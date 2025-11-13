// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6o-7Qt3lC_GFsC-I1PVqdnn80fx_N5OU",
  authDomain: "ai-trip-planner-6dcd0.firebaseapp.com",
  projectId: "ai-trip-planner-6dcd0",
  storageBucket: "ai-trip-planner-6dcd0.firebasestorage.app",
  messagingSenderId: "38121246081",
  appId: "1:38121246081:web:61e964cc0f1460af4bec80",
  measurementId: "G-EMLSLKYH4J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
// const analytics = getAnalytics(app);