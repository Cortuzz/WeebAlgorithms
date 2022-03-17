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
        drawCircle(points[i].x, points[i].y, 10, "gray")
    }
}

function colorClasses(colorMap) {
    for (let i = 0; i < means.length; i++) {
        drawCircle(means[i].x, means[i].y, 20, colorMap[i]);
    }
    for (let i = 0; i < points.length; i++) {
        drawCircle(points[i].x, points[i].y, 10, colorMap[points[i].class]);
    }
}

function colorBoth(colorMapKMC, colorMapMSC, pointsMSC, meansMSC, classes) {
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < meansMSC.length; i++) {
        drawCircle(meansMSC[i].x, meansMSC[i].y, 20, colorMapMSC[i]);
    }
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < means.length; i++) {
        drawCircle(means[i].x, means[i].y, 15, colorMapKMC[i]);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < points.length; i++) {
        drawCircle(points[i].x, points[i].y, 10, colorMapKMC[classes[i]]);
    }
    for (let i = 0; i < pointsMSC.length; i++) {
        drawCircle(pointsMSC[i].x, pointsMSC[i].y, 10, colorMapMSC[pointsMSC[i].class], Math.PI);
    }
}

async function showError(text) {
    currentState.innerText = text;
    currentFrame.borderColor = "rgb(236,22,22)";
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
    colorClasses(colorMap);
    running = false;
}

async function startMSC() {
    if (running === true) {
        return;
    }
    running = true;

    if (points.length === 0) {
        running = false;
        await showError("Точек меньше чем 1");
        return;
    }
    let radius = document.getElementById("radius").value;
    let c = (100 - document.getElementById("const").value) * 1e-5;
    redrawInitial();
    let result = await meanShiftClustering(points, c, radius);
    redrawInitial();
    means = result.means;
    points = result.points;
    let classNum = means.length;
    let colorMap = [];
    for (let i = 0; i < classNum; i++) {
        colorMap.push(`hsl(${i * 360 / classNum},100%,40%)`);
    }
    colorClasses(colorMap);
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
    let result = kMeans(classNum, points, 999);
    means = result.means;
    points = result.points;
    let classes = [];
    for (let i = 0; i < points.length; i++) {
        classes.push(points[i].class);
    }
    let colorMapKMC = [];
    for (let i = 0; i < classNum; i++) {
        colorMapKMC.push(`hsl(${i * 360 / classNum},100%,60%)`);
    }
    let radius = document.getElementById("radius").value;
    let c = document.getElementById("const").value * 1e-5;
    result = await meanShiftClustering(points, c, radius);
    let meansMSC = result.means;
    let pointsMSC = result.points;
    let classNumMSC = meansMSC.length;
    let colorMapMSC = [];
    for (let i = 0; i < classNumMSC; i++) {
        colorMapMSC.push(`hsl(${i * 360 / classNumMSC},80%,40%)`);
    }
    redrawInitial();
    colorBoth(colorMapKMC, colorMapMSC, pointsMSC, meansMSC, classes);
    running = false;
}

const defaultFrameColor = "coral";
const defaultText = "Алгоритм не запущен";
let currentFrame = document.getElementById("log_block").style;
let currentState = document.getElementById("log");
let clearButton = document.getElementById("clearButton");
let startKMeansButton = document.getElementById("startKMeans");
let startMeanShiftButton = document.getElementById("startMeanShift");
let startBothButton = document.getElementById("startBoth");
let scrollClasses = document.getElementById("classAmount");
let scrollRadius = document.getElementById("radius");
let scrollConst = document.getElementById("const");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
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
scrollConst.addEventListener("input", () => document.getElementById("constView").innerText = scrollConst.value);