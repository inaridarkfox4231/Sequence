// ステート処理の実験
'use strict';
var square;
var squareGroup;
var squareImages = [];
var squareImage;

const TITLE = 0;
const SELECT = 1;
const PLAY = 2;
const PAUSE = 3;
const GAMEOVER = 4;
const CLEAR = 5;

// KEYCODE変数
const K_ENTER = 13;
const K_RIGHT = 39;
const K_LEFT = 37;
const K_UP = 38;
const K_DOWN = 40;
const K_SPACE = 32;

var state = TITLE;
var currentIndex = 0;
var stage = 0; // ステージ番号

var titleImg;
var selectImg;

function preload(){
  titleImg = loadImage("./assets/title.png");
  selectImg = loadImage("./assets/select.png");
  for(i = 0; i < 5; i++){
    squareImage = loadImage("./assets/color_" + i + ".png");
    squareImages.push(squareImage);
  }
}

function setup(){
  createCanvas(640, 480);
  squareGroup = new Group();
}

function draw(){
  clear();
  background(220);
  drawText();
  drawEnemy();
}

function drawText(){
  if(state === TITLE){
    image(titleImg, 50, 50);
  }else if(state === SELECT){
    image(selectImg, 50, 50);
    fill(255);
    rect(20, 60 + 40 * currentIndex, 20, 20);
  }else if(state === PLAY){

  }
}

function drawEnemy(){
  if(state !== PLAY){ return; }
  moveSquare();
  drawSprites();
}

// e.keyCodeで取得できるみたいだからそうしよう。
function keyTyped(e){
  if(state === TITLE){
    if(e.keyCode === K_ENTER){
      state = SELECT; return;
    }
  }else if(state === SELECT){
    if(e.keyCode === K_DOWN){
      currentIndex = (currentIndex + 1) % 5; return;
    }else if(e.keyCode === K_UP){
      currentIndex = (currentIndex + 4) % 5; return;
    }else if(e.keyCode === K_ENTER){
      selectEvent(); return;
    }
    return;
  }
}

function selectEvent(){
  if(currentIndex === 0){
    state = TITLE; return;
  }else{
    state = PLAY;
    stage = currentIndex;
    setEnemy(); return;
  }
}

function makeEnemy(x, y, kind){
  if(kind < 5){
    makeSquare(x, y, kind); return;
  }
}

function makeSquare(x, y, kind){
  square = createSprite(x, y, 20, 20);
  square.addImage(squareImages[kind]);
  square.pivot_x = x;
  square.pivot_y = y;
  square.kind = kind;
  square.life = 600;
  square.addToGroup(squareGroup);
}

function moveSquare(){
  squareGroup.forEach(function(s){
    if(s.kind === 0){
      s.position.x = s.pivot_x + 50 * cos(frameCount * PI / 60);
      s.position.y = s.pivot_y + 50 * sin(frameCount * PI / 60);
    }else if(s.kind === 1){
      s.position.x = s.pivot_x + 50 * sin(frameCount * PI / 30);
      s.position.y = s.pivot_y + 50 * cos(frameCount * PI / 30);
    }else if(s.kind === 2){
      s.position.x = s.pivot_x + 75 * cos(frameCount * PI / 45);
      s.position.y = s.pivot_y + 25 * sin(frameCount * PI / 15);
    }
  })
}

function setEnemy(){
  if(stage === 1){
    makeSquare(200, 200, 0);
    makeSquare(320, 160, 1);
    makeSquare(440, 300, 2);
  }
}

// これが基本的な流れ・・でいいと思う。
// 1.ステート処理でタイトルからセレクト画面、さらにプレイ画面。
// 2.プレイ画面移行時に敵を配置、どれくらい倒すかとかそこら辺どうするかってのはあるけど。
//   たとえば100匹倒したら終わるという場合、倒すたびに新しい敵を出現させる必要がある。
// 3.プレイ画面では毎フレーム敵を動かす、こっちも左右のキーで動く、ボタンを押して武器の切り替え、
//   切り替えたらちゃんと明示する、あとゲージを用意、打つとゲージが減る、時間経過で回復。
//   そこら辺の細かい実装も後回し。
//   スペースキーで攻撃するのがキー配置的には良さそうだけど。
// 4.一定条件を満たしたらボスが出現する感じで。ボスのライフきちんと明示する、
//   ボスは攻撃パターン多彩、ザコを出したりする、倒したらクリア。
//   あ、そうだ、攻撃されたらダメージを受ける、こっちのライフも表示する、
//   ライフがなくなったらゲームオーバーでタイトルに戻る。そんな感じで。
// 5.ボスを倒したらクリア画面表示、戦績とかどうするかな・・
//   例えばだけど、連続して弾を当てるとコンボが成立してスコアが大きくなるとか。
//   一定スコアを超えるたびに（たとえば10000とか？）ライフが回復する感じの仕様とか面白そう。
