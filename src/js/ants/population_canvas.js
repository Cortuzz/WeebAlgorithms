const populationCanvas = document.getElementById('populationCanvas');
const populationCtx = populationCanvas.getContext('2d');
const populationView = document.getElementById('populationView');
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
    let maxY = 11;
    maxYValue = maxY * 22 - 20;

    maxColonySizeValue = canvasHeight - maxYValue * maxColonySize / (50 * (maxY - 1) * Math.ceil(maxColonySize / 500)) - 20;
    drawRect(populationCtx, 0, 0, canvasWidth, canvasHeight, "aliceblue");
    drawLine(populationCtx, 25, canvasWidth, maxColonySizeValue, maxColonySizeValue, "darkred");
    populationCtx.stroke();
    populationCtx.fillStyle = "black";

    for (let i = 0; i < maxY; i++) {
        let y = canvasHeight - i * 22 - 20;
        populationCtx.fillText(50 * i * Math.ceil(maxColonySize / 500) + "", 0, y);
        drawLine(populationCtx, 20, 25, y, y);
        if (!i) {
            populationCtx.lineTo(populationCanvas.width, y);
        }
        populationCtx.stroke();
    }

    for (let i = 0; i < canvasWidth / 20; i++) {
        let x = 20 + i * 21;

        if (!(i % 10)) {
            drawLine(populationCtx, x + 4, x + 4, 245, 230);
        } else if (!(i % 5)) {
            drawLine(populationCtx, x + 4, x + 4, 240, 230);
        } else {
            drawLine(populationCtx, x + 4, x + 4, 235, 230);
        }

        if (!i) {
            populationCtx.lineTo(x + 4, 0);
        }
        populationCtx.stroke();
    }
}

function changePopulationCanvas(epoch, population) {
    let color = getPopulationColor(population);
    let ratio = population / maxColonySize;
    let populationValue = ratio * (populationCanvas.height - maxColonySizeValue - 20);

    let yVal = populationCanvas.height - populationValue - 20;
    let xVal = epoch + 24;

    drawLine(populationCtx, xVal, xVal, yVal, 230, color);
    populationCtx.stroke();

    populationView.textContent = population;
    populationView.style.color = color;

    if (epoch > 400) {
        window.populationScroll.scrollBy(1, 0);
    }
}

function getPopulationColor(population) {
    let value = Math.floor(255 * population / maxColonySize);
    return rgbToHex(255 - value, +value, 190);
}