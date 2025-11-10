import { createSlice } from '@reduxjs/toolkit'

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
        if (key === 'timestamp' || key === 'lastMessageTimestamp' || key === 'createdAt' || key === 'lastUpdated') {
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
        setMessages: (state, action) => {
            // Convert ALL timestamps in messages
            state.messages = action.payload.map(message => convertAllTimestamps(message));
        },
        addMessage: (state, action) => {
            // Convert timestamp for single message
            const convertedMessage = convertAllTimestamps(action.payload);
            state.messages.push(convertedMessage);
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
        updateChatLastMessage: (state, action) => {
            const { chatId, lastMessage, lastMessageTimestamp } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = lastMessage;
                state.chats[chatIndex].lastMessageTimestamp = convertTimestamp(lastMessageTimestamp);
            }
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
  setSelectedUser,
  setCurrentUser,
  setLoading,
  updateChatLastMessage,
  clearChatState
} = chatSlice.actions;

export default chatSlice.reducer;