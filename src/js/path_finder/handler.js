window.addEventListener("load", () => {
    init()
    window.startButton.addEventListener("click", startFinder);
    window.pauseButton.addEventListener("click", pauseFinder);
    window.stopButton.addEventListener("click", stopFinder);

    window.cellButtons.addEventListener("click", changeCellMode);
})

let maze;
let start, finish;
let currentState, handleStates, viewStates;

function init() {
    maze = [ ]
    viewStates = {'border': "Выбор преград", 'start': "Выбор начальной точки", 'finish': "Выбор конечной точки"}
    handleStates = {2: 'start', 3: 'finish', 1: 'border', 0: 'unchecked'}
    currentState = 'start'

    window.currentActionView.innerText = viewStates[currentState];
    matrixBuilder(10, 10);
    tableBuilder(maze)
}

function matrixBuilder(width, height) {
    for (let i = 0; i < height; i++) {
        maze[i] = new Array(width);
        for (let j = 0; j < width; j++) {
            maze[i][j] = 0;
        }
    }
}

function changeCellMode(event) {
    let action = event.target.dataset.mode;

    currentState = action
    window.currentActionView.innerText = viewStates[action];
}

function changeCell(event) {
    let dataset = event.target.dataset
    switch (currentState) {
        case "border":
            if (dataset.mode === "border") {
                maze[dataset.row][dataset.column] = 0;
                event.target.dataset.mode = "unchecked";
                return;
            }

            event.target.dataset.mode = "border";
            maze[dataset.row][dataset.column] = 1;
            break;

        case "start":
            let prevCellStart = document.querySelector("td[data-mode='start']");
            if (prevCellStart != null) {
                prevCellStart.dataset.mode = 'unchecked';
            }

            event.target.dataset.mode = "start";
            maze[dataset.row][dataset.column] = 0;
            start = new Point(parseInt(dataset.row), parseInt(dataset.column));
            break;

        case "finish":
            let prevCellFinish = document.querySelector("td[data-mode='finish']");
            if (prevCellFinish != null) {
                prevCellFinish.dataset.mode = 'unchecked';
            }

            event.target.dataset.mode = "finish";
            maze[dataset.row][dataset.column] = 0;
            finish = new Point(parseInt(dataset.row), parseInt(dataset.column));
            break;
    }
}


function tableBuilder(matrix) {
    let fieldBlock = window.field;
    let fieldSize = matrix.length;

    let table = document.createElement("table");
    let width = fieldBlock.clientWidth;
    table.width = width;

    for (let i = 0; i < fieldSize; i++) {
        let row = table.insertRow(-1);

        for (let j = 0; j < fieldSize; j++) {
            let cell = row.insertCell(-1);

            cell.dataset.mode = handleStates[matrix[i][j]]
            cell.dataset.row = i.toString();
            cell.dataset.column = j.toString();
            cell.height = (width / fieldSize).toString();
        }
    }

    table.addEventListener("click", changeCell);
    fieldBlock.appendChild(table);
}

async function startFinder() {
    let a = new PathFinder(maze, manhattanHeuristic);
    await a.findPath(start, finish);
}

function pauseFinder() {

}

function stopFinder() {

}
