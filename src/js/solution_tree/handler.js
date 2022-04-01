window.startButton.addEventListener("click", generateTree);
let csvText = document.getElementById("csv");

function csvNormalizer(text) {
    let data = [ ];
    let currentData = [ ];
    let textString = "";

    for (let symbol of text) {
        if (symbol === " ") {
        } else if (symbol === "\n") {
            if (textString) {
                currentData.push(textString);
            }
            data.push(currentData);
            textString = "";
            currentData = [ ];
        } else if (symbol === ",") {
            currentData.push(textString);
            textString = "";
        } else {
            textString += symbol;
        }
    }
    if (currentData) {
        if (textString) {
            currentData.push(textString);
        }
        data.push(currentData);
    }

    return data;
}

function generateTree() {
    let trainingData = csvNormalizer(csvText.value);
}
