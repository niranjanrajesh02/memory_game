import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

var firebaseConfig = {
    apiKey: "AIzaSyACxVzqA12OMksq_bYbTxAhLju7DsvYEJc",
    authDomain: "sasta-guitarhero.firebaseapp.com",
    projectId: "sasta-guitarhero",
    storageBucket: "sasta-guitarhero.appspot.com",
    messagingSenderId: "872672605497",
    appId: "1:872672605497:web:96b461c0daf8b9d80a24e8",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export const database = firebase.database();
