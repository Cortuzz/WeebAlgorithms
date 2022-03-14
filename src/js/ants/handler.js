window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAnts);

    window.fieldButtons.addEventListener("click", changeMode);
});

const EMPTY = -1, BORDER = -2, COLONY = -3;
let colony;
let viewStates;

class Color {
    constructor(r, g, b, value) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.value = value;
    }
}

function init() {
    viewStates = {'colony': "Установка колонии", 'food': "Установка еды",
        'border': "Установка преград", 'clearBorder': "Очистка преград"};

    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, 1200, 600);
    ctx.fill();
    window.currentActionView.innerText = viewStates[currentState];
    fieldBuilder();
}

function fieldBuilder() {
    for (let i = 0; i < canvas.height; i++) {
        field[i] = new Array(canvas.width);
        for (let j = 0; j < canvas.width; j++) {
            field[i][j] = EMPTY;
        }
    }
}

function changeMode(event) {
    let action = event.target.dataset.mode;

    if (action == null) {
        return;
    }

    if (action === 'clear') {
        clearField();
        return;
    }

    currentState = action;
    window.currentActionView.innerText = viewStates[action];
}

function convertCanvasToMatrix(rawData, w, h) {
    let data = [ ];
    let border = new Color(128, 128, 128, BORDER);
    let colony = new Color(139, 0, 0, COLONY);
    let empty = new Color(240, 248, 255, EMPTY);

    let colors = [border, colony, empty];

    for (let i = 0; i < h; i++) {
        data[i] = [ ];
        for (let j = 0; j < 4 * w; j += 4) {
            let found = false;
            let pixelIndex = 4 * i * w + j;

            let pixel = {
                r: rawData[pixelIndex],
                g: rawData[pixelIndex + 1],
                b: rawData[pixelIndex + 2],
            };

            colors.forEach(color => {
                if (color.r === pixel.r && color.b === pixel.b && color.g === pixel.g) {
                    data[i][j / 4] = color.value;
                    found = true;
                }
            });

            if (!found && pixel.r === 0 && pixel.b === 0) {
                data[i][j / 4] = (parseInt(pixel.g) - 50) / 2;
            }
        }
    }

    return data;
}

function clearField() {

}

function drawAnt(x, y, color, w) {
    if (checkFood(x, y)) {
        return;
    }
    let t = ctx.fillStyle;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, w);
    ctx.fillStyle = t;
}

function checkFood(x, y) {
    return field[y][x] > 0;
}

async function antsAlg(simulation, colony) {
    for (let i = 0; i < colony.ants.length; i++) {
        let ant = colony.ants[i];
        let moves = simulation.getPossibleMoves(ant);

        if (ant.found) {
            simulation.sprayPheromones(moves[0].x, moves[0].y, ant.pheromones);
            ant.move(moves[0].x, moves[0].y);
        }

        let bestProb = 0;
        let bestMove;

        moves.forEach(move => {
            let prob = simulation.getMoveProbability(move.x, move.y, ant);
            if (prob > bestProb) {
                bestProb = prob;
                bestMove = move;
            }
        });

        ant.move(bestMove.x, bestMove.y);
        if (checkFood(bestMove.x, bestMove.y)) {
            ant.found = true;
        }

        let lastMoves = ant.getLastMoves();

        if (ant.found) {
            drawAnt(lastMoves.current.x, lastMoves.current.y, '#114411', 5, 5);
            continue;
        }
        drawAnt(lastMoves.current.x, lastMoves.current.y, '#964B00', 3, 3);

    }
    simulation.pheromoneTick();
    await sleep(1);

    for (let i = 0; i < colony.ants.length; i++) {
        let ant = colony.ants[i];
        let lastMoves = ant.getLastMoves();
        drawAnt(lastMoves.current.x, lastMoves.current.y, '#F0F8FF', 5, 5);
    }
}

async function startAnts() {
    let canvasData = ctx.getImageData(0, 0, 1200, 600);
    field = convertCanvasToMatrix(canvasData.data, canvasData.width, canvasData.height);

    let colony = new Colony(+colonyPoint.x, +colonyPoint.y,512);
    let simulation = new AntsSimulation(field, 1200, 600, 0.05, 0.1, colony);

    colony = simulation.colony;
    let epochs = 1000000;

    for (let epoch = 0; epoch < epochs; epoch++) {
        await antsAlg(simulation, colony);
    }
}
