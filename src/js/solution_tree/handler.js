window.startButton.addEventListener("click", printTree);
let csvText = document.getElementById("csv");

let headline;
let tree;

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

    headline = data[0];
    data.splice(0, 1);

    if (isCorrect(data)) {
        return toFloat(data);
    }
    else {
        console.log("error");
    }
}

function isCorrect(data) {
    const columnsNumber = headline.length;

    for (let i = 0; i < data.length; i++) {
        if (data[i].length !== columnsNumber) {
            return false;
        }
    }

    return true;
}

function toFloat(data) {
    for (let i = 0; i < headline.length; i++) {
        let allNumbers = true;

        for (let j = 0; j < data.length; j++) {
            if (Number.isNaN(parseFloat(data[j][i]))) {
                allNumbers = false;
                break;
            }
        }

        if (allNumbers) {
            for (let j = 0; j < data.length; j++) {
                data[j][i] = parseFloat(data[j][i]);
            }
        }
    }

    return data;
}

function printTree() {
    let trainingData = csvNormalizer(csvText.value);
    let tree = new Tree(trainingData);
    tree.createTree(0, trainingData);
    console.log(tree);
}
