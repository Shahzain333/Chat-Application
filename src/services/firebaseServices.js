import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    GithubAuthProvider
} from "firebase/auth";

import { 
    doc, 
    getDoc,
    setDoc,
    collection,
    getFirestore,
    onSnapshot,
    getDocs, 
    query,   
    where,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    orderBy,
    limit
} from "firebase/firestore"; 

class FirebaseService {
    constructor() {
        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID
        };  
        
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);

        this.googleProvider = new GoogleAuthProvider();
        this.githubProvider = new GithubAuthProvider();

        this.initServerRestartDetection()
    } 
     
    async signUp(email, password, username = '') {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            await this.addUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                username: userCredential.user.email?.split('@')[0] || '',
                fullName: username || '',
                image: ""
            });
            return userCredential;
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    }

    async signIn(email, password) {
        try {
            return await signInWithEmailAndPassword(this.auth, email, password);
        } catch (error) {
            console.error("Signin error:", error);
            throw error;
        }
    }

    async signOut() {
        return await signOut(this.auth);
    }

    async signInWithGoogle() {
        const userCredential = await signInWithPopup(this.auth, this.googleProvider);
        await this.addUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            username: userCredential.user.email?.split('@')[0] || '',
            fullName: userCredential.user.displayName || '',
            image: userCredential.user.photoURL || ""
        });
        return userCredential;
    }

    async signInWithGithub() {
        const userCredential = await signInWithPopup(this.auth, this.githubProvider);
        await this.addUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            username: userCredential.user.email?.split('@')[0] || '',
            fullName: userCredential.user.displayName || '',
            image: userCredential.user.photoURL || ""
        });
        return userCredential;
    }
    
    onAuthStateChange(callback) {
        return onAuthStateChanged(this.auth, callback);
    }

    async initServerRestartDetection() {
        const serverStatusRef = doc(this.db, 'system', 'serverStatus')
        
        try {

            const serverDoc = await getDoc(serverStatusRef)
            const currentServerTime = Date.now().toString()

            if(!serverDoc.exists()){
                await setDoc(serverStatusRef, {
                    startTime: currentServerTime,
                    lastUpdated: serverTimestamp()
                })
            } else {
             
                const serverData = serverDoc.data()
                const lastServerTime = localStorage.getItem('firebaseServerTime')

                if(lastServerTime && lastServerTime !== serverData.startTime){
                    console.log('Firebase server restart detected, logging out user');
                    await this.signOut();
                    localStorage.clear();
                    sessionStorage.clear();
                }
                
                localStorage.setItem('firebaseServerTime', serverData.startTime)
            
            }
        } catch (error) {
            console.error('Error in Firebase restart detection:', error);
        }
    }

    async addUser(userData) {
        try {
            const userDocRef = doc(this.db, "users", userData.uid);
            const userDoc = await getDoc(userDocRef);

            if(userDoc.exists()){
                return userDocRef;
            } else {
                await setDoc(userDocRef, {
                    uid: userData.uid,
                    email: userData.email,
                    username: userData.username,
                    fullName: userData.fullName,
                    image: userData.image,
                    createdAt: serverTimestamp(),
                });
                return userDocRef;
            }
        } catch (error) {
            console.error("Error adding user:", error);
            throw error;
        }
    }

    async getUser(uid) {
        try {    
            const userDocRef = doc(this.db, "users", uid);
            const userDoc = await getDoc(userDocRef);
            
            if(userDoc.exists()){
                const userData = userDoc.data();
                // Convert Firebase timestamps to plain objects
                if (userData.createdAt) {
                    userData.createdAt = {
                        seconds: userData.createdAt.seconds,
                        nanoseconds: userData.createdAt.nanoseconds
                    };
                }
                return userData;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting user:", error);
            throw error;
        }
    }

    listenForUser(uid, callback){
        const userDocRef = doc(this.db, 'users', uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if(doc.exists()){
                callback(doc.data())
            } else {
                callback(null)
            }
        })
        return unsubscribe
    }

    async searchUsers(searchTerm) {
        try {
     
            const normalizedSearchTerm = searchTerm.toLowerCase();
            
            const q = query(
                collection(this.db, "users"), 
                where("username", ">=", normalizedSearchTerm),
                where("username", "<=", normalizedSearchTerm + "\uf8ff")
            );

            const querySnapshot = await getDocs(q);
            
            const foundUsers = [];

            querySnapshot.forEach((doc) => {
                foundUsers.push({ 
                    id: doc.id, 
                    ...doc.data() 
                });
            });

            const currentUserId = this.auth.currentUser?.uid;
            return foundUsers.filter(user => user.uid !== currentUserId);
        
        } catch (error) {
            console.error("Error searching users:", error);
            throw error;
        }
    }

    listenForChats(callback) {
        const chatsRef = collection(this.db, 'chats');
        
        const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
            const chatList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const currentUserEmail = this.auth.currentUser?.email;
            const filteredChats = chatList.filter((chat) => 
                chat?.users?.some((user) => user.email === currentUserEmail)
            );

            callback(filteredChats);
        });

        return unsubscribe;
    }

    listenForMessages(chatId, callback) {
     
        if (!chatId) {
            console.error("No chatId provided to listenForMessages");
            return () => {};
        }
        
        const messagesRef = collection(this.db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        
            callback(messages);
            
        }, (error) => {
            console.error("Error listening to messages:", error);
        });

        return unsubscribe;
    }

    // Send Messages to the user
    async sendMessage(messageText, chatId, user1, user2) {
        try {
            
            const chatRef = doc(this.db, "chats", chatId);

            const user1Doc = await getDoc(doc(this.db, "users", user1));
            const user2Doc = await getDoc(doc(this.db, "users", user2)); 

            const user1Data = user1Doc.data();
            const user2Data = user2Doc.data();

            const chatDoc = await getDoc(chatRef);
            
            if (!chatDoc.exists()) {
                await setDoc(chatRef, {
                    users: [user1Data, user2Data],
                    lastMessage: messageText,
                    lastMessageTimestamp: serverTimestamp(),
                });
            } else {
                await updateDoc(chatRef, {
                    lastMessage: messageText,
                    lastMessageTimestamp: serverTimestamp(),
                });
            }

            const messageRef = collection(this.db, "chats", chatId, "messages");
            await addDoc(messageRef, {
                text: messageText,
                sender: this.getCurrentUser().email,
                timestamp: serverTimestamp(),
            });
            
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }

    // Update message functionality
    async updateMessage(chatId, messageId, newText) {
        try {
            if (!chatId || !messageId || !newText) {
                throw new Error("Missing required parameters for updateMessage");
            }

            const messageRef = doc(this.db, "chats", chatId, "messages", messageId);
            
            // Verify the message exists and belongs to current user
            const messageDoc = await getDoc(messageRef);
            if (!messageDoc.exists()) {
                throw new Error("Message not found");
            }

            const messageData = messageDoc.data();
            const currentUserEmail = this.getCurrentUserEmail();
            
            // Check if the current user is the sender of the message
            if (messageData.sender !== currentUserEmail) {
                throw new Error("You can only edit your own messages");
            }

            // Update the message
            await updateDoc(messageRef, {
                text: newText,
                edited: true,
                editedAt: serverTimestamp()
            });

            // Update chat's last message if this is the latest message
            await this.updateChatLastMessage(chatId, messageData.text, newText);

            console.log("Message updated successfully");
            
        } catch (error) {
            console.error("Error updating message:", error);
            throw error;
        }
    }

    // NEW: Delete message functionality
    async deleteMessage(chatId, messageId) {
        try {
            if (!chatId || !messageId) {
                throw new Error("Missing required parameters for deleteMessage");
            }

            const messageRef = doc(this.db, "chats", chatId, "messages", messageId);
            
            // Verify the message exists and belongs to current user
            const messageDoc = await getDoc(messageRef);
            if (!messageDoc.exists()) {
                throw new Error("Message not found");
            }

            const messageData = messageDoc.data();
            const currentUserEmail = this.getCurrentUserEmail();
            
            // Check if the current user is the sender of the message
            if (messageData.sender !== currentUserEmail) {
                throw new Error("You can only delete your own messages");
            }

            // Store the message text before deletion for chat update
            const deletedMessageText = messageData.text;

            // Delete the message
            await deleteDoc(messageRef);

            // Update chat's last message if this was the latest message
            await this.updateChatLastMessageAfterDeletion(chatId, deletedMessageText);

            console.log("Message deleted successfully");
            
        } catch (error) {
            console.error("Error deleting message:", error);
            throw error;
        }
    }

    // Helper method to update chat's last message after message update
    // Update chat's last message after message update
    async updateChatLastMessage(chatId, oldMessageText, newMessageText) {
        try {
            const chatRef = doc(this.db, "chats", chatId);
            const chatDoc = await getDoc(chatRef);
            
            if (chatDoc.exists()) {
                const chatData = chatDoc.data();
                
                // Get the most recent message to check if our updated message is the last one
                const messagesRef = collection(this.db, "chats", chatId, "messages");
                const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
                const messagesSnapshot = await getDocs(q);
                
                if (!messagesSnapshot.empty) {
                    const latestMessage = messagesSnapshot.docs[0].data();
                    
                    // If the updated message is the latest one, update the chat
                    if (latestMessage.text === newMessageText || chatData.lastMessage === oldMessageText) {
                        await updateDoc(chatRef, {
                            lastMessage: newMessageText,
                            lastMessageTimestamp: serverTimestamp() 
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error updating chat last message after edit:", error);
        }
    }

    // Helper method to update chat's last message after message deletion
    async updateChatLastMessageAfterDeletion(chatId, deletedMessageText) {
        try {
            
            const chatRef = doc(this.db, "chats", chatId);
            const chatDoc = await getDoc(chatRef);
            
            if (chatDoc.exists()) {

                const chatData = chatDoc.data();
                
                // If the deleted message was the last message in the chat
                if (chatData.lastMessage === deletedMessageText) {
                
                    // Get the most recent message (excluding the deleted one)
                    const messagesRef = collection(this.db, "chats", chatId, "messages");
                    const q = query(
                        messagesRef, 
                        orderBy('timestamp', 'desc'), 
                        limit(1)
                    );
                    
                    const messagesSnapshot = await getDocs(q);
                    
                    if (!messagesSnapshot.empty) {
                        const newLastMessage = messagesSnapshot.docs[0].data();
                        await updateDoc(chatRef, {
                            lastMessage: newLastMessage.text,
                            lastMessageTimestamp: newLastMessage.timestamp
                        });
                    } else {
                        // No messages left in the chat
                        await updateDoc(chatRef, {
                            lastMessage: "",
                            lastMessageTimestamp: null
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error updating chat last message after deletion:", error);
        }
    }

    // Delete Chats
    async deleteChats(chatId) {
        try {

            if (!chatId) {
                throw new Error("Chat ID is required");
            }

            const chatRef = doc(this.db, "chats", chatId);
            const chatDoc = await getDoc(chatRef);
            
            if (!chatDoc.exists()) {
                throw new Error("Chat not found");
            }

            // Delete all messages in the chat first
            const messagesRef = collection(this.db, "chats", chatId, "messages");
            const messagesSnapshot = await getDocs(messagesRef);
            
            // Delete all messages
            const deletePromises = messagesSnapshot.docs.map(messageDoc => 
                deleteDoc(doc(this.db, "chats", chatId, "messages", messageDoc.id))
            );
            
            await Promise.all(deletePromises);
            
            // Then delete the chat document
            await deleteDoc(chatRef);
            
            console.log("Chat deleted successfully");
            
        } catch (error) {
            console.error("Error deleting chat:", error);
            throw error;
        }
    }

    getCurrentUser() {
        return this.auth.currentUser;
    }

    getCurrentUserEmail() {
        return this.auth.currentUser?.email;
    }

    getCurrentUserId() {
        return this.auth.currentUser?.uid;
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;