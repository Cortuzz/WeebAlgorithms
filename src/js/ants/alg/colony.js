class Colony {
    constructor(x, y, size, maxSize, antSpeed, liberty, antMoveCooldown, dyingThreshold,
                visionDistance, visionAngle, visionStep) {
        this.x = x;
        this.y = y;
        this.simulation = null;

        this.antSpeed = antSpeed;
        this.threshold = dyingThreshold;
        this.moveCooldown = antMoveCooldown;
        this.liberty = liberty;

        this.visionDistance = visionDistance;
        this.visionAngle = visionAngle;
        this.visionStep = visionStep;

        this.size = size;
        this.maxSize = maxSize;
        this.increasingPopulation = false;

        this.ants = [ ];
    }

    setAnts(simulation) {
        this.simulation = simulation;
        for (let i = 0; i < this.size; i++) {
            this.addAnt();
        }
    }

    addAnt() {
        if (this.ants.length > this.maxSize || this.increasingPopulation) {
            return;
        }
        let ant = new Ant(this.x, this.y, this.simulation, this.antSpeed, this.moveCooldown, this.liberty,
            this.visionDistance, this.visionAngle, this.visionStep);
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
