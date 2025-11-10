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
    serverTimestamp,
    orderBy
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