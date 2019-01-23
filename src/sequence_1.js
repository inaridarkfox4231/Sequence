// 中央の正方形の周囲を別のカラフルな正方形が回っている
// それが中央に集まってまた出てくる、陣形がランダムに変わる、
// なんか小さいのたくさん出す、的な感じのアニメーション
// を、作ります（多分）

// じゃなくて、シナリオみたいなやつ作りたい

// 今日の進捗（2019/01/22）
/* actSequence:
   使い方：
   スプライトごとにクラスを生成します
   どのくらいのフレームでどこに移動するかを指定します
   その順番に直線的に移動を繰り返して勝手に終了します。
   一定フレームの間停止することも可能です
   let actState = {unStarted:0, actOn:1, finished:2}; // actとセットで
   showSequence:
   使い方：
   ひとつひとつは画像の列とポジションの列でフレーム数も指定（何もしないとかも可能）
   どのくらいのフレーム何をどこに表示するかを指定
   （今ちょっとややこしくなってるのはそのうち是正する予定）
   それのシークエンスを与えると
   その通りに実行して勝手に終了する
   そんな感じ
   途中でストップさせて再開とか、強制終了とか出来たら面白いけど。

   やりたいこと
   イメージもスプライト化してコードを統一したい。
   で、軌道を作りたい。orbitクラス、その継承でいろいろ。で、直線移動とか静止とか円軌道とか入れたい。
   中断、再開、リセット、途中で終了の機能を用意するとか。
   あと、入力とかもっと楽にやりたい。シーケンス極めたい感ある。
*/

'use strict';
let images = [];
let i, j, k;

// ちょっと遊んでみて
let texts = [];
let showSeqs;

let squares = []; // ちょっと実験
let actSeqs = [];

let seq1 = [[100, 100, 20], [300, 300, 40], [250, 410, 60]];
let seq2 = [[210, 120, 60], [300, 100, 40], [-1, -1, 20], [200, 120, 60]]; // -1, -1は単に動かないでいるフレーム数
let perm = [[120, 180, 240], [120, 240, 180], [180, 120, 240], [180, 240, 120], [240, 120, 180], [240, 180, 120]];
let shuffleSeq = [];

let actState = {unStarted:0, actOn:1, finished:2}; // actとセットで

function preload(){
  for(i = 0; i < 7; i++){
    let image = loadImage("./assets/squares/square" + i + ".png");
    images.push(image);
  }
  texts.push(loadImage("./assets/texts/IamFox.png"));
  texts.push(loadImage("./assets/texts/Howareyou.png"));
  texts.push(loadImage("./assets/texts/Iamfine.png"))
}

function setup(){
  createCanvas(360, 480);
  for(i = 0; i < 3; i++){
    let s = createSquare(0, 120 + 60 * i, 100);
    squares.push(s);
    let actSeqContent = new actSequence(s);
    actSeqs.push(actSeqContent);
  }
  showSeqs = new showSequence();
  showSeqs.setSequence([[[texts[0]], [[40, 360]], 120], [[texts[1]], [[40, 360]], 120], [[texts[2]], [[40, 360]], 120]]);
}

function draw(){
  background(220);
  actSeqs.forEach(function(a){ a.command(); })
  showSeqs.command();
  drawSprites();
}

function createSquare(typeColor, x, y){
  let square = createSprite(x, y, 40, 40);
  square.addImage(images[typeColor]);
  square.rotation = 0;
  square.update = function(){
    square.rotation++;
  }
  return square;
}

// 行動
class act{
  constructor(sprite){
    this.s = sprite;
    this.actType; // 0で停止、1で移動
    this.actFrame; // 実行フレーム数(0になったら終了)
    this.state = actState['unStarted']; // 0で開始前、1で実行中、2で終了
    this.dest = createVector(sprite.position.x, sprite.position.y);
  }
  setAct(x = -1, y = -1, actFrame = 60){
    if(this.state === actState['actOn']){ return; }
    this.actFrame = actFrame; // Frame設定
    if(x > 0){
      this.actType = 1;
      this.dest = createVector(x, y);
      let unit = createVector(x - this.s.position.x, y - this.s.position.y).mult(1 / this.actFrame);
      this.s.setVelocity(unit.x, unit.y);
    }else{
      this.actType = 0;
    }
    this.state = actState['actOn'];
  }
  move(){
    if(!this.on()){ return this.state; } // 0か2
    if(this.actType === 1 && this.actFrame > 0){
      this.s.position.add(this.s.velocity); // ここいじったら色々できそうじゃん？
    }
    this.actFrame--;
    if(this.actFrame === 0){
      this.s.position = this.dest;
      this.state = actState['finished'];
    }
    return this.state; // 1か2
  }
  unStart(){ return this.state === actState['unStarted']; } // フラグ処理にすれば1行で済むけど
  on(){ return this.state === actState['actOn']; }
  fin(){ return this.state === actState['finished']; }
}

// 行動のシークエンス
class actSequence{
  // いくつも並べて順繰りに実行（指示が雑）
  constructor(sprite){
    this.a = new act(sprite);
    this.actSeq = [];
    this.state = actState['finished'];
  }
  setSequence(seq){ // シークエンスをセット
    // 処理を統一したいので頭にダミーを設ける
    this.actSeq = [[0, 0, 0]].concat(seq); // [[a, a', a''], [b, b', b''], ...]みたいなやつ
    this.state = actState['unStarted'];
  }
  command(){
    if(this.fin()){ return this.state; } // 2
    if(this.a.on()){
      this.a.move(); // ここでact本体の処理
    }else{
      if(this.a.unStart()){ this.state = actState['actOn']; } // 起動
      if(this.actSeq.length > 1){ // 次の処理がある
        this.actSeq.shift();
        this.a.setAct(this.actSeq[0][0], this.actSeq[0][1], this.actSeq[0][2]);
      }else{
        this.state = actState['finished']; // 長さ1のとき、それ以降の処理はしない
      }
    }
    return this.state;
  }
  fin(){ return this.state === actState['finished']; }
}

// 画像表示
class showImg{
  constructor(){
    this.images = []; // 画像
    this.poses = []; // 表示位置
    this.showFrame;
    this.state = actState['unStarted'];
  }
  setAct(imgs, ps, showFrame = 60){
    this.images = imgs; // 空っぽの場合は何もしない
    this.poses = ps;
    this.showFrame = showFrame;
    this.state = actState['actOn'];
  }
  show(){
    if(!this.on()){ return this.state; }
    if(this.images.length > 0){
      for(i = 0; i < this.images.length; i++){
        image(this.images[i], this.poses[i][0], this.poses[i][1]); // 指定の画像を指定の位置に
      }
    }
    this.showFrame--;
    if(this.showFrame === 0){
      this.images = [];
      this.poses = []; // 初期化
      this.state = actState['finished'];
    }
  }
  unStart(){ return this.state === actState['unStarted']; }
  on(){ return this.state === actState['actOn']; }
  fin(){ return this.state === actState['finished']; }
}

// showのsequence...コード似通ってるなぁ。。。
class showSequence{
  constructor(){
    this.s = new showImg(); // ここをとっかえひっかえ
    this.showImgSeq = [];
    this.state = actState['finished'];
  }
  setSequence(seq){ // seqは[[イメージ], [長さ2の配列], 表示時間]の配列（ややこしいな）
    console.log(seq);
    this.showImgSeq = [[[], [], 0]].concat(seq); // ダミーを付ける
    this.state = actState['unStarted'];
    console.log(this.showImgSeq[0]);
  }
  command(){
    if(this.fin()){ return this.state; }
    if(this.s.on()){
      this.s.show();
    }else{
      if(this.s.unStart()){ this.state = actState['actOn']; } // 起動
      if(this.showImgSeq.length > 1){ // 次の処理がある
        console.log(this.showImgSeq[0]);
        this.showImgSeq.shift();
        this.s.setAct(this.showImgSeq[0][0], this.showImgSeq[0][1], this.showImgSeq[0][2]);
        console.log(this.showImgSeq[0]);
      }else{
        this.state = actState['finished'];
      }
    }
    return this.state;
  }
  fin(){ return this.state === actState['finished']; }
}

// 行動のセット
class scene{
  constructor(){}
}

// sceneのシークエンス
class scenario{
  constructor(){}
}

function keyTyped(){
  if(keyCode === KEY['ENTER']){ console.log("keyTyped"); setShuffle(); }
  else if(keyCode === KEY[' ']){ console.log(makeShuffleSeed(3)); }
}

function calcShuffleSeq(){
  let rdn = 0;
  shuffleSeq = []
  for(i = 0; i < 10; i++){
    rdn = (rdn + 1 + Math.floor(random(5))) % 6; // 常に違う配列になるようにする
    shuffleSeq.push(perm[rdn]);
  }
}

// シャッフルのセット
function setShuffle(){
  calcShuffleSeq();
  console.log(shuffleSeq);
  let seq;
  for(i = 0; i < 3; i++){
    seq = [];
    for(j = 0; j < 10; j++){
      seq.push([shuffleSeq[j][i], 100, 20]);
    }
    actSeqs[i].setSequence(seq);
  }
}

// nが3とか4とか5とかのときのやつ作るアルゴリズム（あっちの実装で使う）
// 0, 1, 2, ..., n-1の並び替えをすべて取得する（大きい数でやらないでください）
function makeShuffleSeed(n){
  if(n > 7){ return []; } // 念のため
  if(n === 1){ return [[0]]; }
  if(n === 2){ return [[0, 1], [1, 0]]; }
  let seed = makeShuffleSeed(n - 1); // 元手。
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
