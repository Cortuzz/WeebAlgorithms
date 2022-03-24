let running;
let field = [ ];
let foodValue = 50;
let currentState = 'colony';
let mouse = { x:0, y:0 };
let drawing = false;
let colonyPoint;
let updatedPoints = [ ];

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d');
const scale = 1;

colors = { 'colony': 'darkred', 'food': 'forestgreen', 'border': 'gray', 'clearBorder': 'aliceblue' };
links = { 'colony': COLONY, 'border': -2, 'empty': -1 };
//const EMPTY = -1, BORDER = -2, COLONY = -3;
ctx.lineWidth = 20;

window.changeFoodValue.addEventListener("input", e =>
{ foodValue = +e.target.value; /*window.populationView.textContent = colonySize;*/ });

function setMouseCoords(client, e) {
    mouse.x = Math.floor((e.clientX - client.left) / scale);
    mouse.y = Math.floor((e.clientY - client.top) / scale);
}

canvas.addEventListener('mousedown', function(e) {
    if (currentState === 'colony') {
        drawColony(e);
        return;
    }

    let ClientRect = this.getBoundingClientRect();
    setMouseCoords(ClientRect, e);

    drawing = true;
    if (currentState === 'food') {
        drawCircle(e, 10, undefined, getFoodColor());
        return;
    }
    drawCircle(e, 10, undefined, colors[currentState]);
    //ctx.beginPath();
    //ctx.moveTo(mouse.x, mouse.y);
});

canvas.addEventListener('mousemove', function(e) {
    if (!(drawing && currentState !== 'colony')) {
        return;
    }

    if (currentState === 'food') {
        let foodColor = getFoodColor();
        drawCircle(e, 10, undefined, foodColor);
        return;
    }

    drawCircle(e, 10, undefined, colors[currentState]);
});

canvas.addEventListener('mouseup', function(e) {
    drawing = false;

    if (currentState === 'colony') {
        return;
    } else if (currentState === 'food') {
        drawCircle(e, 10, undefined, getFoodColor());
        return;
    }

    drawCircle(e, 10, undefined, colors[currentState]);
});

function draw(e) {
    let ClientRect = canvas.getBoundingClientRect();
    setMouseCoords(ClientRect, e);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
}

function getFoodColor() {
    if (currentState !== 'food') {
        ctx.strokeStyle = colors[currentState];
        return;
    }

    let hexGreenValue = (2 * foodValue + 50).toString(16);
    return "#00" + hexGreenValue + "00";
}

function drawColony(e) {
    colonyPoint = drawCircle(e, 3, colors.colony);
}

function drawCircle(e, radius, arcColor, fillColor) {
    let ClientRect = canvas.getBoundingClientRect();

    setMouseCoords(ClientRect, e);

    ctx.strokeStyle = arcColor;
    ctx.fillStyle = fillColor;

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, radius, 2 * Math.PI, 0);

    if (fillColor) {
        ctx.fill();
    }
    if (arcColor) {
        ctx.stroke();
    }

    let x_ = mouse.x.toFixed(0);
    let y_ = mouse.y.toFixed(0);
    if (currentState === 'food') {
        setValue(+x_, +y_, radius, foodValue);
    } else if (currentState === 'colony') {
        setValue(+x_, +y_, radius + ctx.lineWidth / 2 + 1, COLONY);
    } else {
        setValue(+x_, +y_, radius, links[currentState]);
    }

    return { x: x_, y: y_ };
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
