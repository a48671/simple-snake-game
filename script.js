const canvasSize = 400;
const cellSize = 20;
const cellsCount = canvasSize / cellSize;

const gameSpeed = 300;

// Colors
const COLOR_BACKGROUND = '#3DA79F';
const COLOR_GRID = '#4DB6AF';
const COLOR_FOOD = '#F97676FF';
const COLOR_SNAKE_HEAD = '#CDCFDE';
const COLOR_SNAKE_BODY = '#FDFFFD';
const COLOR_OVERLAY = 'rgba(61, 167, 159, 0.7)';
const COLOR_TEXT = '#FFFFFF';

// State variables
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let score = 0;
let gameOver = false;

let intervalId = null;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const scoreValueElement = document.getElementById('score-value');

function createInitialSnake() {
    const startX = Math.floor(cellsCount / 2);
    const startY = Math.floor(cellsCount / 2);

    return [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
    ];
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function spawnFood() {
    while (true) {
        const x = getRandomInt(cellsCount);
        const y = getRandomInt(cellsCount);

        const isOnSnake = snake.some((segment) => {
            return segment.x === x && segment.y === y;
        });

        if (!isOnSnake) {
            food = { x, y };
            break;
        }
    }
}

function setInitialState() {
    snake = createInitialSnake();
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    scoreValueElement.textContent = String(score);

    spawnFood();
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;

    ctx.fillRect(
        x * cellSize + 1,
        y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
    );
}

function drawGame() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 1;

    for (let i = 0; i <= cellsCount; i++) {
        const position = i * cellSize;

        ctx.beginPath();
        ctx.moveTo(position, 0);
        ctx.lineTo(position, canvasSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, position);
        ctx.lineTo(canvasSize, position);
        ctx.stroke();
    }

    if (food) {
        drawCell(food.x, food.y, COLOR_FOOD);
    }

    // draw Snake
    for (let i = 0; i < snake.length; i++) {
        drawCell(
            snake[i].x,
            snake[i].y,
            i === 0 ? COLOR_SNAKE_HEAD : COLOR_SNAKE_BODY
        );
    }

    if (gameOver) {
        ctx.save();

        ctx.fillStyle = COLOR_OVERLAY;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;

        ctx.fillStyle = COLOR_TEXT;
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseLine = 'middle';
        ctx.fillText('GAME OVER', centerX, centerY - 10);
        ctx.font = '18px sans-serif';
        ctx.fillText('Press Enter to restart', centerX, centerY + 25);
    }
}

function endGame() {
    gameOver = true;

    drawGame();
    
    // Show restart button on mobile
    const btnRestart = document.getElementById('btn-restart');
    btnRestart.classList.add('visible');
}

function updateGame() {
    if (gameOver) {
        return;
    }

    direction = { ...nextDirection };

    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
    }

    const hitWall = newHead.x < 0
        || newHead.x >= cellsCount
        || newHead.y < 0
        || newHead.y >= cellsCount;

    if (hitWall) {
        endGame();

        return;
    }

    const hitSelf = snake.some(
        (segment) => segment.x === newHead.x && segment.y === newHead.y
    );

    if (hitSelf) {
        endGame();

        return;
    }

    snake.unshift(newHead);

    const ateFood = newHead.x === food.x && newHead.y === food.y;

    if (ateFood) {
        score += 1;
        scoreValueElement.textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function startGameLoop() {
    if (intervalId !== null) {
        clearInterval(intervalId);
    }

    intervalId = setInterval(updateGame, gameSpeed);
}

function handleKeyDown(event) {
    const key = event.key;

    if (key === 'Enter') {
        if (gameOver) {
            setInitialState();
        }

        return;
    }

    let newDirection = null;

    if (key === 'ArrowUp') {
        newDirection = { x: 0, y: -1 };
    }
    
    if (key === 'ArrowDown') {
        newDirection = { x: 0, y: 1 };
    }

    if (key === 'ArrowRight') {
        newDirection = { x: 1, y: 0 };
    }

    if (key === 'ArrowLeft') {
        newDirection = { x: -1, y: 0 };
    }

    handleDirectionChange(newDirection);
}

function handleDirectionChange(newDirection) {
    if (newDirection === null) {
        return;
    }

    const isOpposite = newDirection.x === -direction.x
        && newDirection.y === -direction.y;

    if (isOpposite) {
        return;
    }

    nextDirection = newDirection;
}

document.addEventListener('keydown', handleKeyDown);

// Mobile controls event listeners
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnRestart = document.getElementById('btn-restart');

btnUp.addEventListener('click', () => {
    handleDirectionChange({ x: 0, y: -1 });
});

btnDown.addEventListener('click', () => {
    handleDirectionChange({ x: 0, y: 1 });
});

btnLeft.addEventListener('click', () => {
    handleDirectionChange({ x: -1, y: 0 });
});

btnRight.addEventListener('click', () => {
    handleDirectionChange({ x: 1, y: 0 });
});

btnRestart.addEventListener('click', () => {
    if (gameOver) {
        setInitialState();
        btnRestart.classList.remove('visible');
    }
});

setInitialState();
drawGame();
startGameLoop();
