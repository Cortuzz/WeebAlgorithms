class Fighter extends Ant {
    constructor(colonyIndex, x, y, simulation, speed, moveCooldown, liberty, visionDistance, visionAngle, step) {
        super(colonyIndex, x, y, simulation, speed, moveCooldown, liberty, visionDistance, visionAngle, step);

        this.inFight = false;
    }

    fight() {
        if (!this.inFight) {
            return;
        }

        for (let distance = 1; distance < 5; distance++) {
            let x = Math.floor(this.x + distance * Math.cos(this.angle));
            let y = Math.floor(this.y + distance * Math.sin(this.angle));

            if (this.checkCollision(x, y)) {
                break;
            }

            if (this.simulation.checkEnemy(x, y, this.colonyIndex)) {
                let ants = this.simulation.getAntsOnField(x, y);
                ants.forEach(ant => {
                   if (ant.colonyIndex !== this.colonyIndex) {
                       ant.hp -= 1;
                   }
                });
            }
        }
    }

    findBestAngle() {
        let angle = this.angle - this.visionAngle / 2;
        let endAngle = angle + this.visionAngle;

        let valuablePointsAngles = [ ];

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
                let enemyCollision = this.simulation.checkEnemy(x, y, this.colonyIndex);

                if (enemyCollision) {
                    valuablePointsAngles.push(angle);
                }
            }
        }

        if (valuablePointsAngles.length > 0) {
            this.inFight = true;
            return valuablePointsAngles[Math.floor(valuablePointsAngles.length / 2)];
        }

        this.inFight = false;
        return this.angle;
    }
}
