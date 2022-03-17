window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAlg);
});

let running = false, stepRendering = false;
let epochs = 100000;
const WIDTH = 900, HEIGHT = 600;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.addEventListener("mousedown", changePoint);

let points = [ ];

let viewStates = { "add": "Добавление точек", "remove": "Удаление точек" };
let currentState = "add";

function init() {
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

function clearLines() {
    ctx.fillStyle = "aliceblue";
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();

    points.forEach(point => {
        drawCircle(point.x, point.y, 10, "gray");
    });
}

function updateScreen(lines) {
    clearLines();
    let colorLine = "#d7a029";
    ctx.lineWidth = 2;
    for (let i = 1; i < points.length; i++) {
        ctx.beginPath();
        ctx.moveTo(points[lines[i - 1]].x, points[lines[i - 1]].y);
        ctx.lineTo(points[lines[i]].x, points[lines[i]].y);
        ctx.strokeStyle = colorLine;
        ctx.stroke();
    }
    if (points.length !== 0)
    {
        ctx.beginPath();
        ctx.moveTo(points[lines[lines.length - 1]].x, points[lines[lines.length - 1]].y);
        ctx.lineTo(points[lines[lines.length - 2]].x, points[lines[lines.length - 2]].y);
        ctx.strokeStyle = colorLine;
        ctx.stroke();
    }
}

async function startAlg() {
    let alg = new AntFinder(points, undefined, 1, 3);

    for (let epoch = 0; epoch < epochs; epoch++) {
        alg.run();
        alg.sprayPheromones();
        alg.updatePheromones();

        let path = alg.getBestPath();
        updateScreen(path);

        await sleep(10);
    }
}
