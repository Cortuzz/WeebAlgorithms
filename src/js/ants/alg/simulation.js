const EMPTY = -1, BORDER = -2, COLONY = -3;


class AntsSimulation {
    constructor(field, width, height, colonies, redDecay, greenDecay, densityDecay) {
        this.width = width;
        this.height = height;
        this.field = field;
        this.antsField = [ ];

        this.redDecay = redDecay;
        this.greenDecay = greenDecay;
        this.densityDecay = densityDecay;

        this.colonies = colonies;

        for (let i = 0; i < height; i++) {
            this.antsField[i] = [ ];
            for (let j = 0; j < width; j++) {
                this.antsField[i][j] = [ ];
            }
        }
    }

    addAntToField(x, y, ant) {
        this.antsField[y][x].push(ant);
    }

    removeAntFromField(x, y, ant) {
        let index = this.antsField[y][x].find(a => a === ant);
        if (index) {
            this.antsField[y][x].splice(index, 1);
        }
    }

    updateField(points) {
        points.forEach(point => {
            this.field[point.y][point.x].value = point.value;
        });
    }

    getAntsOnField(x, y) {
        return this.antsField[y][x];
    }

    checkEnemy(x, y, index) {
        let flag = false;

        this.antsField[y][x].forEach(ant => {
           if (ant.colonyIndex !== index) {
               flag = true;
           }
        });
        return flag;
    }

    checkBorder(x, y) {
        return this.field[y][x].value === BORDER;
    }

    checkFood(x, y) {
        return this.field[y][x].value > 0;
    }

    checkColony(x, y, index) {
        return this.field[y][x].value === COLONY - index;
    }

    increaseDensity(x, y) {
        this.field[y][x].density++;
    }

    getFoodValue(x, y) {
        let value = this.field[y][x].value;
        if (value <= 0) {
            throw Error;
        }
        return value;
    }

    updateColony(index) {
        this.colonies[index].replaceAnts();
        return this.colonies[index];
    }

    update() {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.field[i][j].density *= this.densityDecay;

                this.colonies.forEach(colony => {
                    colony.field[i][j].red *= this.redDecay;
                    colony.field[i][j].green *= this.greenDecay;
                });
            }
        }
    }

    addAnt(index) {
        this.colonies[index].addAnt(Worker);
    }

    getColony(index) {
        return this.colonies[index];
    }
}