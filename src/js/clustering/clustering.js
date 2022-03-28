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

//K-Means
function recalculateMean(points, currClass) {
    let class_size = 0, total_x = 0, total_y = 0;
    for (let i = 0; i < points.length; i++) {
        if (points[i].class === currClass) {
            class_size++;
            total_x += points[i].x;
            total_y += points[i].y;
        }
    }
    let new_mean = new Point(total_x / class_size, total_y / class_size);
    new_mean.class = currClass;
    return new_mean;
}

function kMeans(num_classes, points, iterations) {
    points = shuffle(points);
    let means = new Array(num_classes);
    for (let i = 0; i < num_classes; i++) {
        points[i].class = i;
        means[i] = points[i];
    }

    for (let itr = 0; itr < iterations; itr++) {
        for (let i = 0; i < points.length; i++) {
            let minDist = l2normSquared(points[i], means[0]);
            let minClass = 0;
            for (let j = 1; j < num_classes; j++) {
                if (l2normSquared(points[i], means[j]) < minDist) {
                    minDist = l2normSquared(points[i], means[j]);
                    minClass = j;
                }
            }
            points[i].class = minClass;
        }

        for (let i = 0; i < num_classes; i++) {
            means[i] = recalculateMean(points, i);
        }
    }
    return {points, means};
}

//Mean-Shift clustering
class slidingCircle {
    constructor(x, y, radius) {
        this.center = new Point(x, y);
        this.radius = radius;
        this.pointCount = 0;
    }
}

const c = 2e-5;
const eps = 2e-5;

async function convertToMeans(circles) {
    let result = [];
    for (let i = 0; i < circles.length; i++) {
        let isNewClass = true;
        for (let j = 0; j < circles.length; j++) {
            if (l2normSquared(circles[i].center, circles[j].center) <= 4 * circles[i].radius ** 2 &&
                circles[i].pointCount < circles[j].pointCount) {
                isNewClass = false;
            }
        }
        if (isNewClass === true) {
            for (let j = 0; j < result.length; j++) {
                if (l2normSquared(circles[i].center, result[j].center) <= 4 * circles[i].radius ** 2 &&
                    circles[i].pointCount <= result[j].pointCount) {
                    isNewClass = false;
                }
            }
            if (isNewClass === true) {
                result.push(circles[i]);
            }
        }
    }   
    redrawInitial();
    drawSlidingCircles(result);
    await sleep(1000);
    for (let i = 0; i < result.length; i++) {
        let point = result[i].center;
        point.class = i;
        result[i] = point;
    }
    return result;
}

function recalculateCenter(circle, points) {
    let newCenter = new Point(0, 0);
    let kernelSum = 0;
    let pointCounter = 0;
    for (let i = 0; i < points.length; i++) {
        if (l2normSquared(circle.center, points[i]) <= circle.radius ** 2) {
            let kernel = Math.exp(-c * l2normSquared(circle.center, points[i]));
            newCenter.x += kernel * points[i].x;
            newCenter.y += kernel * points[i].y;
            kernelSum += kernel;
            pointCounter++;
        }
    }
    if (kernelSum === 0) {
        return [null, pointCounter];
    }
    newCenter.x /= kernelSum;
    newCenter.y /= kernelSum;
    return [newCenter, pointCounter];
}

async function meanShiftClustering(points, radius) {
    let circles = [];
    for (let i = 5; i < width; i += width / 10) {
        for (let j = 5; j < height; j += width / 10) {
            let currCircle = new slidingCircle(i, j, parseFloat(radius));
            circles.push(currCircle);
        }
    }
    let stopCondition = false;
    while (stopCondition !== true) {
        redrawInitial();
        stopCondition = true;
        for (let i = 0; i < circles.length; i++) {
            let res = recalculateCenter(circles[i], points);
            let newCenter = res[0];
            let pointCounter = res[1];
            if (newCenter != null) {
                stopCondition = stopCondition && (Math.sqrt(l2normSquared(circles[i].center, newCenter)) <= eps);
            }
            circles[i].center = newCenter;
            circles[i].pointCount = pointCounter;
        }
        circles = circles.filter(function (circle) {
            return circle.center != null;
        });
        drawSlidingCircles(circles);
        await sleep(90);
    }
    let means = await convertToMeans(circles);
    for (let i = 0; i < points.length; i++) {
        let minDist = l2normSquared(points[i], means[0]);
        let minClass = 0;
        for (let j = 1; j < means.length; j++) {
            if (l2normSquared(points[i], means[j]) < minDist) {
                minDist = l2normSquared(points[i], means[j]);
                minClass = j;
            }
        }
        points[i].class = minClass;
    }
    return {points, means};
}
