let canvas, g;
const defaultPositionX      = 100;
const defaultEnemyPositionX = 600;
const defaultPositionY      = 400;
let player, enemy, particles, moon, castle;
let score;
let scene;
let frameCount;
let bound;
let next;

// シーンの定義
const Scenes = {
    GameMain: "GameMain",
    GameOver: "GameOver",
};

onload = function () {
    // 描画コンテキストの取得
    canvas = document.getElementById("gamecanvas");
    g = canvas.getContext("2d");
    // 初期化
    init();
    // 入力処理の指定
    document.onkeydown = keydown;
    document.onkeyup = keyup;
    document.onmousedown = keydown;
    document.onmouseup = keyup;
    // ゲームループの設定 60FPS
    setInterval("gameloop()", 16);
};

function init() {
    // 自キャラ初期化
    player = new Player(100, 400, 16, "./asset/reimu.png", 0, 0);

    // 敵キャラ初期化
    enemy = [];
    next = 10;

    // 月
    moon           = new Sprite();
    moon.posX      = 100;
    moon.posY      = 100;
    moon.image     = new Image();
    moon.image.src = "./asset/moon.png";

    // 城
    castle           = new Sprite();
    castle.posX      = 400;
    castle.posY      = 296;
    castle.image     = new Image();
    castle.image.src = "./asset/castle.png";

    // パーティクル初期化
    particles = [];

    // ゲーム管理データの初期化
    score      = 0;
    frameCount = 0;
    bound      = false;
    scene      = Scenes.GameMain;
}
let isKeyDown = false;
function keydown(e) {
    // ゲームプレイ中
    if (scene === Scenes.GameMain) {
        if (player.speed === 0 && !isKeyDown) {
            player.speed = -18;
            player.acceleration = 1.0;
        }
        // ゲームオーバー中
    } else if (scene === Scenes.GameOver) {
        if (frameCount > 60) {
            init();
        }
    }
    isKeyDown = true;
}
function keyup(e) {
    if (player.speed < 0) {
        player.acceleration = 2.5;
    }
    isKeyDown = false;
}

function gameloop() {
    update();
    draw();
}

/**
 * キャラクターの状態を更新する
 */
function update() {
    // ゲームプレイ中
    if (scene === Scenes.GameMain) {
        // 自キャラの状態更新
        player.update();

        // 敵キャラの状態更新
        enemy.forEach((e) => {
            e.update();
            // 端に到達でスコア増加
            if (e.posX < -100) {
                score += 100;
            }
        });

        // 端に到達した敵キャラを除外
        enemy = enemy.filter((e) => e.posX >= -100);

        // 敵キャラ生成
        if (frameCount === next) {
            generateNextEnemy();
        }

        // 当たり判定
        hitCheck();

        // ゲームオーバー中
    } else if (scene === Scenes.GameOver) {
        // パーティクルの状態更新
        particles.forEach((p) => {
            p.update();
        });

        // 敵キャラの状態更新
        enemy.forEach((e) => {
            e.update();
        });
    }

    // 背景の城の位置を動かす
    castle.posX -= 0.25;
    if (castle.posX < -100) castle.posX = 560;

    // 現在何フレーム目かをカウント
    frameCount++;
}

/**
 * キャラクターを描画する
 */
function draw() {
    g.imageSmoothingEnabled = false;

    if (scene === Scenes.GameMain) {
        // ゲームプレイ中
        // 背景描画
        drawBack(g);

        // キャラクタ描画;
        player.draw(g);

        // 敵キャラクタ描画
        enemy.forEach((e) => {
            e.draw(g);
        });

        // スコア描画
        drawScore(g);

    } else if (scene === Scenes.GameOver) {
        // ゲームオーバー中
        // 背景描画
        drawBack(g);

        // パーティクル描画
        particles.forEach((p) => {
            p.draw(g);
        });

        // 敵キャラクタ描画
        enemy.forEach((e) => {
            e.draw(g);
        });

        // スコア描画
        drawScore(g);

        // ゲームオーバー表示
        drawGameOver(g);
    }
}

// 当たり判定
function hitCheck() {
    enemy.forEach((e) => {
        let diffX = player.posX - e.posX;
        let diffY = player.posY - e.posY;
        let distance = Math.sqrt(diffX * diffX + diffY * diffY);
        if (distance < player.r + e.r) {
            // 当たったときの処理
            scene      = Scenes.GameOver;
            frameCount = 0;

            // パーティクル生成
            for (let i = 0; i < 300; i++) {
                particles.push(new Particle(player.posX, player.posY));
            }
        }
    });
}

// 敵キャラ生成
function generateNextEnemy() {
    let newEnemy = new Enemy(
        600,
        400 - (Math.random() < 0.5 ? 0 : 50),
        12,
        "./asset/marisa.png",
        4 + 5 * Math.random(),
        0
    );
    enemy.push(newEnemy);
    next = Math.floor(frameCount + 30 + 80 * Math.random());
}

// 背景の描画
function drawBack(g) {
    let interval = 16;
    let ratio    = 5;
    let center   = 240;
    let baseLine = 360;
    // 画面を黒く塗りつぶして初期化する
    g.fillStyle = "rgb(0,0,0)";
    g.fillRect(0, 0, 480, 480);
    // 月と城を描画する
    moon.draw(g);
    castle.draw(g);
    // 地面のラインアート
    for (let i = 0; i < 480 / interval + 1; i++) {
        let x1 = i * interval - (frameCount % interval);
        let x2 = center + (x1 - center) * ratio;
        g.strokeStyle = "#98660b";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x1, baseLine);
        g.lineTo(x2, 480);
        g.stroke();
    }
}

// スコア描画
function drawScore(g) {
    g.fillStyle         = "rgb(255, 255, 255)";
    g.font              = "16px Arial";
    let scoreLabel      = "SCORE: " + score;
    let scoreLabelWidth = g.measureText(scoreLabel).width; // スコアの文字列の幅を取得
    g.fillText(scoreLabel, 460 - scoreLabelWidth, 40);
}

// ゲームオーバー描画
function drawGameOver(g) {
    g.fillStyle       = "rgb(255, 255, 255)";
    g.font            = "bold 48px Arial";
    let gameOverLabel = "GAME OVER";
    let gameOverLabelWidth = g.measureText(gameOverLabel).width; // スコアの文字列の幅を取得
    g.fillText(gameOverLabel, 240 - gameOverLabelWidth / 2, 240);
}

// スプライトクラス
class Sprite {
    image        = null;
    posX         = 0;
    posY         = 0;
    speed        = 0;
    acceleration = 0;
    r            = 0;

    // コンストラクタ
    constructor() { }

    // 状態更新
    update() { }

    // 描画処理
    draw(g) {
        g.drawImage(
            this.image,
            this.posX - this.image.width / 2,
            this.posY - this.image.height / 2
        );
    }
}

// 自キャラクラス
class Player extends Sprite {
    baseLine = 400;

    constructor(posX, posY, r, imageUrl, speed, acceleration) {
        super();
        this.posX         = posX;
        this.posY         = posY;
        this.r            = r;
        this.image        = new Image();
        this.image.src    = imageUrl;
        this.speed        = speed;
        this.acceleration = acceleration;
    }

    update() {
        // 自キャラの状態更新
        this.speed = this.speed + this.acceleration;
        this.posY = this.posY + this.speed;
        if (this.posY > this.baseLine) {
            this.posY         = this.baseLine;
            this.speed        = 0;
            this.acceleration = 0;
        }
    }
}

// エネミークラス
class Enemy extends Sprite {
    constructor(posX, posY, r, imageUrl, speed, acceleration) {
        super();
        this.posX         = posX;
        this.posY         = posY;
        this.r            = r;
        this.image        = new Image();
        this.image.src    = imageUrl;
        this.speed        = speed;
        this.acceleration = acceleration;
    }

    update() {
        // 敵キャラの状態更新
        this.posX -= this.speed;
    }
}

// パーティクルクラス
class Particle extends Sprite {
    baseLine     = 0;
    acceleration = 0;
    speedX       = 0;
    speedY       = 0;

    constructor(x, y) {
        super();
        this.posX         = x;
        this.posY         = y;
        this.baseLine     = 420;
        this.acceleration = 0.5;
        let angle         = (Math.PI * 5) / 4 + (Math.PI / 2) * Math.random();
        this.speed        = 5 + Math.random() * 20;
        this.speedX       = this.speed * Math.cos(angle);
        this.speedY       = this.speed * Math.sin(angle);
        this.r            = 2;
    }

    update() {
        this.speedX *= 0.97;
        this.speedY += this.acceleration;
        this.posX   += this.speedX - 2;
        this.posY   += this.speedY;
        if (this.posY > this.baseLine) {
            this.posY   = this.baseLine;
            this.speedY = this.speedY * -1 * (Math.random() * 0.5 + 0.3);
        }
    }

    draw(g) {
        g.fillStyle = "rgb(255, 50, 50)";
        g.fillRect(this.posX - this.r, this.posY - this.r, this.r * 2, this.r * 2);
    }
}
