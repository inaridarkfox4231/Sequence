// 改良。まずはコードが分かれているのでまとめる。
// 画像もアクターで、動かなくてもいいという考え方。
// シークエンスの開始時と終了時にvisibleをどうするかとか指定できればいいねとかそういう話

// できた。とりあえず。まだいろいろまだ。中断とか再開とかやりたいよね。ループとかは？んー・・
// ループって開始位置に戻らないといけないでしょ・・・

'use strict'; // まだ、簡単な事しか、やってない！！（はず）
let images = [];
let actors = [];
let acts = [];
let i, j, k;

let actState = {unStarted:0, onAct:1, finished:2}; // actとセットで

function preload(){
  for(i = 0; i < 3; i++){ // 0～2.
    let image = loadImage("./assets/squares/square" + i + ".png");
    images.push(image);
  }
  images.push(loadImage("./assets/texts/IamFox.png")); // 3
  images.push(loadImage("./assets/texts/Howareyou.png")); // 4
  images.push(loadImage("./assets/texts/Iamfine.png")) // 5
}

function setup(){
  createCanvas(360, 480);
  for(i = 0; i < 6; i++){ actors.push(createActor(i)); }
  setActor();
}

function draw(){
  background(220);
  acts.forEach(function(a){ a.execute(); })
  drawSprites();
}

function createActor(i){
  let actor = createSprite(0, 0, 0, 0);
  actor.addImage(images[i]);
  if(i < 3){ actor.update = function(){ this.rotation++; }} // functionの指定の仕方って自由なのね
  return actor;
}

function setActor(){
  for(i = 0; i < 3; i++){
    actors[i].position = createVector(120 + 60 * i, 120);
    let actClass = new act(actors[i]);
    acts.push(actClass);
  }
  for(i = 3; i < 6; i++){
    // 画像の場合は中心だとちとまずいので工夫
    actors[i].position = createVector(40 + actors[i].width / 2, 360 + actors[i].height / 2);
    actors[i].visible = false;
    let actClass = new act(actors[i]);
    acts.push(actClass);
  }
  command(); // これ忘れてた。疲れてるね。寝よう。
}

function command(){
  acts[0].setAct(createVector(120, 240), 30, true, true);
  acts[1].setAct(createVector(180, 240), 30, true, true);
  acts[2].setAct(createVector(240, 240), 30, true, true);
  acts[3].setAct(actors[3].position, 60, true, false);
  //console.log(acts[2].on());
}

// 行動（unStartedのときかfinishedのときに入力を受け付けて実行する感じで）
class act{
  constructor(sprite){
    this.s = sprite;
    this.actType = 0; // 0で静止、1で直線移動。そのうちバリエーション増やしたいけどとりあえずこれで。
    this.end = sprite.position; // 最終的な位置、デフォルトは元の位置
    this.actFrame; // アニメーションにかかる時間
    this.state = actState['unStarted']; // 状態
    this.endvis = true; // 終わったときの表示処理
  }
  setAct(end, actFrame, startvis = true, endvis = true){ // startvisとendvisは見せるとか見せないとかそういうの
    if(this.on()){ return; } // onのときはsetできない
    this.s.visible = startvis; // 開始の時の表示処理
    this.endvis = endvis; // 終了時の表示の有無を記憶しておく
    this.actFrame = actFrame;
    if(this.end !== end){
      this.actType = 1; // 移動タイプの設定
      this.end = end;   // 終点の設定（忘れてた）
      this.s.velocity = createVector(end.x - this.s.position.x, end.y - this.s.position.y).mult(1 / actFrame);
      //console.log(end);
      //console.log(this.s.position)
    }
    this.state = actState['onAct'];
  }
  execute(){
    if(!this.on()){ return this.state; }
    if(this.actType === 1 && this.actFrame > 0){
      this.s.position.add(this.s.velocity);
    }
    this.actFrame--;
    if(this.actFrame === 0){
      this.s.visible = this.endvis; // 終わった時出すのか消すのか
      this.s.position = this.end; // 誤差修正
      this.state = actState['finished'];
    }
    return this.state;
  }
  on(){ return this.state === actState['onAct']; }
}
