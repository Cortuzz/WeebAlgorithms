window.changeRedDecay.addEventListener("input", e =>
{ redDecay = +e.target.value; window.redDecayView.textContent = redDecay; });

window.changeGreenDecay.addEventListener("input", e =>
{ greenDecay = +e.target.value; window.greenDecayView.textContent = greenDecay; });

window.changeDensityDecay.addEventListener("input", e =>
{ densityDecay = +e.target.value; window.densityDecayView.textContent = densityDecay; });

window.changeSize.addEventListener("input", e =>
{ colonySize = +e.target.value; window.sizeView.textContent = colonySize; });

window.changeMaxSize.addEventListener("input", e =>
{ maxColonySize = +e.target.value; window.maxSizeView.textContent = maxColonySize; });

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

let defaultLog = "Алгоритм не запущен";
let defaultColor = "coral";

let drawingAnts = false, drawingRedPheromones = true, drawingGreenPheromones = true, drawingDensity = false;

let colonySize = 500, maxColonySize = 1000;

let speed = 5, moveCooldown = 5, liberty = 0.005;
let visionDistance = 30, visionAngle = Math.PI, visionAngleStep = 0.05;
let redDecay = 0.999, greenDecay = 0.999, densityDecay = 0.999;
let decayingPheromones = 0.1, initialPheromones = 8000;

window.dropbtn1.addEventListener("click", changeMenuView);
window.dropbtn2.addEventListener("click", changeMenuView);
window.dropbtn3.addEventListener("click", changeMenuView);
window.dropbtn4.addEventListener("click", changeMenuView);

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
