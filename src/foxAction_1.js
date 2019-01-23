// アクション・・ゲーム？？
// 狐のアクションゲーム、横スクロールで走ってダッシュとかして
// 障害物抜けたりリフト乗ったりしながらゴールを目指す
// ボタンできつねびはっしゃ！
// ためると強力なのが出せるよ！
// レベルが上がるとより強力なこうげ（以下略）
// アイテムを接触で取得して
// ブロック頭突きして（いい加減にしろ）

'use strict';
let player;
let playerImageRight;
let playerImageLeft;


function preload(){
  playerImageRight = loadImage("./assets/fox_right.png");
  playerImageLeft = loadImage("./assets/fox_left.png");
}

function setup(){
  createCanvas(640, 480);
  createPlayer();
}

function draw(){
  background(157, 217, 234);
  fill(185, 122, 87);
  stroke(185, 122, 87);
  rect(0, 400, width - 1, height - 1);
  player.calcPosition();
  drawSprites();
}

function createPlayer(){
  player = createSprite(100, 100, 32, 32);
  player.addImage('right', playerImageRight);
  player.addImage('left', playerImageLeft);
  player.jump = 1; // 1で空中にいる状態、0で地上にいる状態。
  player.speed = 5;
  player.calcPosition = function(){
    if(this.jump === 2){ this.velocity.y += 0.2; }
    else if(this.jump === 1){ this.velocity.y += 0.4; }
    if(this.position.y > 384){ this.jump = 0; this.position.y = 384; }
    if(keyIsDown(RIGHT_ARROW)){ this.position.x += this.speed; player.changeImage('right'); }
    else if(keyIsDown(LEFT_ARROW)){ this.position.x -= this.speed; player.changeImage('left'); }
    this.position.x = constrain(this.position.x, 16, width - 16);
  };
}

function keyPressed(e){
  if(e.keyCode === 32 && player.jump === 0){
    player.velocity.y = -8;
    player.jump = 2;
  }
}

function keyReleased(e){
  if(e.keyCode === 32 && player.jump === 2){ player.jump = 1; }
}
