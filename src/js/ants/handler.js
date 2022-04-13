window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAnts);
    window.fieldButtons.addEventListener("click", changeMode);
    window.locker.addEventListener("click", changeLock);
});

window.boost1.addEventListener("click", addBoost);
window.boost2.addEventListener("click", addBoost);
window.boost3.addEventListener("click", addBoost);

let unlock = false;

const EMPTY = -1, BORDER = -2, COLONY = -3;
let colony;
let viewStates;
let boostIndex;

function init() {
    viewStates = { 'colony': "Установка колонии", 'food': "Установка еды",
        'border': "Установка преград", 'clearBorder': "Очистка преград" };

    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    window.currentActionView.innerText = viewStates[currentState];
    initPopulationCanvas();
    fieldBuilder();
}

function addBoost(event) {
    let index = event.target.dataset.mode - 1
    if (colonyPoints.length > index) {
        boostIndex = index;
    }
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
    colonyPoints = [ ];
    fieldBuilder();
    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
}

function clearPoints(ants, simulation) {
    ants.forEach(ant => {
        drawPoint(Math.floor(ant.x), Math.floor(ant.y), "aliceblue", pointWidth, simulation);
    })
}

function drawAnts(ants, simulation) {
    ants.forEach(ant => {
        drawPoint(Math.floor(ant.x), Math.floor(ant.y), colonyColors[ant.colonyIndex], pointWidth, simulation);
    })
}

function getDensityColor(value) {
    let colorValue = value.toFixed(0);
    return rgbToHex(240 - colorValue, 248 - 4 * colorValue, 255 - 4 * colorValue);
}

function drawDensity(ants, field, simulation) {
    ants.forEach(ant => {
        let x = Math.floor(ant.x);
        let y = Math.floor(ant.y);
        let density = field[y][x].density;

        drawPoint(x, y, getDensityColor(density), pointWidth, simulation);
    });
}

function drawFullDensity(field, simulation) {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            let density = field[i][j].density;
            if (density === 0) {
                continue;
            }

            drawPoint(j, i, getDensityColor(density), 1, simulation);
        }
    }
}

function getGreenPheromoneColor(value) {
    let colorValue = value.toFixed(0);
    return rgbToHex( Math.floor(240 - colorValue / 40), 248,  Math.floor(255 - colorValue / 40));
}

function getRedPheromoneColor(value) {
    let colorValue = value.toFixed(0);
    return rgbToHex(240, Math.floor(248 - colorValue / 40), Math.floor(255 - colorValue / 40));
}

function drawPheromones(ants, simulation, red, green) {
    ants.forEach(ant => {
        let x = Math.floor(ant.x);
        let y = Math.floor(ant.y);

        let field = simulation.getColony(ant.colonyIndex).field;

        let greenPheromone = field[y][x].green;
        let redPheromone = field[y][x].red;

        if (red && redPheromone > 1) {
            drawPoint(x, y, getRedPheromoneColor(redPheromone), pointWidth, simulation);
        }

        if (green && greenPheromone > 1) {
            drawPoint(x + 1, y, getGreenPheromoneColor(greenPheromone), pointWidth, simulation);
        } else if (greenPheromone <= 1) {
            drawPoint(x, y, "aliceblue", pointWidth, simulation);
        }
    });
}

async function antsAlg(colony) {
    for (let i = 0; i < colony.ants.length; i++) {
        let ant = colony.ants[i];
        ant.move();
        if (ant instanceof Worker) {
            ant.checkPermanents();
            ant.sprayPheromones();
        } else {
            ant.fight();
        }
    }
}

async function startAnts() {
    if (!colonyPoints.length) {
        await showError("Отсутствует колония");
        return;
    }

    running = true;
    changeLog("Алгоритм запущен", "lightgreen");
    let colonies = [ ];

    let count = 0;
    colonyPoints.forEach(colonyPoint => {
        let colony = new Colony(field, count, +colonyPoint.x, +colonyPoint.y, colonySize, maxColonySize,
            speed, liberty, moveCooldown, 1000, visionDistance, visionAngle, visionAngleStep,
            initialPheromones, decayingPheromones);
        colonies.push(colony);

        count++;
    });

    let simulation = new AntsSimulation(field, WIDTH, HEIGHT, colonies, redDecay, greenDecay, densityDecay);

    colonies.forEach(colony => {
        colony.setAnts(simulation);
    });

    let epochs = 1000000;

    for (let epoch = 0; epoch < epochs; epoch++) {
        if (boostIndex != null) {
            colonies[boostIndex].boosted = true;
            boostIndex = undefined;
        }

        if (colonies.length > 1) {
            changePopulationCanvas(epoch, colonies[0].ants.length, colonies);
        } else {
            changePopulationCanvas(epoch, colonies[0].ants.length);
        }

        let ants = [ ];
        if (updatedPoints) {
            simulation.updateField(updatedPoints);
            updatedPoints = [ ];
        }

        for (let i = 0; i < colonies.length; i++) {
            if (colonies[i].boosted) {
                updateBoost(i, 1 - colonies[i].boostTimer.getRatio());
                if (colonies[i].boostTimer.tickAndCheck()) {
                    colonies[i].boosted = false;
                }
            }

            colonies[i] = simulation.updateColony(i);
            ants.push(...colonies[i].ants);

            simulation.update();
            await antsAlg(colonies[i]);
        }

        if (drawingAnts) {
            drawAnts(ants, simulation);
        }
        await sleep(1);
        if (drawingDensity || drawingRedPheromones || drawingGreenPheromones) {
            if (drawingDensity) {
                drawDensity(ants, simulation.field, simulation);
            } else {
                drawPheromones(ants, simulation, drawingRedPheromones, drawingGreenPheromones);
            }
        } else {
            clearPoints(ants, simulation);
        }
    }
}
