// 改良。まずはコードが分かれているのでまとめる。
// 画像もアクターで、動かなくてもいいという考え方。
// シークエンスの開始時と終了時にvisibleをどうするかとか指定できればいいねとかそういう話

'use strict'; // まだ、簡単な事しか、やってない！！（はず）
let images = [];
let actors = [];
let i, j, k;

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
    actors[i].position = createVector(120 + 60 * i, 240);
  }
  for(i = 3; i < 6; i++){
    actors[i].position = createVector(180, 360);
    actors[i].visible = false;
  }
}
