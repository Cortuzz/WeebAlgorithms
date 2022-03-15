function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function createPoint(e) {
    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;
    points.push(new Point(x, y));
    drawCircle(x, y, 10, "gray");
}

function clear() {
    points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function selectColor(number) {
    const hue = number * 137.508;
    return `hsl(${hue},50%,75%)`;
}

function start() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let classNum = document.getElementById("classAmount").value;
    let colorMap = [];
    for (let i = 0; i < classNum; i++) {
        colorMap.push(`hsla(${i * 360 / classNum},${80}%,${50}%,${1})`);
    }

    let result = kMeans(classNum, points, 1000);
    means = result.means;
    points = result.points;
    for (let i = 0; i < points.length; i++) {
        drawCircle(points[i].x, points[i].y, 10, colorMap[points[i].class]);

    }
    for (let i = 0; i < means.length; i++) {
        drawCircle(means[i].x, means[i].y, 30, colorMap[i]);
    }
}


let clearButton = document.getElementById("clearButton")
let startButton = document.getElementById("startButton");
clearButton.addEventListener("click", clear);
startButton.addEventListener("click", start);
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let points = [];
let means = [];
canvas.addEventListener("mousedown", createPoint);
init();