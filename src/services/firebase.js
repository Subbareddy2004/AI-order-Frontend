import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCEf2mLsMWEosjq3OrjGOcOKWifGmLzelM",
    authDomain: "ecub-v2.firebaseapp.com",
    projectId: "ecub-v2",
    storageBucket: "ecub-v2.appspot.com",
    messagingSenderId: "214420805388",
    appId: "1:214420805388:web:46c51e24fd1ea47115db29",
    measurementId: "G-86JX881R23"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Only initialize storage if it's needed
let storage = null;
try {
    storage = getStorage(app);
} catch (error) {
    console.warn("Firebase Storage is not initialized. This is fine if you're not using it.");
}

export { db, storage, collection, getDocs, doc, getDoc };