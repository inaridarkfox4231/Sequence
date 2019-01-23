// moveModule. シーケンスの記念すべき第一弾。
// createSquareにクラス持たせるコード書いてあるから分離が不十分。
// なぜって四角形作る操作とは分離すべきだから
// updateにmoveって書いたけど・・
// うん、今やってるみたいにすべき・・かなぁ

// というかコードいじって複数でしか指定できなくしちゃった失敗作

'use strict';
// エンターキーを押すたびに正方形が移動するアニメーション
// コード分離して再利用できるようにしたいよね、要するに位置の更新してるだけなんだから。
// 応用例：ものかくしクイズ、ものを隠して誰が隠してるか当てる感じのやつ。
// 位置の配列を用意しておいて、それらのシャッフルであれしてこれしてってやる。
let square;
let squareImage;
let moveState = {stop: 0, moving: 1, nextmove: 2}; // nextmoveは次の移動に移る準備・・これもメンバ変数にする？
let i, j, k;

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
  square.rotation = 0; // 回転アニメ
  square.moveModule = new moveModule(square, 30); // moveModuleを持たせる
  square.update = function(){
    this.count += 1;
    this.rotation = (this.rotation + 1) % 360;
    this.moveModule.move(); // これで動くかな・・？
    if(keyIsDown(13)){ // エンターキーが押されたら1回移動
      let destination = createVector(20 * Math.floor(random(1, 20)), 20 * Math.floor(random(1, 20)));
      this.moveModule.setMultiDestination([destination]);
    }
    if(keyIsDown(32)){ // スペースキーが押されたら複数回移動（1～3回）
      let destinations = [];
      let n = Math.floor(random(1, 4));
      for(i = 0; i < n; i += 1){
        destinations.push(createVector(20 * Math.floor(random(1, 20)), 20 * Math.floor(random(1, 20))));
      }
      this.moveModule.setMultiDestination(destinations);
    }
  }
}
/*
使い方：moveStateを定数の辞書として用意しておいて、
移動先を示す配列（posが1つの場合は[pos]のように長さ1の配列）を作り、
setMultiDestinations(destinations)
を呼び出すだけ。あとはupdateにmove()と書けば全部やってくれる。
*/

// スプライトを目的の場所に指定したカウントで移動させるためのクラス
class moveModule{
  constructor(sprite, moveCount){
    this.s = sprite;
    this.destination = createVector(0, 0); // 行先を示すベクトル、デフォルトは(0, 0).
    this.unitVector = createVector(0, 0); // 移動計算に使うベクトル
    this.moveCount = moveCount; // 移動に要するカウント数
    this.count = 0;
    this.state = moveState['stop'];
    this.moveSequence = []; // 2回以上移動する場合用
  }
  setDestination(destination){ // 目的地の設定
    if(this.state === moveState['moving']){ return; } // 移動中は設定不可
    this.destination = destination;
    // 位置の更新はこれ↓で行う
    this.unitVector = createVector(destination.x - this.s.position.x, destination.y - this.s.position.y).mult(1 / this.moveCount);
    this.count = 0;
    this.state = moveState['moving'];
  }
  setMultiDestination(destinations){ // 複数回移動するとき用
    this.moveSequence = destinations;
    this.setDestination(destinations[0]);
  }
  changeMoveCount(newMoveCount){
    this.moveCount = newMoveCount; // 移動カウント数を変更できるようにする
  }
  move(){
    if(this.state === moveState['moving']){
      this.count += 1;
      this.s.position.x += this.unitVector.x;
      this.s.position.y += this.unitVector.y;
      if(this.count === this.moveCount){
        //this.state = state['stop'];
        this.s.position.x = this.destination.x;
        this.s.position.y = this.destination.y;
        // もしlength>0の場合は先頭を削除してlength--して再び登録（その場合はstate:moving継続）
        this.moveSequence.shift();
        if(this.moveSequence.length > 0){
          this.state = moveState['nextmove']; // movingだと設定できない
          this.setDestination(this.moveSequence[0]); // 次の目的地を設定
        }else{
          this.count = 0;
          this.state = moveState['stop'];
        }
      }
    }
  }
}
