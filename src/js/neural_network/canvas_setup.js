let mouse = {x: 0, y: 0};
let drawing = false;

const debug = document.getElementById('pause')
const buttonClear = document.getElementById('clear')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

function setMouseCoords(e) {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
}

debug.addEventListener('click', () => {
    evaluate();
    console.log(matrix);
})
buttonClear.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    probCtx.clearRect(30, 0, probCanvas.width, probCanvas.height)
    clearMatrix();
})
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    setMouseCoords(e);
});
canvas.addEventListener('mousemove', (e) => makeStroke(e));
canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.stroke();
    ctx.beginPath();
});


function makeStroke(e) {
    if (!drawing) {
        return;
    }
    let start = Object.assign({}, mouse);
    setMouseCoords(e);
    let end = Object.assign({}, mouse);
    writeToMatrix(start, end);
    draw(start,25)
    //evaluate();
}

function draw(start,radius) {
    ctx.lineWidth = radius;
    ctx.lineCap = 'round';
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
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
