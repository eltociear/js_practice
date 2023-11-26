let canvas, g;
const defaultPositionX = 100;
const defaultEnemyPositionX = 600;
const defaultPositionY = 400;
let player, enemy;
let score;
let scene;
let frameCount;
let bound;

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
    // ゲームループの設定 60FPS
    setInterval("gameloop()", 16);
};

/**
 * ゲームの初期化
 */
function init() {
    // 自キャラの初期化
    player              = new Sprite();
    player.image        = new Image();
    player.image.src    = "./asset/reimu.png";
    player.posX         = defaultPositionX;
    player.posY         = defaultPositionY;
    player.speed        = 0;
    player.acceleraiton = 0;
    player.r            = 16; // 接触判定用の半径

    // 敵の初期化
    enemy              = new Sprite();
    enemy.image        = new Image();
    enemy.image.src    = "./asset/marisa.png";
    enemy.posX         = defaultEnemyPositionX; // 右画面外
    enemy.posY         = defaultPositionY;
    enemy.speed        = 5;
    enemy.acceleraiton = 0;
    enemy.r            = 16; // 接触判定用の半径

    // ゲーム管理データの初期化
    score      = 0;
    frameCount = 0;
    bound      = false;
    scene      = Scenes.GameMain;
}

function keydown(e) {
    // 地面にいない場合はジャンプしない
    if (player.posY < defaultPositionY) {
        return;
    }
    // Y軸方向への1フレームあたりの移動量
    player.speed = -20;
    // (重力)
    player.acceleraiton = 1.5;
}

function gameloop() {
    update();
    draw();
}

/**
 * キャラクターの状態を更新する
 */
function update() {
    if (scene === Scenes.GameMain) {
        // ゲーム中
        player.speed = player.speed + player.acceleraiton;
        player.posY  = player.posY + player.speed;
        // 地面に着いたら速度と加速度を0にする
        if (player.posY > defaultPositionY) {
            player.posY = defaultPositionY;
            player.speed        = 0;
            player.acceleraiton = 0;
        }

        // 敵の状態更新
        enemy.posX -= enemy.speed;
        if (enemy.posX < -100) {
            enemy.posX = defaultEnemyPositionX;
            // 敵が画面外に出たらスコアを加算
            score += 100;
        }

        // 自キャラと敵キャラの接触判定
        let diffX = player.posX - enemy.posX;
        let diffY = player.posY - enemy.posY;
        // 2点間の距離を求める(3平方の定理)
        let distance = Math.sqrt(diffX * diffX + diffY * diffY);
        // (当たった時の処理)自キャラと敵キャラの距離が半径の和より小さい場合は接触している
        if (distance < player.r + enemy.r) {
            scene               = Scenes.GameOver;
            player.speed        = -20;
            player.acceleraiton = 0.5;
            frameCount          = 0;
        }
    } else if (scene === Scenes.GameOver) {
        // ゲームオーバー
        // 自キャラの状態更新
        player.speed += player.acceleraiton;
        player.posY  += player.speed;
        if (player.posX < 20 || player.posX > 460) {
            // 画面端に移動したらバウンド
            bound = !bound;
        }
        if (bound) {
            player.posX += 30;
        } else {
            player.posX -= 30;
        }

        // 敵キャラの状態更新
        enemy.posX += enemy.speed;
    }

    // 現在何フレーム目かを記録
    frameCount++;
}

/**
 * キャラクターを描画する
 */
function draw() {
    g.imageSmoothingEnabled = false;

    if (scene === Scenes.GameMain) {
        // 画面を黒でクリア
        g.fillStyle = "rgb(0, 0, 0)";
        g.fillRect(0, 0, 480, 480);

        // 自キャラ描画
        player.draw(g);

        // 敵キャラ描画
        enemy.draw(g);

        // スコア表示
        g.fillStyle         = "rgb(255, 255, 255)";
        g.font              = "16px Arial";
        let scoreLabel      = "SCORE: " + score;
        let scoreLabelWidth = g.measureText(scoreLabel).width; // スコアの文字列の幅を取得
        g.fillText(scoreLabel, 460 - scoreLabelWidth, 40);
    } else if (scene === Scenes.GameOver) {
        // 画面を黒でクリア
        g.fillStyle = "rgb(0, 0, 0)";
        g.fillRect(0, 0, 480, 480);

        // 自キャラ描画
        if (frameCount < 120) {
            g.save();
            g.translate(player.posX, player.posY);
            // 30フレームで1回転
            g.rotate(((frameCount % 30) * Math.PI / 2) / 30);
            // 拡大描画
            g.drawImage(
                player.image,
                -player.image.width / 2,
                -player.image.height / 2,
                player.image.width + frameCount,
                player.image.height + frameCount
            );
            g.restore();
        }

        // ゲームオーバー表示
        g.fillStyle = "rgb(255, 255, 255)";
        g.font      = "48px Arial";
        let gameOverLabel = "GAME OVER";
        let gameOverLabelWidth = g.measureText(gameOverLabel).width; // スコアの文字列の幅を取得
        g.fillText(gameOverLabel, 240 - gameOverLabelWidth / 2, 240);
    }
}

// スプライトクラス
class Sprite {
    image        = null;
    posX         = 0;
    posY         = 0;
    speed        = 0;
    acceleraiton = 0;
    r            = 0;

    // 描画処理
    draw(g) {
        g.drawImage(
            this.image,
            this.posX - this.image.width / 2,
            this.posY - this.image.height / 2
        );
    }
}
