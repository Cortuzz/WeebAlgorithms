window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAlg);
    window.addPointButton.addEventListener("click", function () {
        currentState = "add";
    });
    window.removePointButton.addEventListener("click", function () {
        currentState = "remove";
    });
    window.randomizeButton.addEventListener("click", setupRandomPoints);
    window.clearButton.addEventListener("click", clearScreen);
    window.changeSpeedInput.addEventListener("input", e =>
    { renderSpeed = +e.target.value; window.speedView.textContent = renderSpeed; });
});

const WIDTH = document.getElementById("canv").offsetWidth;
const HEIGHT = document.getElementById("canv").offsetHeight;
const BACKGROUND_COLOR = "aliceblue";
const CIRCLE_COLOR = "gray";
const LINE_COLOR = "#d5a527"

const canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx = canvas.getContext('2d');

let cities = [];

let currentState = "";
let renderSpeed = 1;
let totalCities = 10;

canvas.addEventListener("mousedown", changePoint);

function init() {
    //window.changeSpeedInput.value = renderSpeed;

    ctx.beginPath();
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    //window.currentActionView.innerText = viewStates[currentState];
}

function setupRandomPoints() {
    cities.splice(0, cities.length - 1);
    renewCanvas();

    for (let i = 0; i < totalCities; i++) {
        let v = {
            x: Math.random()  * (canvas.width - 10 - 10) + 10,
            y: Math.random()  * (canvas.height - 10 - 10) + 10
        };

        cities.push(v);
    }

    drawPoints();
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
    else if (currentState === "remove") {
        removePoint(e);
    }
}

function checkPoint(checkingPoint, set) {
    let index = -1;
    for (let i = 0; i < set.length; i++) {
        if (checkingPoint.x <= set[i].x + 5 && checkingPoint.x >= set[i].x - 5
            && checkingPoint.x <= set[i].x + 5 && checkingPoint.x >= set[i].x - 5) {
            index = i;
        }
    }
    return index;
}

function createPoint(e) {
    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;
    let point = { x: x, y: y };

    // if (checkPoint(point, points) || checkPoint(point, newPoints)) {
    //     return;
    // }

    drawCircle(x, y, 10, CIRCLE_COLOR);

    cities.push(point);
}

function drawPoints() {
    for (city of cities) {
        drawCircle(city.x, city.y, 10, CIRCLE_COLOR);
    }
}

function renewCanvas() {
    ctx.beginPath();
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
}

function removePoint(e) {
    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;
    let point = { x: x, y: y };
    let index = checkPoint(point, cities);

    if (index != -1) {
        cities.splice(index, 1);
        renewCanvas();
        drawPoints();
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = LINE_COLOR;
    ctx.stroke();
}

function startAlg() {
    window.log.textContent = "Алгоритм запущен";
    window.log_block.style.borderColor = "lightgreen";
    geneticAlg();
}

function clearScreen() {
    window.log.textContent = "Алгоритм не запущен";
    window.log_block.style.borderColor = "coral";
    renewCanvas();
    cities.splice(0, cities.length);
    currentState = "";
}
