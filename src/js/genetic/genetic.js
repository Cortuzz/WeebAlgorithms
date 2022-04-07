let totalPopulation;
let numGeneration;
let numBest;
let population ;
let bestGene;

function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;

    return arr.slice();
}

function shuffle(arr) {
    for (let i = 0; i < 10000; i++) {
        let index1 = Math.floor(Math.random() * arr.length);
        let index2 = index1;

        while (index2 == index1) {
            index2 = Math.floor(Math.random() * arr.length);
        }

        arr = swap(arr, index1, index2);
    }

    return arr.slice();
}

function createStructure(individ, fitness) {
    return {
        individ: individ,
        fitness: fitness,
    };
}

function createFirstGeneration() {
    let newPopulation = [];
    let order = []

    for (let i = 0; i < cities.length; i++) {
        order.push(i);
    }

    for (let i = 0; i < totalPopulation; i++) {
        let copyOfOrder = order.slice();
        copyOfOrder = shuffle(copyOfOrder);
        newPopulation[i] = createStructure(copyOfOrder, getCurrentDistance(copyOfOrder));

        if (newPopulation[i].fitness < bestGene.fitness) {
            bestGene = newPopulation[i];
        }
    }
    return newPopulation.slice();
}

async function geneticAlg() {
    totalPopulation = cities.length;
    numGeneration = 1;
    numBest = 1;

    population = [];

    bestGene = {
        individ: [],
        fitness: Infinity
    };

    population = createFirstGeneration();
    renewCanvas();
    drawLines(bestGene.individ);
    drawPoints();

    while (numGeneration - numBest <= 1000) {
        await sleep(1);
        population = createNextGeneration();
        numGeneration++;

        if (population[0].fitness < bestGene.fitness) {
            bestGene = population[0];
            numBest = numGeneration;
            renewCanvas();
            drawLines(bestGene.individ, 2);
            drawPoints();
            await delay(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
        }
        else if (!bestView) {
            renewCanvas();
            drawLines(bestGene.individ, 3);
            drawLines(population[0].individ, 1);
            drawPoints();
            await delay(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
        }
    }

    if (!bestView) {
        renewCanvas();
        drawLines(bestGene.individ, 2);
        drawPoints();
        await delay(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
    }

    running = false;
    window.log.textContent = `Минимальная длина пути равна ${bestGene.fitness.toFixed(2)}`;
    window.log_block.style.borderColor = "forestgreen";
    await sleep(3000);
    window.log.textContent = DEFAULT_LOG_TEXT;
    window.log_block.style.borderColor = DEFAULT_LOG_COLOR;
}

function delay(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout))
}

