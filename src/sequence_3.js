'use strict';
let images = []; // とりあえず2つでいいよ
let cast = []; // actorを格納する配列
let motions = {}; // motionを格納する辞書（キーワードでクラスを入れるかもしれない感じの）
// motionをつなげてscenarioを作るイメージ
let i, j, k;
const DEFAULT_SELF_ROTATION_SPEED = 1;  // 自転スピード
const DEFAULT_REVOLUTION_SPEED = 1;     // 中央の正方形の周りをまわるスピード

// motionの状態について
let motionState = {unStarted:0, onAct:1, finished:2, pause:3};

// 画像をロードする
function preload(){
  for(i = 0; i < 2; i++){
    let image = loadImage("./assets/squares/square" + i + ".png");
    images.push(image);
  }
}

function setup(){
  createCanvas(320, 480);
  setMaster();
  setGuns();
  commandScenario(); // 各々のactorに命令する（後はその通りに動くだけ）
}

function draw(){
  background(220);
  drawSprites();
}

function setMaster(){
  let master = new master(160, 120, images[0]);
  cast.push(master);
}

function setGuns(){
  let gun = new gun(260, 120, images[1]);
  cast.push(gun);
}

function commandScenario(){
  // うにいいいいいいいいぎゃあああああす
}

// actorを作る（
class actor{
  constructor(startX, startY, img){
    this.s = createSprite(startX, startY, 0, 0);
    this.s.addImage(img);
  }// これだけ
  setScenario(){} // シナリオをセットする
}

// masterは真ん中で回転しているだけ（もしかしたらgunへの指示はここに書くかも？）
class master extends actor{
  constructor(startX, startY, img){
    super(startX, startY, img);
    this.selfRotationSpeed = DEFAULT_SELF_ROTATION_SPEED;
  }
  update(){
    this.s.rotation += this.selfRotationSpeed;
  }
}

// gunはmasterの周りを公転しながらbulletを発射する感じ？（まだ発射しない）
class gun extends actor{
  constructor(startX, startY, img){
    super(startX, startY, img);
    this.scenario = new scenario(startX, startY);
    this.selfRotationSpeed = DEFAULT_SELF_ROTATION_SPEED;
    this.revolutionSpeed = DEFAULT_REVOLUTION_SPEED;
  }
  update(){
    this.s.rotation += this.selfRotationSpeed;
    this.s.scenario.execute(); // 何か、させる感じで。あー・・位置どうするんだろ・・
  }
}

// 一連の動き
class motion{
  constructor(startX, startY, interval){
    this.start = createVector(startX, startY);
    this.state = motionState['unStarted'];
    this.interval = interval; // 実行フレーム数
    this.frame = 0; // こちらは経過フレーム数（増やしていく）
  }
  setMotion(){ if(unStart()){ this.state = motionState['onAct']; } } // 起動させる
  pauseMotion(){ // いわゆるポーズ
    if(on()){
      this.state = motionState['pause'];
    }else if(pause()){
      this.state = motionState['onAct'];
    }
   }
   quit(){ // 中止（再び始めないみたいな）
     this.frame = this.interval:
     this.state = motionState['finished']; // 強制的に終わらせる
   }
  calcPos(){} // 位置を計算して返す
  // calcPosの中ではループかどうかだけ考慮しましょう。
  // onActの条件がどうこう、それはactorに任せる感じで・・・
  unStart(){ return this.state === motionState['unStarted']; }
  on(){ return this.state === motionState['onAct']; }
  fin(){ return this.state === motionState['finished']; }
  pause(){ return this.state === motionState['pause']; } // pauseの時は位置更新しない感じ
}

// 静止！
class staticMotion extends motion{
  constructor(startX, startY, interval){
    super(startX, startY, interval);
  }
  calcPos(){ return this.start; } // 静止
}

// 直線運動
class linearMotion extends motion{
  constructor(startX, startY, interval, end){ // endはゴール地点
    super(startX, startY, interval);
    this.end = end;
    // スタートからゴールに向かう単位ベクトル
    this.unitVector = createVector(end.x - startX, end.y - startY).mult(1 / interval);
  }
  calcPos(){
    this.frame++;
    let x = this.start.x + unitVector.x * interval;
    let y = this.start.y + unitVector.y * interval;
    if(this.frame < this.interval){
      return createVector(x, y);
    }else{
      this.state = motionState['finished'];
      return this.end;
    }
  }
}

// 円運動
class revolveMotion extends motion{
  constructor(startX, startY, interval, center, radiusX, radiusY, startPhase){
    super(startX, startY, interval);
    this.loop = true; // ループさせる
    this.center = center; // 中心のベクトル
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.startPhase = startPhase; // 開始位置の位相（たとえばPI / 4とか）
    this.increasePhase = 120 / interval; // 120で2PIになるので120をインターバルで割る。
    this.loop = true; // ループさせる
  }
  calcPos(){
    this.frame++;
    let x = center.x + this.radius.x * cos(startPhase + this.frame * this.increasePhase * (PI / 60));
    let y = center.y + this.radius.y * sin(startPhase + this.frame * this.increasePhase * (PI / 60));
    if(this.frame < this.interval){
      return createVector(x, y);
    }else{
      this.frame = 0;
      return this.start; // 初めの場所からもう一度（finishedにするのは別にメソッドを用意・・）
    }
  }
}

// 動きを並べたもの
class scenario{

}
