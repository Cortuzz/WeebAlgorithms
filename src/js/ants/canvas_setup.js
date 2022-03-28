let running;
let field = [ ];
let foodValue = 50;
let currentState = 'colony';
let mouse = { x: 0, y: 0 };
let drawing = false;
let colonyPoints = [ ];
let updatedPoints = [ ];

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d');
const scale = 1;
const pointWidth = 1;

colonyColors = { 0: "black", 1: "darkred", 2: "yellow", 3: "darkblue" };
const maxColonyCounts = 4;
colors = { 'colony': 'darkred', 'food': 'forestgreen', 'border': 'gray', 'clearBorder': 'aliceblue' };
links = { 'colony': COLONY, 'border': BORDER, 'empty': EMPTY };
ctx.lineWidth = 20;

window.changeFoodValue.addEventListener("input", e =>
{ foodValue = +e.target.value; window.foodValueView.textContent = foodValue + "%"; });

function setMouseCoords(client, e) {
    mouse.x = Math.floor((e.clientX - client.left) / scale);
    mouse.y = Math.floor((e.clientY - client.top) / scale);
}

canvas.addEventListener('mousedown', async function(e) {
    if (currentState === 'colony') {
        await drawColony(e);
        return;
    }

    let ClientRect = this.getBoundingClientRect();
    setMouseCoords(ClientRect, e);

    drawing = true;
    if (currentState === 'food') {
        draw(e, 10, undefined, getFoodColor());
        return;
    }
    draw(e, 10, undefined, colors[currentState]);
});

canvas.addEventListener('mousemove', function(e) {
    if (!(drawing && currentState !== 'colony')) {
        return;
    }

    if (currentState === 'food') {
        let foodColor = getFoodColor();
        draw(e, 10, undefined, foodColor);
        return;
    }

    draw(e, 10, undefined, colors[currentState]);
});

canvas.addEventListener('mouseup', function(e) {
    drawing = false;

    if (currentState === 'colony') {
        return;
    } else if (currentState === 'food') {
        draw(e, 10, undefined, getFoodColor());
        return;
    }

    draw(e, 10, undefined, colors[currentState]);
});

function getFoodColor() {
    if (currentState !== 'food') {
        ctx.strokeStyle = colors[currentState];
        return;
    }

    return rgbToHex(0, 2 * foodValue + 50, 0);
}

async function drawColony(e) {
    if (colonyPoints.length >= maxColonyCounts) {
        await showError("Нельзя размещать более 4 колоний")
        return;
    }
    colonyPoints.push(draw(e, 3, colonyColors[colonyPoints.length]));
}

function draw(e, radius, arcColor, fillColor) {
    let ClientRect = canvas.getBoundingClientRect();

    setMouseCoords(ClientRect, e);
    drawCircle(mouse.x, mouse.y, radius, arcColor, fillColor);

    let x_ = mouse.x.toFixed(0);
    let y_ = mouse.y.toFixed(0);
    if (currentState === 'food') {
        setValue(+x_, +y_, radius, foodValue);
    } else if (currentState === 'colony') {
        setValue(+x_, +y_, radius + ctx.lineWidth / 2 + 1, COLONY - colonyPoints.length);
    } else {
        setValue(+x_, +y_, radius, links[currentState]);
    }

    return { x: x_, y: y_ };
}

function drawCircle(x, y, radius, arcColor, fillColor) {
    ctx.strokeStyle = arcColor;
    ctx.fillStyle = fillColor;

    ctx.beginPath();
    ctx.arc(x, y, radius, 2 * Math.PI, 0);

    if (fillColor) {
        ctx.fill();
    }
    if (arcColor) {
        ctx.stroke();
    }
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function setValue(x, y, radius, value_) {
    for (let i = y - radius; i < y + radius; i++) {
        for (let j = x - radius; j < x + radius; j++) {
            if ((y - i) ** 2 + (x - j) ** 2 < radius ** 2) {
                try {
                    field[i][j] = { value: value_, red: 1, green: 1, density: 0 };
                    if (running) {
                        updatedPoints.push( { value: value_, x: j, y: i } );
                    }
                }
                catch (e) { }
            }
        }
    }
}

function drawPoint(x, y, color, w, simulation) {
    if (simulation != null) {
        if (simulation.checkFood(x, y) || field[y][x].value <= COLONY) {
            return;
        }
    }

    drawRect(x, y, w, w, color);
}