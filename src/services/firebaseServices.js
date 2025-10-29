// firebaseServices.js
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    GithubAuthProvider,
} from "firebase/auth";

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
        
        this.firebaseApp = initializeApp(firebaseConfig);
        this.firebaseAuth = getAuth(this.firebaseApp);
        this.googleProvider = new GoogleAuthProvider();
        this.githubProvider = new GithubAuthProvider();
    } 
     
    // Auth Methods
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
            return userCredential;
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    }

    async signIn(email, password) {
        try {
            return await signInWithEmailAndPassword(this.firebaseAuth, email, password);
        } catch (error) {
            console.error("Signin error:", error);
            throw error;
        }
    }

    async signOut() {
        return await signOut(this.firebaseAuth);
    }

    // Function to SignIn With Google
    async signinWithGoogle() {
        return await signInWithPopup(this.firebaseAuth, this.googleProvider);
    }

    // Function to SignIn With Github
    async signinWithGithub() {
        return await signInWithPopup(this.firebaseAuth, this.githubProvider);
    }

    // getCurrentUser() {
    //     return this.firebaseAuth.currentUser;
    // }

    onAuthStateChange(callback) {
        return onAuthStateChanged(this.firebaseAuth, callback);
    }
}

export const firebaseService = new FirebaseService();

export default firebaseService;