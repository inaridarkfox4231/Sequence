// シーケンスを作る前段階
// ここでやりたかったことは、スプライトにその場所から特定の場所へ直線的に
// 一定フレーム数で移動する命令が出せるようにすること。
// はっきり言ってダメダメ。正方形を生成するときにdestinationだのmoveTimeだの書いてる。
// まあ、実現するだけだから・・この時点ではね。

'use strict';
// エンターキーを押すたびに正方形が移動するアニメーション
let square;
let squareImage;
let state = {stop: 0, moving: 1};

function preload(){
  squareImage = loadImage('./assets/squares/square0.png');
}

function setup(){
  createCanvas(400, 400);
  createSquare();
}

function draw(){
  background(220);
  drawSprites();
}

function createSquare(){
  square = createSprite(width / 2, height / 2, 20, 20);
  square.count = 0;
  square.addImage(squareImage);
  square.state = state['stop'];
  square.rotation = 0;
  square.destination = createVector(square.position.x, square.position.y);
  square.moveTime = 30;
  square.update = function(){
    this.count += 1;
    this.rotation = (this.rotation + 1) % 360;
    // 位置は自動更新してくれないので直接速度を元に更新する
    if(this.state === state['moving']){
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    };
    // 指定カウントだけ移動したら強制的に目的地に固定する
    if(this.count === this.moveTime && this.state === state['moving']){
      this.position.x = this.destination.x;
      this.position.y = this.destination.y;
      this.setVelocity(0, 0);
      this.state = state['stop'];
      this.count = 0;
    }
  }
  square.moveToAnywhere = function(x, y){
    // (x, y)へ0.5秒で移動する。移動先は20刻みで(20, 20)～(380, 380).
    if(this.position.x === x && this.position.y === y){ return; } // 同じ場所の時
    this.setVelocity(0, 0);
    this.destination = createVector(x, y); // 目的地
    let unitVector = createVector(x - this.position.x, y - this.position.y).mult(1 / this.moveTime);
    this.setVelocity(unitVector.x, unitVector.y);
    this.state = state['moving'];
    this.count = 0;
  }
}

function keyPressed(e){
  if(e.keyCode === 13){
    let destination = createVector(20 * Math.floor(random(1, 20)), 20 * Math.floor(random(1, 20)));
    square.moveToAnywhere(destination.x, destination.y);
  }
}
