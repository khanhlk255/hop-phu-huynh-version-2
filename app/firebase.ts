import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP1DuUKARaKbEgdGBf7IenYCAE6Zl__4A",
  authDomain: "hop-phu-huynh.firebaseapp.com",
  projectId: "hop-phu-huynh",
  storageBucket: "hop-phu-huynh.firebasestorage.app",
  messagingSenderId: "339965630200",
  appId: "1:339965630200:web:adb87b4ab881677fd2cd0d",
  measurementId: "G-4WDCKQJYEY"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
