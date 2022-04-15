let currentCaveAction = window.currentAction;

const totalGenIterations = 14;
let genIterations;

let hScaled = HEIGHT / 4;
let wScaled = WIDTH / 4;
let fieldScaled = [ ];

let caveCanvas = document.getElementById('cave');
let caveCtx = caveCanvas.getContext('2d');

async function generateCave() {
    window.cave.parentElement.style.display = "flex";
    genIterations = 0;

    await prim();

    await removeDeadEnds(5);
    await vegetate(3);
    await removeDeadEnds(2);
    await removeLonelyPoints();

    await scaleUp();
    currentCaveAction.textContent = "Мир сгенерирован";
}

async function prim() {
    currentCaveAction.textContent = "Очистка карты";
    clearProgress(progressCaveCtx);
    for (let i = 0; i < hScaled; i++) {
        fieldScaled[i] = [ ];
        await updateProgress(progressCaveCtx, (i + 1) / hScaled, i / hScaled, true);
        for (let j = 0; j < wScaled; j++) {
            fieldScaled[i][j] = -2;
            drawRect(caveCtx, j, i, 1, 1, "gray");
        }
        await sleep(0.01);
    }

    clearProgress(progressCaveCtx);
    currentCaveAction.textContent = "Генерация высотных зон";
    await updateProgress(totalProgressCaveCtx, ++genIterations / totalGenIterations,
        (genIterations - 1) / totalGenIterations);

    let start = { x:0, y: 0 };
    drawRect(caveCtx, 0, 0, 1, 1, "aliceblue");

    let toCheck = [ ];
    fieldScaled[start.y][start.x] = -1;
    let directions = [ ];
    directions = createDirections(start, directions);

    for (let i = 0; i < directions.length; i++) {
        toCheck.push({
            x: start.x + directions[i][1],
            y: start.y + directions[i][0]
        });
    }

    let total = 0;
    while (toCheck.length > 0) {
        if (total % 20 === 0) {
            await updateProgress(progressCaveCtx, 2 * total / wScaled / hScaled, 0, true);
        }

        let index = getRandomIndex(toCheck);
        let choosenCell = toCheck[index];
        toCheck.splice(index, 1);
        if (fieldScaled[choosenCell.y][choosenCell.x] === -2) {
            fieldScaled[choosenCell.y][choosenCell.x] = -1;

            drawRect(caveCtx, choosenCell.x, choosenCell.y, 1, 1, "aliceblue");
            if (Math.random() < 0.1) {
                await sleep(0.01);
            }

            directions = [ ];
            directions = createDirections(choosenCell, directions);
            let edges = directions.slice();

            while (edges.length > 0) {
                let ind = getRandomIndex(edges);
                let connectedCell = {
                    x: choosenCell.x + edges[ind][1],
                    y: choosenCell.y + edges[ind][0]
                }

                if (fieldScaled[connectedCell.y][connectedCell.x] === -1) {
                    let valX = connectedCell.x - edges[ind][1] / 2;
                    let valY = connectedCell.y - edges[ind][0] / 2;
                    drawRect(caveCtx, valX, valY, 1, 1, "aliceblue");

                    fieldScaled[valY][valX] = -1;
                    edges.splice(0, directions.length);
                    break;
                }

                edges.splice(ind, 1);
            }

            for (let i = 0; i < directions.length; i++) {
                let nextCell = {
                    x: choosenCell.x + directions[i][1],
                    y: choosenCell.y + directions[i][0],
                };

                if (fieldScaled[nextCell.y][nextCell.x] === -2) {
                    toCheck.push(nextCell);
                    total++;
                }
            }
        }
    }
    await updateProgress(totalProgressCaveCtx, ++genIterations / totalGenIterations,
        (genIterations - 1) / totalGenIterations);
}

async function removeDeadEnds(iterations) {
    for (let iter = 0; iter < iterations; iter++) {
        clearProgress(progressCaveCtx);
        currentCaveAction.textContent = "Удаление тупиковых зон (" + (iter + 1) + "/" + iterations + ")";
        let deadEnds = [ ];
        for (let i = 0; i < hScaled; i++) {
            await updateProgress(progressCaveCtx, (i + 1) / hScaled, i / hScaled, true);

            for (let j = 0; j < wScaled; j++) {
                if (fieldScaled[i][j] === -1) {
                    let neighbors = 0;

                    if (i - 1 >= 0 && fieldScaled[i - 1][j] === -1) {
                        neighbors++;
                    }
                    if (i + 1 < hScaled && fieldScaled[i + 1][j] === -1) {
                        neighbors++;
                    }
                    if (j - 1 >= 0 && fieldScaled[i][j - 1] === -1) {
                        neighbors++;
                    }
                    if (j + 1 < wScaled && fieldScaled[i][j + 1] === -1) {
                        neighbors++;
                    }
                    if (neighbors <= 1) {
                        deadEnds.push( { x: j, y: i } );
                    }
                }
            }

            for (let deadEnd of deadEnds) {
                fieldScaled[deadEnd.y][deadEnd.x] = -2;
                drawRect(caveCtx, deadEnd.x, deadEnd.y, 1, 1, "gray");
            }
            await sleep(0.01);
        }
        await updateProgress(totalProgressCaveCtx, ++genIterations / totalGenIterations,
            (genIterations - 1) / totalGenIterations);
    }
}

async function vegetate(iterations) {
    for (let iter = 0; iter < iterations; iter++) {
        clearProgress(progressCaveCtx);
        currentCaveAction.textContent = "Расширение пустых зон (" + (iter + 1) + "/" + iterations + ")";
        let points = [ ];
        for (let i = 0; i < hScaled; i++) {
            await updateProgress(progressCaveCtx, (i + 1) / hScaled, i / hScaled, true);
            for (let j = 0; j < wScaled; j++) {
                if (fieldScaled[i][j] === -2) {
                    let neighbors = 0;
                    for (let a = 0; a < 3; a++) {
                        for (let b = 0; b < 3; b++) {
                            let neighbor_x = j - a;
                            let neighbor_y = i - b;

                            if (neighbor_x >= 0 && neighbor_x < wScaled && neighbor_y >= 0 && neighbor_y < hScaled) {
                                if (fieldScaled[neighbor_y][neighbor_x] === -1) {
                                    neighbors++;
                                }
                            }
                        }
                    }
                    if (neighbors >= 4) {
                        points.push( { x: j, y: i } );
                    }
                }
            }
        }

        for (let point of points) {
            fieldScaled[point.y][point.x] = -1;
            drawRect(caveCtx, point.x, point.y, 1, 1, "aliceblue");
            if (Math.random() < 0.05) {
                await sleep(0.01);
            }
        }
        await updateProgress(totalProgressCaveCtx, ++genIterations / totalGenIterations,
            (genIterations - 1) / totalGenIterations);
    }
}

async function scaleUp() {
    currentCaveAction.textContent = "Масштабирование карты";
    clearProgress(progressCaveCtx);
    for (let i = 0; i < HEIGHT; i++) {
        if (i % 4 === 0) {
            await updateProgress(progressCaveCtx, (i + 3) / HEIGHT, i / HEIGHT, true);
        }

        for (let j = 0; j < WIDTH; j++) {
            let value = fieldScaled[Math.floor(i / 4)][Math.floor(j / 4)];

            field[i][j].value = value;
            if (value === -1) {
                drawPoint(j, i, "aliceblue", 1);
            } else {
                drawPoint(j, i, "gray", 1);
            }
        }
        await sleep(1);
    }
    await updateProgress(totalProgressCaveCtx, ++genIterations / totalGenIterations,
        (genIterations - 1) / totalGenIterations);
}

async function removeLonelyPoints() {
    currentCaveAction.textContent = "Удаление одиночных точек";
    clearProgress(progressCaveCtx);
    for (let i = 0; i < hScaled; i++) {
        await updateProgress(progressCaveCtx, (i + 1) / hScaled, i / hScaled, true);
        for (let j = 0; j < wScaled; j++) {
            if (fieldScaled[i][j] === -2) {
                if (i - 1 >= 0 && fieldScaled[i - 1][j] === -2 ||
                    i + 1 < hScaled && fieldScaled[i + 1][j] === -2 ||
                    j - 1 >= 0 && fieldScaled[i][j - 1] === -2 ||
                    j + 1 < wScaled && fieldScaled[i][j + 1] === -2) {
                    continue;
                }

                fieldScaled[i][j] = -1;
                drawRect(caveCtx, j, i, 1, 1, "aliceblue");
                await sleep(0.01);
            }
        }
    }
    await updateProgress(totalProgressCaveCtx, ++genIterations / totalGenIterations,
        (genIterations - 1) / totalGenIterations);
}

function createDirections(cell, arr) {
    if (cell.x > 1) {
        arr.push([0, -2]);
    }

    if (cell.x < wScaled - 2) {
        arr.push([0, 2]);
    }

    if (cell.y > 1) {
        arr.push([-2, 0]);
    }

    if (cell.y < hScaled - 2) {
        arr.push([2, 0]);
    }

    return arr;
}

function getRandomIndex(array) {
    return Math.floor(Math.random() * array.length);
}

function equals(cell1, cell2) {
    return cell1.x === cell2.x && cell1.y === cell2.y;
}

const totalProgressCaveCanvas = document.getElementById('totalProgressCave');
const totalProgressCaveCtx = totalProgressCaveCanvas.getContext('2d');
const progressCaveCanvas = document.getElementById('progressCave');
const progressCaveCtx = progressCaveCanvas.getContext('2d');

let progressCaveGradient = totalProgressCaveCtx.createLinearGradient(0, 0, totalProgressCaveCanvas.width, 0);

progressCaveGradient.addColorStop(0, 'darkred');
progressCaveGradient.addColorStop(.5, 'darkorange');
progressCaveGradient.addColorStop(.8, 'forestgreen');
progressCaveGradient.addColorStop(1, 'green');

async function updateProgress(ctx, value, lastValue, fastRendering) {
    ctx.fillStyle = progressCaveGradient;

    if (fastRendering) {
        ctx.fillRect(0, 0, 250 * value, 30);
        await sleep(0.01);
        return;
    }
    for (let i = 250 * lastValue; i <= 250 * value; i++) {
        ctx.fillRect(i, 0, 1, 30);
        await sleep(0.01);
    }
    ctx.fillRect(0, 0, 250 * value, 30);
    await sleep(0.01);
}

function clearProgress(ctx) {
    ctx.fillStyle = "aliceblue";
    ctx.fillRect(0, 0, 250, 30);
}
