const BORDER = -2;
const COLONY = -3;


class AntsSimulation {
    constructor(field, width, height, colony, redDecay, greenDecay, densityDecay) {
        this.width = width;
        this.height = height;
        this.field = field;

        this.redDecay = redDecay;
        this.greenDecay = greenDecay;
        this.densityDecay = densityDecay;

        this.increasingPheromones = false;
        this.maxColonySize = 1000;
        this.increasingPoplation = true;

        this.colony = colony;
    }

    updateField(points) {
        points.forEach(point => {
            this.field[point.y][point.x].value = point.value;
        });
    }

    checkBorder(x, y) {
        return this.field[y][x].value === BORDER;
    }

    checkFood(x, y) {
        return this.field[y][x].value > 0;
    }

    checkColony(x, y) {
        return this.field[y][x].value === COLONY;
    }

    increaseDensity(x, y) {
        this.field[y][x].density++;
    }

    getPheromonesValue(x, y, isGreen) {
        if (isGreen) {
            return this.field[y][x].green;
        }
        return this.field[y][x].red;
    }

    increasePheromonesValue(x, y, value, isGreen) {
        if (isGreen) {
            if (this.increasingPheromones) {
                this.field[y][x].red += value;
            } else if (this.field[y][x].green < value) {
                this.field[y][x].green = value;
            }
            return;
        }

        if (this.increasingPheromones) {
            this.field[y][x].red += value;
        } else if (this.field[y][x].red < value) {
            this.field[y][x].red = value;
        }
    }

    getFoodValue(x, y) {
        let value = this.field[y][x].value;
        if (value <= 0) {
            throw Error;
        }
        return value;
    }

    update() {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.field[i][j].density *= this.densityDecay;
                this.field[i][j].red *= this.redDecay;
                this.field[i][j].green *= this.greenDecay;
            }
        }

        this.colony.replaceAnts();
        return this.colony;
    }

    addAnt() {
        if (this.colony.ants.length > this.maxColonySize && this.increasingPoplation) {
            return;
        }
        this.colony.addAnt();
    }
}


class Colony {
    constructor(x, y, size, antSpeed, liberty, antMoveCooldown, dyingThreshold) {
        this.x = x;
        this.y = y;
        this.simulation = null;

        this.antSpeed = antSpeed;
        this.threshold = dyingThreshold;
        this.moveCooldown = antMoveCooldown;
        this.liberty = liberty;

        this.size = size;
        this.ants = [ ];
    }

    setAnts(simulation) {
        this.simulation = simulation;
        for (let i = 0; i < this.size; i++) {
            this.addAnt();
        }
    }

    addAnt() {
        let ant = new Ant(this.x, this.y, this.simulation, this.antSpeed, this.moveCooldown, this.liberty);
        this.ants.push(ant);
    }

    replaceAnts() {
        for (let i = 0; i < this.ants.length; i++) {
            let ant = this.ants[i];
            if (ant.decayedPheromones > this.threshold) {
                this.ants.splice(i, 1);
                this.addAnt();
            }
        }
    }
}


class Cooldown {
    constructor(threshold) {
        this.value = 0;
        this.threshold = threshold;
    }

    tick() {
        this.value++;
    }

    check() {
        if (this.value >= this.threshold) {
            this.value = 0;
            return true;
        }
        return false;
    }

    tickAndCheck() {
        this.tick();
        return this.check();
    }
}


class Ant {
    constructor(x, y, simulation, speed, moveCooldown, liberty) {
        this.moveTimer = new Cooldown(moveCooldown);
        this.simulation = simulation;
        this.speed = speed;

        this.x = x;
        this.y = y;

        this.decayedPheromones = 0;
        this.foodFinding = true;
        this.liberty = liberty;
        this.pheromoneValue = 1;

        this.rays = [ ];
        this.visionDistance = 30;
        this.visionAngle = Math.PI;
        this.visionAngleStep = this.visionAngle / 20;

        this.angle = 2 * Math.PI * Math.random();
        this.direction = null;
        this.setDirection();
    }

    // todo: create common function for colony and food
    changeColony() {
        if (this.foodFinding === true) {
            return;
        }
        this.foodFinding = true;
        this.decayedPheromones = 0;
        this.angle += Math.PI //+ (Math.random() - 0.5) * Math.PI / 2; // random ?
        this.setDirection();
        this.simulation.addAnt();
    }

    changeFood() {
        if (this.foodFinding === false) {
            return;
        }

        this.pheromoneValue = Math.sqrt(this.simulation.getFoodValue(Math.floor(this.x), Math.floor(this.y)) / 50);

        this.foodFinding = false;
        this.decayedPheromones = 0;
        this.angle += Math.PI //+ (Math.random() - 0.5) * Math.PI / 2; // random ?
        this.setDirection();
    }

    setDirection() {
        let x = Math.cos(this.angle);
        let y = Math.sin(this.angle);

        this.direction = { x: x, y: y };
    }

    changeDirection() {
        this.angle = this.findBestAngle();
        this.setDirection();
    }

    findBestAngle() {
        let angle = this.angle - this.visionAngle / 2;
        let endAngle = angle + this.visionAngle;

        let valuablePointsAngles = [ ];
        let bestAngles = [ ];
        let bestPheromones = 0;
        this.rays = [ ];

        for (angle; angle <= endAngle; angle += this.visionAngleStep) {
            this.rays.push(angle);
            if (this.liberty > Math.random()) {
                return angle;
            }

            for (let distance = 1; distance < this.visionDistance; distance++) {
                let x = Math.floor(this.x + distance * this.speed * Math.cos(angle));
                let y = Math.floor(this.y + distance * this.speed * Math.sin(angle));
                if (this.checkCollision(x, y)) {
                    break;
                }

                if (this.simulation.checkColony(x, y) && !this.foodFinding) {
                    valuablePointsAngles.push(angle);
                    continue;
                }

                if (this.simulation.checkFood(x, y) && this.foodFinding) {
                    valuablePointsAngles.push(angle);
                    continue;
                }

                let pheromones = this.simulation.getPheromonesValue(x, y, this.foodFinding);

                if (pheromones >= bestPheromones) {
                    if (pheromones === bestPheromones && pheromones !== 0) {
                        bestAngles.push(angle);
                    } else {
                        bestAngles = [ angle ];
                    }

                    bestPheromones = pheromones;
                }
            }
        }

        if (valuablePointsAngles.length > 0) {
            return valuablePointsAngles[Math.floor(valuablePointsAngles.length / 2)];
        }

        if (bestPheromones > 0) {
            return bestAngles[Math.floor(bestAngles.length / 2)];
        }
        return this.angle;
    }

    move() {
        if (this.moveTimer.tickAndCheck()) {
            this.changeDirection();
        }

        let x = this.x + this.speed * this.direction.x;
        let y = this.y + this.speed * this.direction.y;

        if (this.checkCollision(x, y)) {
            this.angle += Math.PI; // + (Math.random() - 0.5) * Math.PI / 2;
            this.setDirection();
            return;
        }

        this.x = x;
        this.y = y;

        this.simulation.increaseDensity(Math.floor(x), Math.floor(y));
        if (this.simulation.checkFood(Math.floor(x), Math.floor(y))) {
            this.changeFood();
        }
        if (this.simulation.checkColony(Math.floor(x), Math.floor(y))) {
            this.changeColony();
        }
    }

    checkCollision(x, y) {
        let fieldCollision = x < 0 || x >= this.simulation.width || y < 0 || y >= this.simulation.height;
        if (fieldCollision) {
            return true;
        }
        return this.simulation.checkBorder(Math.floor(x), Math.floor(y));
    }

    sprayPheromones() {
        this.decayedPheromones += 0.1;
        let value = 8000 * Math.exp(-0.05 * this.decayedPheromones);
        if (!this.foodFinding) {
            value *= this.pheromoneValue;
        }

        this.simulation.increasePheromonesValue(Math.floor(this.x), Math.floor(this.y), value, !this.foodFinding);
    }

    async drawRays() {
        this.rays.forEach(ray => {
            let x = Math.floor(this.x + this.visionDistance * this.speed * Math.cos(ray));
            let y = Math.floor(this.y + this.visionDistance * this.speed * Math.sin(ray));
            drawStroke(this.x, this.y, x, y, "black", 1);
        });

        await sleep(20);

        this.rays.forEach(ray => {
            let x = Math.floor(this.x + this.visionDistance * this.speed * Math.cos(ray));
            let y = Math.floor(this.y + this.visionDistance * this.speed * Math.sin(ray));
            drawStroke(this.x, this.y, x, y, "aliceblue", 3);
        });
    }
}

function drawStroke(x1, y1, x2, y2, color, width) {
    let width_ = ctx.lineWidth;
    let color_ = ctx.strokeStyle;

    ctx.lineWidth = width;
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();

    ctx.lineWidth = width_;
    ctx.strokeStyle = color_;
}
