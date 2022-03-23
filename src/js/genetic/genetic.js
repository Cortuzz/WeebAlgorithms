let population = [];
let fitness = [];
let bestOrder = []

const totalPopulation = 1000
let shortestDistance = Infinity;

function createFirstGeneration() {
    shortestDistance = Infinity;
    population.slice();
    fitness.slice();
    bestOrder.slice();

    let order = []

    for (let i = 0; i < cities.length; i++) {
        order.push(i);
    }

    for (let i = 0; i < totalPopulation; i++) {
        let copyOfOrder = order.slice();
        population[i] = shuffle(copyOfOrder);
    }
}

async function geneticAlg() {
    createFirstGeneration()

    while(cities.length != 0) {
        renewCanvas()
        calculateFitness();

        for (let i = 0; i < cities.length - 1; i++) {
            drawCircle(cities[i].x, cities[i].y, 10, CIRCLE_COLOR);
            drawLine(cities[bestOrder[i]].x, cities[bestOrder[i]].y, cities[bestOrder[i + 1]].x, cities[bestOrder[i + 1]].y);
        }

        drawCircle(cities[cities.length - 1].x, cities[cities.length - 1].y, 10, CIRCLE_COLOR);

        await delay(100 / renderSpeed ** 4);

        normalizeFitness();
        population = createNextGeneration();

    }
}

function delay(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout))
}

function getCurrentDistance(order) {
    let sum = 0;

    for (let i = 0; i < cities.length - 1; i++) {
        sum += getDistanceBetweenTwoCities(cities[order[i]], cities[order[i + 1]]);
    }

    return sum;
}

function getDistanceBetweenTwoCities(city1, city2) {
    return Math.sqrt(Math.pow(city1.x - city2.x, 2) + Math.pow(city1.y - city2.y, 2));
}

function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function shuffle(arr) {
    for (let i = 0; i < 100; i++) {
        let index1 = Math.floor(Math.random() * arr.length);
        let index2 = Math.floor(Math.random() * arr.length);
        swap(arr, index1, index2)
    }

    return arr;
}