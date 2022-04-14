window.addEventListener("load", () => {
    init();
    window.startButton.addEventListener("click", startAlg);
    window.randomizeButton.addEventListener("click", setupRandomPoints);
    window.clearButton.addEventListener("click", clearScreen);
    window.autoSizingChecker.addEventListener("click", checkSizing);
});

let cities = [ ];
let tempAdd = [ ];
let tempRemove = [ ];

canvas.addEventListener("click", changePoint);

function init() {
    window.changeSpeedInput.value = renderSpeed;
    window.changeTotalCitiesInput.value = renderTotalCities;
    window.changePopulationSizeInput.value = renderPopulation;
    window.changeAutoPopulationSizeInput.value = renderCoefficientPopulation;
    window.changeMutationInput.value = renderMutation;
    window.changeGenerationSizeInput.value = renderGeneration;
    ctx.beginPath();
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.rect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
}

function checkSizing() {
    autoSize = window.autoSizingChecker.checked;
    window.changePopulationSizeInput.disabled = autoSize;
    window.changeAutoPopulationSizeInput.disabled = !autoSize;

    if (!autoSize) {
        window.populationSizeView.textContent = `${renderPopulation}`;
        window.autoPopulationSizeView.textContent = "Ручной режим";
    } else {
        window.populationSizeView.textContent = "Автоматически";
        window.autoPopulationSizeView.textContent = `${renderCoefficientPopulation}`;
    }
}

function setupRandomPoints() {
    if (running) {
        return;
    }

    cities.splice(0);
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

    window.cities_number.textContent = `${cities.length}`;
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

    window.cities_number.textContent = `${cities.length}`;
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

    drawCircle(x, y, 10, CIRCLE_COLOR);

    if (running) {
        tempAdd.push(point);
        running = false;
    } else {
        cities.push(point);
    }
}

function drawPoints() {
    cities.forEach(city => {
        drawCircle(city.x, city.y, 10, CIRCLE_COLOR);
    });
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

    if (index === -1) {
        return;
    }
    point.index = index;

    if (running) {
        tempRemove.push(point);
        running = false;
    } else {
        cities.splice(index, 1);
        renewCanvas();
        drawPoints();
    }
}

function drawLine(x1, y1, x2, y2, width, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawLines(order, width, color) {
    for (let i = 0; i < cities.length - 1; i++) {
        drawLine(cities[order[i]].x, cities[order[i]].y,
            cities[order[i + 1]].x, cities[order[i + 1]].y, width, color);
    }
    drawLine(cities[order[order.length - 1]].x, cities[order[order.length - 1]].y,
        cities[order[0]].x, cities[order[0]].y, width, color);
}

async function startAlg() {
    if (cities.length <= 1) {
        window.log.textContent = "Должно быть не меньше 2 точек";
        window.log_block.style.borderColor = "darkred";
        await sleep(1000);
        window.log.textContent = DEFAULT_LOG_TEXT;
        window.log_block.style.borderColor = DEFAULT_LOG_COLOR;
    } else if (!running) {
        running = true;
        window.log.textContent = "Алгоритм запущен";
        window.num_iteratin.textContent = "1";
        window.log_block.style.borderColor = "lightgreen";
        await geneticAlg();
    }
}

function clearScreen() {
    if (running) {
        running = false;
        return;
    }
    cities.splice(0);
    renewCanvas();
    window.log.textContent = DEFAULT_LOG_TEXT;
    window.log_block.style.borderColor = DEFAULT_LOG_COLOR;
    window.num_iteratin.textContent = "";
    window.best_path.textContent = "";
    window.cities_number.textContent = cities.length;
    window.best_number.textContent = "";
}
