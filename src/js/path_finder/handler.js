window.addEventListener("load", () => {
    tableBuilder(maze)
    window.startButton.addEventListener("click", startFinder)
    window.pauseButton.addEventListener("click", pauseFinder)
    window.stopButton.addEventListener("click", stopFinder)

    window.startCellButton.addEventListener("click") // todo
    window.finishCellButton.addEventListener("click") // todo
    window.borderCellButton.addEventListener("click") // todo
})


let States = {0: "unchecked", 1: "border", 2: "start", 3: "end"}
let viewStates = {0: "Выбор преград", 1: "Выбор преград",
    2: "Выбор начальной точки", 3: "Выбор конечной точки"}

let currentState = States["2"]

let maze = [
        [0, 0, 1, 0, 1, 1],
        [1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1],
        [0, 1, 1, 0, 1, 0]
]

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

            cell.dataset.mode = States[matrix[i][j]]
            cell.dataset.row = i.toString();
            cell.dataset.column = j.toString();
            cell.height = (width / fieldSize).toString();
        }
    }

    fieldBlock.appendChild(table);
}

async function startFinder(startX, startY, finishX, finishY) {
    console.log(maze);

    let start = new Point(0, 0);
    let finish = new Point(3, 2);
    console.log(start, finish);

    //Вместо эвристики могут стоять разные функции, например manhattanHeuristic или euclidHeuristic
    let a = new PathFinder(maze, manhattanHeuristic);
    await a.findPath(start, finish);
}

function pauseFinder() {

}

function stopFinder() {

}
