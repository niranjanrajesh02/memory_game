import {Graphics, Text, TextStyle} from "pixi.js";


function createText(x, y, text, style, container) {

  let textStyle = new TextStyle(style);

  let message = new Text(text, textStyle);

  container.addChild(message);
  message.position.set(x, y);
  return message;
}

function createCircle(x, y, radius, color) {
  let circle = new Graphics();
  circle.beginFill(color);
  circle.drawCircle(0, 0, radius);
  circle.endFill();

  circle.position.set(x, y);
  
  return circle;
}

function rectCollisionCheck(rect1, rect2) {
  let hit = false;

  rect1.centerX = rect1.x + rect1.width / 2;
  rect1.centerY = rect1.y + rect1.height / 2;
  rect2.centerX = rect2.x + rect2.width / 2;
  rect2.centerX = rect2.y + rect2.height / 2;

  rect1.halfWidth = rect1.width / 2;
  rect1.halfHeight = rect1.height / 2;
  rect2.halfWidth = rect2.width / 2;
  rect2.halfHeight = rect2.height / 2;

  let vx = rect1.centerX - rect2.centerX;
  let vy = rect1.centerY - rect2.centerY;

  let combinedHalfWidths = rect1.halfWidth + rect2.halfWidth;
  let combinedHalfHeights = rect1.halfHeight + rect2.halfHeight;

  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }

  return hit;
}
// 
function keyboard(keyCode) {
  var key = {};

  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downHandler = (e) => {
    if (e.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }

    e.preventDefault();
  };

  key.upHandler = (e) => {
    if (e.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }

    e.preventDefault();
  };

  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);

  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);

  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };

  return key;
}

function contains(entity, container) {
  let collision = undefined;

  // Left
  if (entity.x < container.x) {
    entity.x = container.x;
    collision = "left";
  }

  // Right
  if (entity.x + entity.width > container.x + container.width) {
    entity.x = container.x + container.width - entity.width;
    collision = "right";
  }

  // Top
  if (entity.y < container.y) {
    entity.y = container.y;
    collision = "top";
  }

  // Bottom
  if (entity.y + entity.height > container.y + container.height) {
    entity.y = container.y + container.height - entity.height;
    collision = "bottom";
  }

  return collision;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function circleCollisionCheck(c1, c2) {

  let hit = false;

  if (getDistance(c1.x, c1.y, c2.x, c2.y) < c1.width / 2 + c2.width / 2) {
    hit = true;
  }

  return hit;
}

function circleCollisionBounce(c1, c2) {
  let hit = false;
  let dx, dy;

  let magnitude = Math.sqrt(
    Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2)
  );

  let combinedRad = c1.width / 2 + c2.width / 2;

  if (magnitude < combinedRad) {
    hit = true;

    dx = (c2.x - c1.x) / magnitude;
    dy = (c2.y - c1.y) / magnitude;

    c1.x -= (combinedRad - magnitude) * dx;
    c1.y -= (combinedRad - magnitude) * dy;
  }

  return hit;
}


export {
  createCircle,
  rectCollisionCheck,
  keyboard,
  contains,
  randomInt,
  circleCollisionCheck,
  getDistance,
  circleCollisionBounce,
  createText,
};
