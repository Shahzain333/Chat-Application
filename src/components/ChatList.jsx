import React, { useEffect, useMemo } from "react";
import defaultAvatar from "../assets/default.jpg";
import { RiMore2Fill } from "react-icons/ri";
import SearchModal from "../components/SearchModal";
import { formatTimestamp } from "../utils/formatTimestamp";
import firebaseService from "../services/firebaseServices";
import { setSelectedUser, setChats, setCurrentUser, setLoading, clearChatState } from "../store/chatSlice";
import { useSelector, useDispatch } from "react-redux";

const Chatlist = () => {

    const dispatch = useDispatch();
    const { chats, selectedUser, currentUser, loading } = useSelector(state => state.chat);

    // Single useEffect for initialization
    useEffect(() => {
        
        let unsubscribeUser = () => {};
        let unsubscribeChats = () => {};


        const initializeUserAndChats = async () => {
            try {
                dispatch(setLoading(true));
                
                const currentUserId = firebaseService.getCurrentUserId();
                
                if (currentUserId) {
                    unsubscribeUser = firebaseService.listenForUser(currentUserId, (user) => {
                        if (user) {
                            dispatch(setCurrentUser(user));
                        }
                    });
                }

                unsubscribeChats = firebaseService.listenForChats((newChats) => {
                    dispatch(setChats(newChats));
                });

            } catch (error) {
                console.error('Error initializing user and chats:', error);
            } finally {
                dispatch(setLoading(false));
            }
        };

        initializeUserAndChats();

        return () => {
            unsubscribeUser();
            unsubscribeChats();
        };
    }, [dispatch]);

    // Auth state listener
    useEffect(() => {
        const unsubscribeAuth = firebaseService.onAuthStateChange(async (authUser) => {
            if (authUser) {
                try {
                    const userData = await firebaseService.getUser(authUser.uid);
                    if (userData) {
                        dispatch(setCurrentUser(userData));
                    }
                } catch (error) {
                    console.error('Error fetching user on auth change:', error);
                }
            } else {
                dispatch(setCurrentUser(null));
                dispatch(clearChatState());
            }
        });

        return () => unsubscribeAuth();
    }, [dispatch]);

    const sortedChats = useMemo(() => {
        return [...chats].sort((a,b) => {
            const aTime = a.lastMessageTimestamp?.seconds || 0;
            const bTime = b.lastMessageTimestamp?.seconds || 0;
            return bTime - aTime;
        });
    }, [chats]);

    const startChat = (user) => {
        dispatch(setSelectedUser(user));
    };

    const getOtherUserFromChat = (chat) => {
        const currentUserEmail = currentUser?.email;
        return chat?.users?.find(user => user?.email !== currentUserEmail);
    };

    if (loading) {
        return (
            <section className="flex flex-col h-screen w-full md:w-[300px] lg:w-[400px] bg-white border-r border-gray-200">
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col h-screen w-full md:w-[300px] lg:w-[400px] bg-white border-r border-gray-200">
            {/* Header */}
            <header className="flex items-center justify-between p-4 md:border-b md:border-gray-200">
                <main className="flex items-center gap-3">
                    <img 
                        src={currentUser?.image || defaultAvatar} 
                        className="w-10 h-10 object-cover rounded-full" 
                        alt="Profile" 
                    />
                    <span className="hidden md:block">
                        <h3 className="font-semibold text-[#2A3D39] text-sm">
                            {currentUser?.fullName || "ChatFrik user"}
                        </h3>
                        <p className="font-light text-[#2A3D39] text-xs">
                            @{currentUser?.username || "chatfrik"}
                        </p>
                    </span>
                </main>
                
                <button className="hidden md:flex items-center justify-center w-10 h-10 bg-[#D9F2ED] rounded-lg">
                    <RiMore2Fill color="#01AA85" />
                </button>
            </header>

            {/* Messages Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">
                        Messages ({chats?.length || 0})
                    </h3>
                    <SearchModal startChat={startChat} />
                </div>
            </div>

            {/* Chat List */}
            <main className="flex-1 overflow-y-auto">
                {sortedChats.length > 0 ? (
                    sortedChats.map((chat) => {
                        const otherUser = getOtherUserFromChat(chat);
                        if (!otherUser) return null;

                        const isActive = selectedUser?.uid === otherUser.uid;

                        return (
                            <button 
                                key={chat.id} 
                                className={`flex items-center w-full p-4 border-b border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer ${
                                    isActive ? 'bg-green-100' : ''
                                }`}
                                onClick={() => startChat(otherUser)}
                            >
                                <img 
                                    src={otherUser?.image || defaultAvatar} 
                                    className="h-12 w-12 rounded-full object-cover flex-shrink-0" 
                                    alt={otherUser.fullName} 
                                />
                                <div className="flex-1 min-w-0 ml-3 text-left">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                                            {otherUser?.fullName || "ChatFrik User"}
                                        </h4>
                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                            {chat?.lastMessageTimestamp ? formatTimestamp(chat.lastMessageTimestamp) : ""}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm truncate mt-1">
                                        {chat?.lastMessage || "No messages yet"}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new chat to see conversations here</p>
                    </div>
                )}
            </main>
        </section>
    );
};

export default Chatlist;