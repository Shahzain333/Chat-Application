import React, { useState, useEffect, useMemo, useRef } from 'react';
import defaultAvatar from '../assets/default.jpg';
import { RiSendPlaneFill, RiArrowLeftLine } from 'react-icons/ri';
import Logo from '../assets/logo.png';
import { formatTimestamp } from '../utils/formatTimestamp';
import firebaseService from '../services/firebaseServices';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages, setSelectedUser } from '../store/chatSlice';

function Chatbox({ onBack }) {
    
    const [messageText, setMessageText] = useState('');
    const scrollRef = useRef(null);
    
    const dispatch = useDispatch();
    const { messages, selectedUser, currentUser } = useSelector(state => state.chat);
    
    const chatId = useMemo(() => {
        if (!selectedUser || !currentUser) return null;
        return currentUser.uid < selectedUser.uid 
            ? `${currentUser.uid}-${selectedUser.uid}`
            : `${selectedUser.uid}-${currentUser.uid}`;
    }, [selectedUser, currentUser]);

    // Messages listener
    useEffect(() => {
        if (chatId && selectedUser) {
            const unsubscribe = firebaseService.listenForMessages(chatId, (newMessages) => {
                dispatch(setMessages(newMessages));
            });
            
            return () => unsubscribe();
        } else {
            dispatch(setMessages([]));
        }
    }, [chatId, selectedUser, dispatch]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sortedMessages = useMemo(() => {
        return [...messages].sort((a, b) => {
            const aTime = a.timestamp?.seconds || 0;
            const bTime = b.timestamp?.seconds || 0;
            return aTime - bTime;
        });
    }, [messages]);

    const handleMessage = async (e) => {
        e.preventDefault();
        
        if (!messageText.trim() || !selectedUser || !chatId) return;
        
        try {
            await firebaseService.sendMessage(messageText.trim(), chatId, currentUser.uid, selectedUser.uid);
            setMessageText('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleBack = () => {
        dispatch(setSelectedUser(null));
        onBack();
    };

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
            
            <header className='border-b border-gray-400 w-full h-[75px] p-4 bg-white flex-shrink-0'>
                <main className='flex items-center gap-3'>
                    <button 
                        onClick={handleBack} 
                        className='lg:hidden flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors p-1'
                    >
                        <RiArrowLeftLine className='text-2xl' />
                    </button>

                    <img 
                        src={selectedUser?.image || defaultAvatar} 
                        className='w-11 h-11 object-cover rounded-full' 
                        alt={selectedUser.fullName} 
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
                            {sortedMessages.map((msg, index) => (
                                <div key={msg.id || index} className="mb-4">
                                    {msg.sender === currentUser?.email ? (
                                        <div className="flex flex-col items-end w-full">
                                            <div className="flex gap-3 me-5 max-w-[80%]">
                                                <div>
                                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                                        <p className='text-sm'>{msg.text}</p>
                                                    </div>
                                                    <p className="text-gray-400 text-xs mt-1 text-right">
                                                        {formatTimestamp(msg.timestamp)}
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
                                                    alt={selectedUser.fullName} 
                                                />
                                                <div>
                                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                                        <p className='text-sm'>{msg.text}</p>
                                                    </div>
                                                    <p className="text-gray-400 text-xs mt-1">
                                                        {formatTimestamp(msg.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className='sticky bottom-[20px] p-3 w-full'>
                    <form onSubmit={handleMessage} className='flex items-center bg-white h-[45px] w-full px-2 rounded-lg relative shadow-lg'>
                        <input 
                            type='text'
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder='Write Your Message....'
                            className='h-full text-[#2A3D39] outline-none text-base pl-3 pr-[50px] rounded-lg w-full'
                        />
                        <button 
                            type='submit' 
                            disabled={!messageText.trim()}
                            className='flex items-center justify-center absolute right-3 p-2 rounded-full bg-[#D9f2ed] hover:bg-[#c8eae3] disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            <RiSendPlaneFill color="#01AA85" />
                        </button>
                    </form>
                </div>
            </main>
        </section>
    );
}

export default Chatbox;