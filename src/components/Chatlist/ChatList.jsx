import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import firebaseService from "../../services/firebaseServices";
import { 
  setSelectedUser, 
  setLoading, 
  deleteChats, 
  setMessages 
} from "../../store/chatSlice";

// Import components
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import FilterSection from "./FilterSection";
import UserList from "./UserList";
import LoadingScreen from "./LoadingScreen";

// Import custom hooks
import { useChatUtils } from "../../hooks/useChatUtils";
import { useFirebaseData } from "../../hooks/useFirebaseData";

function Chatlist() {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOnlyChats, setShowOnlyChats] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const dispatch = useDispatch();
  const { chats, selectedUser, currentUser, loading, allUsers } = useSelector(state => state.chat);
  
  // Initialize custom hooks
  const { getOtherUserFromChat, getChatIdForUser } = useChatUtils(currentUser);
  useFirebaseData(currentUser);

  // Sort chats by timestamp
  const sortedChats = useMemo(() => {
    if (!Array.isArray(chats)) return [];
    return [...chats].sort((a, b) => {
      const aTime = a.lastMessageTimestamp?.seconds || 0;
      const bTime = b.lastMessageTimestamp?.seconds || 0;
      return bTime - aTime;
    });
  }, [chats]);

  // Create a map of user IDs to their chat data
  const userToChatMap = useMemo(() => {
    const map = new Map();
    sortedChats.forEach(chat => {
      const otherUser = getOtherUserFromChat(chat);
      if (otherUser?.uid) {
        map.set(otherUser.uid, {
          chatId: chat.id,
          lastMessage: chat.lastMessage || "",
          lastMessageTimestamp: chat.lastMessageTimestamp
        });
      }
    });
    return map;
  }, [sortedChats, getOtherUserFromChat]);

  // Prepare users list
  const usersToDisplay = useMemo(() => {
    if (showOnlyChats) {
      return sortedChats.map(chat => {
        const otherUser = getOtherUserFromChat(chat);
        if (!otherUser) return null;
        return {
          ...otherUser,
          chatId: chat.id,
          lastMessage: chat.lastMessage || "",
          lastMessageTimestamp: chat.lastMessageTimestamp
        };
      }).filter(Boolean);
    }
    
    return allUsers.map(user => {
      const chatData = userToChatMap.get(user.uid);
      return chatData ? { ...user, ...chatData } : user;
    }).sort((a, b) => {
      const aHasChat = !!a.chatId;
      const bHasChat = !!b.chatId;
      if (aHasChat && !bHasChat) return -1;
      if (!aHasChat && bHasChat) return 1;
      if (aHasChat && bHasChat) {
        const aTime = a.lastMessageTimestamp?.seconds || 0;
        const bTime = b.lastMessageTimestamp?.seconds || 0;
        return bTime - aTime;
      }
      return (a.fullName || "").localeCompare(b.fullName || "");
    });
  }, [showOnlyChats, sortedChats, allUsers, userToChatMap, getOtherUserFromChat]);

  // Unified delete chat handler
  const handleDeleteChat = useCallback(async (user, source = 'dropdown') => {
    
    const chatId = getChatIdForUser(user);
    
    if (!chatId) {
      toast.error("Cannot delete chat at this moment.", { duration: 3000 });
      return false;
    }

    // Show confirmation toast
    toast(`Delete all chats with ${user?.fullName || 'this user'}?`, {
      description: 'This action cannot be undone. All messages will be permanently deleted.',
      duration: 3000, // 2 seconds to decide
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            dispatch(setLoading(true));
            await firebaseService.deleteChats(chatId);
            dispatch(deleteChats(chatId));
            
            if (selectedUser?.uid === user.uid) {
              dispatch(setSelectedUser(null));
              dispatch(setMessages([]));
            }
            
            toast.success(`Chat with ${user?.fullName || 'user'} deleted successfully!`, {
              duration: 3000,
            });
            
            // Clean up UI based on source
            if (source === 'dropdown') {
              setActiveDropdown(null);
            } else if (source === 'mobileMenu') {
              setIsMobileMenuOpen(false);
            }
            
            return true;
          
          } catch (error) {
          
            console.error('Error deleting chat:', error);
            toast.error('Failed to delete chat. Please try again.', { duration: 3000 });
            return false;
          
          } finally {
            dispatch(setLoading(false));
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          // Clean up UI based on source
          if (source === 'dropdown') {
            setActiveDropdown(null);
          } else if (source === 'mobileMenu') {
            setIsMobileMenuOpen(false);
          }
        },
      },
    });
    
    return true; 

  }, [dispatch, getChatIdForUser, selectedUser]);

  // Event Handlers
  const startChat = useCallback((user) => {
    if (user?.uid) {
      dispatch(setSelectedUser(user));
      setActiveDropdown(null);
    }
  }, [dispatch]);

  const toggleUserDropdown = useCallback((userId, e) => {
    e.stopPropagation();
    setActiveDropdown(prev => prev === userId ? null : userId);
  }, []);

  // Single delete function for all cases
  const handleDeleteUserChat = useCallback((user, e) => {
    e?.stopPropagation();
    setActiveDropdown(null);
    handleDeleteChat(user, 'dropdown');
  }, [handleDeleteChat]);

  const handleDeleteSelectedUserChats = useCallback(() => {
    if (!selectedUser) {
      toast.info("Please select a user first.", { duration: 3000 });
      setIsMobileMenuOpen(false);
      return;
    }
    setIsMobileMenuOpen(false);
    handleDeleteChat(selectedUser, 'mobileMenu');
  }, [selectedUser, handleDeleteChat]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen) {
        const menu = document.querySelector('.mobile-menu');
        const menuButton = document.querySelector('.menu-button');
        if (menu && menuButton && !menu.contains(e.target) && !menuButton.contains(e.target)) {
          setIsMobileMenuOpen(false);
        }
      }
      if (activeDropdown && !e.target.closest('.user-dropdown')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, activeDropdown]);

  // Render
  if (loading && allUsers.length === 0) {
    return <LoadingScreen mesage="Loading users..."/>;
  }

  return (
      <section className="flex flex-col h-screen w-full md:w-[300px] lg:w-[400px] bg-white border-r border-gray-200 relative">
        <Header 
          currentUser={currentUser} 
          isMenuOpen={isMobileMenuOpen} 
          onToggleMenu={() => setIsMobileMenuOpen(prev => !prev)} 
        />
        
        <MobileMenu 
          isOpen={isMobileMenuOpen}
          onDeleteSelected={handleDeleteSelectedUserChats}
          selectedUser={selectedUser}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <FilterSection 
          showOnlyChats={showOnlyChats}
          usersCount={usersToDisplay.length}
          onToggleFilter={() => setShowOnlyChats(prev => !prev)}
          onSearch={startChat}
        />

        <UserList 
          users={usersToDisplay}
          selectedUser={selectedUser}
          activeDropdown={activeDropdown}
          onSelectUser={startChat}
          onDeleteUserChat={handleDeleteUserChat}
          onToggleDropdown={toggleUserDropdown}
        />
    </section>
  );
}

export default Chatlist;