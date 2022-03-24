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
    changeSetup();
    if (!checkBorderType()) {
        if (currentState === 'food') {
            drawRect(e);
            return;
        }
        drawCircle(e);
        return;
    }

    let ClientRect = this.getBoundingClientRect();
    setMouseCoords(ClientRect, e);

    drawing = true;
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
});

canvas.addEventListener('mousemove', function(e) {
    if (!(drawing && checkBorderType()) || running) {
        return;
    }

    draw(e);
});

canvas.addEventListener('mouseup', function(e) {
    if (running) {
        return;
    }
    changeSetup();
    if (!checkBorderType()) {
        return;
    }

    draw(e);
    ctx.closePath();
    drawing = false;
});

function draw(e) {
    let ClientRect = canvas.getBoundingClientRect();
    setMouseCoords(ClientRect, e);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
}

function changeSetup() {
    if (currentState !== 'food') {
        ctx.strokeStyle = colors[currentState];
        return;
    }

    let hexGreenValue = (2 * foodValue + 50).toString(16);
    ctx.fillStyle = "#00" + hexGreenValue + "00";
}

function drawCircle(e) {
    let ClientRect = canvas.getBoundingClientRect();
    setMouseCoords(ClientRect, e);

    colonyPoint = {x: mouse.x.toFixed(0), y: mouse.y.toFixed(0)};

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 3, 2 * Math.PI, 0);
    ctx.stroke();
}

function drawRect(e) {
    let ClientRect = canvas.getBoundingClientRect();
    setMouseCoords(ClientRect, e);

    ctx.fillRect(mouse.x, mouse.y, 30, 30);
}

function checkBorderType() {
    return !(currentState !== 'border' && currentState !== 'clearBorder');
}
