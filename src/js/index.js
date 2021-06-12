import { provider, auth, database } from "../lib/firebase";
import app from "./game";
import * as game from "./game";

import "../css/global.css";

const signedOut = document.getElementById("signedOut");
const signedIn = document.getElementById("signedIn");

const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const finishBtn = document.getElementById("finishBtn");

const userDetails = document.getElementById("userDetails");

document.querySelector("#main").appendChild(app.view);


signInBtn.onclick = () => {
    auth.signInWithPopup(provider)
        .then(res => {
            user = res.user;
            console.log(user.uid);
        })
        .catch(console.log);
}

signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        signedIn.hidden = false;
        signedOut.hidden = true;
        userDetails.innerHTML = `<p style="padding: 0; margin: 0;">Hello ${user.displayName}</p>`

        finishBtn.onclick = (e) => {
            if (game.isGameOver) {
                console.log("game over");

                e.preventDefault();

                const ref = database.ref(user.uid);
                const data = {
                    hits: game.hits,
                    misses: game.misses,
                    hitRate: game.hitRate,
                    avgReactionTime: game.reactionTimes,
                };
                console.log(user.uid, data);

                ref.push(data);

            } else {
                alert("game not over yet");
            }
        };

    } else {
        signedIn.hidden = true;
        signedOut.hidden = false;
        userDetails.innerHTML = ``;
    }
});

console.log(game);
