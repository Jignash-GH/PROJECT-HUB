// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7tIHxICQx7Fo74gycrlAK4Eec1U0srHc",
    authDomain: "project-hub-da1ad.firebaseapp.com",
    projectId: "project-hub-da1ad",
    storageBucket: "project-hub-da1ad.firebasestorage.app",
    messagingSenderId: "691394585263",
    appId: "1:691394585263:web:6a7fb37548163b12072a5a",
    measurementId: "G-J2XQ5ZVQ7V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export everything
export {
    db,
    collection,
    getDocs,
    addDoc,
    query,
    where,
    orderBy
};