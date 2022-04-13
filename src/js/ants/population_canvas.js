const populationCanvas = document.getElementById('populationCanvas');
const populationCtx = populationCanvas.getContext('2d');

const markupCanvas = document.getElementById('markupCanvas');
const markupCtx = markupCanvas.getContext('2d');

const populationView = document.getElementById('populationView');
const populationView2 = document.getElementById('populationView2');
const populationView3 = document.getElementById('populationView3');
const populationView4 = document.getElementById('populationView4');


let populationViews = [ populationView, populationView2, populationView3, populationView4 ]
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
    drawRect(markupCtx, 0, 0, markupCanvas.width, markupCanvas.height, "aliceblue");

    drawLine(populationCtx, 0, canvasWidth, maxColonySizeValue, maxColonySizeValue, "darkred");
    populationCtx.stroke();
    populationCtx.fillStyle = "black";
    markupCtx.fillStyle = "black";

    for (let i = 0; i < maxY; i++) {
        let y = canvasHeight - i * 22 - 20;
        markupCtx.fillText(50 * i * Math.ceil(maxColonySize / 500) + "", 0, y);
        drawLine(markupCtx, 20, 25, y, y);
        if (!i) {
            drawLine(populationCtx, 0, populationCanvas.width, y, y);
        }
        markupCtx.stroke();
        populationCtx.stroke();
    }

    for (let i = 0; i < canvasWidth / 20; i++) {
        let x = 20 + i * 21;

        if (!(i % 10)) {
            drawLine(populationCtx, x - 21, x - 21, 245, 230);
        } else if (!(i % 5)) {
            drawLine(populationCtx, x - 21, x - 21, 240, 230);
        } else {
            drawLine(populationCtx, x - 21, x - 21, 235, 230);
        }

        if (!i) {
            drawLine(markupCtx, x + 4, x + 4, 230, 0);
            markupCtx.stroke();
        }
        populationCtx.stroke();
    }
}

function getValue(population) {
    let ratio = population / maxColonySize;
    let populationValue = ratio * (populationCanvas.height - maxColonySizeValue - 20);

    return populationCanvas.height - populationValue - 20;
}

function changePopulationCanvas(epoch, population, colonies) {
    let color = getPopulationColor(population);
    let yVal = getValue(population);
    let xVal = epoch;

    if (colonies == null) {
        drawLine(populationCtx, xVal, xVal, yVal, 230, color);
        populationCtx.stroke();

        populationView.textContent = population;
        populationView.style.color = color;
    } else {
        for (let i = 0; i < colonies.length; i++) {
            let populationSize = colonies[i].ants.length;
            drawLine(populationCtx, xVal, xVal, getValue(populationSize), 230, colonyColors[i]);
            populationCtx.stroke();

            populationViews[i].textContent = populationSize;
            populationViews[i].style.color = colonyColors[i];
        }
    }

    if (epoch > 650) {
        window.populationScroll.scrollBy(1, 0);
    }
}

function getPopulationColor(population) {
    let value = Math.floor(255 * population / maxColonySize);
    return rgbToHex(255 - value, +value, 190);
}