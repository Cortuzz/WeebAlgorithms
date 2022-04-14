window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAlg);
    window.addPointButton.addEventListener("click", function () {
        currentState = "add";
        window.currentActionView.textContent = "Добавление точек";
    });
    window.removePointButton.addEventListener("click", function () {
        currentState = "remove";
        window.currentActionView.textContent = "Удаление точек";
    });
    window.randomizeButton.addEventListener("click", setupRandomPoints);
    window.clearButton.addEventListener("click", clearScreen);
    window.changeTotalCitiesInput.addEventListener("input", e =>
    { renderTotalCities = +e.target.value; window.totalCitiesView.textContent = renderTotalCities; });
    window.changeSpeedInput.addEventListener("input", e =>
    { renderSpeed = +e.target.value; window.speedView.textContent = renderSpeed; });
    window.bestViewChecker.addEventListener("click", e => { bestView = window.bestViewChecker.checked; });
});

const WIDTH = document.getElementById("canv").offsetWidth;
const HEIGHT = document.getElementById("canv").offsetHeight;

const BACKGROUND_COLOR = "aliceblue";
const CIRCLE_COLOR = "gray";
const LINE_COLOR = "#d5a527";
const DEFAULT_LOG_COLOR = "coral";
const DEFAULT_LOG_TEXT = "Алгоритм не запущен";

const canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx = canvas.getContext('2d');

let cities = [];

let currentState = "";
let renderTotalCities = 10;
let renderSpeed = 1;
let bestView = true;
let running = false;

canvas.addEventListener("click", changePoint);

function init() {
    window.changeSpeedInput.value = renderSpeed;
    ctx.beginPath();
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
}

function setupRandomPoints() {
    cities.splice(0, cities.length - 1);
    renewCanvas();

    for (let i = 0; i < renderTotalCities; i++) {
        let point = {
            x: Math.random()  * (canvas.width - 10 - 10) + 10,
            y: Math.random()  * (canvas.height - 10 - 10) + 10
        };

        while (checkPoint(point, cities)) {
            point = {
                x: Math.random()  * (canvas.width - 10 - 10) + 10,
                y: Math.random()  * (canvas.height - 10 - 10) + 10
            };
        }

        cities.push(point);
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
    } else if (currentState === "remove") {
        removePoint(e);
    }
}

function checkPoint(checkingPoint, set) {
    for (let i = 0; i < set.length; i++) {
        if (checkingPoint.x <= set[i].x + 20 && checkingPoint.x >= set[i].x - 20
            && checkingPoint.y <= set[i].y + 20 && checkingPoint.y >= set[i].y - 20) {
            return true;
        }
    }
    return false;
}

function getIndexOfPoint(checkingPoint, set) {
    let index = -1;
    for (let i = 0; i < set.length; i++) {
        if (checkingPoint.x <= set[i].x + 10 && checkingPoint.x >= set[i].x - 10
            && checkingPoint.y <= set[i].y + 10 && checkingPoint.y >= set[i].y - 10) {
            index = i;
        }
    }
    return index;
}

function createPoint(e) {
    let x = e.clientX - canvas.offsetLeft;
    let y = e.clientY - canvas.offsetTop;
    let point = { x: x, y: y };

    if (checkPoint(point, cities)) {
        return;
    }

    if (!running) {
        drawCircle(x, y, 10, CIRCLE_COLOR);
        cities.push(point);
    }
}

function drawPoints() {
    for (let city of cities) {
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
    let index = getIndexOfPoint(point, cities);

    if (!running && index !== -1) {
        cities.splice(index, 1);
        renewCanvas();
        drawPoints();
    }
}

function drawLine(x1, y1, x2, y2, width) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.strokeStyle = LINE_COLOR;
    ctx.stroke();
}

function drawLines(order, width) {
    for (let i = 0; i < cities.length - 1; i++) {
        drawLine(cities[order[i]].x, cities[order[i]].y, cities[order[i + 1]].x, cities[order[i + 1]].y, width);
    }

    drawLine(cities[order[order.length - 1]].x, cities[order[order.length - 1]].y, cities[order[0]].x, cities[order[0]].y, width);
}

async function startAlg() {
    if (cities.length <= 1) {
        window.log.textContent = "Должно быть не меньше 2 точек";
        window.log_block.style.borderColor = "darkred";
        await sleep(1000);
        window.log.textContent = DEFAULT_LOG_TEXT;
        window.log_block.style.borderColor = DEFAULT_LOG_COLOR;
    }
    else if (!running) {
        running = true;
        currentState = "";
        window.log.textContent = "Алгоритм запущен";
        window.log_block.style.borderColor = "lightgreen";
        await geneticAlg();
    }
}

function clearScreen() {
    window.log.textContent = DEFAULT_LOG_TEXT;
    window.log_block.style.borderColor = DEFAULT_LOG_COLOR;
    renewCanvas();
    cities.splice(0, cities.length);
    currentState = "";
    running = false;
}
