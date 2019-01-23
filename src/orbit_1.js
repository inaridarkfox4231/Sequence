// orbitの実験
// Enterキーを押すごとにいずれかの位置に移動します。
// 移動中はキー押しても動かないように細工して。
// ぐだぐだ・・
// count使ってるのは実験の為できちんとしたコードにまとめる際にはきちんとするつもり

'use strict';
let img;
let actor;
let orb;

let count = 0;

function preload(){
  img = loadImage("./assets/squares/square0.png");
}

function setup(){
  createCanvas(480, 320);
  actor = createSquare();
  orb = new lineOrbit(actor); // ここに色々代入する？？
}

function draw(){
  background(220);
  if(count > 0){
    count--;
    if(count > 0){
      orb.calcPos(count);
    }else{
      actor.position.x = orb.end.x;
      actor.position.y = orb.end.y;
    }
  }
  drawSprites();
}

function createSquare(){
  let square = createSprite(240, 160, 40, 40);
  square.addImage(img);
  return square;
}

class orbit{ // ひながた。始点と終点はデフォルトが元の位置
  constructor(sprite){
    this.s = sprite;
    this.start = this.s.position;
    this.end = this.s.position;
  }
}

class staticOrbit extends orbit{
  constructor(sprite){
    super(sprite);
  }
  setOrbit(end, moveTime){}
  calcPos(frame){} // 動かないでじっとしているだけ
}

class lineOrbit extends orbit{
  constructor(sprite){
    super(sprite);
    this.unit; // 始点から終点までの単位ベクトル
  }
  setOrbit(end, moveTime){
    this.end = end;
    this.unit = createVector(this.start.x - this.end.x, this.start.y - this.end.y).mult(1 / moveTime);
  }
  calcPos(frame){ // frameはmoveTimeから始まって1ずつ減っていくことを想定
    this.s.position.x = this.end.x + this.unit.x * frame;
    this.s.position.y = this.end.y + this.unit.y * frame;
  }
}

function keyTyped(){
  if(keyCode === KEY['ENTER']){
    if(count > 0){ return; }
    let rndx = Math.floor(random(50) + 20) * 5;
    let rndy = Math.floor(random(50) + 20) * 3;
    let end = createVector(rndx, rndy);
    orb.setOrbit(end, 30);
    count = 30;
  }
}

// 軌道の情報、見えるか見えないか、が重要なのかな、と思った。
