class Ant {
    constructor(x, y, simulation, speed, moveCooldown, liberty, visionDistance, visionAngle, step) {
        this.moveTimer = new Cooldown(moveCooldown);
        this.simulation = simulation;
        this.speed = speed;

        this.x = x;
        this.y = y;

        this.decayedPheromones = 0;
        this.foodFinding = true;
        this.liberty = liberty;
        this.pheromoneValue = 1;

        this.drawingRays = false;
        this.rays = [ ];
        this.visionDistance = visionDistance;
        this.visionAngle = visionAngle;
        this.visionAngleStep = step * this.visionAngle;

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
        this.angle += Math.PI;
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
        this.angle += Math.PI;
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
        this.clearRays();
        let angle = this.angle - this.visionAngle / 2;
        let endAngle = angle + this.visionAngle;

        let valuablePointsAngles = [ ];
        let bestAngles = [ ];
        let bestPheromones = 0;
        this.rays = [ ];

        for (angle; angle <= endAngle; angle += this.visionAngleStep) {
            if (this.liberty > Math.random()) {
                return angle;
            }

            for (let distance = 1; distance < this.visionDistance; distance++) {
                let x = Math.floor(this.x + distance * this.speed * Math.cos(angle));
                let y = Math.floor(this.y + distance * this.speed * Math.sin(angle));
                if (this.checkCollision(x, y)) {
                    break;
                }

                let colonyCollision = this.simulation.checkColony(x, y);
                let foodCollision = this.simulation.checkFood(x, y);

                if (colonyCollision && !this.foodFinding || foodCollision && this.foodFinding) {
                    valuablePointsAngles.push(angle);
                    continue;
                }

                if (this.drawingRays && !colonyCollision && !foodCollision) {
                    this.rays.push( { x, y } );
                    drawCircle(x, y, 1, undefined, "black");
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
            this.angle += Math.PI;
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

    clearRays() {
        this.rays.forEach(ray => {
            drawCircle(ray.x, ray.y, 2, undefined, "aliceblue");
        });
    }
}
