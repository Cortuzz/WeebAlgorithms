window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startFinder);

    window.cellButtons.addEventListener("click", changeCellMode);

    window.fieldSizeX.addEventListener("input", changeSizeX);
    window.fieldSizeY.addEventListener("input", changeSizeY);
    window.retainer.addEventListener("input", changeFix);

    window.findSpeed.addEventListener("input", changeSpeed);

    window.randomizeButton.addEventListener("click", randomizeMatrix);
    window.generateButton.addEventListener("click", generateMaze);
    window.clearButton.addEventListener("click", clear);
    window.changeRandBorder.addEventListener("input", changeRandomBorder);
});

let defaultLog = "Алгоритм не запущен";
let defaultColor = "coral";

let fixing = false;
let width, height;
let maze, speed;
let randomBorder = 0.5;

let finder;
let start, finish;
let currentState = 'start', handleStates, viewStates;

const ERASERS_NUMBER = 100;
let erasers = [ ];
for (let i = 0; i < ERASERS_NUMBER; i++) {
    erasers.push( { x: 0, y: 0 })
}

function init() {
    maze = [];
    viewStates = {'border': "Выбор преград", 'start': "Выбор начальной точки", 'finish': "Выбор конечной точки"};
    handleStates = {2: 'start', 3: 'finish', 1: 'border', 0: 'unchecked'};

    window.currentActionView.innerText = viewStates[currentState];

    if (width == null && height == null) {
        width = parseInt(window.fieldSizeX.value);
        height = parseInt(window.fieldSizeY.value);
    }

    changeRandomBorder(undefined);
    changeSpeed(undefined);
    matrixBuilder();
    changeDimensionView();
    refreshTable();
}

function clear() {
    for (let eraser of erasers) {
        eraser.x = 0;
        eraser.y = 0;
    }

    window.log.textContent = defaultLog;

    if (finder != null) {
        finder.running = false;
    }

    init();
}

async function checkPoints() {
    if (start == null) {
        window.log.textContent = "Не задана начальная точка";
    } else if (finish == null) {
        window.log.textContent = "Не задана конечная точка";
    }

    if (start == null || finish == null) {
        window.log_block.style.borderColor = "B72626";
        await sleep(3000);

        if (window.log.textContent !== "Алгоритм запущен") {
            window.log.textContent = defaultLog;
            window.log_block.style.borderColor = defaultColor;
        }
        return false;
    }
    return true;
}

async function renderPathLength(length) {
    window.log.textContent = "Путь не найден";

    if (length != null) {
        window.log.textContent = "Длина пути равна " + length;
    }

    window.log_block.style.borderColor = "forestgreen";
    await sleep(3000);

    window.log.textContent = defaultLog;
    window.log_block.style.borderColor = defaultColor;
}

function changeRandomBorder(event) {
    if (event == null) {
        randomBorder = +window.changeRandBorder.value / 100;
    } else {
        randomBorder = +event.target.value / 100;
    }

    window.randomView.textContent = (100 * randomBorder).toFixed(0) + "%"
}

function dropTable() {
    let table = document.getElementById("table");

    if (table != null) {
        table.parentNode.removeChild(table);
    }
}

function refreshTable() {
    dropTable();
    tableBuilder(maze);
}


function matrixBuilder() {
    start = null;
    finish = null;

    for (let i = 0; i < height; i++) {
        maze[i] = new Array(width);
        for (let j = 0; j < width; j++) {
            maze[i][j] = 0;
        }
    }
}

function randomizeMatrix() {
    start = null;
    finish = null;

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (Math.random() < randomBorder) {
                maze[i][j] = 1;
                continue;
            }
            maze[i][j] = 0;
        }
    }

    refreshTable();
}

function generateMaze() {
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            maze[i][j] = 1;
        }
    }

    maze[0][0] = 0;

    while (!isValid()) {
        for (const eraser of erasers) {
            moveEraser(eraser);
        }
    }

    refreshTable();
}

function moveEraser(eraser) {
    const directions = [];

    if (eraser.x > 1) {
        directions.push([0, -2]);
    }

    if (eraser.x < width - 2) {
        directions.push([0, 2]);
    }

    if (eraser.y > 1) {
        directions.push([-2, 0]);
    }

    if (eraser.y < height - 2) {
        directions.push([2, 0]);
    }

    const [dy, dx] = getRandomDirection(directions);
    eraser.x += dx;
    eraser.y += dy;

    if (maze[eraser.y][eraser.x]) {
        maze[eraser.y][eraser.x] = 0;
        maze[eraser.y - dy / 2][eraser.x - dx / 2] = 0;
    }
}

function getRandomDirection(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

function isValid() {
    for (let i = 0; i < height; i += 2) {
        for (let j = 0; j < width; j += 2) {
            if (maze[i][j]) {
                return false;
            }
        }
    }

    return true;
}

function changeCellMode(event) {
    let action = event.target.dataset.mode;

    if (action == null) {
        return;
    }

    currentState = action;
    window.currentActionView.innerText = viewStates[action];
}

function changeDimensionView() {
    window.fieldWidthView.textContent = width;
    window.fieldHeightView.textContent = height;

    window.fieldSizeView.textContent = parseInt(width) * parseInt(height) + " ячеек";
}

function checkReplacePoints(x, y, point) {
    if (point != null && point.x === x && point.y === y) {
        return null;
    }

    return point;
}

function changeColor(x, y, value, state, target) {
    maze[x][y] = value;
    target.dataset.mode = state;
}

function changeCell(event) {
    clearSolution();
    let dataset = event.target.dataset;
    start = checkReplacePoints(+dataset.row, +dataset.column, start);
    finish = checkReplacePoints(+dataset.row, +dataset.column, finish);

    switch (currentState) {
        case "border":
            if (dataset.mode === "border") {
                changeColor(dataset.row, dataset.column, 0, "unchecked", event.target);
                return;
            }

            changeColor(dataset.row, dataset.column, 1, "border", event.target);
            break;

        case "start":
            let prevCellStart = document.querySelector("td[data-mode='start']");
            if (prevCellStart != null) {
                prevCellStart.dataset.mode = 'unchecked';
            }

            changeColor(dataset.row, dataset.column, 0, "start", event.target);
            start = new Point(parseInt(dataset.row), parseInt(dataset.column));
            break;

        case "finish":
            let prevCellFinish = document.querySelector("td[data-mode='finish']");
            if (prevCellFinish != null) {
                prevCellFinish.dataset.mode = 'unchecked';
            }

            changeColor(dataset.row, dataset.column, 0, "finish", event.target);
            finish = new Point(parseInt(dataset.row), parseInt(dataset.column));
            break;
    }
}

function changeSizeX(event) {
    let sizeX = event.target.value;
    let sizeY = window.fieldSizeY.value;
    width = sizeX;

    if (fixing) {
        height = +sizeX;
        init();

        window.fieldSizeY.value = window.fieldSizeX.value;
        return;
    }

    height = sizeY;
    init();
}

function changeSizeY(event) {
    let sizeX = window.fieldSizeX.value;
    let sizeY = event.target.value;
    height = sizeY;

    if (fixing) {
        width = +sizeY;
        init();

        window.fieldSizeX.value = window.fieldSizeY.value;
        return;
    }

    width = sizeX;
    init();
}

function changeSpeed(event) {
    if (event == null) {
        speed = window.findSpeed.value;
    } else {
        speed = event.target.value;
    }

    if (finder != null) {
        finder.changeDelay(1000 / speed);
    }

    window.speedView.textContent = speed + ". Обновление каждые " + (1000 / speed).toFixed(0) + " мс.";
}

function changeFix() {
    fixing = this.checked;

    if (fixing) {
        if (window.fieldSizeY.value === window.fieldSizeX.value) {
            return;
        }

        window.fieldSizeY.value = window.fieldSizeX.value;
        let value = window.fieldSizeY.value;

        width = value;
        height = value;

        init();
    }
}

function tableBuilder(matrix) {
    let fieldBlock = window.field;
    let fieldSize = matrix.length;

    let table = document.createElement("table");
    table.setAttribute("id", "table");

    let blockWidth = fieldBlock.clientWidth;
    table.width = blockWidth;

    for (let i = 0; i < height; i++) {
        let row = table.insertRow(-1);

        for (let j = 0; j < width; j++) {
            let cell = row.insertCell(-1);

            cell.dataset.mode = handleStates[matrix[i][j]];
            cell.dataset.row = i.toString();
            cell.dataset.column = j.toString();
            cell.height = (blockWidth / fieldSize).toString();
        }
    }

    table.addEventListener("click", changeCell);
    fieldBlock.appendChild(table);
}

function clearSolution() {
    if (finder == null) {
        return;
    }

    let solutionCells = document.querySelectorAll("td[data-mode='path']");
    let visitedCells = document.querySelectorAll("td[data-mode='checked']");

    solutionCells.forEach(cell => {cell.dataset.mode = "unchecked"});
    visitedCells.forEach(cell => {cell.dataset.mode = "unchecked"});
}

async function startFinder() {
    if (!await checkPoints()) {
        return;
    }
    clearSolution();

    window.log.textContent = "Алгоритм запущен";
    window.log_block.style.borderColor = "lightgreen";

    let select = document.getElementById('selectHeuristic');
    let value = select.options[select.selectedIndex].value;
    let heuristic;

    if (value === "Euclid") {
        heuristic = euclidHeuristic;
    } else {
        heuristic = manhattanHeuristic;
    }

    if (finder != null) {
        finder.running = false;
    }

    finder = new PathFinder(maze, heuristic, 1000 / speed);
    try {
        await renderPathLength(await finder.findPath(start, finish));
    }
    catch (e) {

    }
}
