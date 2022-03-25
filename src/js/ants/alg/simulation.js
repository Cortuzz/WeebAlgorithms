const EMPTY = -1, BORDER = -2, COLONY = -3;


class AntsSimulation {
    constructor(field, width, height, colony, redDecay, greenDecay, densityDecay) {
        this.width = width;
        this.height = height;
        this.field = field;

        this.redDecay = redDecay;
        this.greenDecay = greenDecay;
        this.densityDecay = densityDecay;

        this.increasingPheromones = false;

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
        this.colony.addAnt();
    }
}
