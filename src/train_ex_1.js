// 四角形を動かす
// HPが設定されていて攻撃を受けると減る、消えたりする

// 2019/01/13に作った一つの形。
// このあとショットゲージをなくすので、一応バックアップ。

var player; // プレイヤーのスプライト情報
var player_Img; // プレイヤーの画像

var square; // squareのスプライト情報（こうするらしい）
var squareGroup;
var squareImages = [];
var squareImage;

var attack; // 攻撃のスプライト情報
var attackGroup;
var attackImages = [];
var attackImage;

var fire; // fireのスプライト情報（こうする？）
var fireGroup;
var fire_red; // 炎の画像その1
var fire_blue; // 炎の画像その2
var gauge = 0; // 炎の種類を分けるゲージ

// state定数
const TITLE = 0;
const SELECT = 1;
const PLAY = 2;
const PAUSE = 3;
const GAMEOVER = 4;
const CLEAR = 5;

// e.keyCodeで参照するkeyCode定数
const K_ENTER = 13;
const K_RIGHT = 39;
const K_LEFT = 37;
const K_UP = 38;
const K_DOWN = 40;

// e.charCodeで参照するkeyCode定数
const K_SPACE = 32;
const K_A = 97;
const K_B = 98;
const K_C = 99;

//　state変数、カーソル変数、stage変数
var state = TITLE;
var currentIndex = 0;
var stage = 0; // ステージ番号

// タイトルとセレクト画面の画像
var titleImg;
var selectImg;

// 回す用
var i, j, k, tmp;

// 画像のpreload
function preloadImage(){
  titleImg = loadImage("./assets/title.png");
  selectImg = loadImage("./assets/select.png");
  for(i = 0; i < 5; i++){
    squareImage = loadImage("./assets/color_" + i + ".png");
    squareImages.push(squareImage);
  }
  for(i = 0; i < 3; i++){
    attackImage = loadImage("./assets/attack_" + i + ".png");
    attackImages.push(attackImage);
  }
  fire_red = loadImage("./assets/fire_1.png");
  fire_blue = loadImage("./assets/fire_2.png");
  player_Img = loadImage("./assets/player.png");
}

function preload(){
  // 画像とか音とか入れることになったらって思うから分けるか
  preloadImage();
}

function setup(){
  createCanvas(480, 320);
  squareGroup = new Group();
  fireGroup = new Group();
  player = createSprite(240, 290, 40, 40);
  player.addImage('normal', player_Img);
  player.hp = 100; // playerのHP
}

function draw(){
  clear();
  background(220);
  drawText(); // テキスト描画
  // ここでも位置修正するようにした
  if(state === PLAY){
    if(mouseIsPressed){ move(); gauge += 2; if(gauge > 100){ gauge = 0; }}
    else{ gauge = 0; }
    checkCollide();
    drawSprites();
    drawgauge();
  }
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

function drawgauge(){
  rect(9, 9, 101, 11); // ゲージのふちがきちんと黒で分けられるように調整
  if(gauge < 80){ fill(255, 0, 0); }else{ fill(0, 0, 255); }
  noStroke(); // ゲージの輪郭線を消す
  rect(10, 10, gauge, 10);
}

function checkCollide(){
  if(fireGroup.size() === 0){ return; }
  for(i = 0; i < fireGroup.size(); i++){
    for(j = 0; j < squareGroup.size(); j++){
      if(fireGroup[i].collide(squareGroup[j])){
        if(vanish(fireGroup[i], squareGroup[j])){
          break; // 弾が消える場合はそこで処理を抜ける
        }
      }
    }
  }
}

function vanish(f, s){
  // 今の仕様だとどのブロックも一撃で壊せるのでそこをいじる感じ。
  // 青い弾は赤い弾の3倍ダメージ。
  // 青い弾の場合は壊したときに貫通するけど赤い弾は壊しても貫通しない。そんな感じで。
  s.hp -= f.dmg;
  if(s.hp > 0){ f.remove(); return true; } // 壊せなかったとき
  else{
    // 壊せたとき
    s.remove();
    if(f.name === "red"){ // 赤い弾は貫通しないで消える
      f.remove(); return true;
    }
  }
  return false; // 青い弾は貫通する
}

// 動く（マウス押さえたままでも動くように関数化）
function move(){
  var new_x = mouseX;
  if(new_x < 25){ new_x = 25; }
  if(new_x > 455){ new_x = 455; }
  player.position.x = new_x;
}

 // マウス移動で反応（押したままの移動だと発動しない）
function mouseMoved(){ if(state === PLAY){ move(); } }

function mouseReleased(){
  if(state !== PLAY){ return; }
  // ゲージの色による場合分け
  fire = createSprite(player.position.x, 262, 15, 15);
  if(gauge < 80){
    fire.addImage(fire_red);
    fire.name = "red"; // 名前はred
    fire.dmg = 1; // dmg1
  }else{
    fire.addImage(fire_blue);
    fire.name = "blue"; // 名前はblue
    fire.dmg = 3; // dmg3
  }
  fire.setVelocity(0, -5); // 速度
  fire.life = 60; // 消滅するまでのフレーム数
  fire.addToGroup(fireGroup);
}

// キーを押すと正方形が大量発生
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
  }else if(state === PLAY){
    console.log(e); // keyCodeで反応するキーとcharCodeで反応するキーがある
    if(e.charCode === K_C){
      // デバッグコード
      console.log(squareGroup.size());
      console.log(fireGroup.size());
      return;
    }
    if(!(e.charCode === K_A || e.charCode === K_B)){ return; }
    square = createSprite(random(50, 350), random(50, 250), 20, 20);
    if(e.charCode === K_A){
      square.addImage("one", squareImages[0]);
      square.hp = 1; // HP1
    }else if(e.charCode === K_B){
      square.addImage("two", squareImages[1]);
      square.hp = 2; // HP2
    }
    square.addToGroup(squareGroup);
  }
}

function selectEvent(){
  if(currentIndex === 0){
    state = TITLE; return;
  }else{
    state = PLAY;
    stage = currentIndex;
    //setEnemy(); return;
  }
}
