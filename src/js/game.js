import * as PIXI from "pixi.js";
import { Application, Container, Graphics, Sprite, TextStyle, Texture, } from "pixi.js";
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
  gameWidth: 600
}

let app = new Application({
  width: DIMENSIONS.mainWidth,
  height: DIMENSIONS.height,
  antialias: true,
  resolution: 1,
});

document.querySelector("#main").appendChild(app.view);


loader
  .load(setup);


let textStyle = new TextStyle({fill: "black"})

let state, gameScene, gameBg, gameOverScene;

let scoreScene, scoreText, scoreBg;


function setup() {

  gameScene = new Container();
  scoreScene = new Container();

  app.stage.addChild(scoreScene);
  app.stage.addChild(gameScene);

  // Score Background
  scoreBg = new Sprite(Texture.WHITE);
  scoreBg.width = DIMENSIONS.mainWidth - DIMENSIONS.gameWidth - 10;
  scoreBg.height = DIMENSIONS.height - 10;
  scoreBg.position.set(5, 5);
  scoreBg.tint = 0x777777;

  scoreScene.addChild(scoreBg);
  scoreScene.position.set(DIMENSIONS.gameWidth, 0);

  // Score Text
  scoreText = lib.createText(0, 0, "score: 10", textStyle, scoreScene);
  scoreText.position.set(scoreBg.width / 2 - scoreText.width / 2, 50);

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
  for (let i = 0; i < 7; i++) {

    let offsetX = 60;
    let gap = 70;

    if (i == 3) {
      continue;
    }

    let fret = new Sprite(Texture.WHITE);
    fret.width = 60
    fret.height = 20
    fret.tint = 0xffffff;

    fret.position.set(offsetX + i * gap, DIMENSIONS.height - 60);
    gameScene.addChild(fret);

  }
  
  state = play;

  app.ticker.add((delta) => gameLoop(delta));
}


function gameLoop(delta) {
  state(delta);
}


function play(delta) {

}


