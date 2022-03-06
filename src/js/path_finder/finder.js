class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.parent = null;
        this.heuristicValue = Number.MAX_VALUE;
        this.pathLength = Number.MAX_VALUE;
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
        if (this.maze[start.x][start.y] === 1) {
            console.log("Начало в стене((", start.x, start.y);
            return;
        }
        if (this.maze[finish.x][finish.y] === 1) {
            console.log("Конец в стене((", finish.x, finish.y);
            return;
        }
        start.pathLength = 0;
        start.heuristicValue = this.heuristic(start, finish);
        this.open.push(start);

        while (this.open.length > 0) {
            //maybe implement maxHeap
            let current = this.open.pop();

            this.closed[current.x][current.y] = 1;
            if (current.x === finish.x && current.y === finish.y) {
                finish = current;
                showWin(finish);
                return;
            }
            let x = current.x, y = current.y;
            //loop through neighbours and check if the neighbour is OK and not already in the closed[] list.
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    // 1st condition to not include diagonal points
                    if (Math.abs(i) + Math.abs(j) === 1 && x + i < this.width && x + i >= 0 && y + j < this.height &&
                        y + j >= 0 && this.maze[x + i][y + j] !== 1 && this.closed[x + i][y + j] === 0) {

                        let indexInOpen = find(x + i, y + j, this.open);
                        let neighbourPoint;
                        if (indexInOpen === -1) {
                            //If Point is not in open[], then push it
                            neighbourPoint = new Point(x + i, y + j);
                            neighbourPoint.parent = current;
                            neighbourPoint.heuristicValue = this.heuristic(neighbourPoint, finish);
                            neighbourPoint.pathLength = current.pathLength + 1;
                            this.open.push(neighbourPoint);
                        }
                        else if (this.open[indexInOpen].pathLength > current.pathLength + 1) {
                            //Otherwise, check if possible to decrease g value
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

function euclidHeuristic(pointA, pointB) {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

function manhattanHeuristic(pointA, pointB) {
    return Math.abs((pointA.x - pointB.x)) + Math.abs((pointA.y - pointB.y));
}

function showLose() {
    console.log("Нет пути из start в finish");
}

function showWin(finish) {
    let node = finish;
    while (node !== null) {
        console.log(node.x, node.y)
        node = node.parent;
    }
    console.log("Длина пути равна ", finish.pathLength);
}

/*
Эта функция нужна была просто для тестов,
нормальный лабиринт будет генерироваться по-другому

function ConstructMaze(width, height) {
    let maze = new Array(width);
    for (let i = 0; i < width; i++) {
        maze[i] = new Array(height);
        for (let j = 0; j < height; j++) {
            maze[i][j] = Math.round(Math.random());
        }
    }
    return maze;
}
*/
