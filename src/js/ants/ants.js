const BORDER = -2;


class AntsSimulation {
    constructor(field, width, height, greed, gregariousness, colony) {
        this.width = width;
        this.height = height;
        this.greed = greed;
        this.gregariousness = gregariousness;

        this.foodFound = false;
        this.field = field;
        this.pheromoneMap = [ ];
        this.pheromonePoints = [ ];

        this.colony = colony;

        for (let i = 0; i < this.height; i++) {
            this.pheromoneMap[i] = [ ];
            for (let j = 0; j < this.width; j++) {
                this.pheromoneMap[i][j] = 1;
            }
        }
    }

    getDistance(x, y, colony) {
        return Math.sqrt((x - colony.x) ** 2 + (y - colony.y) ** 2);
    }

    getMoveProbability(x, y, ant) {
        let pheromoneValue = this.pheromoneMap[y][x];
        let distance = this.getDistance(x, y, this.colony) + 1;

        if (ant.found) {
            return Math.pow(1 / distance, this.gregariousness);
        } else if (this.foodFound) {
            return Math.pow(pheromoneValue, this.greed) / distance;
        } else {
            let distancePwd = Math.pow(distance, this.greed);
            if (distance > 100) {
                return distancePwd + 0.05 * (2 * Math.random() - 1) / distancePwd;
            }
            return distancePwd + 0.1 * (2 * Math.random() - 1) / distancePwd;
        }
    }

    sprayPheromones(x, y, value) {
        this.pheromoneMap[y][x] = value;
        this.pheromonePoints[this.pheromonePoints.length] = { x: x, y: y };
    }

    getPossibleMoves(ant) {
        let speed = 1;
        let moves = [[speed, 0], [0, speed], [-speed, 0], [0, -speed]];
        let possibleMoves = [ ];
        let count = 0;

        moves.forEach(move => {
            let moveX = ant.x + move[0];
            let moveY = ant.y + move[1];

            if (ant.found && ant.path[0].x === moveX && ant.path[0].y === moveY) {
                ant.path = [ ];
                ant.found = false;
                return [ {x: moveX, y: moveY} ]
            }

            if (!(moveX < 0 || moveY < 0 || moveX >= this.width || moveY >= this.height ||
                this.field[moveY][moveX] === BORDER)) {
                    possibleMoves[count] = {x: moveX, y: moveY};
                    count++;
            }
            else if (!this.foodFound) {
                ant.alive = false;
            }
        });
        return shuffle(possibleMoves);
    }

    pheromoneTick() {
        this.pheromonePoints.forEach(point => {
            let pheromone = this.pheromoneMap[point.y][point.x];
            if (pheromone > 1) {
                pheromone--;
            }
        })
    }
}


class Colony {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;

        this.size = size;
        this.ants = [ ];

        for (let i = 0; i < this.size; i++) {
            this.ants[i] = new Ant(this.x, this.y);
        }
    }

    addAnt() {
        this.ants[this.ants.length] = new Ant(this.x, this.y);
    }
}


class Ant {
    constructor(x, y) {
        this.alive = true;
        this.found = false;
        this.pheromones = 5000;
        this.x = x;
        this.y = y;
        this.path = [ {x: this.x, y:this.y} ];
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        if (!this.found) {
            this.path[this.path.length] = {x: this.x, y: this.y};
        }
    }

    getLastMoves() {
        return {current: {x: this.x, y: this.y}, previous: this.path[this.path.length - 2]};
    }

    getPheromoneCount(pheromoneMap) {
        let count = 1;
        this.path.forEach(point => {
            count += pheromoneMap[point.y][point.x];
        })

        return count;
    }

    getPathPheromones() {

    }
}
