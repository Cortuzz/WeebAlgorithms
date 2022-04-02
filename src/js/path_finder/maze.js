async function dfs(eraser) {
    maze[eraser.y][eraser.x] = 0;
    let directions = [];
    directions = createDirections(eraser, directions);

    while (directions.length > 0) {
        const index = getRandomIndex(directions);
        const [dy, dx] = directions[index];
        let newEraser =  {
            x: eraser.x + dx,
            y: eraser.y + dy
        }
        if (maze[newEraser.y][newEraser.x] === 1) {
            maze[newEraser.y - dy / 2][newEraser.x - dx / 2] = 0;

            if (mazeChecker) {
                refreshTable();
                await delay(10);
            }
            await dfs(newEraser);
        }
        directions.splice(index, 1);
    }
}

async function Prim(start) {
    let toCheck = [];
    maze[start.y][start.x] = 0;
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
        if (maze[choosenCell.y][choosenCell.x] === 1) {
            maze[choosenCell.y][choosenCell.x] = 0;

            if (mazeChecker) {
                refreshTable();
                await delay(10);
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

                if (maze[connectedCell.y][connectedCell.x] === 0) {
                    maze[connectedCell.y - edges[ind][0] / 2][connectedCell.x - edges[ind][1] / 2] = 0;
                    edges.splice(0, directions.length);
                    break;
                }

                edges.splice(ind, 1);
            }

            if (mazeChecker) {
                refreshTable();
                await delay(10);
            }

            for (let i = 0; i < directions.length; i++) {
                let nextCell = {
                    x: choosenCell.x + directions[i][1],
                    y: choosenCell.y + directions[i][0],
                };

                if (maze[nextCell.y][nextCell.x] === 1) {
                    toCheck.push(nextCell);
                }
            }
        }
    }
}

async function Kruskal() {
    let edges = [];

    for (let i = 0; i < height; i+=2) {
        for (let j = 0; j < width; j+=2) {
            let cell1 = {
                x: j,
                y: i
            };

            if (j + 2 < width) {
                let cell2 = {
                    x: j + 2,
                    y: i
                };
                edges.push({
                    firstCell: cell1,
                    secondCell: cell2,
                    dx: 2,
                    dy: 0
                });
            }
            if (i + 2 < height) {
                let cell3 = {
                    x: j,
                    y: i + 2
                };
                edges.push({
                    firstCell: cell1,
                    secondCell: cell3,
                    dx: 0,
                    dy: 2
                });
            }
        }
    }

    let parents = [];

    for (let i = 0; i < height; i++) {
        parents[i] = new Array(width);
        for (let j = 0; j < width; j++) {
            parents[i][j] = {
                x: j,
                y: i
            };
        }
    }


    while (edges.length > 0) {
        let index = getRandomIndex(edges);
        let currentEdge = edges[index];
        let firstCell = currentEdge.firstCell;
        let secondCell = currentEdge.secondCell;

        while (!equals(parents[firstCell.y][firstCell.x], firstCell)) {
            firstCell = parents[firstCell.y][firstCell.x];
        }

        while (!equals(parents[secondCell.y][secondCell.x], secondCell)) {
            secondCell = parents[secondCell.y][secondCell.x];
        }

        if (!equals(firstCell, secondCell)) {
            maze[currentEdge.firstCell.y][currentEdge.firstCell.x] = 0;
            maze[currentEdge.secondCell.y - currentEdge.dy / 2][currentEdge.secondCell.x - currentEdge.dx / 2] = 0;
            maze[currentEdge.secondCell.y][currentEdge.secondCell.x] = 0;
            parents[secondCell.y][secondCell.x] = firstCell;
            parents[currentEdge.secondCell.y - currentEdge.dy / 2][currentEdge.secondCell.x - currentEdge.dx / 2] = firstCell;

            if (mazeChecker) {
                refreshTable();
                await delay(10);
            }
        }

        edges.splice(index, 1);
    }
}

function createDirections(cell, arr) {
    if (cell.x > 1) {
        arr.push([0, -2]);
    }

    if (cell.x < width - 2) {
        arr.push([0, 2]);
    }

    if (cell.y > 1) {
        arr.push([-2, 0]);
    }

    if (cell.y < height - 2) {
        arr.push([2, 0]);
    }

    return arr;
}

function getRandomIndex(array) {
    const index = Math.floor(Math.random() * array.length);
    return index;
}

function equals(cell1, cell2) {
    return cell1.x === cell2.x && cell1.y === cell2.y
}

function delay(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout))
}

