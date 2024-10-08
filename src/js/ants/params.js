window.antsViewChecker.addEventListener("click", e =>
{ drawingAnts = window.antsViewChecker.checked; });

window.redPheromoneViewChecker.addEventListener("click", e =>
{ drawingRedPheromones = window.redPheromoneViewChecker.checked; });

window.greenPheromoneViewChecker.addEventListener("click", e =>
{ drawingGreenPheromones = window.greenPheromoneViewChecker.checked; });

window.densityViewChecker.addEventListener("click", e =>
{ drawingDensity = window.densityViewChecker.checked; });

window.changeRedDecay.addEventListener("input", e =>
{ redDecay = +e.target.value; window.redDecayView.textContent = redDecay; });

window.changeGreenDecay.addEventListener("input", e =>
{ greenDecay = +e.target.value; window.greenDecayView.textContent = greenDecay; });

window.changeDensityDecay.addEventListener("input", e =>
{ densityDecay = +e.target.value; window.densityDecayView.textContent = densityDecay; });

window.changeSize.addEventListener("input", e =>
{ colonySize = +e.target.value; window.sizeView.textContent = colonySize; });

window.changeMaxSize.addEventListener("input", e =>
{ maxColonySize = +e.target.value; window.maxSizeView.textContent = maxColonySize; initPopulationCanvas(); });

window.changeAntSpeed.addEventListener("input", e =>
{ speed = +e.target.value; window.speedView.textContent = speed; });

window.changeMoveCooldown.addEventListener("input", e =>
{ moveCooldown = +e.target.value; window.moveCooldownView.textContent = moveCooldown; });

window.changeLiberty.addEventListener("input", e =>
{ liberty = +e.target.value; window.libertyView.textContent = liberty; });

window.changeVisionDistance.addEventListener("input", e =>
{ visionDistance = +e.target.value; window.visionDistanceView.textContent = visionDistance; });

window.changeVisionAngle.addEventListener("input", e =>
{ visionAngle = +e.target.value; window.visionAngleView.textContent = visionAngle; });

window.changeVisionAngleStep.addEventListener("input", e =>
{ visionAngleStep = +e.target.value; window.visionAngleStepView.textContent = visionAngleStep; });

window.changeInitialPheromones.addEventListener("input", e =>
{ initialPheromones = +e.target.value; window.initialPheromonesView.textContent = initialPheromones; });

window.changeDecayingPheromones.addEventListener("input", e =>
{ decayingPheromones = +e.target.value; window.decayingPheromonesView.textContent = decayingPheromones; });

window.changeDeadEnds1.addEventListener("input", e =>
{ deadEndsCount1 = +e.target.value; window.deadEndsView1.textContent = deadEndsCount1; initTotalGen(); });

window.changeDeadEnds2.addEventListener("input", e =>
{ deadEndsCount2 = +e.target.value; window.deadEndsView2.textContent = deadEndsCount2; initTotalGen(); });

window.changeVegetate.addEventListener("input", e =>
{ vegetateCount = +e.target.value; window.vegetateView.textContent = vegetateCount; initTotalGen(); });

const WIDTH = 720, HEIGHT = 400;
let defaultLog = "Алгоритм не запущен";
let defaultColor = "coral";

let drawingAnts = true, drawingRedPheromones = false, drawingGreenPheromones = false, drawingDensity = false;

let colonySize = 500, maxColonySize = 1000;

let speed = 5, moveCooldown = 5, liberty = 0.005;
let visionDistance = 15, visionAngle = Math.PI, visionAngleStep = 0.05;
let redDecay = 0.98, greenDecay = 0.98, densityDecay = 0.98;
let decayingPheromones = 0.1, initialPheromones = 8000;
let vegetateCount = 4, deadEndsCount1 = 6, deadEndsCount2 = 2;
let totalGenIterations;
initTotalGen();

window.dropbtn1.addEventListener("click", changeMenuView);
window.dropbtn2.addEventListener("click", changeMenuView);
window.dropbtn3.addEventListener("click", changeMenuView);
window.dropbtn4.addEventListener("click", changeMenuView);
window.dropbtn5.addEventListener("click", changeMenuView);

function changeLog(text, color) {
    window.log.textContent = text;
    window.log_block.style.borderColor = color;
}

async function showError(text) {
    changeLog(text, "B72626");
    await sleep(3000);

    if (window.log.textContent !== "Алгоритм запущен") {
        changeLog(defaultLog, defaultColor);
    }
}

function changeMenuView(e) {
    let parent = e.target.parentNode;
    parent.childNodes.forEach(child => {
        try {
            if (child.style.display === "block" && child !== e.target) {
                child.style.display = "none";
                return;
            }
            child.style.display = "block";
        }
        catch (e) { }
    })
}

function changeLock() {
    let dangerParams = document.querySelectorAll(".dangerParam");
    let dangerParamsView = document.querySelectorAll(".dangerParamView");

    unlock = this.checked;
    if (unlock) {
        window.dropdowns.style.display = "block";
        window.lockerView.innerText = "Параметры разблокированы";
        dangerParams.forEach(param => {
            param.disabled = false;
        })

        window.redDecayView.textContent = redDecay;
        window.greenDecayView.textContent = greenDecay;
        window.densityDecayView.textContent = densityDecay;

        window.sizeView.textContent = colonySize;
        window.maxSizeView.textContent = maxColonySize;

        window.speedView.textContent = speed;
        window.moveCooldownView.textContent = moveCooldown;
        window.libertyView.textContent = liberty;

        window.visionDistanceView.textContent = visionDistance;
        window.visionAngleView.textContent = visionAngle.toFixed(1);
        window.visionAngleStepView.textContent = visionAngleStep;

        window.initialPheromonesView.textContent = initialPheromones;
        window.decayingPheromonesView.textContent = decayingPheromones;

        window.deadEndsView1.textContent = deadEndsCount1;
        window.deadEndsView2.textContent = deadEndsCount2;
        window.vegetateView.textContent = vegetateCount;

    } else {
        window.lockerView.innerText = "Параметры заблокированы";
        dangerParams.forEach(param => {
            param.disabled = true;
        })

        dangerParamsView.forEach(paramView => {
            paramView.textContent = "Заблокировано";
        })
    }
}

function initTotalGen() {
    totalGenIterations = vegetateCount + deadEndsCount1 + deadEndsCount2 + 4;
}

window.changeRedDecay.value = redDecay;
window.changeGreenDecay.value = greenDecay;
window.changeDensityDecay.value = densityDecay;

window.changeSize.value = colonySize;
window.changeMaxSize.value = maxColonySize;

window.changeAntSpeed.value = speed;
window.changeMoveCooldown.value = moveCooldown;
window.changeLiberty.value = liberty;

window.changeVisionDistance.value = visionDistance;
window.changeVisionAngle.value = visionAngle;
window.changeVisionAngleStep.value = visionAngleStep;

window.changeInitialPheromones.value = initialPheromones;
window.changeDecayingPheromones.value = decayingPheromones;

window.changeDeadEnds1.value = deadEndsCount1;
window.changeDeadEnds2.value = deadEndsCount2;
window.changeVegetate.value = vegetateCount;
