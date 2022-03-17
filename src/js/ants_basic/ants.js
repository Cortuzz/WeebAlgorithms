function randomElement(array) {
    return array[randomIndex(array)];
}

function randomIndex(array) {
    return Math.floor(Math.random() * array.length);
}


class AntFinder {
    constructor(points, size, greed, gregariousness) {
        this.bestDistance = Infinity;
        this.points = points;
        this.size = size;
        this.greed = greed;
        this.gregariousness = gregariousness;

        this.bestAnt = null;

        this.pheromonesSpraying = 240;
        this.pheromonesDecay = 0.7;

        if (size == null) {
            this.size = 2 * this.points.length;
        }

        this.ants = [ ];
        this.edges = [ ];

        for (let i = 0; i < this.points.length; i++) {
            this.edges[i] = [ ];
            for (let j = 0; j < this.points.length; j++) {
                let distance = this.getDistance(points[i], points[j]);
                this.edges[i][j] = { distance: distance, attraction: 75 / distance, pheromones: 0.5 };
            }
        }
    }

    run() {
        this.ants = [ ];
        for (let i = 0; i < this.size; i++)
        {
            const ant = { edges: [ ], path: [ ] };

            let currentPoint = randomIndex(this.points);
            ant.path.push(currentPoint);

            for (let j = 0; j < this.points.length; j++) {
                let edge = this.edges[currentPoint][j];
                let way = { index: j, distance: edge.distance, probability: edge.attraction };
                ant.edges.push(way);
            }
            ant.edges.splice(currentPoint, 1);
            let updatedAnt = null;

            while (ant.edges.length !== 0) {
                let sum = this.getSum(currentPoint, ant);
                updatedAnt = this.updateAnt(currentPoint, ant, sum);
                let index = this.randomMove(ant);

                currentPoint = updatedAnt.edges[index].index;
                updatedAnt.path.push(currentPoint);
                updatedAnt.edges.splice(index,1);
            }
            updatedAnt.path.push(ant.path[0]);
            this.ants.push(updatedAnt);
        }
    }

    randomMove(ant) {
        let random = Math.random();
        let sum = 0;

        for (let edge of ant.edges) {
            sum += edge.probability;

            if (sum > random) {
                return ant.edges.indexOf(edge);
            }
        }
    }

    getSum(index, ant) {
        let total = 0;

        for (let i = 0; i < ant.edges.length; i++)
        {
            let pheromonesValue = this.edges[index][ant.edges[i].index].pheromones;
            let distanceValue = this.edges[index][ant.edges[i].index].attraction;
            total += Math.pow(pheromonesValue, this.greed) * Math.pow(distanceValue, this.gregariousness);
        }

        return total;
    }

    updateAnt(index, ant, ratio) {
        for (let i = 0; i < ant.edges.length; i++)
        {
            let pheromonesValue = this.edges[index][ant.edges[i].index].pheromones;
            let distanceValue = this.edges[index][ant.edges[i].index].attraction;

            let value = Math.pow(pheromonesValue, this.greed) * Math.pow(distanceValue, this.gregariousness);
            ant.edges[i].probability = value / ratio;
        }

        return ant;
    }

    getDistance(point1, point2) {
        return (Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2));
    }

    sprayPheromones() {
        let distance = 0;
        for (let i = 0; i < this.size; i++)
        {
            for (let j = 0; j < this.points.length; j++)
            {
                let first = this.ants[i].path[j];
                let second = this.ants[i].path[j + 1];

                distance += this.edges[first][second].distance;
            }

            if (distance < this.bestDistance)
            {
                this.bestDistance = distance;
                this.bestAnt = this.ants[i];
            }

            for (let j = 0; j < this.points.length; j++)
            {
                let first = this.ants[i].path[j];
                let second = this.ants[i].path[j + 1];
                if (first !== second)
                {
                    this.edges[first][second].pheromones += this.pheromonesSpraying / distance;
                    this.edges[second][first].pheromones += this.pheromonesSpraying / distance;
                }
            }
            distance = 0;
        }
    }

    updatePheromones() {
        for (let i = 0; i < this.points.length; i++)
        {
            for (let j = 0; j < this.points.length; j++)
            {
                this.edges[i][j].pheromones *= this.pheromonesDecay;
            }
        }
    }

    getBestPath() {
        return this.bestAnt.path;
    }
}
