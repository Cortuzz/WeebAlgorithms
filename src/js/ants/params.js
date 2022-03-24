window.changePopulation.addEventListener("input", e =>
{ colonySize = +e.target.value; window.populationView.textContent = colonySize; });

window.changeGreed.addEventListener("input", e =>
{ greed = +e.target.value; window.greedView.textContent = greed; });

window.changeGregariousness.addEventListener("input", e =>
{ gregariousness = +e.target.value; window.gregariousnessView.textContent = gregariousness; });

window.changeAntSpeed.addEventListener("input", e =>
{ speed = +e.target.value; window.speedView.textContent = speed; });

window.changePheromoneDecay.addEventListener("input", e =>
{ pheromoneMultiplier = +e.target.value; window.pheromoneDecayView.textContent = pheromoneMultiplier; });

window.changeRedPheromoneDecay.addEventListener("input", e =>
{ redPheromoneMultiplier = +e.target.value; window.redPheromoneDecayView.textContent = redPheromoneMultiplier; });

window.changeDecay.addEventListener("input", e =>
{ decay = +e.target.value / 100; window.decayView.textContent = (100 * decay).toFixed(2) + '%'; });

