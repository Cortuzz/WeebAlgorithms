let renderCave = true;
let hScaled = HEIGHT / 4;
let wScaled = WIDTH / 4;
let fieldScaled = [ ];

let caveCanvas =document.getElementById('cave');
const caveCtx = caveCanvas.getContext('2d');

async function generateCave() {
    await prim();
    await removeDeadEnds(5);
    await vegetate(3);
    await removeDeadEnds(2);
    await scaleUp();
}

async function prim() {
    for (let i = 0; i < hScaled; i++) {
        fieldScaled[i] = [ ];
        for (let j = 0; j < wScaled; j++) {
            fieldScaled[i][j] = { value: -2 };
            drawRect(caveCtx, j, i, 1, 1, "gray");
        }
    }

    let start = { x:0, y: 0 };
    drawRect(caveCtx, 0, 0, 1, 1, "aliceblue");

    let toCheck = [];
    fieldScaled[start.y][start.x].value = -1;
    let directions = [];
    directions = createDirections(start, directions);

    for (let i = 0; i < directions.length; i++) {
        toCheck.push({
            x: start.x + directions[i][1],
            y: start.y + directions[i][0]
        });
    }

    while (toCheck.length > 0) {
        let index = getRandomIndex(toCheck);
        let choosenCell = toCheck[index];
        toCheck.splice(index, 1);
        if (fieldScaled[choosenCell.y][choosenCell.x].value === -2) {
            fieldScaled[choosenCell.y][choosenCell.x].value = -1;

            drawRect(caveCtx, choosenCell.x, choosenCell.y, 1, 1, "aliceblue");
            if (renderCave && Math.random() < 0.01) {
                await sleep(0.01);
            }

            directions = [];
            directions = createDirections(choosenCell, directions);
            let edges = directions.slice();

            while (edges.length > 0) {
                let ind = getRandomIndex(edges);
                let connectedCell = {
                    x: choosenCell.x + edges[ind][1],
                    y: choosenCell.y + edges[ind][0]
                }

                if (fieldScaled[connectedCell.y][connectedCell.x].value === -1) {
                    let valX = connectedCell.x - edges[ind][1] / 2;
                    let valY = connectedCell.y - edges[ind][0] / 2;
                    drawRect(caveCtx, valX, valY, 1, 1, "aliceblue");

                    fieldScaled[valY][valX].value = -1;
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

                if (fieldScaled[nextCell.y][nextCell.x].value === -2) {
                    toCheck.push(nextCell);
                }
            }
        }
    }
}

async function removeDeadEnds(iterations) {
    for (let iter = 0; iter < iterations; iter++) {
        let deadEnds = [ ];
        for (let i = 0; i < hScaled; i++) {
            for (let j = 0; j < wScaled; j++) {
                if (fieldScaled[i][j].value === -1) {
                    let neighbors = 0;

                    if (i - 1 >= 0 && fieldScaled[i - 1][j].value === -1) {
                        neighbors++;
                    }
                    if (i + 1 < hScaled && fieldScaled[i + 1][j].value === -1) {
                        neighbors++;
                    }
                    if (j - 1 >= 0 && fieldScaled[i][j - 1].value === -1) {
                        neighbors++;
                    }
                    if (j + 1 < wScaled && fieldScaled[i][j + 1].value === -1) {
                        neighbors++;
                    }
                    if (neighbors <= 1) {
                        deadEnds.push( { x: j, y: i } );
                    }
                }
            }

            for (let deadEnd of deadEnds) {
                fieldScaled[deadEnd.y][deadEnd.x].value = -2;
                drawRect(caveCtx, deadEnd.x, deadEnd.y, 1, 1, "gray");
            }

            if (renderCave) {
                await sleep(0.01);
            }
        }

        await sleep(0.01);
    }
}

async function vegetate(iterations) {
    for (let iter = 0; iter < iterations; iter++) {
        let points = [ ];
        for (let i = 0; i < hScaled; i++) {
            for (let j = 0; j < wScaled; j++) {
                if (fieldScaled[i][j].value === -2) {
                    let neighbors = 0;
                    for (let a = 0; a < 3; a++) {
                        for (let b = 0; b < 3; b++) {
                            let neighbor_x = j - a;
                            let neighbor_y = i - b;

                            if (neighbor_x >= 0 && neighbor_x < wScaled && neighbor_y >= 0 && neighbor_y < hScaled) {
                                if (fieldScaled[neighbor_y][neighbor_x].value === -1) {
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
            fieldScaled[point.y][point.x].value = -1;
            drawRect(caveCtx, point.x, point.y, 1, 1, "aliceblue");

            if (renderCave && Math.random() < 0.01) {
                await sleep(0.01);
            }
        }

        await sleep(0.01);
    }
}

async function scaleUp() {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            let value = fieldScaled[Math.floor(i / 4)][Math.floor(j / 4)].value;

            field[i][j].value = value;
            if (value === -1) {
                drawPoint(j, i, "aliceblue", 1);
            } else {
                drawPoint(j, i, "gray", 1);
            }
        }

        if (renderCave) {
            await sleep(0.01);
        }
    }
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
