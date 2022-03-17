function randomElement(array) {
    return array[randomIndex(array)];
}

function randomIndex(array) {
    return Math.floor(Math.random() * array.length);
}


class AntFinder {
    constructor(points, size, sizeMultiplier, greed, gregariousness, spray, decay, attractionMultiplier) {
        this.bestDistance = Infinity;
        this.points = points;
        this.size = size;
        this.greed = greed;
        this.gregariousness = gregariousness;

        this.bestAnt = null;

        this.pheromonesSpraying = spray;
        this.pheromonesDecay = decay;
        this.attractionMultiplier = attractionMultiplier;

        if (size == null) {
            this.size = sizeMultiplier * this.points.length;
        }

        this.ants = [ ];
        this.edges = [ ];

        for (let i = 0; i < this.points.length; i++) {
            this.edges[i] = [ ];
            for (let j = 0; j < this.points.length; j++) {
                let distance = this.getDistance(points[i], points[j]);
                this.edges[i][j] = { distance: distance, attraction: this.attractionMultiplier / distance, pheromones: 0.5 };
            }
        }
    }

    run() {
        let ant = { edges: [ ], path: [ ], distance: Infinity };

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
            updatedAnt = this.updateAnt(currentPoint, ant);
            let index = this.randomMove(ant);

            currentPoint = updatedAnt.edges[index].index;
            updatedAnt.path.push(currentPoint);
            updatedAnt.edges.splice(index,1);
        }
        updatedAnt.path.push(ant.path[0]);
        this.ants.push(updatedAnt);

        return this.sprayPheromones(updatedAnt);
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

    updateAnt(index, ant) {
        let total = 0;

        for (let i = 0; i < ant.edges.length; i++)
        {
            let pheromonesValue = this.edges[index][ant.edges[i].index].pheromones;
            let distanceValue = this.edges[index][ant.edges[i].index].attraction;
            total += Math.pow(pheromonesValue, this.greed) * Math.pow(distanceValue, this.gregariousness);
        }

        for (let i = 0; i < ant.edges.length; i++)
        {
            let pheromonesValue = this.edges[index][ant.edges[i].index].pheromones;
            let distanceValue = this.edges[index][ant.edges[i].index].attraction;

            let value = Math.pow(pheromonesValue, this.greed) * Math.pow(distanceValue, this.gregariousness);
            ant.edges[i].probability = value / total;
        }

        return ant;
    }

    getDistance(point1, point2) {
        return (Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2));
    }

    sprayPheromones(ant) {
        let distance = 0;
        for (let j = 0; j < this.points.length; j++)
        {
            let first = ant.path[j];
            let second = ant.path[j + 1];

            distance += this.edges[first][second].distance;
        }

        if (distance < this.bestDistance)
        {
            this.bestDistance = distance;
            this.bestAnt = ant;
        }

        for (let j = 0; j < this.points.length; j++)
        {
            let first = ant.path[j];
            let second = ant.path[j + 1];
            if (first !== second)
            {
                this.edges[first][second].pheromones += this.pheromonesSpraying / distance;
                this.edges[second][first].pheromones += this.pheromonesSpraying / distance;
            }
        }
        ant.distance = distance;
        return ant;
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

    getBestDistance() {
        return this.bestAnt.distance;
    }

    getEdges() {
        return this.edges;
    }

    getBestPath() {
        return this.bestAnt.path;
    }
}
