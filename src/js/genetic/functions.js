function calculateFitness() {
    for (let i = 0; i < totalPopulation; i++) {
        let distance = getCurrentDistance(population[i]);

        if (distance < shortestDistance) {
            shortestDistance = distance;
            bestOrder = population[i];
            console.log(shortestDistance);
        }

        fitness[i] = 1 / (distance + 1);
    }
}

function normalizeFitness() {
    let sum = 0;

    for (let i = 0; i < totalPopulation; i++) {
        sum += fitness[i];
    }

    for (let i = 0; i < totalPopulation; i++) {
        fitness[i] /= sum;
    }
}

function createNextGeneration() {
    let newPopulation = [];

    for (let i = 0; i < totalPopulation; i++) {
        let order = pickRandom(population, fitness);
        mutate(order);
        newPopulation[i] = order;
    }

    return newPopulation;
}

function pickRandom(arr, probability) {
    let index = 0;
    let randomNumber = Math.random();

    while (randomNumber > 0) {
        randomNumber -= probability[index];
        index++;
    }

    index--;

    return arr[index].slice();
}

function mutate(arr) {
    let index1 = Math.floor(Math.random() * arr.length);
    let index2 = Math.floor(Math.random() * arr.length);
    swap(arr, arr[index1], arr[index2]);
}