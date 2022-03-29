let mouse = { x: 0, y: 0 };
let drawing = false;
scale = 1;

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const probCanvas = document.getElementById('probs')
const probCtx = probCanvas.getContext('2d')

function setMouseCoords(client, e) {
    mouse.x = Math.floor((e.clientX - client.left) / scale);
    mouse.y = Math.floor((e.clientY - client.top) / scale);
}

canvas.addEventListener('mousedown', async function(e) {
    let ClientRect = this.getBoundingClientRect();
    setMouseCoords(ClientRect, e);

    drawing = true;
    draw(e, 10, undefined, "black");
});

canvas.addEventListener('mousemove', function(e) {
    if (!drawing) {
        return;
    }

    draw(e, 10, undefined, "black");
});

canvas.addEventListener('mouseup', function(e) {
    drawing = false;
    draw(e, 10, undefined, "black");
});

function draw(e, radius, arcColor, fillColor) {
    let ClientRect = canvas.getBoundingClientRect();

    setMouseCoords(ClientRect, e);
    drawCircle(ctx, mouse.x, mouse.y, radius, arcColor, fillColor);

    let x_ = mouse.x.toFixed(0);
    let y_ = mouse.y.toFixed(0);
    //setValue(+x_, +y_, radius, links[currentState]);
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

probCtx.font = "25px serif";

const step = 25;
for (let i = 0; i < 10; i++) {
    probCtx.fillText(i + ": ", 10, (i + 1) * step);
}

let probGradient = ctx.createLinearGradient(10,0, probCanvas.width, 0);
probGradient.addColorStop(0, 'darkred');
probGradient.addColorStop(.5, 'darkorange');
probGradient.addColorStop(.8, 'forestgreen');
probGradient.addColorStop(1, 'green');