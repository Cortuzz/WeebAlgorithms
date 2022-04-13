class Colony {
    constructor(field, index, x, y, size, maxSize, antSpeed, liberty, antMoveCooldown, dyingThreshold,
                visionDistance, visionAngle, visionStep, initialPheromones, pheromonesDecaying) {
        this.field = field;
        this.index = index;
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
        this.increasingPheromones = false;

        this.initialPheromones = initialPheromones;
        this.pheromonesDecaying = pheromonesDecaying;

        this.boostTimer = new Cooldown(500);
        this.boosted = false;

        this.ants = [ ];
    }

    setAnts(simulation) {
        this.simulation = simulation;
        if (this.simulation.colonies.length === 1) {
            for (let i = 0; i < this.size; i++) {
                this.addAnt(Worker);
            }
            return;
        }

        for (let i = 0; i < this.size / 8; i++) {
            this.addAnt(Fighter);
        }
        for (let i = 0; i < 7 * this.size / 8; i++) {
            this.addAnt(Worker);
        }
    }

    addAnt(AntType) {
        if (this.ants.length >= this.maxSize || this.increasingPopulation) {
            return;
        }
        let ant;

        if (AntType === Worker) {
            ant = new AntType(this.index, this.x, this.y, this.simulation, this.antSpeed, this.moveCooldown,
                this.liberty, this.visionDistance, this.visionAngle, this.visionStep,
                this.initialPheromones, this.pheromonesDecaying);
        } else {
            ant = new AntType(this.index, this.x, this.y, this.simulation, this.antSpeed, this.moveCooldown,
                this.liberty, this.visionDistance, this.visionAngle, this.visionStep);
        }

        this.ants.push(ant);
    }

    replaceAnts() {
        for (let i = 0; i < this.ants.length; i++) {
            let ant = this.ants[i];
            if (ant.decayedPheromones > this.threshold || ant.hp <= 0) {
                this.ants.splice(i, 1);

                if (ant.hp > 0) {
                    this.addAnt(Worker);
                }
            }
        }
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
}
