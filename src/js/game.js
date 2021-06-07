import * as PIXI from "pixi.js";
import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import * as lib from "./lib";

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
};

let app = new Application({
  width: DIMENSIONS.mainWidth,
  height: DIMENSIONS.height,
  antialias: true,
  resolution: 1,
});

document.querySelector("#main").appendChild(app.view);

loader.load(setup);

let state, gameScene, gameBg, gameOverScene;
let scoreScene, scoreText, missText, scoreBg;
let numberOfNotes, noteSpeed, noteGenerateLag, timer;
let frets, keyInputs, notes;
let hits, misses;

function setup() {
  gameScene = new Container();
  scoreScene = new Container();

  app.stage.addChild(scoreScene);
  app.stage.addChild(gameScene);

  // Score Background
  hits = 0; misses = 0
  scoreBg = new Sprite(Texture.WHITE);
  scoreBg.width = DIMENSIONS.mainWidth - DIMENSIONS.gameWidth - 10;
  scoreBg.height = DIMENSIONS.height - 10;
  scoreBg.position.set(5, 5);
  scoreBg.tint = 0x777777;

  scoreScene.addChild(scoreBg);
  scoreScene.position.set(DIMENSIONS.gameWidth, 0);

  // Score Text
  scoreText = lib.createText(0, 0, `score: ${hits}`, { fill: "black" }, scoreScene);
  scoreText.position.set(scoreBg.width / 2 - scoreText.width / 2, 50);

  missText = lib.createText(
    0,
    0,
    `misses: ${misses}`,
    { fill: "black" },
    scoreScene
  );
  missText.position.set(scoreBg.width / 2 - missText.width / 2, 100);

  // Game Background
  gameBg = new Sprite(Texture.WHITE);
  gameBg.width = DIMENSIONS.gameWidth;
  gameBg.height = DIMENSIONS.height;
  gameBg.position.set(0, 0);
  gameBg.tint = 0x111111;

  gameScene.addChild(gameBg);

  // The distance between each pole is 70, there are 8 such poles, hence 7 spaces,
  // therefore total width between the first and last pole will be 7 * 70 = 490.
  // Total width of the gameScene is 600, hence there is a whitespace of 110 on both sides.

  // Lines
  for (let i = 0; i < 8; i++) {
    let offsetX = 55;
    let gap = 70;

    let line = new Graphics();

    line.lineStyle(2, 0xeeeeee, 1);

    line.moveTo(offsetX + i * gap, 100);
    line.lineTo(offsetX + i * gap, DIMENSIONS.height - 20);

    if (i == 0 || i == 7) {
      // For the last two lines
      line.lineStyle(2, 0x444444, 1);
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
    fret.tint = 0xffffff;

    fret.position.set(offsetX + i * gap, DIMENSIONS.height - 80);
    frets.push({ fret: fret, isPressed: false });

    gameScene.addChild(fret);
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

  keyInputs.forEach((key, i) => {
    key.press = () => {
      frets[i].isPressed = true;
    };
    key.release = () => {
      frets[i].isPressed = false;
    };
  });

  // Notes
  numberOfNotes = 1; noteSpeed = 5
  notes = [];

  for (let i = 0; i < numberOfNotes; i++) {
    generateNote();
    
  }

  noteGenerateLag = 100;
  timer = noteGenerateLag;

  notes.forEach(note => console.log(note.y))
  state = play;
  app.ticker.add((delta) => gameLoop(delta));
}

function generateNote() {
  let noteOffsetX = 90,
    noteGapX = 70;

  let x;

  while (true) {
    x = lib.randomInt(0, 6);
    if (x != 3) {
      break;
    }
  }  
  
  let circle = lib.createCircle(
    noteOffsetX + noteGapX * x,
    lib.randomInt(-30, -500),
    20,
    0xffffff
  );
  circle.vx = 0;
  circle.vy = noteSpeed;

  circle.tint = 0xffffff;

  notes.push(circle);
  gameScene.addChild(circle);
}

function gameLoop(delta) {
  state(delta);
}

function play(delta) {
  
  timer = timer >= 0 ? --timer : noteGenerateLag

  // console.log(timer)
  if (timer === 1) {
    generateNote();
  }

  frets.forEach((fret) => {
    if (fret.isPressed) {
      fret.fret.tint = 0x555555;
    } else {
      fret.fret.tint = 0xffffff;
    }
  });

  notes.forEach((note, index, object) => {
    note.y += note.vy * delta;
    
    frets.forEach(fret => {
      if (
        (lib.getDistance(
          fret.fret.x + fret.fret.width / 2,
          fret.fret.y + fret.fret.height / 2,
          note.x,
          note.y
        ) <
        fret.fret.height / 2 + note.width / 2) && fret.isPressed
      ) {
        console.log("hit");
        note.clear();
        object.splice(index, 1);
        hits += 1
        scoreText.text = `score: ${hits}`
      }
    })

    if (note.y + note.height / 2 > DIMENSIONS.height) {
      note.clear();
      object.splice(index, 1);
      // note.y = -100
      misses += 1;
      missText.text = `misses: ${misses}`;
    }
  })


}
