let running;
let field = [ ];
let foodValue = 50;
let currentState = 'colony';
let mouse = { x:0, y:0 };
let drawing = false;
let colonyPoint;
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d');
const scale = 1;

colors = {'colony': 'darkred', 'food': 'forestgreen', 'border': 'gray', 'clearBorder': 'aliceblue'};
ctx.lineWidth = 20;

function setMouseCoords(client, e) {
    mouse.x = Math.floor((e.clientX - client.left) / scale);
    mouse.y = Math.floor((e.clientY - client.top) / scale);
}

canvas.addEventListener('mousedown', function(e) {
    if (running) {
        return;
    }

    if (checkColonyType()) {
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
    drawCircle(e, 10, undefined, colors.border);
    //ctx.beginPath();
    //ctx.moveTo(mouse.x, mouse.y);
});

canvas.addEventListener('mousemove', function(e) {
    if (!(drawing && !checkColonyType()) || running) {
        return;
    } else if (currentState === 'food') {
        drawCircle(e, 10, undefined, getFoodColor());
        return;
    }

    drawCircle(e, 10, undefined, colors.border);
});

canvas.addEventListener('mouseup', function(e) {
    drawing = false;
    if (running) {
        return;
    }

    if (checkColonyType()) {
        return;
    } else if (currentState === 'food') {
        drawCircle(e, 10, undefined, getFoodColor());
        return;
    }

    drawCircle(e, 10, undefined, colors.border);
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
    let strokeStyle = ctx.strokeStyle;
    let fillStyle = ctx.fillStyle;

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
    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = fillStyle;

    return { x: mouse.x.toFixed(0), y: mouse.y.toFixed(0) };
}

function checkBorderType() {
    return !(currentState !== 'border' && currentState !== 'clearBorder');
}

function checkColonyType() {
    return currentState === 'colony';
}
