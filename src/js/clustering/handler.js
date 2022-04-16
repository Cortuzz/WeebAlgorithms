function drawCircle(x, y, radius, color, angle) {
    if (angle === undefined) {
        angle = 2 * Math.PI;
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, angle, true);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function drawSlidingCircles(circles) {
    for (let i = 0; i < circles.length; i++) {
        drawCircle(circles[i].center.x, circles[i].center.y, 3, "hsla(12,90%,51%,0.47)");
        ctx.font = 'bold 36px serif';
        ctx.globalAlpha = 0.2;
        drawCircle(circles[i].center.x, circles[i].center.y, circles[i].radius, "hsla(8,72%,61%,0.47)");
        ctx.globalAlpha = 1;
    }
}

function createPoint(e) {
    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;
    points.push(new Point(x, y));
    drawCircle(x, y, 10, "gray");
}

function clear() {
    if (!running) {
        points = [];
        means = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function redrawInitial() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < points.length; i++) {
        drawCircle(points[i].x, points[i].y, 10, "gray");
    }
}

async function colorClasses(colorMap, alpha, angle) {
    ctx.globalAlpha = alpha;
    for (let i = 0; i < means.length; i++) {
        drawCircle(means[i].x, means[i].y, 22, colorMap[i]);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < points.length; i++) {
        drawCircle(points[i].x, points[i].y, 10, colorMap[points[i].class], angle);
    }
}

async function showError(text) {
    currentState.innerText = text;
    currentFrame.borderColor = "darkred";
    await sleep(3000);
    currentState.innerText = defaultText;
    currentFrame.borderColor = defaultFrameColor;
}

async function startKMC() {
    if (running === true) {
        return;
    }
    running = true;
    let classNum = document.getElementById("classAmount").value;
    if (points.length < classNum) {
        running = false;
        await showError("Точек меньше чем классов");
        return;
    }
    redrawInitial();
    let result = kMeans(classNum, points, 1000);
    means = result.means;
    points = result.points;
    let colorMap = [];
    for (let i = 0; i < classNum; i++) {
        colorMap.push(`hsl(${i * 360 / classNum},100%,60%)`);
    }
    await colorClasses(colorMap, 0.6, 2 * Math.PI);
    running = false;
}

async function startMSC() {
    if (running === true) {
        return;
    }
    running = true;

    if (points.length === 0) {
        running = false;
        await showError("Отсутствуют точки");
        return;
    }
    let radius = document.getElementById("radius").value;
    redrawInitial();
    let result = await meanShiftClustering(points, radius);
    redrawInitial();
    means = result.means;
    points = result.points;
    let classNum = means.length;
    let colorMap = [];
    for (let i = 0; i < classNum; i++) {
        colorMap.push(`hsl(${i * 360 / classNum},100%,40%)`);
    }
    await colorClasses(colorMap, 0.6, 2 * Math.PI);
    running = false;
}

async function startBoth() {
    if (running === true) {
        return;
    }
    running = true;
    let classNum = document.getElementById("classAmount").value;
    if (points.length < classNum) {
        running = false;
        await showError("Точек меньше чем классов");
        return;
    }
    redrawInitial();

    let radius = document.getElementById("radius").value;
    let result = await meanShiftClustering(points, radius);
    means = result.means;
    points = result.points;
    let colorMapMSC = [ ];
    for (let i = 0; i < means.length; i++) {
        colorMapMSC.push(`hsl(${i * 360 / means.length},80%,40%)`);
    }
    redrawInitial();
    await colorClasses(colorMapMSC, 0.67, 2 * Math.PI);
    result = kMeans(classNum, points, 999);
    means = result.means;
    points = result.points;
    let colorMapKMC = [ ];
    for (let i = 0; i < classNum; i++) {
        colorMapKMC.push(`hsl(${i * 360 / classNum},100%,60%)`);
    }
    await colorClasses(colorMapKMC, 0.15, Math.PI);
    running = false;
}

const defaultFrameColor = "coral";
const defaultText = "Алгоритм не запущен";
let currentFrame = document.getElementById("log_block").style;
const currentState = document.getElementById("log");
const clearButton = document.getElementById("clearButton");
const startKMeansButton = document.getElementById("startKMeans");
const startMeanShiftButton = document.getElementById("startMeanShift");
const startBothButton = document.getElementById("startBoth");
const scrollClasses = document.getElementById("classAmount");
const scrollRadius = document.getElementById("radius");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let points = [];
let means = [];
let running = false;
clearButton.addEventListener("click", clear);
startKMeansButton.addEventListener("click", startKMC);
startMeanShiftButton.addEventListener("click", startMSC);
startBothButton.addEventListener("click", startBoth);
canvas.addEventListener("mousedown", createPoint);
scrollClasses.addEventListener("input", () => document.getElementById("classAmountView").innerText = scrollClasses.value);
scrollRadius.addEventListener("input", () => document.getElementById("radiusView").innerText = scrollRadius.value);