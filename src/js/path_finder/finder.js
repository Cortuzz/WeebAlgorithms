class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.parent = null;
        this.heuristicValue = Number.MAX_VALUE;
        this.pathLength = Number.MAX_VALUE;
    }
}


class PathFinder {
    constructor(maze, heuristic) {
        this.width = maze.length;
        this.height = maze[0].length;
        this.maze = maze;
        this.heuristic = heuristic;

        this.open = [];
        this.closed = new Array(this.width);
        for (let i = 0; i < this.width; i++) {
            this.closed[i] = new Array(this.height);
            for (let j = 0; j < this.height; j++) {
                this.closed[i][j] = 0;
            }
        }
    }

    async findPath(start, finish) {
        start.pathLength = 0;
        start.heuristicValue = this.heuristic(start, finish);
        this.open.push(start);

        while (this.open.length > 0) {
            let current = this.open.pop();
            markCheckedCell(current, 'checked');
            await sleep(250);
            this.closed[current.x][current.y] = 1;

            if (current.x === finish.x && current.y === finish.y) {
                finish = current;
                await showWin(finish);
                return;
            }
            let x = current.x, y = current.y;
            // loop through neighbours and check if the neighbour is OK and not already in the closed[] list.
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    // 1st condition to not include diagonal points
                    if (Math.abs(i) + Math.abs(j) === 1 && x + i < this.width && x + i >= 0 && y + j < this.height &&
                        y + j >= 0 && this.maze[x + i][y + j] !== 1 && this.closed[x + i][y + j] === 0) {

                        let indexInOpen = find(x + i, y + j, this.open);
                        let neighbourPoint;
                        if (indexInOpen === -1) {
                            // If Point is not in open[], then push it
                            neighbourPoint = new Point(x + i, y + j);
                            neighbourPoint.parent = current;
                            neighbourPoint.heuristicValue = this.heuristic(neighbourPoint, finish);
                            neighbourPoint.pathLength = current.pathLength + 1;
                            this.open.push(neighbourPoint);
                        }
                        else if (this.open[indexInOpen].pathLength > current.pathLength + 1) {
                            // Otherwise, check if possible to decrease pathLength value
                            neighbourPoint = this.open[indexInOpen];
                            neighbourPoint.parent = current;
                            neighbourPoint.pathLength = current.pathLength + 1;
                        }
                    }
                }
            }
            this.open.sort((a, b) =>
                (b.heuristicValue + b.pathLength) - (a.heuristicValue + a.pathLength));
        }
        showLose();
    }
}


function find(x, y, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].x === x && array[i].y === y) {
            return i;
        }
    }
    return -1;
}

function euclidHeuristic(pointA, pointB) {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

function manhattanHeuristic(pointA, pointB) {
    return Math.abs((pointA.x - pointB.x)) + Math.abs((pointA.y - pointB.y));
}

function showLose() {
    console.log("Нет пути из start в finish");
}

async function showWin(finish) {
    let node = finish;
    while (node !== null) {
        markCheckedCell(node, 'path');
        await sleep(50);
        node = node.parent;
    }

    console.log("Длина пути равна ", finish.pathLength);
}

function markCheckedCell(cell, type) {
    let tableCell = document.querySelector(`td[data-row='${cell.x}'][data-column='${cell.y}']`);
    let mode = tableCell.dataset.mode;

    if (mode === 'start' || mode === 'finish') {
        return;
    }

    tableCell.dataset.mode = type;
}
