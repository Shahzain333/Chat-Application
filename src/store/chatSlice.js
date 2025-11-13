import { createSlice } from '@reduxjs/toolkit'
import { selectAuth } from './authSlice';
import Chatlist from '../components/ChatList';

// Helper function to convert Firebase timestamps to plain objects
const convertTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp) {
        return {
            seconds: timestamp.seconds,
            nanoseconds: timestamp.nanoseconds
        };
    }
    return timestamp;
};

// Recursive function to convert all timestamps in an object
const convertAllTimestamps = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => convertAllTimestamps(item));
    }
    
    const converted = { ...obj };
    
    for (const key in converted) {
        if (key === 'timestamp' || key === 'lastMessageTimestamp' || key === 'createdAt' || key === 'lastUpdated' || key === 'editedAt') {
            converted[key] = convertTimestamp(converted[key]);
        } else if (typeof converted[key] === 'object' && converted[key] !== null) {
            converted[key] = convertAllTimestamps(converted[key]);
        }
    }
    
    return converted;
};

const initialState = {
    chats: [],
    messages: [],
    selectedUser: null,
    currentUser: null,
    loading: false
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats: (state, action) => {
            // Convert ALL timestamps in chats and nested objects
            state.chats = action.payload.map(chat => convertAllTimestamps(chat));
        },
        // Del Chats Functionallity
        deleteChats : (state,action) => {

            const chatId = action.payload
            state.chats = state.chats.filter(chat => chat.id === chatId)

            // Also Clear Messages and selected User if we are curently viewing this chats
            // const currentChatId = state.currentUser?.uid && state.selectedUser?.uid ?
            //   state.currentUser.uid < state.selectedUser.uid ? 
            //   `${state.currentUser.uid}-${state.selectedUser.uid}` :
            //   `${state.selectedUser.uid}-${state.currentUser.uid}` : null

            //   if(currentChatId === chatId) {
            //     state.messages = []
            //     state.selectedUser = null
            //   }
            
        },
        setMessages: (state, action) => {
            // Convert ALL timestamps in messages
            state.messages = action.payload.map(message => convertAllTimestamps(message));
        },
        // ADD message functionality
        addMessage: (state, action) => {
            // Convert timestamp for single message
            const convertedMessage = convertAllTimestamps(action.payload);
            state.messages.push(convertedMessage);
        },   
        // Update message functionality
        updateMessage: (state, action) => {

            const { messageId, newText } = action.payload;
            
            // Find the message in the messages array
            const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
            
            if (messageIndex !== -1) {
                // Update the message text and mark as edited
                state.messages[messageIndex].text = newText;
                state.messages[messageIndex].edited = true;
                state.messages[messageIndex].editedAt = convertTimestamp(new Date());
                
                // Also update the chat's last message if this message is the last one
                const lastMessage = state.messages[state.messages.length - 1];
                if (lastMessage && lastMessage.id === messageId) {
                    // Find the chat that contains this message
                    const chatIndex = state.chats.findIndex(chat => 
                        chat.users?.some(user => user.uid === state.currentUser?.uid) &&
                        chat.users?.some(user => user.uid === state.selectedUser?.uid)
                    );
                    
                    if (chatIndex !== -1) {
                        state.chats[chatIndex].lastMessage = newText;
                        state.chats[chatIndex].lastMessageTimestamp = convertTimestamp(new Date());
                    }
                }
            }
        },
        // Delete message functionality
        deleteMessage: (state, action) => {
            
            const messageId = action.payload;
            
            // Find the message before deleting it
            const messageToDelete = state.messages.find(msg => msg.id === messageId);
            
            // Remove the message from messages array
            state.messages = state.messages.filter(msg => msg.id !== messageId);
            
            // Update chat's last message if the deleted message was the last one
            if (messageToDelete) {
                const isLastMessage = state.messages.length === 0 || 
                    !state.messages.some(msg => 
                        msg.timestamp?.seconds > (messageToDelete.timestamp?.seconds || 0)
                    );
                
                if (isLastMessage) {
                    const chatIndex = state.chats.findIndex(chat => 
                        chat.users?.some(user => user.uid === state.currentUser?.uid) &&
                        chat.users?.some(user => user.uid === state.selectedUser?.uid)
                    );
                    
                    if (chatIndex !== -1) {
                        if (state.messages.length > 0) {
                            // Find the new last message
                            const newLastMessage = state.messages.reduce((latest, msg) => {
                                const msgTime = msg.timestamp?.seconds || 0;
                                const latestTime = latest.timestamp?.seconds || 0;
                                return msgTime > latestTime ? msg : latest;
                            });
                            
                            state.chats[chatIndex].lastMessage = newLastMessage.text;
                            state.chats[chatIndex].lastMessageTimestamp = newLastMessage.timestamp;
                        } else {
                            // No messages left in chat
                            state.chats[chatIndex].lastMessage = "";
                            state.chats[chatIndex].lastMessageTimestamp = null;
                        }
                    }
                }
            }
        },
        // Remove optimistic message (for failed sends)
        removeOptimisticMessage: (state, action) => {
            const tempMessageId = action.payload;
            state.messages = state.messages.filter(msg => 
                !(msg.id === tempMessageId && msg.isOptimistic)
            );
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = convertAllTimestamps(action.payload);
        },
        setCurrentUser: (state, action) => {
            // Convert ALL timestamps in user data
            state.currentUser = convertAllTimestamps(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        clearChatState: (state) => {
            return { ...initialState };
        }
    }
})

export const {
  setChats,
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  removeOptimisticMessage,
  setSelectedUser,
  setCurrentUser,
  setLoading,
  clearChatState,
  deleteChats
} = chatSlice.actions;

export default chatSlice.reducer;