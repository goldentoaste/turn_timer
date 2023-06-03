// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp,  } from "firebase/app";

import { Firestore, getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDs1jHwnL2dem61w7DRc0HSiE1w4w2d3Js",
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
