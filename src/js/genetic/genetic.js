let totalPopulation;
let numOfGeneration;
let countBest;
let population;
let bestGene;

function createFirstGeneration() {
    let newPopulation = [ ];
    let order = [ ];

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
    totalPopulation = (autoSize) ? cities.length * renderCoefficientPopulation:renderPopulation;
    numOfGeneration = 1;
    countBest = 0;

    bestGene = { individ: [], fitness: Infinity };

    population = createFirstGeneration();
    renewCanvas();
    drawLines(bestGene.individ, 2, LINE_COLOR);
    drawPoints();

    while (running && numOfGeneration < renderGeneration) {
        await sleep(1);
        createNextGeneration();
        numOfGeneration++;

        if (population[0].fitness < bestGene.fitness) {
            bestGene = population[0];
            countBest++;
            window.best_number.textContent = `${countBest}`;

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

        window.num_iteratin.textContent = `${numOfGeneration}`;
        window.best_path.textContent = `${bestGene.fitness.toFixed(2)}`;
    }

    if (!running) {
        if (tempAdd.length !== 0) {
            cities = cities.concat(tempAdd);
            tempAdd.splice(0);
            await startAlg();
            return;
        } else if (tempRemove.length !== 0) {
            cities.splice(tempRemove[0].index, 1);
            tempRemove.splice(0, 1);
            renewCanvas();
            await startAlg();
        } else {
            cities.splice(0);
            renewCanvas();
        }
    }

    if (!bestView) {
        renewCanvas();
        drawLines(bestGene.individ, 2);
        drawPoints();
        await sleep(renderSpeed < 1 ? 1000 - 100 * (renderSpeed * 10 - 1) : 100 - 10 * (renderSpeed - 1));
    }
    running = false;

    if (cities.length !== 0) {
        window.log.textContent = `Минимальная длина пути равна ${bestGene.fitness.toFixed(2)}`;
        window.log_block.style.borderColor = "forestgreen";
        await sleep(5000);
    }

    window.log.textContent = DEFAULT_LOG_TEXT;
    window.log_block.style.borderColor = DEFAULT_LOG_COLOR;
    window.num_iteratin.textContent = "";
    window.best_path.textContent = "";
    window.best_number.textContent = "";
}
