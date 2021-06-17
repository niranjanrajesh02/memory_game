import { provider, auth, database } from "../lib/firebase";
import app from "./game";
import * as game from "./game";
import getRandomPassSequence from "./PassSequences";

import "../css/global.css";

const signedOut = document.getElementById("signedOut");
const signedIn = document.getElementById("signedIn");

const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const finishBtn = document.getElementById("finishBtn");

const userDetails = document.getElementById("userDetails");
const loginToPlay = document.getElementById("loginToPlay");



signInBtn.onclick = () => {
    auth.signInWithPopup(provider)
        .then(res => {
            console.log(res.user.uid);
        })
        .catch(console.log);
}

signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        signedIn.hidden = false;
        signedOut.hidden = true;

        userDetails.innerHTML = `<p style="padding: 0; margin: 0;">Hello ${user.displayName}!</p>`

        const ref = database.ref(user.uid);
        ref.once("value", (data) => {
            const userExists = data.val();
            //if user is new
            if (!userExists) {
                let seq = getRandomPassSequence()
                ref.child("passSequence").set(seq, () => {
                    game.setPassSequence(seq);
                });
            } else {
                // console.log(userExists);
                game.setPassSequence(userExists.passSequence);
            }
            document.querySelector("#main").appendChild(app.view);
        });

        finishBtn.onclick = (e) => {
            console.log();
            if (game.isGameOver && game.gameNumber === game.totalGameNumber + 1) {
                // const avgReaction = avgArray(game.reactionTimes);
                console.log("game over");
                e.preventDefault();
                const data = {
                    hits: game.hits,
                    misses: game.misses,
                    hitRate: game.hitRate.toFixed(3),
                    // avgReactionTime: avgReaction.toFixed(3),
                };
                console.log(user.uid, data);

                ref.push(data);
                alert(`Uploaded your data:- HITS:${data.hits}, MISSES:${data.misses}, HITRATE:${data.hitRate}.  Thanks for playing!`);
            } else {
                alert(`Game not over yet, Game number ${game.gameNumber} out of 7`);
            }
        };
    } else {
        signedIn.hidden = true;
        signedOut.hidden = false;
        loginToPlay.innerHTML = `<p style="padding: 0; margin: 0;">Login to Play</p>`;
        document.querySelector("#main").removeChild(app.view);
    }
});

// console.log(game);
