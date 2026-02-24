// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBceoigwtMQ_yK2ABdEiBmXPMrVteoddl4",
  authDomain: "housemajor-3837c.firebaseapp.com",
  projectId: "housemajor-3837c",
  storageBucket: "housemajor-3837c.firebasestorage.app",
  messagingSenderId: "79873578624",
  appId: "1:79873578624:web:ccfb35d8deff6c58653865",
  measurementId: "G-JMJYEXPZ2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);