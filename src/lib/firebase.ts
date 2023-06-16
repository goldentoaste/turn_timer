// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp,  } from "firebase/app";

import { Firestore, getFirestore } from "firebase/firestore";
import {PUBLIC_FIREBASE_KEY} from '$env/static/public'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: PUBLIC_FIREBASE_KEY,
    authDomain: "mtg-turn-timer.firebaseapp.com",
    projectId: "mtg-turn-timer",
    storageBucket: "mtg-turn-timer.appspot.com",
    messagingSenderId: "753270612934",
    appId: "1:753270612934:web:81e7f7e86f653c716b08c7",
    measurementId: "G-KSFQZBDXTV"
    
};

// Initialize Firebase
let app : FirebaseApp ;
let db : Firestore ;
function initializeFB(){
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    

}

export {app, db, initializeFB};
