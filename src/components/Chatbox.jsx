import React, { useState, useEffect, useMemo, useRef } from 'react';
import defaultAvatar from '../assets/default.jpg';
import { RiSendPlaneFill, RiArrowLeftLine, RiEditLine, RiDeleteBinLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';
import Logo from '../assets/logo.png';
import { formatTimestamp } from '../utils/formatTimestamp';
import firebaseService from '../services/firebaseServices';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setMessages, 
  setSelectedUser, 
  setLoading, 
  addMessage, 
  updateMessage,
  removeOptimisticMessage 
} from '../store/chatSlice';

function Chatbox({ onBack }) {
    
    const [messageText, setMessageText] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [activeMessageId, setActiveMessageId] = useState(null);
    
    const scrollRef = useRef(null);
    
    const dispatch = useDispatch();
    const { messages, selectedUser, currentUser, loading } = useSelector(state => state.chat);
    
    const chatId = useMemo(() => {
        if (!selectedUser?.uid || !currentUser?.uid) return null;
        return currentUser.uid < selectedUser.uid 
            ? `${currentUser.uid}-${selectedUser.uid}`
            : `${selectedUser.uid}-${currentUser.uid}`;
    }, [selectedUser, currentUser]);

    // Messages listener
    useEffect(() => {
        if (chatId && selectedUser) {
            dispatch(setLoading(true));
            const unsubscribe = firebaseService.listenForMessages(chatId, (newMessages) => {
                dispatch(setMessages(newMessages || []));
                dispatch(setLoading(false));
            });
            
            return () => {
                unsubscribe();
                dispatch(setLoading(false));
            };
        } else {
            dispatch(setMessages([]));
            dispatch(setLoading(false));
        }
    }, [chatId, selectedUser, dispatch]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current && !loading) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Clear Input and editing state When selectedUser change
    useEffect(() => {
        setMessageText('');
        setEditingMessage(null);
        setActiveMessageId(null);
    }, [selectedUser?.uid]);

    const sortedMessages = useMemo(() => {
        if (!messages || !Array.isArray(messages)) return [];
        
        return [...messages].sort((a, b) => {
            const aTime = a.timestamp?.seconds || a.timestamp || 0;
            const bTime = b.timestamp?.seconds || b.timestamp || 0;
            return aTime - bTime;
        });
    }, [messages]);

    const handleMessage = async (e) => {
        e.preventDefault();
        
        if (!messageText.trim() || !selectedUser?.uid || !currentUser?.uid || !chatId || loading) return;
        
        try {
            dispatch(setLoading(true));
            
            if (editingMessage) {
                // Update existing message - optimistic update
                dispatch(updateMessage({
                    messageId: editingMessage.id,
                    newText: messageText.trim()
                }));
                
                // Update in Firebase
                await firebaseService.updateMessage(chatId, editingMessage.id, messageText.trim());
                setEditingMessage(null);

            } else {
                // Send new message - optimistic update
                const tempMessageId = `temp-${Date.now()}`;
                const newMessage = {
                    id: tempMessageId,
                    text: messageText.trim(),
                    sender: currentUser.email,
                    timestamp: {
                        seconds: Math.floor(Date.now() / 1000),
                        nanoseconds: 0
                    },
                    isOptimistic: true
                };
                
                dispatch(addMessage(newMessage));
                
                try {
                    await firebaseService.sendMessage(
                        messageText.trim(), 
                        chatId, 
                        currentUser.uid, 
                        selectedUser.uid
                    );
                } catch (error) {
                    // Remove optimistic message if send fails
                    dispatch(removeOptimisticMessage(tempMessageId));
                    throw error;
                }
            }
            
            setMessageText('');
            
        } catch (error) {
            console.error("Error sending message:", error);
            alert('Failed to send message. Please try again.');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleBack = () => {
        dispatch(setSelectedUser(null));
        if (onBack && typeof onBack === 'function') {
            onBack();
        }
    };

    const handleMessageClick = (messageId, e) => {
        e.stopPropagation();
        setActiveMessageId(activeMessageId === messageId ? null : messageId);
    };

    const handleEdit = (message) => {
        // Don't allow editing optimistic messages
        if (message.isOptimistic) return;
        
        setEditingMessage(message);
        setMessageText(message.text);
        setActiveMessageId(null);
    };

    const handleDelete = async (messageId) => {
        // Don't allow deleting optimistic messages
        const messageToDelete = messages.find(msg => msg.id === messageId);
        if (messageToDelete?.isOptimistic) return;
        
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                dispatch(setLoading(true));
                await firebaseService.deleteMessage(chatId, messageId);
                setActiveMessageId(null);
            } catch (error) {
                console.error('Error deleting message:', error);
                alert('Failed to delete message. Please try again.');
            } finally {
                dispatch(setLoading(false));
            }
        }
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setMessageText('');
    };

    // Show loading state
    if (loading && messages.length === 0) {
        return (
            <section className="h-screen w-full bg-[#e5f6f3] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading messages...</p>
                </div>
            </section>
        );
    }

    if (!selectedUser) {
        return (
            <section className="h-screen w-full bg-[#e5f6f3]">
                <div className="flex flex-col justify-center items-center h-full">
                    <img src={Logo} alt="Chatfrik Logo" width={100} />
                    <h1 className="text-3xl font-bold text-teal-700 mt-5">Welcome to Chatfrik</h1>
                    <p className="text-gray-500">Connect and chat with friends easily, securely, fast and free</p>
                </div>
            </section>
        );
    }

    return (
        <section className='flex flex-col h-screen w-full app-background'>
            {/* Header Of ChatBox */}
            <header className='border-b border-gray-400 w-full h-[75px] p-4 bg-white flex-shrink-0'>
                <main className='flex items-center gap-2'>
                    <button 
                        onClick={handleBack} 
                        className='flex items-center justify-center text-gray-600 
                        hover:bg-gray-100 rounded-full transition-colors p-1 cursor-pointer'
                        aria-label="Back to chat list"
                        disabled={loading}
                    >
                        <RiArrowLeftLine className='text-2xl' />
                    </button>

                    <img 
                        src={selectedUser?.image || defaultAvatar} 
                        className='w-11 h-11 object-cover rounded-full' 
                        alt={selectedUser?.fullName || "User"} 
                    />
                    
                    <div className='flex-1'>
                        <h3 className='font-semibold text-[#2A3D39] text-lg'>
                            {selectedUser?.fullName || "Chatfrik User"}
                        </h3>
                        <p className='font-light text-[#2A3D39] text-sm'>
                            @{selectedUser?.username || "chatfrik"}
                        </p>
                    </div>
                </main>
            </header>

            <main className='flex flex-col flex-1 w-full min-h-0'>
                
                <section className='flex-1 overflow-hidden px-3 pt-5'>
                    <div ref={scrollRef} className='h-full overflow-y-auto custom-scrollbar'>
                        <div className='min-h-full flex flex-col justify-end'>
                            {sortedMessages.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-gray-500 py-8">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                sortedMessages.map((msg, index) => (
                                    <div key={msg.id || `msg-${index}`} className="mb-4 relative">
                                        {msg.sender === currentUser?.email ? (
                                            <div className="flex flex-col items-end w-full">
                                                <div className="flex gap-3 me-5 max-w-[80%]">
                                                    <div className={`relative ${msg.isOptimistic ? 'opacity-70' : ''}`}>
                                                        <div 
                                                            className={`bg-white p-3 rounded-lg shadow-sm message-content ${!msg.isOptimistic ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                                                            onClick={!msg.isOptimistic ? (e) => handleMessageClick(msg.id, e) : undefined}
                                                        >
                                                            <p className='text-sm'>{msg.text || ''}</p>
                                                        </div>
                                                        
                                                        {/* Edit/Delete Actions for sender's messages */}
                                                        {activeMessageId === msg.id && !msg.isOptimistic && (
                                                            <div className="absolute right-0 -top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-2 z-10 message-actions">
                                                                <button 
                                                                    onClick={() => handleEdit(msg)}
                                                                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <RiEditLine className="text-gray-600" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(msg.id)}
                                                                    className="p-2 hover:bg-gray-100 rounded transition-colors text-red-500"
                                                                    title="Delete"
                                                                >
                                                                    <RiDeleteBinLine />
                                                                </button>
                                                            </div>
                                                        )}
                                                        
                                                        <p className="text-gray-400 text-xs mt-1 text-right">
                                                            {msg.isOptimistic ? 'Sending...' : formatTimestamp(msg.timestamp)}
                                                            {msg.edited && <span className="ml-1 text-gray-500">(edited)</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-start w-full">
                                                <div className="flex gap-3 max-w-[80%] ms-5">
                                                    <img 
                                                        src={selectedUser?.image || defaultAvatar} 
                                                        className="h-8 w-8 object-cover rounded-full mt-1" 
                                                        alt={selectedUser?.fullName || "User"} 
                                                    />
                                                    <div className="relative">
                                                        <div className="bg-white p-3 rounded-lg shadow-sm message-content">
                                                            <p className='text-sm'>{msg.text || ''}</p>
                                                        </div>
                                                        <p className="text-gray-400 text-xs mt-1">
                                                            {formatTimestamp(msg.timestamp)}
                                                            {msg.edited && <span className="ml-1 text-gray-500">(edited)</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Form */}
                <div className='sticky bottom-[20px] p-3 w-full'>
                    
                    <form onSubmit={handleMessage} className='flex items-center bg-green-200 
                    h-[55px] w-full px-2 rounded-lg relative shadow-lg'>
                        <input 
                            type='text'
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={editingMessage ? 'Edit your message...' : (loading ? 'Sending message...' : 'Write Your Message....')}
                            className='h-full text-[#2A3D39] outline-none text-base pl-3 pr-[50px] rounded-lg w-full disabled:opacity-50'
                            disabled={loading}
                        />
                        <div className="absolute right-5 flex gap-1">
                            {editingMessage && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="p-2 hover:bg-red-100 rounded transition-colors"
                                    title="Cancel edit"
                                >
                                    <RiCloseLine className="text-red-500" />
                                </button>
                            )}
                            <button 
                                type='submit' 
                                disabled={!messageText.trim() || loading}
                                className='flex items-center justify-center p-2 rounded-full 
                                bg-[#D9f2ed] hover:bg-[#c8eae3] disabled:opacity-50 
                                disabled:cursor-not-allowed transition-colors min-w-[40px] cursor-pointer'
                                aria-label={editingMessage ? "Update message" : (loading ? "Sending message..." : "Send message")}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 
                                    border-teal-600"></div>
                                ) : editingMessage ? (
                                    <RiCheckLine color="#01AA85" />
                                ) : (
                                    <RiSendPlaneFill color="#01AA85" />
                                )}
                            </button>
                        </div>
                    </form>
            
                </div>

            </main>

        </section>
    );
}

export default Chatbox;