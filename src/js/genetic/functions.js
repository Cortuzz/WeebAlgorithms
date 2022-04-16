function getDistanceBetweenCities(city1, city2) {
    return Math.sqrt(Math.pow(parseInt(city1.x) - parseInt(city2.x), 2) +
        Math.pow(parseInt(city1.y) - parseInt(city2.y), 2));
}

function getCurrentDistance(order) {
    let sum = 0;

    for (let i = 0; i < order.length - 1; i++) {
        sum += getDistanceBetweenCities(cities[order[i]], cities[order[i + 1]]);
    }
    sum += getDistanceBetweenCities(cities[order[order.length - 1]], cities[order[0]]);

    return sum;
}

function createNextGeneration() {
    let newPopulation = [ ];

    for (let i = 0; i < totalPopulation - 1; i++) {
        for (let j = i + 1; j < totalPopulation; j++) {
            let parent1 = population[i].individ;
            let parent2 = population[j].individ;
            let child = crossOver(parent1, parent2);
            if (Math.random() <= renderMutation) {
                child = mutate(child);
            }
            newPopulation.push( { individ: child.slice(), fitness: getCurrentDistance(child) } );
        }
    }

    population = population.concat(newPopulation);
    population.sort(function (a, b) { return (a.fitness > b.fitness) ? 1:-1 });
    population.splice(totalPopulation);
}

function crossOver(parent1, parent2) {
    let child;
    let index1 = Math.floor(Math.random() * (parent1.length - 1));
    let index2 = Math.floor(Math.random() * (parent1.length - (index1 - 1)) + (index1 + 1));
    child = parent1.slice(index1, index2 + 1);

    for (let num of parent2) {
        if (!child.includes(num)) {
            child.push(num);
        }
    }
    return child;
}

function mutate(arr) {
    let index1 = Math.floor(Math.random() * (arr.length - 1));
    let index2 = Math.floor(Math.random() * (arr.length - (index1 + 1)) + (index1 + 1));
    let mid = Math.floor((Math.abs(index1 - index2) + 1) / 2);

    for (let i = 0; i < mid; i++) {
        arr = swap(arr, index1 + i, index2 - i);
    }
    return arr;
}
