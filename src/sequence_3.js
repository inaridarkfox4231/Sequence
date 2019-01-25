'use strict';
let images = []; // とりあえず2つでいいよ
let cast = []; // actorを格納する配列
let motions = {}; // motionを格納する辞書（キーワードでクラスを入れるかもしれない感じの）
// motionをつなげてscenarioを作るイメージ
let i, j, k;
const DEFAULT_SELF_ROTATION_SPEED = 1;  // 自転スピード
const DEFAULT_PERIOD = 120;     // 周期

let test; // モーションのテスト

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
  test = new testActor(100, 400, images[1]);


  commandScenario(); // 各々のactorに命令する（後はその通りに動くだけ）
}

function draw(){
  background(220);
  cast.forEach(function(a){a.update();})
  test.update();

  drawSprites();
}

function setMaster(){
  let masterActor = new master(160, 120, images[0]);
  cast.push(masterActor);
}

function setGuns(){
  let gunActor = new gun(260, 120, images[1]);
  cast.push(gunActor);
}

function commandScenario(){
  // うにいいいいいいいいぎゃあああああす
  // このA地点までFフレームで直線移動、っていうのを関数化して命令しやすくするとか？
  // Scenarioは辞書で命令できるといいかもしれない。で、motionにラベル貼るとかしてみたらいいかも。
  let linear = new linearMotion(100, 400, 120, createVector(300, 200));
  test.setScenario(linear);
  //let circular = new circularMotion(100, 400, 120, createVector(100, 300), 100, 100, PI / 2)
  //test.setScenario(circular);
  test.action();
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
    this.selfRotationSpeed = DEFAULT_SELF_ROTATION_SPEED; // 自転スピード
    this.period = DEFAULT_PERIOD; // 周期
  }
  update(){
    this.s.rotation += this.selfRotationSpeed;
    //this.scenario.execute(); // 何か、させる感じで。あー・・位置どうするんだろ・・
  }
}

class testActor extends actor{
  constructor(startX, startY, img){
    super(startX, startY, img);
    this.motion = new motion(startX, startY, 0);
  }
  // この辺は、motion1つしか持たないクラス作ってそのextendsでやった方がいいかも
  // 名付けてsingleMotionActor, multiMotionActorみたいな？
  setScenario(motion){ this.motion = motion; }
  action(){ this.motion.action(); }
  pause(){ this.motion.pauseMotion(); }
  quit(){ this.motion.quitMotion(); }
  finish(){ this.motion.finishMotion(); }
  update(){
    if(this.motion.on()){ // これはpauseのときは位置更新しませんよ、という意思表示
      this.s.position = this.motion.calcPos();
    }
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
  action(){ if(this.unStart()){ this.state = motionState['onAct']; } } // 起動させる
  pauseMotion(){ // いわゆるポーズ
    if(this.on()){
      this.state = motionState['pause'];
    }else if(this.pause()){
      this.state = motionState['onAct'];
    }
   }
   quitMotion(){ // 中止（再び始めないみたいな）
     this.frame = this.interval;
     this.state = motionState['finished']; // 強制的に終わらせる
   }
   finishMotion(){ // 強制的にframeを最後まで持っていく
     this.frame = this.interval - 1;
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
    this.label = 'static'; // 静止
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
    this.label = 'linear';
  }
  calcPos(){
    this.frame++;
    let x = this.start.x + this.unitVector.x * this.frame;
    let y = this.start.y + this.unitVector.y * this.frame;
    if(this.frame < this.interval){
      return createVector(x, y);
    }else{
      this.state = motionState['finished'];
      return this.end;
    }
  }
}

// 円運動
class circularMotion extends motion{
  constructor(startX, startY, interval, center, radiusX, radiusY, startPhase){
    super(startX, startY, interval);
    this.center = center; // 中心のベクトル
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.startPhase = startPhase; // 開始位置の位相（たとえばPI / 4とか）
    this.increasePhase = 120 / interval; // 120で2PIになるので120をインターバルで割る。
    this.label = 'circular';
  }
  calcPos(){
    this.frame++;
    let x = this.center.x + this.radiusX * cos(this.startPhase + this.frame * this.increasePhase * (PI / 60));
    let y = this.center.y + this.radiusY * sin(this.startPhase + this.frame * this.increasePhase * (PI / 60));
    if(this.frame < this.interval){
      return createVector(x, y);
    }else{
      this.frame = 0;
      return this.start; // 初めの場所からもう一度（finishedにするのは別にメソッドを用意・・）
    }
  }
}

// testActorの動きを制御
function keyTyped(){
  if(key === 'p'){ test.pause(); }
  else if(key === 'q'){ test.quit(); }
  else if(key === 'f'){ test.finish(); }
}

// actorを、motion持ちとscenario持ちに分岐させて、この手のメソッドを全部そこに書く、
// という方がいいかもしれない。いちいち書くの面倒すぎる。

// 動きを並べたもの
class scenario{
  constructor(){

  }
  execute(){

  }
}
