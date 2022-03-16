const BORDER = -2;


class AntsSimulation {
    constructor(field, width, height, greed, gregariousness, speed, pheromoneDecay, redPheromoneDecay, colony) {
        this.width = width;
        this.height = height;
        this.greed = greed;
        this.gregariousness = gregariousness;
        this.speed = speed;
        this.pheromoneDecay = pheromoneDecay;
        this.redPheromoneDecay = redPheromoneDecay;

        this.field = field;
        this.pheromoneMap = [ ];
        this.redPheromoneMap = [ ];
        this.pheromonePoints = [ ];

        this.colony = colony;

        for (let i = 0; i < this.height; i++) {
            this.pheromoneMap[i] = [ ];
            this.redPheromoneMap[i] = [ ];
            for (let j = 0; j < this.width; j++) {
                this.pheromoneMap[i][j] = 0;
                this.redPheromoneMap[i][j] = 0.5;
            }
        }
    }

    getDistance(x, y, colony) {
        return Math.sqrt((x - colony.x) ** 2 + (y - colony.y) ** 2);
    }

    getMoveProbability(x, y, ant) {
        let redPheromoneValue = this.redPheromoneMap[y][x];
        let distance = this.getDistance(x, y, this.colony) + 1;

        return Math.pow(-2 * (redPheromoneValue - 1), this.gregariousness) / Math.pow(distance, this.greed);
    }

    sprayPheromones(x, y, value) {
        this.pheromoneMap[y][x] += value;
        this.pheromonePoints[this.pheromonePoints.length] = { x: x, y: y };
    }

    sprayRedPheromones(x, y, dif) {
        if (this.redPheromoneMap[y][x] - dif > 0) {
            this.redPheromoneMap[y][x] -= dif;
        }
    }

    getPossibleMoves(ant) {
        let moves = [[this.speed, 0], [0, this.speed], [-this.speed, 0], [0, -this.speed],
            [this.speed, this.speed], [this.speed, -this.speed],
            [-this.speed, this.speed], [-this.speed, -this.speed]];
        let possibleMoves = [ ];
        let count = 0;

        moves.forEach(move => {
            let moveX = ant.x + move[0];
            let moveY = ant.y + move[1];

            if (this.checkBounds(moveX, moveY)) {
                    possibleMoves[count] = { x: moveX, y: moveY };
                    count++;
            }
        });

        return shuffle(possibleMoves);
    }

    checkBounds(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height || this.field[y][x] === BORDER) {
            return false;
        }
        return true;
    }

    pheromoneTick() {
        this.pheromonePoints.forEach(point => {
            let pheromone = this.pheromoneMap[point.y][point.x];
            if (pheromone > 0) {
                this.pheromoneMap[point.y][point.x] -= this.pheromoneDecay;
            }
        })

        return;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.redPheromoneMap[i][j] += this.redPheromoneDecay;
            }
        }
    }
}


class Colony {
    constructor(x, y, size, antDirectionRandomBorder) {
        this.x = x;
        this.y = y;
        this.simulation = null;
        this.antDirRand = antDirectionRandomBorder;

        this.size = size;
        this.ants = [ ];
    }

    setAnts(simulation) {
        this.simulation = simulation;
        for (let i = 0; i < this.size; i++) {
            this.ants[i] = new Ant(this.x, this.y, this.simulation, this.antDirRand);
        }
    }

    addAnt() {
        this.ants[this.ants.length] = new Ant(this.x, this.y, this.simulation, this.antDirRand);
    }
}


class Ant {
    constructor(x, y, simulation, randomBorder) {
        this.simulation = simulation;
        this.pheromones = 0.8;
        this.pheromonesDecay = 0;
        this.found = false;
        this.x = x;
        this.y = y;

        this.prevX = null;
        this.prevY = null;
        this.randomBorder = randomBorder;

        this.difX = 1;
        this.difY = 0;
    }

    move(x, y) {
        let pheromones = 0.05;
        this.difX = x - this.x;
        this.difY = y - this.y;

        this.prevX = this.x;
        this.prevY = this.y;

        this.x = x;
        this.y = y;


        if (this.found) {
            this.pheromones -= this.pheromonesDecay;
            this.simulation.sprayPheromones(this.x, this.y, this.pheromones);
            pheromones *= -1;
        }

        if (this.pheromones < 0) {
            this.pheromones = 0.8;
            this.found = false;
        }

        this.simulation.sprayRedPheromones(this.x, this.y, pheromones);
    }

    getLastMoves() {
        return {current: {x: this.x, y: this.y}, previous: {x: this.prevX, y: this.prevY}};
    }

    tryGreenPheromone(moves) {
        let moved = false;
        let changeValue = Math.random();

        moves.forEach(move => {
            let greenPheromone = this.simulation.pheromoneMap[move.y][move.x];
            if (greenPheromone > changeValue) {
                moved = true;

                this.difX = move.x - this.x;
                this.difY = move.y - this.y;
            }
        });

        if (!moved) {
            return undefined;
        }

        let moveX = this.x + this.difX;
        let moveY = this.y + this.difY;

        return { x: moveX, y: moveY };
    }

    getRandomDirection() {
        let moves = shuffle(this.simulation.getPossibleMoves(this));

        let changeValue = Math.random();

        let greenPheromoneMove = this.tryGreenPheromone(moves);
        if (greenPheromoneMove != null) {
            return greenPheromoneMove;
        }

        if (changeValue < this.randomBorder) {
            this.difX = moves[0].x - this.x;
            this.difY = moves[0].y - this.y;
        }

        let moveX = this.x + this.difX;
        let moveY = this.y + this.difY;

        return { x: moveX, y: moveY };
    }

    getRandomDirectionByPheromones() {
        let moves = shuffle(this.simulation.getPossibleMoves(this));
        let moved = false;
        let bestRedMove;
        let bestRedPheromone = -100000000;
        let changeValue = Math.random();

        let greenPheromoneMove = this.tryGreenPheromone(moves);
        if (greenPheromoneMove != null) {
            return greenPheromoneMove;
        }

        moves.forEach(move => {
            let redPheromone = this.simulation.redPheromoneMap[move.y][move.x];
            if (redPheromone > changeValue) {
                moved = true;

                this.difX = move.x - this.x;
                this.difY = move.y - this.y;
            }

            if (redPheromone > bestRedPheromone) {
                bestRedMove = move;
                bestRedPheromone = redPheromone;
            }
        });

        if (!moved && bestRedMove != null) {
            this.difX = bestRedMove.x - this.x;
            this.difY = bestRedMove.y - this.y;
        }

        let moveX = this.x + this.difX;
        let moveY = this.y + this.difY;

        return { x: moveX, y: moveY };
    }
}
