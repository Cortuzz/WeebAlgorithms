const populationCanvas = document.getElementById('populationCanvas')
const populationCtx = populationCanvas.getContext('2d');
let maxYValue;
let maxColonySizeValue;

function drawLine(ctx, x1, x2, y1, y2, color) {
    if (color) {
        ctx.strokeStyle = color;
    } else {
        ctx.strokeStyle = "#000000";
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
}

function initPopulationCanvas() {
    let canvasHeight = populationCanvas.height;
    let canvasWidth = populationCanvas.width;
    let step = 1;
    let maxY = 11;
    maxYValue = maxY * 22 - 20;

    maxColonySizeValue = canvasHeight - maxYValue * maxColonySize / (10 * (maxY - 1) * Math.ceil(maxColonySize / 100)) - 20;
    console.log(maxColonySizeValue);
    drawRect(populationCtx, 0, 0, canvasWidth, canvasHeight, "aliceblue");
    drawLine(populationCtx, 25, canvasWidth, maxColonySizeValue, maxColonySizeValue, "darkred");
    populationCtx.stroke();
    populationCtx.fillStyle = "black";

    for (let i = 0; i < maxY; i++) {
        let y = canvasHeight - i * 22 - 20;
        populationCtx.fillText(10 * i * Math.ceil(maxColonySize / 100) + "", 0, y);
        drawLine(populationCtx, 20, 25, y, y);
        if (!i) {
            populationCtx.lineTo(populationCanvas.width, y);
        }
        populationCtx.stroke();
    }

    for (let i = 0; i < 101; i++) {
        let x = 20 + i * 21;
        populationCtx.fillText(step * i + "", x, 245);
        drawLine(populationCtx, x + 4, x + 4, 235, 230);
        if (!i) {
            populationCtx.lineTo(x + 4, 0);
        }
        populationCtx.stroke();
    }
}

function changePopulationCanvas(epoch, population) {
    let ratio = population / maxColonySize;
    let populationValue = ratio * (populationCanvas.height - maxColonySizeValue - 20);
    let yVal = populationCanvas.height - populationValue - 20;
    console.log(populationValue, yVal);
    let xVal = epoch + 24;

    populationCtx.beginPath();
    populationCtx.moveTo(xVal, yVal);
    populationCtx.lineTo(xVal, 230);
    populationCtx.stroke();
}