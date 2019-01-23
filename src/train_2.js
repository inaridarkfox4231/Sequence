// 正方形がたくさん出てきて色んな軌道を描きます
// aキーを押すと出現、様々な挙動、攻撃。色々。
var square;
var squareGroup;
var squareImages = [];
var squareImage;
var attack;
var attackGroup;
var attackImages = [];
var attackImage;
var i, j, k;

function preload(){
  for(i = 0; i < 5; i++){
    squareImage = loadImage("./assets/color_" + i + ".png");
    squareImages.push(squareImage);
  }
  for(i = 0; i < 3; i++){
    attackImage = loadImage("./assets/attack_" + i + ".png");
    attackImages.push(attackImage);
  }
}

function setup(){
  createCanvas(640, 480);
  squareGroup = new Group;
}

function draw(){
  clear();
  background(220);
  move(); // 動く
  makeAttack(Math.floor(random(0, 100))); // 攻撃を出すかどうかの確率判定
  drawSprites(); // 攻撃とか正方形の描画
}

function move(){
  squareGroup.forEach(function(s){
    if(s.kind === 0){
      // simple harmonic ocillation (horizontal)
      s.position.x = s.pivot_x + 50 * sin((s.phase + frameCount) * PI / 60);
    }else if(s.kind === 1){
      // simple harmonic ocillation (vertical)
      s.position.y = s.pivot_y + 50 * cos((s.phase + frameCount) * PI / 60);
    }else if(s.kind === 2){
      // cyclic trail
      s.position.x = s.pivot_x + 50 * sin((s.phase + frameCount) * PI / 60);
      s.position.y = s.pivot_y + 50 * cos((s.phase + frameCount) * PI / 60);
    }else if(s.kind === 3){
      // Lissajous
      s.position.x = s.pivot_x + 50 * sin((s.phase + frameCount) * PI / 30);
      s.position.y = s.pivot_y + 50 * cos((s.phase + frameCount) * PI / 60);
    }else if(s.kind === 4){
      // trefoil
      s.position.x = s.pivot_x + 50 * sin((s.phase + frameCount) * PI / 30) + 50 * cos((s.phase + frameCount) * PI / 60);
      s.position.y = s.pivot_y + 50 * cos((s.phase + frameCount) * PI / 30) + 50 * sin((s.phase + frameCount) * PI / 60);
    }
  });
}

// 攻撃によって出す確率を変える
function makeAttack(rdm){
  squareGroup.forEach(function(s){
    if(s.kind === 0 && rdm < 5){
      createAttack(s.position.x, s.position.y + s.height, 0);
    }else if(s.kind === 1 && rdm < 5){
      createAttack(s.position.x, s.position.y + s.height, 1);
    }else if(s.kind === 2 && rdm < 3){
      createAttack(s.position.x, s.position.y + s.height, 2);
    }
  })
}

// 攻撃を作る
function createAttack(x, y, kind){
  if(kind === 0){
    attack = createSprite(x, y, 20, 20);
    attack.addImage(attackImages[0]);
    attack.setVelocity(0, 5);
  }else if(kind === 1){
    attack = createSprite(x, y, 20, 20);
    attack.addImage(attackImages[1]);
    attack.setVelocity(0, 10);
  }else if(kind === 2){
    for(i = 2; i < 5; i++){
      attack = createSprite(x, y, 20, 20);
      attack.addImage(attackImages[2]);
      attack.setVelocity(5 * cos(i * PI / 6), 5 * sin(i * PI / 6));
    }
  }
}

function keyTyped(){
  console.log(KEY['A']);
  console.log(KEY['1NUMPAD']);
  console.log(keyCode === KEY['1NUMPAD']);  // どうもKEY['A']は65でkeyCodeは97なのでズレがあるみたい
  if(key === 'a'){
    var x = random(80, 560);
    var y = random(80, 400);
    square = createSprite(x, y, 20, 20);
    var kind = Math.floor(random(0, 5));
    square.kind = kind; // 種類に応じて挙動を変える
    square.phase = Math.floor(random(0, 60)); // 固有の位相
    square.pivot_x = x;
    square.pivot_y = y;
    square.life = 600; // 10秒で消滅する
    square.addImage(squareImages[kind]);
    square.addToGroup(squareGroup);
  }
}
