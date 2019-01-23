// 中心から周囲に向かって弾を発射する
// 若干速くて忙しく見えてしまうので色々工夫したほうがいいかも

'use strict';
let angleCoefficient = 0; // 0～24. これをPI/12に掛けて角度を決定。10フレームごとに発射。
let circleGroup;
let circle;
let circleImage;

function preload(){
  circleImage = loadImage("./assets/circle.png");
}

function setup(){
  createCanvas(400, 400);
  circleGroup = new Group();
  noFill();
}

function draw(){
  clear();
  background(220);
  translate(width / 2, height / 2);
  if(frameCount % 10 === 0){
    angleCoefficient = (angleCoefficient + 1) % 24;
    createCircle();
  }
  circleGroup.forEach(function(c){
    if(c.position.x < -width / 2 || c.position.x > width / 2 || c.position.y < -height / 2 || c.position.y > height / 2){
      c.remove();
    }
  })
  drawSprites();
}

function createCircle(){
  circle = createSprite(0, 0, 20, 20);
  circle.addImage(circleImage);
  circle.setVelocity(5 * cos(angleCoefficient * (PI / 12)), 5 * sin(angleCoefficient * (PI / 12)));
  circle.addToGroup(circleGroup);
}
