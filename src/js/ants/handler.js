window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAnts);

    window.fieldButtons.addEventListener("click", changeMode);

    window.locker.addEventListener("click", changeLock);

    window.pathViewChecker.addEventListener("click", e => { renderFullPath = e.checked; })
});

const WIDTH = 900, HEIGHT = 600;
let defaultLog = "Алгоритм не запущен";
let defaultColor = "coral";

let renderFullPath = true;
let unlock = false;
let colonySize = 1000;

let speed = 3, moveCooldown = 5, liberty = 0.005;
let redDecay = 0.9, greenDecay = 0.9, densityDecay = 0.999;

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

    window.changePopulation.value = colonySize;
    window.populationView.textContent = colonySize;

    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    window.currentActionView.innerText = viewStates[currentState];
    fieldBuilder();
}

function changeLock(event) {
    let dangerParams = document.querySelectorAll(".dangerParam");
    let dangerParamsView = document.querySelectorAll(".dangerParamView");

    unlock = this.checked;
    if (unlock) {
        window.lockerView.innerText = "Параметры разблокированы";
        dangerParams.forEach(param => {
            param.disabled = false;
        })

        window.greedView.textContent = greed;
        window.gregariousnessView.textContent = gregariousness;
        window.speedView.textContent = speed;
        window.pheromoneDecayView.textContent = pheromoneMultiplier;
        window.redPheromoneDecayView.textContent = redPheromoneMultiplier;
        window.decayView.textContent = (100 * decay).toFixed(2) + '%';

    } else {
        window.lockerView.innerText = "Параметры заблокированы";
        dangerParams.forEach(param => {
            param.disabled = true;
        })

        dangerParamsView.forEach(paramView => {
            paramView.textContent = "Заблокировано";
        })
    }
}

function fieldBuilder() {
    for (let i = 0; i < canvas.height; i++) {
        field[i] = new Array(canvas.width);
        for (let j = 0; j < canvas.width; j++) {
            field[i][j] = { value: EMPTY, red: 1, green: 1, density: 0 };
        }
    }
}

async function changeMode(event) {
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

function clearField() {
    colonyPoint = undefined;
    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
}

function drawAnt(x, y, color, w, simulation) {
    if (simulation != null) {
        if (simulation.checkFood(x, y) || simulation.checkColony(x, y)) {
            return;
        }
    }

    let t = ctx.fillStyle;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, w);
    ctx.fillStyle = t;
}

function getGreenColor(value) {
    let colorValue = (value / 500).toFixed(0);
    return rgbToHex(240 - 4 * colorValue, 248 - colorValue, 255 - 4 * colorValue);
}

async function drawAnts(ants, field, simulation) {
    ants.forEach(ant => {
        drawAnt(Math.floor(ant.x), Math.floor(ant.y), "#000000", 1, simulation);

    })
    await sleep(1);
    for (let ant of ants) {
        let x = Math.floor(ant.x);
        let y = Math.floor(ant.y);
        let density = field[y][x].density;

        /*let red = field[y][x].red;
        let green = field[y][x].green;

        if (red === 0) {
            drawAnt(x, y, getGreenColor(green), 4, simulation);
            return;
        }

        //drawAnt(x, y, "red", 1, simulation);
        drawAnt(x, y, getGreenColor(green), 4, simulation);*/

        drawAnt(x, y, getDensityColor(density), 1, simulation);

        //drawAnt(Math.floor(ant.x), Math.floor(ant.y), "aliceblue", 1, simulation);
    }
}

function getDensityColor(value) {
    let colorValue = (value).toFixed(0);
    return rgbToHex(240 - colorValue, 248 - 4 * colorValue, 255 - 4 * colorValue);
}

async function drawPheromones(field, simulation) {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            let red = field[i][j].red;
            let green = field[i][j].green;

            if (green === 0) {
                drawAnt(j, i, "darkred", 1, simulation);
                return;
            }
            if (red === 0) {
                drawAnt(j, i, "green", 1, simulation);
                return;
            }

            drawAnt(j, i, "darkred", 1, simulation);
            drawAnt(j, i, "green", 1, simulation);
        }
    }

    await sleep(1);
}

async function drawDensity(field, simulation) {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            let density = field[i][j].density;
            if (density === 0) {
                continue;
            }

            drawAnt(j, i, getDensityColor(density), 1, simulation);
        }
    }

    await sleep(1);
}

async function antsAlg(simulation, colony) {
    for (let i = 0; i < colony.ants.length; i++) {
        let ant = colony.ants[i];
        ant.move();
        //await ant.drawRays();
        ant.sprayPheromones();
    }
    //await drawDensity(simulation.field);
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

    let colony = new Colony(+colonyPoint.x, +colonyPoint.y, 500, speed, liberty, moveCooldown);
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
