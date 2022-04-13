let renderCave = false;


async function Prim() {
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            field[i][j].value = -2;
            drawPoint(j, i, "gray", 1);
        }
    }

    let start = { x:0, y: 0 };
    drawPoint(0, 0, "aliceblue", 1);

    let toCheck = [];
    field[start.y][start.x].value = -1;
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
        if (field[choosenCell.y][choosenCell.x].value === -2) {
            field[choosenCell.y][choosenCell.x].value = -1;

            drawPoint(choosenCell.x, choosenCell.y, "aliceblue", 1);
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

                if (field[connectedCell.y][connectedCell.x].value === -1) {
                    let valX = connectedCell.x - edges[ind][1] / 2;
                    let valY = connectedCell.y - edges[ind][0] / 2;
                    drawPoint(valX, valY, "aliceblue", 1);

                    field[valY][valX].value = -1;
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

                if (field[nextCell.y][nextCell.x].value === -2) {
                    toCheck.push(nextCell);
                }
            }
        }
    }

    await removeDeadEnds(15);
    await vegetate(4);
    await removeDeadEnds(3);
}

async function removeDeadEnds(iterations) {
    for (let iter = 0; iter < iterations; iter++) {
        let deadEnds = [ ];
        for (let i = 0; i < HEIGHT; i++) {
            for (let j = 0; j < WIDTH; j++) {
                if (field[i][j].value === -1) {
                    let neighbors = 0;

                    if (i - 1 >= 0 && field[i - 1][j].value === -1) {
                        neighbors++;
                    }
                    if (i + 1 < HEIGHT && field[i + 1][j].value === -1) {
                        neighbors++;
                    }
                    if (j - 1 >= 0 && field[i][j - 1].value === -1) {
                        neighbors++;
                    }
                    if (j + 1 < WIDTH && field[i][j + 1].value === -1) {
                        neighbors++;
                    }
                    if (neighbors <= 1) {
                        deadEnds.push( { x: j, y: i } );
                    }
                }
            }

            for (let deadEnd of deadEnds) {
                field[deadEnd.y][deadEnd.x].value = -2;
                drawPoint(deadEnd.x, deadEnd.y, "gray", 1);
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
        for (let i = 0; i < HEIGHT; i++) {
            for (let j = 0; j < WIDTH; j++) {
                if (field[i][j].value === -2) {
                    let neighbors = 0;
                    for (let a = 0; a < 3; a++) {
                        for (let b = 0; b < 3; b++) {
                            let neighbor_x = j - a;
                            let neighbor_y = i - b;

                            if (neighbor_x >= 0 && neighbor_x < WIDTH && neighbor_y >= 0 && neighbor_y < HEIGHT) {
                                if (field[neighbor_y][neighbor_x].value === -1) {
                                    neighbors++;
                                }
                            }
                        }
                    }
                    if (neighbors >= 3) {
                        points.push( { x: j, y: i } );
                    }
                }
            }
        }

        for (let point of points) {
            field[point.y][point.x].value = -1;
            drawPoint(point.x, point.y, "aliceblue", 1);

            if (renderCave && Math.random() < 0.01) {
                await sleep(0.01);
            }
        }

        await sleep(0.01);
    }
}

function createDirections(cell, arr) {
    if (cell.x > 1) {
        arr.push([0, -2]);
    }

    if (cell.x < WIDTH - 2) {
        arr.push([0, 2]);
    }

    if (cell.y > 1) {
        arr.push([-2, 0]);
    }

    if (cell.y < HEIGHT - 2) {
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
