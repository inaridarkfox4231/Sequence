// attractionPointの実験。
// これはその方向に向かう速度ベクトルを足し算するので、
// 具体的にその方向に向かわせたいときは一旦速度を(0, 0)で初期化する。
'use strict';
var circle;
var circleGroup;
var circleImage;
var circleImages = [];
var MAX_CIRCLE = 5;
var numOfCircle = 0;
var appearCount = 30; // 0.5秒ごとに出現

var i;

// 球の画像をロード
function preload(){
  for(var i = 0; i < 3; i++){
    circleImage = loadImage("./assets/circle_" + i + ".png");
    circleImages.push(circleImage);
  }
}

function setup(){
  createCanvas(640, 480);
  circleGroup = new Group();
}

function draw(){
  clear();
  background(220);
  makeCircles();
  update();
  drawSprites();
}

function update(){
  if(circleGroup.size() !== 0){
    for(i = 0; i < circleGroup.size(); i++){
      circle = circleGroup[i];
      if(circle.position.y > height){ circle.remove(); numOfCircle -= 1; continue; }
      else if(circle.position.y > 200 && circle.flag === false){
        circle.flag = true;
        circle.setVelocity(0, 0); // 速度の初期化
        circle.attractionPoint(10, width / 2, height);
      }
    }
  }
}

function makeCircles(){
  if(numOfCircle < MAX_CIRCLE){
    appearCount -= 1;
    if(appearCount === 0){
      makeCircle(random(80, 560), random(80, 120), Math.floor(random(0, 3)));
      numOfCircle += 1;
      appearCount = 30;
    }
  }
}

function makeCircle(x, y, kind){
  circle = createSprite(x, y, 40, 40);
  circle.addImage(circleImages[kind]);
  circle.addToGroup(circleGroup);
  if(kind === 0){
    circle.setVelocity(0, 5);
  }else if(kind === 1){
    circle.setVelocity(-5, 5);
  }else if(kind === 2){
    circle.setVelocity(5, 5);
  }
  circle.flag = false;
}
