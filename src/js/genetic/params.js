window.addPointButton.addEventListener("click", function () {
    currentState = "add";
    window.current_action_view.textContent = `${window.addPointButton.textContent}`;
});

window.removePointButton.addEventListener("click", function () {
    currentState = "remove";
    window.current_action_view.textContent = `${window.removePointButton.textContent}`;
});

window.changePopulationSizeInput.addEventListener("input", e =>
{ renderPopulation = +e.target.value; window.populationSizeView.textContent = renderPopulation; });

window.changeAutoPopulationSizeInput.addEventListener("input", e =>
{ renderCoefficientPopulation = +e.target.value; window.autoPopulationSizeView.textContent = renderCoefficientPopulation; });

window.changeMutationInput.addEventListener("input", e =>
{ renderMutation = +e.target.value; window.mutationView.textContent = renderMutation; });

window.changeGenerationSizeInput.addEventListener("input", e =>
{ renderGeneration = +e.target.value; window.generationSizeView.textContent = renderGeneration; });

window.changeTotalCitiesInput.addEventListener("input", e =>
{ renderTotalCities = +e.target.value; window.totalCitiesView.textContent = renderTotalCities; });

window.changeSpeedInput.addEventListener("input", e =>
{ renderSpeed = +e.target.value; window.speedView.textContent = renderSpeed; });

window.bestViewChecker.addEventListener("click", e => { bestView = window.bestViewChecker.checked; });

const WIDTH = document.getElementById("canv").offsetWidth;
const HEIGHT = document.getElementById("canv").offsetHeight;

const BACKGROUND_COLOR = "aliceblue";
const CIRCLE_COLOR = "gray";
const LINE_COLOR = "#d5a527";
const DEFAULT_LOG_COLOR = "coral";
const DEFAULT_LOG_TEXT = "Алгоритм не запущен";

const canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx = canvas.getContext('2d');

let currentState = "";
let renderTotalCities = 20;
let renderSpeed = 1;
let renderPopulation = 100;
let renderCoefficientPopulation = 1;
let renderMutation = 100;
let renderGeneration = 5000;
let bestView = true;
let autoSize = true;
let running = false;