// 三角関数を使わずに振動を表現する
'use strict';
var square;
var squareGroup;
var squareImages = [];
var squareImage;
var dir_x = [1, 1, -1, -1];
var dir_y = [1, -1, 1, -1];

function preload(){
  for(i = 0; i < 5; i++){
    squareImage = loadImage("./assets/color_" + i + ".png");
    squareImages.push(squareImage);
  }
}

function setup(){
  createCanvas(640, 480);
  squareGroup = new Group;
}

function draw(){
  clear();
  background(220);
  move(); // 動く
  drawSprites(); // 正方形の描画
}

function move(){
  squareGroup.forEach(function(s){
    // d^2y/dx^2 = -yを表現している
    if(s.kind === 0){
      s.velocity.x += (s.pivot_x - s.position.x) / 50;
      s.velocity.y += (s.pivot_y - s.position.y) / 50;
    }else if(s.kind === 1){
      s.velocity.x += (s.pivot_x - s.position.x) / 25;
      s.velocity.y += (s.pivot_y - s.position.y) / 50;
    }else if(s.kind === 2){
      s.velocity.x += (s.pivot_x - s.position.x) / 17;
      s.velocity.y += (s.pivot_y - s.position.y) / 25;
    }else if(s.kind === 3){
      s.velocity.x += (s.pivot_x - s.position.x) / 25 + (s.pivot_y - s.position.y) / 50;
      s.velocity.y += (s.pivot_y - s.position.y) / 25 + (s.pivot_x - s.position.x) / 50;
    }
  })
}

function keyTyped(){
  if(key === 'a'){
    var x = random(80, 560);
    var y = random(80, 400);
    var kind_of_dir = Math.floor(random(0, 4));
    var sign_x = dir_x[kind_of_dir];
    var sign_y = dir_y[kind_of_dir];
    square = createSprite(x + sign_x * random(30, 60), y + sign_y * random(30, 60), 20, 20);
    var kind = Math.floor(random(0, 5));
    square.kind = kind;
    square.pivot_x = x;
    square.pivot_y = y;
    square.life = 600; // 10秒で消滅する
    square.addImage(squareImages[kind]);
    square.addToGroup(squareGroup);
  }
}
