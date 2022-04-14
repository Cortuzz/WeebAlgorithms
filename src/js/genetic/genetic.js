let totalPopulation;
let numGeneration;
let numBest;
let population;
let bestGene;

function createFirstGeneration() {
    let newPopulation = [];
    let order = [];

    for (let i = 0; i < cities.length; i++) {
        order.push(i);
    }

    for (let i = 0; i < totalPopulation; i++) {
        let copyOfOrder = order.slice();
        copyOfOrder = shuffle(copyOfOrder);
        newPopulation[i] = { individ: copyOfOrder, fitness: getCurrentDistance(copyOfOrder) };

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

    bestGene = { individ: [], fitness: Infinity };

    population = createFirstGeneration();
    renewCanvas();
    drawLines(bestGene.individ);
    drawPoints();

    while (numGeneration - numBest < 1000) {
        await sleep(1);
        createNextGeneration();
        numGeneration++;

        if (population[0].fitness < bestGene.fitness) {
            bestGene = population[0];
            numBest = numGeneration;
            renewCanvas();
            drawLines(bestGene.individ, 2);
            drawPoints();
            await sleep(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
        }
        else if (!bestView) {
            renewCanvas();
            drawLines(bestGene.individ, 3);
            drawLines(population[0].individ, 1);
            drawPoints();
            await sleep(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
        }
    }

    if (!bestView) {
        renewCanvas();
        drawLines(bestGene.individ, 2);
        drawPoints();
        await sleep(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
    }

    running = false;
    window.log.textContent = `Минимальная длина пути равна ${bestGene.fitness.toFixed(2)}`;
    window.log_block.style.borderColor = "forestgreen";
    await sleep(3000);
    window.log.textContent = DEFAULT_LOG_TEXT;
    window.log_block.style.borderColor = DEFAULT_LOG_COLOR;
}
