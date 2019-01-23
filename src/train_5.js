// ランダムウォークの実験なんだけどうまくいってないね・・・
// これも多分シーケンスの応用で表現できないことはない、はず
// そのうち書き直しますか。
'use strict';
var circle;
var circleGroup;
var circleImage;
var circleImages = [];
var numOfCircles = 0;
var MAX_CIRCLE = 10;
var dx = [1, 0, -1, 0];
var dy = [0, 1, 0, -1];

function preload(){
  for(var i = 0; i < 3; i++){
    circleImage = loadImage("./assets/circle_" + i + ".png");
    circleImages.push(circleImage);
  }
}

function setup(){
  createCanvas(400, 400);
  circleGroup = new Group();
}

function draw(){
  clear();
  background(220);
  noFill();
  ellipse(200 + 100 * sin(frameCount * PI / 60), 50, 50);
  moveCircles();
  drawSprites();
}

function moveCircles(){
  circleGroup.forEach(function(c){
    if((frameCount - c.birth) % 10 === 0){
      c.dir_id = random([0, 1, 2, 3]);
      var new_x = c.position.x + dx[c.dir_id] * 50;
      var new_y = c.position.y + dy[c.dir_id] * 50;
      if(new_x < 40 || new_y < 40 || new_x > 360 || new_y > 360){
        console.log("Hello");
        c.dir_id = (c.dir_id + 2) % 4;
      }
      c.setVelocity(5 * dx[circle.dir_id], 5 * dy[circle.dir_id]);
    }
  })
}

function makeCircles(){
}

function makeCircle(x, y, kind){
  circle = createSprite(x, y, 40, 40);
  circle.addImage(circleImages[0]);
  circle.addToGroup(circleGroup);
  circle.birth = frameCount; // 出現した時点でのフレーム数を記録しておくんだけど・・・
  circle.dir_id = random([0, 1, 2, 3]);
  circle.setVelocity(5 * dx[circle.dir_id], 5 * dy[circle.dir_id]);
  circle.life = 600;
}

function keyTyped(e){
  if(e.charCode === 97){
    makeCircle(200, 200, 0);
    console.log(circleGroup.size());
  }
}
