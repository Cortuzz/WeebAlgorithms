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
