import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

var firebaseConfig = {
	apiKey: "AIzaSyAwCB018SfqeoO6-B6rURJlLhYFCBf4tnk",
	authDomain: "memory-game-efd15.firebaseapp.com",
	projectId: "memory-game-efd15",
	storageBucket: "memory-game-efd15.appspot.com",
	messagingSenderId: "1095150748980",
	appId: "1:1095150748980:web:08cc96a7c8dbeb0b659161",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export const database = firebase.database();