import { createSlice } from '@reduxjs/toolkit'

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
        setChats: (state,action) => {
            state.chats = action.payload
        },
        setMessages: (state,action) => {
            state.messages = action.payload
        },
        addMessage: (state,action) => {
            state.messages.push(action.payload);
        },
        setSelectedUser: (state,action) => {
            state.selectedUser = action.payload
        },
        setCurrentUser: (state,action) => {
            state.currentUser = action.payload
        },
        setLoading: (state,action) => {
            state.loading = action.payload
        },
        // FIXED: Corrected action name (was updateChatlastMessage)
        updateChatLastMessage: (state,action) => {
            const { chatId, lastMessage, lastMessageTimestamp} = action.payload
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId)
            if(chatIndex !== -1) {
                state.chats[chatIndex].lastMessage = lastMessage;
                state.chats[chatIndex].lastMessageTimestamp = lastMessageTimestamp;
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
  updateChatLastMessage, // FIXED: Correct export name
  clearChatState
} = chatSlice.actions;

export default chatSlice.reducer;