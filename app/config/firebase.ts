// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from '@firebase/firestore';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWPMnL6zWOJFuSMdsv0H0Y9YcOSM1uUK0",
  authDomain: "habit-tracker-d363b.firebaseapp.com",
  projectId: "habit-tracker-d363b",
  storageBucket: "habit-tracker-d363b.firebasestorage.app",
  messagingSenderId: "16803286238",
  appId: "1:16803286238:web:a52e2408ee1d47e984c64f",
  measurementId: "G-NS844GYV4S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
