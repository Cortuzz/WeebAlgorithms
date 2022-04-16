window.buildTree.addEventListener("click", generateTree);
window.startButton.addEventListener("click", prediction);
window.clearButton.addEventListener("click", clearCanvas);
window.fieldDeep.addEventListener("input", changeDeep);
window.addEventListener('DOMContentLoaded', function () {
    const slider = new ChiefSlider('.slider', {loop: true })
});
window.typeInputChecker.addEventListener("change", changeInputType);
window.nextSlider.addEventListener("click", countNextSlider);
window.prevSlider.addEventListener("click", countPrevSlider);
window.upload.addEventListener("change", parseFile);

let csvText = document.getElementById("textCsv");
let predictText = document.getElementById("predict");
let ulTree = document.getElementById("tree");
let inputByHand = window.typeInputChecker.checked;
let dataFile = document.getElementById("dataFile");

let headline = [];
let tree;
let file;
let fileToText;

let defaultLog = "Алгоритм не запущен";
let defaultColor = "coral";
let maxDeep = 10;
let numOfSplitter = 0;

window.fieldDeepView.textContent = maxDeep;
window.fieldDeep.value = maxDeep;

function changeDeep(event) {
    maxDeep = event.target.value;
    window.fieldDeepView.textContent = maxDeep;
    maxDeep--;
}

function countNextSlider() {
    numOfSplitter++;
}

function countPrevSlider() {
    numOfSplitter--;
    console.log(numOfSplitter);
}

function changeInputType() {
    inputByHand = window.typeInputChecker.checked;

    if (inputByHand) {
        window.textCsv.style.display = "block";
        window.fileInput.style.display = "none";
    } else {
        window.textCsv.style.display = "none";
        window.fileInput.style.display = "flex";
    }

    fileToText = undefined;
}

function parseFile() {
    if (document.getElementById("upload").files.length === 0) {
        dataFile.textContent = "Файл не выбран";
        fileToText = undefined;
    } else  {
        file = document.getElementById("upload").files[0];
        let type = file.name.slice(file.name.indexOf(".") + 1);

        if (!(type === "csv" || type === "txt")) {
            dataFile.textContent = "Неверный тип файла";
            fileToText = undefined;
        } else {
            dataFile.textContent = file.name;
            let reader = new FileReader;
            reader.readAsText(file);
            reader.onload = function(){
                fileToText = (reader.result).toString();
            }
        }
    }

}

function getCombinations(valuesArray) {
    let combinations = [];
    let temp = [];
    let slent = Math.pow(2, valuesArray.length);

    for (let i = 0; i < slent; i++) {
        temp = [];
        for (let j = 0; j < valuesArray.length; j++) {
            if ((i & Math.pow(2, j))) {
                temp.push(valuesArray[j]);
            }
        }
        if (temp.length > 0) {
            combinations.push(temp);
        }
    }

    combinations.sort((a, b) => a.length - b.length);
    return combinations;
}


function normalizer(text, type) {
    let data = [];
    text = text.replace("\r", " ");
    data = text.split("\n")
    data = clearEmptyStrings(data);

    for (let i = 0; i < data.length; i++) {
        if (numOfSplitter % 3 === 0) {
            data[i] = data[i].split(",");
        } else if (numOfSplitter % 3 === 1) {
            data[i] = data[i].split(";");
        } else {
            data[i] = data[i].split(" ");
        }

        for (let j = 0; j < data[i].length; j++) {
            data[i][j] = data[i][j].trim();
            data[i][j] = data[i][j].charAt(0).toUpperCase() + data[i][j].slice(1);
        }
    }

    if (type === "csv") {
        headline = data[0];
        data.splice(0, 1);
    }

    if (data.length === 0) {
        return data;
    } else if (isCorrect(data, type)) {
        return toFloat(data);
    } else {
        return undefined;
    }
}

function isCorrect(data, type) {
    let columnsNumber = headline.length;

    for (let i = 0; i < data.length; i++) {
        if (data[i].length !== ((type === "csv") ? columnsNumber:columnsNumber - 1)) {
            return false;
        }
    }

    return true;
}

function clearEmptyStrings(data) {
    while (getIndexOfEmptyString(data) !== -1) {
        data.splice(getIndexOfEmptyString(data), 1);
    }

    return data;
}

function getIndexOfEmptyString(data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i] === "") {
            return i;
        }
    }

    return -1;
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

function printTree(node, ulTree) {
    //let li = document.createElement("li");
    //let span = document.createElement("span");

    let ul = document.createElement("ul");

    if (node.type === "leaf") {
        let names = node.name.slice();

        while (names.length !== 0) {
            let li = document.createElement("li");
            let span = document.createElement("span");
            span.setAttribute("class", "leaf");

            if (node.fromTrueBranch) {
                li.setAttribute("class", "trueBranch");
            } else {
                li.setAttribute("class", "falseBranch")
            }

            span.innerHTML = `${names.pop()}`;
            li.appendChild(span);
            ulTree.appendChild(li);
            node.domElement.push(span);
        }
        return;
    } else {
        let li = document.createElement("li");
        let span = document.createElement("span");

        if (tree.root !== node) {
            if (node.fromTrueBranch) {
                li.setAttribute("class", "trueBranch");
            } else {
                li.setAttribute("class", "falseBranch")
            }
        }

        span.innerHTML = `${node.name}`;
        li.appendChild(span);
        ulTree.appendChild(li);
        node.domElement = span;
        li.appendChild(ul);
    }

    //let ul = document.createElement("ul");
    //li.appendChild(ul);

    printTree(node.trueBranch, ul);
    printTree(node.falseBranch, ul);
}

function clearTree(parent, node) {
    if (node == null || !node.childElementCount) {
        return;
    }

    parent.removeChild(node);
    node.childNodes.forEach(childNode => {
        clearTree(node, childNode);
    });
}

function clearCanvas() {
    clearTree(ulTree, ulTree.childNodes[0]);
    tree = undefined;
}

async function generateTree() {
    let trainingData;

    if (inputByHand) {
        trainingData = normalizer(csvText.value, "csv");
    } else {
        if (fileToText === undefined) {
            window.log.textContent = "Неверные csv данные";
            window.log_block.style.borderColor = "darkred";
            await sleep(1500);

            window.log.textContent = defaultLog;
            window.log_block.style.borderColor = defaultColor;
        } else {
            trainingData = normalizer(fileToText, "csv");
        }
    }

    if (trainingData === undefined) {
        window.log.textContent = "Неверные csv данные";
        window.log_block.style.borderColor = "darkred";
        await sleep(1500);

        window.log.textContent = defaultLog;
        window.log_block.style.borderColor = defaultColor;
        headline = [];
    } else if (trainingData.length === 0) {
        window.log.textContent = "Недостаточно csv данных";
        window.log_block.style.borderColor = "darkred";
        await sleep(1500);

        window.log.textContent = defaultLog;
        window.log_block.style.borderColor = defaultColor;
        headline = [];
    } else {
        clearTree(ulTree, ulTree.childNodes[0]);
        tree = new Tree(trainingData);
        tree.createTree(0, trainingData);
        printTree(tree.root, ulTree);
    }
}

async function prediction() {
    let predictData = normalizer(predictText.value, "predict");

    if (tree === undefined) {
        window.log.textContent = "Сначала постройте дерево";
        window.log_block.style.borderColor = "darkred";
        await sleep(1500);

        window.log.textContent = defaultLog;
        window.log_block.style.borderColor = defaultColor;
    } else if (predictData === undefined) {
        window.log.textContent = "Неверный запрос";
        window.log_block.style.borderColor = "darkred";
        await sleep(1500);

        window.log.textContent = defaultLog;
        window.log_block.style.borderColor = defaultColor;
    } else if (predictData.length === 0) {
        window.log.textContent = "Пустой запрос";
        window.log_block.style.borderColor = "darkred";
        await sleep(1500);

        window.log.textContent = defaultLog;
        window.log_block.style.borderColor = defaultColor;
    } else {
        clearTree(ulTree, ulTree.childNodes[0]);
        printTree(tree.root, ulTree);
        console.log(predictData);
        await tree.predict(predictData[predictData.length - 1]);
    }
}
