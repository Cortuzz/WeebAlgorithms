let totalPopulation;
let numOfGeneration;
let numOfBestGene;
let population;
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
    numOfGeneration = 1;
    numOfBestGene = 1;
    population = [];

    bestGene = {
        individ: [],
        fitness: Infinity
    };

    population = createFirstGeneration();
    renewCanvas();
    drawLines(bestGene.individ);
    drawPoints();

    while (numOfGeneration - numOfBestGene < 500) {
        await sleep(1);
        createNextGeneration();
        numOfGeneration++;

        if (population[0].fitness < bestGene.fitness) {
            bestGene = population[0];
            numOfBestGene = numOfGeneration;

            if (bestView) {
                renewCanvas();
                drawLines(bestGene.individ, 2, LINE_COLOR);
                drawPoints();
                await sleep(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
            }
        }

        if (!bestView) {
            renewCanvas();
            for (let i = 1; i < totalPopulation; i++) {
                drawLines(population[i].individ, 1, "#dacb95");
            }
            drawLines(bestGene.individ, 3, LINE_COLOR);
            drawPoints();
            await sleep(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
        }

        console.log(numOfGeneration - numOfBestGene)
        window.log.textContent = `Номер итерации: ${numOfGeneration}`;
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


