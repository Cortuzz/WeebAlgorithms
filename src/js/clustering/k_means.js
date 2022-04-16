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
    return { points, means };
}
