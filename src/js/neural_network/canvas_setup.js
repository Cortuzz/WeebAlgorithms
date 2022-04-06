let mouse = {x: 0, y: 0};
let drawing = false;
const debug = document.getElementById('pause')
const buttonClear = document.getElementById('clear')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const microCanvas = document.getElementById('micro_canvas')

const convCtx1 = document.getElementById('conv_canvas1').getContext('2d')
const convCtx2 = document.getElementById('conv_canvas2').getContext('2d')
const convCtx3 = document.getElementById('conv_canvas3').getContext('2d')
const convCtx4 = document.getElementById('conv_canvas4').getContext('2d')
const convCtx5 = document.getElementById('conv_canvas5').getContext('2d')
const convCtx6 = document.getElementById('conv_canvas6').getContext('2d')
const convCtx7 = document.getElementById('conv_canvas7').getContext('2d')
const convCtx8 = document.getElementById('conv_canvas8').getContext('2d')
const convCtx9 = document.getElementById('conv_canvas9').getContext('2d')

const microCtx = microCanvas.getContext('2d')

function setMouseCoords(e) {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
}


debug.addEventListener('click', () => {
    writeToMatrix(microCtx);
    evaluate();

    displayConv(convCtx1, convMatrix, 25, 0);
    displayConv(convCtx2, convMatrix, 25, 1);
    displayConv(convCtx3, convMatrix, 25, 2);
    displayConv(convCtx4, convMatrix, 25, 3);
    displayConv(convCtx5, convMatrix, 25, 4);

    displayConv(convCtx6, convMatrix1, 12, 0);
    displayConv(convCtx7, convMatrix1, 12, 1);
    displayConv(convCtx8, convMatrix1, 12, 2);
    displayConv(convCtx9, convMatrix1, 12, 3);
})
buttonClear.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    microCtx.clearRect(0, 0, 28, 28);
    probCtx.clearRect(30, 0, probCanvas.width, probCanvas.height)
    clearMatrix();
})
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    setMouseCoords(e);
});

function stopDrawing() {
    if (drawing) {
        drawing = false;
        ctx.stroke();
        ctx.beginPath();
        microCtx.stroke();
        microCtx.beginPath();
    }
}

canvas.addEventListener('mousemove', (e) => makeStroke(e));
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('mouseup', stopDrawing);


function makeStroke(e) {
    if (!drawing) {
        return;
    }
    let start = Object.assign({}, mouse);
    setMouseCoords(e);
    let end = Object.assign({}, mouse);
    draw(ctx, start, end, 25)
    let microStart = {x: 27 * start.x / canvas.width, y: 27 * start.y / canvas.height};
    let microEnd = {x: 27 * end.x / canvas.width, y: 27 * end.y / canvas.height};
    draw(microCtx, microStart, microEnd, 1)

}

function draw(context, start, end, radius) {
    context.lineWidth = radius;
    context.lineCap = 'round';
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
}

function drawCircle(context, x, y, radius, arcColor, fillColor) {
    context.strokeStyle = arcColor;
    context.fillStyle = fillColor;

    context.beginPath();
    context.arc(x, y, radius, 2 * Math.PI, 0);

    if (fillColor) {
        context.fill();
    }
    if (arcColor) {
        context.stroke();
    }
}

function drawRect(context, x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawProbs(response) {
    probCtx.clearRect(30, 0, probCanvas.width, probCanvas.height)
    for (let i = 0; i < 10; i++) {
        let height = i * step;
        let prob = response[i][0];
        let lineWidth = prob * probCanvas.width * 0.9;

        if (lineWidth > 40) {
            lineWidth -= 40;
        }

        drawRect(probCtx, 40, height + 8, lineWidth, 20, probGradient);
        drawCircle(probCtx, 45, height + 18, 10.3, undefined, probGradient);
        if (lineWidth > 5) {
            drawCircle(probCtx, 40 + lineWidth, height + 18, 10.3, undefined, probGradient);
        }
    }
}

const probCanvas = document.getElementById('probs')
const probCtx = probCanvas.getContext('2d')

probCtx.font = "25px serif";
const step = 25;
for (let i = 0; i < 10; i++) {
    probCtx.fillText(i + ": ", 10, (i + 1) * step);
}

let probGradient = ctx.createLinearGradient(10, 0, probCanvas.width, 0);
probGradient.addColorStop(0, 'darkred');
probGradient.addColorStop(.5, 'darkorange');
probGradient.addColorStop(.8, 'forestgreen');
probGradient.addColorStop(1, 'green');
