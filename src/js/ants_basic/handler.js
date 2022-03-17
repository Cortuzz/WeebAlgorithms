window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAlg);
    window.stepViewChecker.addEventListener("click", e => {
        stepView = window.stepViewChecker.checked;
        window.bestViewChecker.disabled = !window.bestViewChecker.disabled;
        if (!stepView && !bestView) {
            bestView = true;
            window.bestViewChecker.checked = 1;
        }
    });
    window.bestViewChecker.addEventListener("click", e => { bestView = window.bestViewChecker.checked; });
    window.pheromoneViewChecker.addEventListener("click", e => { pheromoneView = window.pheromoneViewChecker.checked; });

    window.locker.addEventListener("click", changeLock);
});

let running = false;
let stepView = true, bestView = true, pheromoneView = false;

let epochs = 100000, infinityEpochs = false;
const WIDTH = 900, HEIGHT = 600;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.addEventListener("mousedown", changePoint);

let points = [ ];

let viewStates = { "add": "Добавление точек", "remove": "Удаление точек" };
let currentState = "add";

function init() {
    window.changeSize.value = colonySize;
    window.changeSizeMultiplier.value = colonySizeMultiplier;
    window.changeGreed.value = greed;
    window.changeGregariousness.value = gregariousness;
    window.changeDecay.value = decay;
    window.changeSpray.value = spray;
    window.changeAttractionMultiplier.value = attractionMultiplier;

    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    window.currentActionView.innerText = viewStates[currentState];
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function changePoint(e) {
    if (currentState === "add") {
        createPoint(e);
    }
}

function createPoint(e) {
    if (!running) {
        let x = e.clientX - canvas.offsetLeft;
        let y = e.clientY - canvas.offsetTop;
        points.push({ x: x, y: y });
        drawCircle(x, y, 10, "gray");
    }
}

function clearScreen() {
    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
}

function drawPoints() {
    points.forEach(point => {
        drawCircle(point.x, point.y, 10, "gray");
    });
}

function updateScreen(lines, edges, colorRatio, renderPheromones) {
    let colorLine = "#d5a527";

    ctx.lineWidth = 2;
    for (let i = 1; i < points.length; i++) {
        if ((colorRatio > 50 || colorRatio == null)) {
            if (colorRatio == null && renderPheromones) {
                let colorValue = +(255 * sigmoid(edges[i][i - 1].pheromones / 10)).toFixed(0);
                colorLine = rgbToHex(205 - colorValue, colorValue, 50);
            } else if (renderPheromones) {
                colorLine = rgbToHex(205 - colorRatio, colorRatio, 50);
            }

            ctx.beginPath();
            ctx.moveTo(points[lines[i - 1]].x, points[lines[i - 1]].y);
            ctx.lineTo(points[lines[i]].x, points[lines[i]].y);
            ctx.strokeStyle = colorLine;
            ctx.stroke();
        }

    }
    if (points.length !== 0)
    {
        ctx.beginPath();
        ctx.moveTo(points[lines[lines.length - 1]].x, points[lines[lines.length - 1]].y);
        ctx.lineTo(points[lines[lines.length - 2]].x, points[lines[lines.length - 2]].y);
        ctx.strokeStyle = colorLine;
        ctx.stroke();
    }
    drawPoints();
}

function getColorRatio(ant1, ant2) {
    return +(255 * (ant1 / ant2) ** 8).toFixed(0);
}

async function startAlg() {
    console.log(colonySize);
    let alg = new AntFinder(points, colonySize, colonySizeMultiplier, greed,
        gregariousness, spray, decay, attractionMultiplier);
    let ants = [ ];

    for (let epoch = 0; epoch < epochs;) {
        clearScreen();
        alg.ants = [ ];
        for (let i = 0; i < alg.size; i++) {
            let ant = alg.run();

            if (stepView) {
                let path = ant.path;
                let colorRatio = getColorRatio(alg.getBestDistance(), ant.distance);
                let bestPath = alg.getBestPath();
                let edges = alg.getEdges();
                if (bestView) {
                    updateScreen(bestPath, edges, undefined, pheromoneView);
                } else {
                    updateScreen(path, edges, colorRatio, pheromoneView);
                }
                await sleep(0.0001);
            } else if (!bestView) {
                ants.push({ path: ant.path, distance: ant.distance });
            }
        }

        if (!stepView) {
            let bestPath = alg.getBestPath();
            let edges = alg.getEdges();

            if (bestView) {
                updateScreen(bestPath, edges, undefined, pheromoneView);
            }
            // While working very slowly, it's necessary to remove the frequent function call
            /*
            else {
                let bestDistance = alg.getBestDistance();
                ants.forEach(ant => {
                    let colorRatio = getColorRatio(bestDistance, ant.distance);
                    updateScreen(ant.path, edges, colorRatio, pheromoneView);
                });
            }
            */

            await sleep(10);
        }

        alg.updatePheromones();
        if (!infinityEpochs) {
            epochs++;
        }
    }
}
