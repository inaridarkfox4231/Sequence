// 中央の正方形の周囲を別のカラフルな正方形が回っている
// それが中央に集まってまた出てくる、陣形がランダムに変わる、
// なんか小さいのたくさん出す、的な感じのアニメーション
// を、作ります（多分）

// じゃなくて、シナリオみたいなやつ作りたい

'use strict';
let images = [];
let i, j, k;

let squares = []; // ちょっと実験
let acts = [];
let actSeqs = [];

let seq1 = [[100, 100, 20], [300, 300, 40], [250, 410, 60]];
let seq2 = [[210, 120, 60], [300, 100, 40], [-1, -1, 20], [200, 120, 60]];

// onActの方が意味的にはいいかもなー（てかonActって書いちゃってデバッグ苦労した記憶）
let actState = {unStarted:0, actOn:1, finished:2}; // actとセットで

function preload(){
  for(i = 0; i < 7; i++){
    let image = loadImage("./assets/squares/square" + i + ".png");
    images.push(image);
  }
}

function setup(){
  createCanvas(360, 480);
  for(i = 0; i < 3; i++){
    let s = createSquare(i);
    squares.push(s);
    let actContent = new act(s);
    actContent.setAct(200 + 70 * i, 100 + 50 * i); // この指示を順繰りに与えるのがー・・
    acts.push(actContent);
  }
  let s = createSquare(3);
  squares.push(s);
  let actSeqContent = new actSequence(s);
  actSeqContent.setSequence(seq1);
  actSeqs.push(actSeqContent);
}

function draw(){
  background(220);
  acts.forEach(function(a){ a.move(); }); // actでmoveってやると1回で終わり
  actSeqs[0].command(); // actSequenceでcommandってやるとそれがすべて実行されたら終わり
  drawSprites();
}

function createSquare(typeColor){
  let square = createSprite(width / 2, height / 4, 40, 40);
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
  unstart(){ return this.state === actState['unStarted']; } // フラグ処理にすれば1行で済むけど
  on(){ return this.state === actState['actOn']; }
  fin(){ return this.state === actState['finished']; }
}

// 行動のシークエンス
class actSequence{
  // いくつも並べて順繰りに実行（指示が雑）
  constructor(sprite){
    this.a = new act(sprite);
    this.actSeq = [];
    this.state = actState['unStarted'];
  }
  setSequence(seq){ // シークエンスをセット
    // 処理を統一したいので頭にダミーを設ける
    this.actSeq = [[0, 0, 0]].concat(seq); // [[a, a', a''], [b, b', b''], ...]みたいなやつ
  }
  command(){
    if(this.fin()){ return this.state; } // 2
    if(this.a.on()){
      this.a.move(); // ここでact本体の処理
    }else{
      if(this.a.unstart()){ this.state = actState['actOn']; } // 起動
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

function keyTyped(e){
  if(e.keyCode === 13){
    if(acts[0].on()){ return; }
    let rndx = Math.floor(random(50)) * 5 + 50;
    let rndy = Math.floor(random(50)) * 5 + 50;
    acts[0].setAct(rndx, rndy);
  }else if(e.charCode === 32){ // スペースキーはcharCode=32.
    if(acts[1].on()){ return; }
    let rndx = Math.floor(random(70)) * 4 + 30;
    let rndy = Math.floor(random(70)) * 4 + 30;
    acts[1].setAct(rndx, rndy, 30);
  }
}
