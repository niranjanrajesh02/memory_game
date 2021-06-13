import * as PIXI from "pixi.js";
import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";

import * as lib from "../lib/lib";

let loader = PIXI.Loader.shared;

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas";
}

PIXI.utils.sayHello(type);

let DIMENSIONS = {
  height: 600,
  mainWidth: 800,
  gameWidth: 600,
  antialias: false,
};

let app = new Application({
  width: DIMENSIONS.mainWidth,
  height: DIMENSIONS.height,
  resolution: 1,
});

// document.querySelector("#main").appendChild(app.view);

loader.load(setup);

let state, gameScene, gameBg, isPaused;
let gameOverBg, gameOverText, gameOverScene, restartButton, restart;
let scoreScene, scoreText, missText, hitText, scoreBg;
let numberOfNotes, noteSpeed, noteGenerateLag, timer;
let frets, keyInputs, notes;

let hits = 0;
let misses = 0;
let hitRate = 0;
let prevHitRate = 0;
let noteCounter = 0;
let prevNoteCounter = 0;
let isGameOver;
let reactionTimes = [];
let avgReactionTime = 0;

let indexForNotes = 0;
let obj = { "S": 0, "D": 1, "F": 2, "J": 4, "K": 5, "L": 6 };  // Note to integer conversion
let passSequence = [
  "S",
  "D",
  "F",
  "J",
  "K",
  "L",
  "D",
  "S",
  "J",
  "K",
  "L",
  "K",
  "L",
  "D",
  "S",
  "J",
  "K",
  "D",
  "S",
  "J",
  "K",
  "L",
  "F",
  "J",
  "K",
  "L",
  "D",
  "S",
  "L",
  "S"
]; // Password sequence for the current user.


function setup() {
  isPaused = true;
  restart = false;
  isGameOver = false;

  gameScene = new Container();
  scoreScene = new Container();
  gameOverScene = new Container();

  app.stage.addChild(scoreScene);
  app.stage.addChild(gameScene);
  app.stage.addChild(gameOverScene);

  // Score Background
  hits = 0;
  misses = 0;
  hitRate = 0;

  scoreBg = new Sprite(Texture.WHITE);
  scoreBg.width = DIMENSIONS.mainWidth - DIMENSIONS.gameWidth - 10;
  scoreBg.height = DIMENSIONS.height - 10;
  scoreBg.position.set(5, 5);
  scoreBg.tint = 0x777777;

  scoreScene.addChild(scoreBg);
  scoreScene.position.set(DIMENSIONS.gameWidth, 0);

  // Score Text
  scoreText = lib.createText(`score: ${hits}`, { fill: "black" }, scoreScene);
  scoreText.position.set(scoreBg.width / 2 - scoreText.width / 2, 50);

  missText = lib.createText(`misses: ${misses}`, { fill: "black" }, scoreScene);
  missText.position.set(scoreBg.width / 2 - missText.width / 2, 100);

  hitText = lib.createText(
    `${hitRate.toPrecision(3)}`,
    { fill: "black" },
    scoreScene
  );
  hitText.position.set(scoreBg.width / 2 - hitText.width / 2, 150);

  // Game Over
  gameOverBg = new Sprite(Texture.WHITE);
  gameOverBg.width = DIMENSIONS.gameWidth;
  gameOverBg.height = DIMENSIONS.height;
  gameOverBg.position.set(0, 0);
  gameOverBg.tint = 0xffffff;

  restartButton = new Sprite(Texture.WHITE);
  restartButton.width = 25;
  restartButton.height = 25;
  restartButton.position.set(0, 0);
  restartButton.tint = 0x000000;
  restartButton.interactive = true;
  restartButton.on("mouseup", () => {
    restart = true;
  });

  gameOverScene.addChild(gameOverBg);
  gameOverScene.addChild(restartButton);

  gameOverScene.visible = false;

  // Game Over Text
  gameOverText = lib.createText(
    `GAME OVER`,
    {
      fill: "black",
      fontFamily: "pixel, sans-serif",
    },
    gameOverScene
  );
  gameOverText.position.set(
    gameOverBg.width / 2 - gameOverText.width / 2,
    gameOverBg.height / 2 - gameOverText.height / 2
  );

  // Game Background
  gameBg = new Sprite(Texture.WHITE);
  gameBg.width = DIMENSIONS.gameWidth;
  gameBg.height = DIMENSIONS.height;
  gameBg.position.set(0, 0);
  gameBg.tint = 0xffffff;

  gameScene.addChild(gameBg);

  // The distance between each pole is 70, there are 8 such poles, hence 7 spaces,
  // therefore total width between the first and last pole will be 7 * 70 = 490.
  // Total width of the gameScene is 600, hence there is a whitespace of 110 on both sides.

  // Lines
  for (let i = 0; i < 8; i++) {
    let offsetX = 55;
    let gap = 70;

    let line = new Graphics();

    line.lineStyle(2, 0x000000, 1);

    line.moveTo(offsetX + i * gap, 100);
    line.lineTo(offsetX + i * gap, DIMENSIONS.height - 20);

    if (i == 0 || i == 7) {
      // For the last two lines
      line.lineStyle(2, 0x000000, 1);
      line.moveTo(offsetX + i * gap, 20);
      line.lineTo(offsetX + i * gap, DIMENSIONS.height - 20);
    }

    gameScene.addChild(line);
  }

  // Frets
  frets = [];

  for (let i = 0; i < 7; i++) {
    let offsetX = 60;
    let gap = 70;

    if (i == 3) {
      continue;
    }

    let fret = new Sprite(Texture.WHITE);
    fret.width = 60;
    fret.height = 20;
    fret.tint = 0x000000;

    fret.position.set(offsetX + i * gap, DIMENSIONS.height - 80);
    frets.push({ fret: fret, isPressed: false });

    gameScene.addChild(fret);
  }

  let letters = "SDFJKL";

  for (let i = 0; i < 6; i++) {
    let letter = lib.createText(
      `${letters[i]}`,
      { fill: "black", fontFamily: "pixel, sans-serif" },
      gameScene
    );
    let j = i > 2 ? i + 1 : i;
    let offsetX = 60 + 30;
    let gap = 70;
    letter.position.set(
      offsetX - letter.width / 2 + j * gap,
      DIMENSIONS.height - 60
    );
  }

  // Keyboard Input
  keyInputs = [];

  keyInputs.push(
    lib.keyboard(83),
    lib.keyboard(68),
    lib.keyboard(70),
    lib.keyboard(74),
    lib.keyboard(75),
    lib.keyboard(76)
  );

  let space = lib.keyboard(32);
  let esc = lib.keyboard(27);

  space.press = () => {
    isPaused = !isPaused;
  };

  esc.press = () => {
    isGameOver = true;
  };

  keyInputs.forEach((key, i) => {
    key.press = () => {
      frets[i].isPressed = true;
    };
    key.release = () => {
      frets[i].isPressed = false;
    };
  });

  // Notes
  numberOfNotes = 1;
  noteSpeed = 5;
  notes = [];

  // for (let i = 0; i < numberOfNotes; i++) {
  //   generateNote(-1);
  // }

  noteGenerateLag = 50;
  timer = 1;

  state = play;
  app.ticker.add((delta) => gameLoop(delta));
}

function noteSequence() {
  let subBlock = lib.subBlockGen(passSequence);
  console.log(subBlock);
  if (indexForNotes > passSequence.length - 1) {
    // isGameOver = true;
  } else {
    generateNote(obj[subBlock[indexForNotes]]);
    indexForNotes++;
  }
}

// If n === -1 or 3: random note; 1-2 and 4-6: appropriate column
function generateNote(n) {
  let noteOffsetX = 90,
    noteGapX = 70;

  let x;

  while (true) {
    x = n === -1 || n === 3 ? lib.randomInt(0, 6) : n;

    if (x !== 3) {
      break;
    }
  }

  let circle = lib.createCircle(
    noteOffsetX + noteGapX * x,
    lib.randomInt(-100, -100),
    20,
    0xffffff
  );

  circle["vx"] = 0;
  circle["vy"] = noteSpeed;

  circle.tint = 0x000000;
  circle["isInsideFretTime"] = 0;

  notes.push(circle);
  // console.log(circle);

  gameScene.addChild(circle);
}

function gameLoop(delta) {
  state(delta);
}

function hitRateMonitor(prevHR, curHR) {
  console.log("hitRate:", curHR.toPrecision(3), prevHR.toPrecision(3), "speed:", noteSpeed.toPrecision(3));
  let alpha = 10;

  noteSpeed = Math.floor(noteSpeed - ((0.7 - curHR) * alpha))
  noteGenerateLag = Math.floor(noteGenerateLag + ((0.7 - curHR) * 25))

  if (noteSpeed < 3) {
    noteSpeed = 3;
  }
  else if (noteSpeed > 15) {
    noteSpeed = 15;
  }
  //changing noteGenerateLag
  if (noteGenerateLag > 55) {
    noteGenerateLag = 55;
  }
  else if (noteGenerateLag < 20) {
    noteGenerateLag = 20;
  }
  console.log(noteSpeed);
  console.log(noteGenerateLag);
}

function collisionCheck(fret, note) {
  return (
    lib.getDistance(
      fret.fret.x + fret.fret.width / 2,
      fret.fret.y + fret.fret.height / 2,
      note.x,
      note.y
    ) <
    fret.fret.height / 2 + note.width / 2
  );
}

function play(delta) {
  gameScene.visible = true;
  gameOverScene.visible = false;

  if (!isPaused) {

    if (indexForNotes > passSequence.length - 1 && notes.length === 0) {
      if (timer === 0) {
        isGameOver = true;
      }
    }

    if (
      noteCounter !== prevNoteCounter &&
      noteCounter % 20 === 0 &&
      noteCounter !== 0
    ) {
      console.log("counter: ", noteCounter);
      hitRateMonitor(prevHitRate, hitRate);
      notes.forEach((note) => {
        note.vy = noteSpeed;
      });
    }

    gameBg.tint = 0xffffff;

    // Timer loop, timer is a decerement counter which ranges between noteGenerateLag and 0,
    // and when it hits 0, it generates a new note and goes back to noteGenerateLag to start decerementing again
    timer = timer > 0 ? --timer : noteGenerateLag;

    if (timer === 0) {
      // generateNote(-1);
      noteSequence();
    }

    // Fret press.
    frets.forEach((fret) => {
      if (fret.isPressed) {
        fret.fret.tint = 0x222222;
      } else {
        fret.fret.tint = 0x000000;
      }
    });

    prevHitRate = hitRate;
    prevNoteCounter = noteCounter;

    // For each note check if it is colliding with any fret.
    notes.forEach((note, index, object) => {
      note.y += note.vy * delta;

      frets.forEach((fret) => {
        if (collisionCheck(fret, note)) {

          // The reaction time, this is the epoch time when note enters the fret
          if (!note.isInsideFretTime) {
            note.isInsideFretTime = new Date().valueOf();
          }

          if (fret.isPressed) {
            note.clear();
            object.splice(index, 1);
            hits += 1;

            hitRate = hits / (hits + misses);
            scoreText.text = `score: ${hits}`;
            hitText.text = `${hitRate.toPrecision(3)}`;
            noteCounter++;

            // This subtracts the time when the user presses the corresponding fret to 
            // with the previously taken time
            reactionTimes.push(new Date().valueOf() - note.isInsideFretTime);
          }
        }
      });

      // Checks if ball is outside the boundry.
      if (note.y + note.height / 2 > DIMENSIONS.height) {
        note.clear();
        object.splice(index, 1);
        misses += 1;
        hitRate = hits / (hits + misses);
        missText.text = `misses: ${misses}`;
        hitText.text = `${hitRate.toPrecision(3)}`;
        noteCounter++;
      }
    });

  } else {
    gameBg.tint = 0x333333;
  }

  if (isGameOver) {
    state = end;
  }
}

function end(delta) {
  gameScene.visible = false;
  gameOverScene.visible = true;


  notes.forEach((note) => {
    note.clear();
  });

  notes = [];

  if (restart) {
    hits = 0;
    misses = 0;
    hitRate = 0;
    prevHitRate = 0;
    prevNoteCounter = 0;
    noteCounter = 0;
    indexForNotes = 0;
    noteGenerateLag = 50;
    noteSpeed = 5;

    scoreText.text = `score: ${hits}`;
    hitText.text = `${hitRate.toPrecision(3)}`;
    missText.text = `misses: ${misses}`;
    reactionTimes = [];

    isGameOver = false;
    restart = false;
    isPaused = true;
    state = play;
  }
}

export {
  hits,
  misses,
  hitRate,
  isGameOver,
  reactionTimes,
};
export default app;
