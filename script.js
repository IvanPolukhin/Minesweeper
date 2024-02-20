let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let countBlock = 15;
let sizeBlock = 40;
let CB = 0.1;
let game = false;
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
                wline.push({ number: 9, show: 0, flagged: false });
            } else {
                wline.push({ number: 0, show: 0, flagged: false });
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
                    ctx.fillText(blocks[h][w].number, w * sizeBlock + sizeBlock / 3, (h + 1) * sizeBlock - sizeBlock / 3);
                }
            } else if (blocks[h][w].flagged) { // Блок для рисования флажка на закрытых ячейках с установленным флажком
                ctx.fillStyle = '#00f';
                ctx.fillRect(w * sizeBlock + sizeBlock / 4, h * sizeBlock + sizeBlock / 4, sizeBlock / 2, sizeBlock / 2);
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

canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

canvas.addEventListener('mousedown', function (event) {
    let h = Math.floor((event.clientY - offsetY) / sizeBlock);
    let w = Math.floor((event.clientX - offsetX) / sizeBlock);

    if (!game) {
        startGame(h, w);
    }

    if (event.button === 0) { // Левая кнопка мыши
        if (!blocks[h][w].show && !blocks[h][w].flagged) {
            if (blocks[h][w].number == 9) {
                console.log('lose');
                showAllMines();
                game = false;
                alert("Вы проиграли");
            } else {
                showBlock(h, w);
            }
        }
    } else if (event.button === 2) { // Правая кнопка мыши
        event.preventDefault(); // Предотвращаем стандартное контекстное меню браузера
        toggleFlag(h, w);
    }

    if (checkWin()) {
        alert('Вы нашли все мины!!!');
        game = false;
    }
});

function toggleFlag(h, w) {
    blocks[h][w].flagged = !blocks[h][w].flagged;
    draw(); // Перерисовываем игровое поле после установки или снятия флажка
}

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

function checkWin() {
    for (let h = 0; h < countBlock; h++) {
        for (let w = 0; w < countBlock; w++) {
            if (blocks[h][w].number == 9 && !blocks[h][w].flagged) {
                return false;
            }
        }
    }
    return true;
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