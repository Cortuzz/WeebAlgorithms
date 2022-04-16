window.autoSizingChecker.addEventListener("click", e => {
    autoSizing = window.autoSizingChecker.checked;
    window.changeSize.disabled = autoSizing;
    window.sizeMultiplierView.textContent = "Ручной режим";
    window.sizeView.textContent = prevColonySize;
    if (autoSizing) {
        prevColonySize = colonySize;
        colonySize = undefined;
        window.sizeMultiplierView.textContent = colonySizeMultiplier;
        window.sizeView.textContent = "Автоматически";
    } else if (colonySize == null) {
        colonySize = prevColonySize;
    }

    window.changeSizeMultiplier.disabled = !autoSizing;
});

window.changeSize.addEventListener("input", e =>
{ colonySize = +e.target.value; window.sizeView.textContent = colonySize; });

window.changeSizeMultiplier.addEventListener("input", e =>
{ colonySizeMultiplier = +e.target.value; window.sizeMultiplierView.textContent = colonySizeMultiplier; });

window.changeGreed.addEventListener("input", e =>
{ greed = +e.target.value; window.greedView.textContent = greed; });

window.changeGregariousness.addEventListener("input", e =>
{ gregariousness = +e.target.value; window.gregariousnessView.textContent = gregariousness; });

window.changeDecay.addEventListener("input", e =>
{ decay = +e.target.value; window.decayView.textContent = decay; });

window.changeSpray.addEventListener("input", e =>
{ spray = +e.target.value; window.sprayView.textContent = spray; });

window.changeAttractionMultiplier.addEventListener("input", e =>
{ attractionMultiplier = +e.target.value; window.attractionMultiplierView.textContent = attractionMultiplier});


let prevColonySize = 250;
let greed = 1, gregariousness = 3, colonySize, colonySizeMultiplier = 3,
    spray = 240, decay = 0.7, attractionMultiplier = 75;
let autoSizing = true;

function changeLock(event) {
    let dangerParams = document.querySelectorAll(".dangerParam");
    let dangerParamsView = document.querySelectorAll(".dangerParamView");

    unlock = this.checked;
    if (unlock) {
        window.lockerView.innerText = "Параметры разблокированы";
        dangerParams.forEach(param => {
            if (param.id !== "changeSize") {
                param.disabled = false;
            }
        });

        window.sizeMultiplierView.textContent = colonySizeMultiplier;
        window.greedView.textContent = greed;
        window.gregariousnessView.textContent = gregariousness;
        window.decayView.textContent = decay;
        window.sprayView.textContent = spray;
        window.attractionMultiplierView.textContent = attractionMultiplier;
        if (colonySize) {
            window.sizeMultiplierView.textContent = "Ручной режим";
            window.sizeView.textContent = colonySize;
            return;
        }
        window.sizeView.textContent = "Автоматически";
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