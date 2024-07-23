const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load the background image
const backgroundImage = new Image();
backgroundImage.src = 'background2.jpg';

backgroundImage.onload = () => {
    console.log('Background image loaded.');
};

// Game settings
const spaceshipSize = 30;
const spaceshipPixelSize = 6; // Size of individual pixels in the pixelated spaceship
const spaceshipSpeed = 5;
const bulletSpeed = 7;
const enemySpeed = 3;
const enemySpawnInterval = 2000; // milliseconds
const bulletShootInterval = 500; // milliseconds
const orbRadius = 5;
const xpBoostThreshold = 5;

let spaceship = {
    x: canvas.width / 2 - spaceshipSize / 2,
    y: canvas.height - spaceshipSize - 10,
    width: spaceshipSize,
    height: spaceshipSize,
    xp: 0,
    level: 1
};

let bullets = [];
let enemies = [];
let orbs = [];
let keys = {};
let gameRunning = false;
let highscore = localStorage.getItem('highscore') || 0;

function drawPixelatedSpaceship() {
    const pixelSize = spaceshipPixelSize;
    ctx.fillStyle = 'green';
    // Draw the pixelated spaceship using small rectangles
    for (let y = 0; y < spaceshipSize; y += pixelSize) {
        for (let x = 0; x < spaceshipSize; x += pixelSize) {
            ctx.fillRect(spaceship.x + x, spaceship.y + y, pixelSize, pixelSize);
        }
    }
}

function drawBullet(bullet) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

function drawEnemy(enemy) {
    ctx.fillStyle = 'red';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

function drawOrb(orb) {
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

function updateGame() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background image
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Move spaceship
    if (keys['ArrowLeft'] && spaceship.x > 0) {
        spaceship.x -= spaceshipSpeed;
    }
    if (keys['ArrowRight'] && spaceship.x < canvas.width - spaceship.width) {
        spaceship.x += spaceshipSpeed;
    }
    if (keys['ArrowUp'] && spaceship.y > 0) {
        spaceship.y -= spaceshipSpeed;
    }
    if (keys['ArrowDown'] && spaceship.y < canvas.height - spaceship.height) {
        spaceship.y += spaceshipSpeed;
    }

    // Move bullets
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }

    // Move enemies
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += enemySpeed;
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            i--;
        }
    }

    // Move orbs
    for (let i = 0; i < orbs.length; i++) {
        if (
            spaceship.x < orbs[i].x + orbs[i].radius &&
            spaceship.x + spaceship.width > orbs[i].x - orbs[i].radius &&
            spaceship.y < orbs[i].y + orbs[i].radius &&
            spaceship.y + spaceship.height > orbs[i].y - orbs[i].radius
        ) {
            spaceship.xp++;
            orbs.splice(i, 1);
            i--;
            if (spaceship.xp % xpBoostThreshold === 0) {
                spaceship.level++;
            }
            updateXPLevelBar();
        }
    }

    // Check for collisions
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            if (
                bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y
            ) {
                bullets.splice(i, 1);
                let orb = {
                    x: enemies[j].x + enemies[j].width / 2,
                    y: enemies[j].y + enemies[j].height / 2,
                    radius: orbRadius
                };
                orbs.push(orb);
                enemies.splice(j, 1);
                i--;
                break;
            }
        }
    }

    // Draw everything
    drawPixelatedSpaceship();
    bullets.forEach(drawBullet);
    enemies.forEach(drawEnemy);
    orbs.forEach(drawOrb);

    if (gameRunning) {
        requestAnimationFrame(updateGame);
    }
}

function spawnEnemy() {
    if (!gameRunning) return;
    let enemy = {
        x: Math.random() * (canvas.width - spaceshipSize),
        y: 0,
        width: spaceshipSize,
        height: spaceshipSize
    };
    enemies.push(enemy);
}

function shootBullet() {
    if (!gameRunning) return;
    for (let i = 0; i < spaceship.level; i++) {
        bullets.push({
            x: spaceship.x + spaceship.width / 2 - 2.5 + (i * 10) - (spaceship.level - 1) * 5,
            y: spaceship.y,
            width: 5,
            height: 10
        });
    }
}

function updateXPLevelBar() {
    document.getElementById('xpLabel').textContent = `XP: ${spaceship.xp}`;
    document.getElementById('levelLabel').textContent = `Level: ${spaceship.level}`;
}

function showStartScreen() {
    document.getElementById('startScreen').style.display = 'flex';
    document.getElementById('highscoreScreen').style.display = 'none';
    canvas.style.display = 'none';
    document.getElementById('xpBar').style.display = 'none';
}

function showHighscoreScreen() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('highscoreScreen').style.display = 'flex';
    document.getElementById('xpBar').style.display = 'none';
    document.getElementById('highscore').textContent = `Best Level: ${highscore}`;
}

function startGame() {
    gameRunning = true;
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('highscoreScreen').style.display = 'none';
    canvas.style.display = 'block';
    document.getElementById('xpBar').style.display = 'flex';
    spaceship.x = canvas.width / 2 - spaceshipSize / 2;
    spaceship.y = canvas.height - spaceshipSize - 10;
    spaceship.xp = 0;
    spaceship.level = 1;
    bullets = [];
    enemies = [];
    orbs = [];
    updateXPLevelBar();
    setInterval(spawnEnemy, enemySpawnInterval);
    setInterval(shootBullet, bulletShootInterval);
    updateGame();
}

function goBackToStart() {
    showStartScreen();
}

// Event Listeners
document.getElementById('playButton').addEventListener('click', startGame);
document.getElementById('highscoreButton').addEventListener('click', showHighscoreScreen);
document.getElementById('settingsButton').addEventListener('click', () => {
    alert('Settings functionality is not implemented yet.');
});
document.getElementById('backButton').addEventListener('click', goBackToStart);

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});
