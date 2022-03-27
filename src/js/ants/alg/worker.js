class Worker extends Ant {
    constructor(colonyIndex, x, y, simulation, speed, moveCooldown, liberty, visionDistance, visionAngle, step,
                initialPheromones, pheromonesDecaying) {
        super(colonyIndex, x, y, simulation, speed, moveCooldown, liberty, visionDistance, visionAngle, step);

        this.initialPheromones = initialPheromones;
        this.pheromonesDecaying = pheromonesDecaying;

        this.decayedPheromones = 0;
        this.foodFinding = true;
        this.pheromoneValue = 1;

        this.drawingRays = false;
        this.rays = [ ];
    }

    changeColony() {
        if (this.foodFinding === true) {
            return;
        }
        this.foodFinding = true;
        this.decayedPheromones = 0;
        this.angle += Math.PI;
        this.setDirection();
        this.simulation.addAnt(this.colonyIndex);
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

                let colonyCollision = this.simulation.checkColony(x, y, this.colonyIndex);
                let foodCollision = this.simulation.checkFood(x, y);

                if (colonyCollision && !this.foodFinding || foodCollision && this.foodFinding) {
                    valuablePointsAngles.push(angle);
                    continue;
                }

                if (this.drawingRays && !colonyCollision && !foodCollision) {
                    this.rays.push( { x, y } );
                    drawCircle(x, y, 1, undefined, "black");
                }

                let pheromones = this.simulation.getColony(this.colonyIndex).getPheromonesValue(x, y, this.foodFinding);

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

        this.decayedPheromones = this.simulation.colonies[this.colonyIndex].threshold + 1;
        return this.angle;
    }

    checkPermanents() {
        if (this.simulation.checkFood(Math.floor(this.x), Math.floor(this.y))) {
            this.changeFood();
        }
        if (this.simulation.checkColony(Math.floor(this.x), Math.floor(this.y), this.colonyIndex)) {
            this.changeColony();
        }
    }

    sprayPheromones() {
        this.decayedPheromones += this.pheromonesDecaying;
        let value = this.initialPheromones * Math.exp(-0.05 * this.decayedPheromones);
        if (!this.foodFinding) {
            value *= this.pheromoneValue;
        }

        this.simulation.getColony(this.colonyIndex).increasePheromonesValue(Math.floor(this.x), Math.floor(this.y), value, !this.foodFinding);
    }

    clearRays() {
        this.rays.forEach(ray => {
            drawCircle(ray.x, ray.y, 2, undefined, "aliceblue");
        });
    }
}
