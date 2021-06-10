import { provider, auth } from "../lib/firebase";
import app from "./game";

import "../css/global.css";

const signedOut = document.getElementById("signedOut");
const signedIn = document.getElementById("signedIn");

const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const userDetails = document.getElementById("userDetails");

document.querySelector("#main").appendChild(app.view);


signInBtn.onclick = () => {
    auth.signInWithPopup(provider)
        .then(res => {
            const user = res.user;
        })
        .catch(console.log);
}

signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        signedIn.hidden = false;
        signedOut.hidden = true;
        userDetails.innerHTML = `<p>Hello ${user.displayName}</p>`
    } else {
        signedIn.hidden = true;
        signedOut.hidden = false;
        userDetails.innerHTML = ``;
    }
})