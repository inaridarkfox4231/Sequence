// 改良。まずはコードが分かれているのでまとめる。
// 画像もアクターで、動かなくてもいいという考え方。
// シークエンスの開始時と終了時にvisibleをどうするかとか指定できればいいねとかそういう話

// できた。とりあえず。まだいろいろまだ。中断とか再開とかやりたいよね。ループとかは？んー・・
// ループって開始位置に戻らないといけないでしょ・・・

'use strict'; // まだ、簡単な事しか、やってない！！（はず）
let images = [];
let actors = []; // 動かすスプライト
let acts = [];   // スプライトの挙動を指示するクラス
let i, j, k;

let actState = {unStarted:0, onAct:1, finished:2}; // actとセットで

// メインスクリプト

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
  setActor(); // actorを用意
  command(); // 命令を用意
}

function draw(){
  background(220);
  acts.forEach(function(a){ a.execute(); })
  drawSprites();
}

// 以下はサブスクリプト

// actorの生成
function createActor(i){
  let actor = createSprite(0, 0, 0, 0);
  actor.addImage(images[i]);
  if(i < 3){ actor.update = function(){ this.rotation++; }} // functionの指定の仕方って自由なのね
  return actor;
}

// actorに挙動を指示
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
}

// 指示の内容
function command(){
  let actNote = [];
  for(i = 0; i < 3; i++){ actNote.push(actC(120 + 60 * i, 240, 30)); }
  for(i = 0; i < 3; i++){ acts[i].setAct(actNote[i]); }
  acts[3].setAct(actC(actors[3].position.x, actors[3].position.y, 60, true, false));
}

// get actContent.
function actC(end_x, end_y, actFrame, startvis = true, endvis = true){
  let end = createVector(end_x, end_y);
  return [end, actFrame, startvis, endvis]; // actの内容配列を簡単に作る
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
  setAct(actContent){ // [ベクトル、フレーム数、開始時の出現処理、終了時の出現処理]
    if(this.on()){ return; } // onのときはsetできない
    this.s.visible = actContent[2]; // 開始の時の表示処理
    this.endvis = actContent[3]; // 終了時の表示の有無を記憶しておく
    this.actFrame = actContent[1];  // 所要フレーム数
    let end = actContent[0]; // 終点
    if(this.end !== end){
      this.actType = 1; // 移動タイプの設定
      this.end = end;   // 終点の設定（忘れてた）
      this.s.velocity = createVector(end.x - this.s.position.x, end.y - this.s.position.y).mult(1 / this.actFrame);
      //console.log(end);
      //console.log(this.s.position)
    }
    this.state = actState['onAct'];
  }
  execute(){ // 実行
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
  unStart(){ return this.state === actState['unStarted']; }
  on(){ return this.state === actState['onAct']; }
}

// actSequence.
class actSequence{
  constructor(sprite){
    this.a = new act(sprite);
    this.actSeq = [];
    this.state = actState['finished'];
  }
  setSequence(seq){
    this.actSeq = [[createVector(0, 0), 0, true, true]].concat(seq);
    this.actSeq = actState['unStarted'];
  }
  command(){
    if(this.fin()){ return this.state; }
    if(this.a.on()){
      this.a.execute();
    }else{
      if(this.a.unStart()){ this.state = actState['onAct']; } // シークエンス本体の起動
      if(this.actSeq.length > 1){ // 次の処理があるとき
        this.actSeq.shift();
        this.a.setAct(this.actSeq[0]);
      }else{
        this.state = actState['finished'];
      }
    }
    return this.state;
  }
  fin(){ return this.state === actState['finished']; }
}

function keyTyped(){
  if(keyCode === KEY['ENTER']){
    console.log(getShuffleData(3, [120, 180, 240]));
  }
}

// バグ出た

// 長さnの配列dataに対してすべての順列からなる配列を与える。
function getShuffleData(n, data){
  let seed = getShuffleSeed(n);
  let shuffle = [];
  let len = seed.length;
  seed.forEach(function(perm){
    let permOfData = [];
    perm.forEach(function(x){ permOfData.push(data[x]); })
    shuffle.push(permOfData);
  })
  return shuffle;
}

// 入力：n=3, 4, 5など。
// 出力：0, 1, ..., n-1の並び替えの配列の列（長さn!）で、すべてのパターンを網羅。
function getShuffleSeed(n){
  if(n > 7){ return []; } // 念のため
  if(n === 1){ return [[0]]; }
  if(n === 2){ return [[0, 1], [1, 0]]; }
  let seed = getShuffleSeed(n - 1); // 元手。
  let a = [];
  for(i = 0; i < n; i++){ a.push(i); } // a = [0, 1, 2, ..., n-1]
  let perm = [];
  for(k = 0; k < n; k++){
    // kから始まってひとつずつ
    seed.forEach(function(subPerm){
      let seq = [k];
      // 各々のsubPermについて、0からn-2までの並び替えがあるので、
      // それらに1を足したものをkに足してnでモジュロしてseqに放り込んで行って
      // 完成したらpermに追加。それを延々と。
      for(j = 0; j < n - 1; j++){ seq.push((k + subPerm[j] + 1) % n); }
      perm.push(seq);
    })
  }
  return perm;
}
