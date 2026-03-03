// app/lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ এই লাইন থাকতে হবে

const firebaseConfig = {
  apiKey: "AIzaSyCP4mqmlW4GXfeYMWHg0mPmDJqrElDdGDo",
  authDomain: "vantis-caps.firebaseapp.com",
  projectId: "vantis-caps",
  storageBucket: "vantis-caps.firebasestorage.app",
  messagingSenderId: "44604964454",
  appId: "1:44604964454:web:9ae006b3d98d2c17e6f7a7",
  measurementId: "G-B0GLEKNHS9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ এই লাইন থাকতে হবে
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db, // ✅ db export থাকতে হবে
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
};
