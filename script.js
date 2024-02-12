let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let countBlock = 15;
let sizeBlock = 40;
let CB = 0.1;
let game = false;
let firstClick = true;
let minesPlaced = false;
let startTime;
let timerInterval;
let pausedTime = 0;

let blocks = [];

canvas.width = countBlock * sizeBlock;
canvas.height = countBlock * sizeBlock;

function plusOne(h, w) {
    if (h >= 0 && h <= countBlock - 1 && w >= 0 && w <= countBlock - 1) {
        if (blocks[h][w].number != 9) {
            blocks[h][w].number++;
        }
    }
}

function placeMines(excludedH, excludedW) {
    for (let h = 0; h < countBlock; h++) {
        let wline = [];
        for (let w = 0; w < countBlock; w++) {
            if (h == excludedH && w == excludedW) {
                wline.push({ number: 0, show: 0 });
                continue;
            }
            if (Math.random() < CB) {
                wline.push({ number: 9, show: 0 });
            } else {
                wline.push({ number: 0, show: 0 });
            }
        }
        blocks.push(wline);
    }

    for (let h = 0; h < countBlock; h++) {
        for (let w = 0; w < countBlock; w++) {
            if (blocks[h][w].number == 9) {
                plusOne(h, w - 1);
                plusOne(h, w + 1);
                plusOne(h - 1, w);
                plusOne(h + 1, w);
                plusOne(h - 1, w - 1);
                plusOne(h - 1, w + 1);
                plusOne(h + 1, w - 1);
                plusOne(h + 1, w + 1);
            }
        }
    }

    minesPlaced = true;
}

function draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let h = 0; h < blocks.length; h++) {
        for (let w = 0; w < blocks[h].length; w++) {
            if (blocks[h][w].show) {
                if (blocks[h][w].number == 9) {
                    ctx.beginPath();
                    ctx.fillStyle = '#f00';
                    ctx.arc(w * sizeBlock + sizeBlock / 2, h * sizeBlock + sizeBlock / 2, sizeBlock / 3, 0, 2 * Math.PI, true);
                    ctx.fill();
                    continue;
                }
                ctx.fillStyle = '#555';
                ctx.fillRect(w * sizeBlock, h * sizeBlock, sizeBlock, sizeBlock);
                if (blocks[h][w].number) {
                    ctx.font = '32px serif';
                    ctx.fillStyle = '#ddd';
                    ctx.fillText(blocks[h][w].number, w * sizeBlock, (h + 1) * sizeBlock - 10);
                }
            }
        }
    }

    for (let t = 0; t < countBlock + 1; t++) {
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, t * sizeBlock);
        ctx.lineTo(canvas.width, t * sizeBlock);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(t * sizeBlock, 0);
        ctx.lineTo(t * sizeBlock, canvas.height);
        ctx.stroke();
    }
}

setInterval(draw, 25);

let rect = canvas.getBoundingClientRect();
let offsetX = rect.left;
let offsetY = rect.top;

canvas.addEventListener('mousedown', function (event) {
    let h = Math.floor((event.clientY - offsetY) / sizeBlock);
    let w = Math.floor((event.clientX - offsetX) / sizeBlock);

    if (!game) {
        startGame(h, w);
    }

    if (event.button === 0) {
        if (blocks[h][w].number == 9) {
            console.log('lose');
            showAllMines();
            game = false;
            alert("Вы проиграли");
        } else {
            showBlock(h, w);
        }
    } else if (event.button === 2) {
        event.preventDefault();
        toggleFlag(h, w);
    }
});

function startGame(h, w) {
    if (!minesPlaced) {
        placeMines(h, w);
    }
    game = true;
    startTime = Date.now();
    startTimer();
    showBlock(h, w);
}

function showBlock(h, w) {
    blocks[h][w].show = 1;

    if (blocks[h][w].number === 0) {
        checkZero(h, w - 1);
        checkZero(h, w + 1);
        checkZero(h - 1, w);
        checkZero(h + 1, w);
    }
}

function checkZero(h, w) {
    if (h >= 0 && h <= countBlock - 1 && w >= 0 && w <= countBlock - 1) {
        if (!blocks[h][w].show) {
            showBlock(h, w);
        }
    }
}

function toggleFlag(h, w) {
    if (!blocks[h][w].show) {
        blocks[h][w].flagged = !blocks[h][w].flagged;
    }
}

function showAllMines() {
    for (let h = 0; h < countBlock; h++) {
        for (let w = 0; w < countBlock; w++) {
            if (blocks[h][w].number == 9) {
                blocks[h][w].show = 1;
            }
        }
    }
}

function startTimer() {
    timerInterval = setInterval(function () {
        let elapsedTime = Date.now() - startTime;
        let minutes = Math.floor(elapsedTime / 60000);
        let seconds = ((elapsedTime % 60000) / 1000).toFixed(0);
        document.getElementById("timer").innerText = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }, 1000);
}

function resetGame() {
    clearInterval(timerInterval);
    blocks = [];
    minesPlaced = false;
    game = false;
    firstClick = true;
    draw();
    document.getElementById("timer").innerText = "0:00";
    document.getElementById('pauseResumeButton').textContent = 'Пауза'; // Возвращаем текст кнопки к 'Пауза'
}

function pauseGame() {
    if (game) {
        clearInterval(timerInterval);
        game = false;
        pausedTime = Date.now();
        document.getElementById('pauseResumeButton').textContent = 'Продолжить'; // Изменяем текст кнопки на 'Продолжить'
    }
}

function resumeGame() {
    if (!game) {
        game = true;
        startTime += Date.now() - pausedTime;
        startTimer();
        document.getElementById('pauseResumeButton').textContent = 'Пауза'; // Изменяем текст кнопки на 'Пауза'
    }
}

document.getElementById('resetButton').addEventListener('click', function () {
    resetGame();
});

document.getElementById('pauseResumeButton').addEventListener('click', function () {
    if (game) {
        pauseGame();
    } else {
        resumeGame();
    }
});