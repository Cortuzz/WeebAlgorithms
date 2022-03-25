window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAnts);
    window.fieldButtons.addEventListener("click", changeMode);
    window.locker.addEventListener("click", changeLock);
});

const WIDTH = 900, HEIGHT = 600;
let defaultLog = "Алгоритм не запущен";
let defaultColor = "coral";

let unlock = false;

const EMPTY = -1, BORDER = -2, COLONY = -3;
let colony;
let viewStates;

function init() {
    viewStates = { 'colony': "Установка колонии", 'food': "Установка еды",
        'border': "Установка преград", 'clearBorder': "Очистка преград" };

    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    window.currentActionView.innerText = viewStates[currentState];
    fieldBuilder();
}

function fieldBuilder() {
    for (let i = 0; i < canvas.height; i++) {
        field[i] = [ ];
        for (let j = 0; j < canvas.width; j++) {
            field[i][j] = { value: EMPTY, red: 1, green: 1, density: 0 };
        }
    }
}

async function changeMode(event) {
    let action = event.target.dataset.mode;

    if (action == null || action === 'clear') {
        action && clearField();
        return;
    }

    currentState = action;
    window.currentActionView.innerText = viewStates[action];
}

function clearField() {
    colonyPoint = undefined;
    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
}

function drawPoint(x, y, color, w, simulation) {
    if (simulation != null) {
        if (simulation.checkFood(x, y) || simulation.checkColony(x, y)) {
            return;
        }
    }

    drawRect(x, y, w, w, color);
}

async function drawAnts(ants, field, simulation) {
    ants.forEach(ant => {
        drawPoint(Math.floor(ant.x), Math.floor(ant.y), "#000000", 1, simulation);

    })
    await sleep(1);
    ants.forEach(ant => {
        let x = Math.floor(ant.x);
        let y = Math.floor(ant.y);
        let density = field[y][x].density;

        drawPoint(x, y, getDensityColor(density), 1, simulation);
    });
}

function getDensityColor(value) {
    let colorValue = value.toFixed(0);
    return rgbToHex(240 - colorValue, 248 - 4 * colorValue, 255 - 4 * colorValue);
}

async function drawDensity(field, simulation) {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            let density = field[i][j].density;
            if (density === 0) {
                continue;
            }

            drawPoint(j, i, getDensityColor(density), 1, simulation);
        }
    }

    await sleep(1);
}

async function antsAlg(simulation, colony) {
    for (let i = 0; i < colony.ants.length; i++) {
        let ant = colony.ants[i];
        ant.move();
        ant.sprayPheromones();
    }
    await sleep(1);

    await drawAnts(colony.ants, simulation.field, simulation);
}

function changeLog(text, color) {
    window.log.textContent = text;
    window.log_block.style.borderColor = color;
}

async function startAnts() {
    if (colonyPoint == null) {
        changeLog("Отсутствует колония", "B72626");
        await sleep(3000);

        if (window.log.textContent !== "Алгоритм запущен") {
            changeLog(defaultLog, defaultColor);
        }
        return;
    }

    running = true;
    changeLog("Алгоритм запущен", "lightgreen");

    let colony = new Colony(+colonyPoint.x, +colonyPoint.y, colonySize, maxColonySize,
        speed, liberty, moveCooldown, 1000, visionDistance, visionAngle, visionAngleStep);
    let simulation = new AntsSimulation(field, WIDTH, HEIGHT, colony, redDecay, greenDecay, densityDecay);

    colony.setAnts(simulation);
    let epochs = 1000000;

    await drawDensity(simulation.field);
    for (let epoch = 0; epoch < epochs; epoch++) {
        if (updatedPoints) {
            simulation.updateField(updatedPoints);
            updatedPoints = [ ];
        }

        colony = simulation.update();
        await antsAlg(simulation, colony);
    }
}
