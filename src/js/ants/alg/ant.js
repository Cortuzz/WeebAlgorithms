class Ant {
    constructor(colonyIndex, x, y, simulation, speed, moveCooldown, liberty, visionDistance, visionAngle, step) {
        this.hp = 1;
        this.colonyIndex = colonyIndex;
        this.moveTimer = new Cooldown(moveCooldown);
        this.simulation = simulation;
        this.speed = speed;

        this.x = x;
        this.y = y;

        this.liberty = liberty;

        this.visionDistance = visionDistance;
        this.visionAngle = visionAngle;
        this.visionAngleStep = step * this.visionAngle;

        this.angle = 2 * Math.PI * Math.random();
        this.direction = null;
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

        this.simulation.removeAntFromField(Math.floor(this.x), Math.floor(this.y), this);

        this.x = x;
        this.y = y;

        this.simulation.addAntToField(Math.floor(this.x), Math.floor(this.y), this);
        this.simulation.increaseDensity(Math.floor(x), Math.floor(y));
    }

    checkCollision(x, y) {
        let fieldCollision = x < 0 || x >= this.simulation.width || y < 0 || y >= this.simulation.height;
        if (fieldCollision) {
            return true;
        }
        return this.simulation.checkBorder(Math.floor(x), Math.floor(y));
    }
}
