const width = 1200;
const height = 800;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.class = null;
    }
}

function l2normSquared(point_a, point_b) {
    return (point_a.x - point_b.x) ** 2 + (point_a.y - point_b.y) ** 2;
}
