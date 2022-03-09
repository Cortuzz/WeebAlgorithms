window.addEventListener("load", () => {
    init()
    window.startButton.addEventListener("click", startFinder);
    window.pauseButton.addEventListener("click", pauseFinder);
    window.stopButton.addEventListener("click", stopFinder);

    window.cellButtons.addEventListener("click", changeCellMode);

    window.fieldSizeX.addEventListener("input", changeSizeX);
    window.fieldSizeY.addEventListener("input", changeSizeY);
    window.retainer.addEventListener("input", changeFix);
})

let fixing = false;
let maze;
let start, finish;
let currentState = 'start', handleStates, viewStates;

function init(width = 15, height = 15) {
    maze = [];
    viewStates = {'border': "Выбор преград", 'start': "Выбор начальной точки", 'finish': "Выбор конечной точки"};
    handleStates = {2: 'start', 3: 'finish', 1: 'border', 0: 'unchecked'};

    window.currentActionView.innerText = viewStates[currentState];
    dropTable();
    matrixBuilder(width, height);
    changeDimensionView(width, height);
    tableBuilder(maze, width, height);
}

function dropTable() {
    let table = document.getElementById("table");

    if (table != null) {
        table.parentNode.removeChild(table);
    }
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

    if (action == null) {
        return;
    }

    currentState = action
    window.currentActionView.innerText = viewStates[action];
}

function changeDimensionView(sizeX, sizeY) {
    window.fieldWidthView.textContent = sizeX;
    window.fieldHeightView.textContent = sizeY;

    window.fieldSizeView.textContent = parseInt(sizeX) * parseInt(sizeY) + " ячеек";
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

function changeSizeX(event) {
    let sizeX = event.target.value;
    let sizeY = window.fieldSizeY.value;

    if (fixing) {
        init(sizeX, +sizeX);
        window.fieldSizeY.value = window.fieldSizeX.value;
        return;
    }

    init(sizeX, sizeY);
}

function changeSizeY(event) {
    let sizeX = window.fieldSizeX.value;
    let sizeY = event.target.value;

    if (fixing) {
        init(+sizeY, sizeY);
        window.fieldSizeX.value = window.fieldSizeY.value;
        return;
    }

    init(sizeX, sizeY);
}

function changeFix() {
    fixing = this.checked;

    if (fixing) {
        window.fieldSizeY.value = window.fieldSizeX.value;
        let value = window.fieldSizeY.value;

        init(value, value);
    }
}

function tableBuilder(matrix, width, height) {
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

            cell.dataset.mode = handleStates[matrix[i][j]]
            cell.dataset.row = i.toString();
            cell.dataset.column = j.toString();
            cell.height = (blockWidth / fieldSize).toString();
        }
    }

    table.addEventListener("click", changeCell);
    fieldBlock.appendChild(table);
}

async function startFinder() {
    let select = document.getElementById('selectHeuristic');
    let value = select.options[select.selectedIndex].value;
    let a;
    if (value === "Euclid") {
        a = new PathFinder(maze, euclidHeuristic);
    } else {
        a = new PathFinder(maze, manhattanHeuristic);
    }
    await a.findPath(start, finish);
}

function pauseFinder() {

}

function stopFinder() {

}
