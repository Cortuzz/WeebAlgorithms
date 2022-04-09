//window.startButton.addEventListener("click");
window.buildTree.addEventListener("click", generateTree);
let csvText = document.getElementById("csv");
let ulTree = document.getElementById("tree");

let headline;
let tree;

let defaultLog = "Алгоритм не запущен";
let defaultColor = "coral";

function csvNormalizer(text) {
    let data = [ ];
    let currentData = [ ];
    let textString = "";

    for (let symbol of text) {
        if (symbol === "\n") {
            if (textString) {
                currentData.push(textString.trim());
            }
            data.push(currentData);
            textString = "";
            currentData = [ ];
        } else if (symbol === ",") {
            currentData.push(textString.trim());
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

    while (getIndexOfEmptyString(data) !== -1) {
        data.splice(getIndexOfEmptyString(data), 1);
    }

    if (data.length === 0) {
        return data;
    }

    headline = data[0];
    data.splice(0, 1);

    if (isCorrect(data)) {
        return toFloat(data);
    } else {
        return [];
    }
}

function isCorrect(data) {
    let columnsNumber = headline.length;

    for (let i = 0; i < data.length; i++) {
        if (data[i].length !== columnsNumber) {
            return false;
        }
    }

    return true;
}

function getIndexOfEmptyString(data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].length == 0) {
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
        while (node.name.length !== 0) {
            let li = document.createElement("li");
            let span = document.createElement("span");
            console.log(node.name)
            span.innerHTML = `${node.name.pop()}`;
            li.appendChild(span);
            ulTree.appendChild(li);
            node.domElement = span;
        }
    } else {
        let li = document.createElement("li");
        let span = document.createElement("span");
        span.innerHTML = `${node.name}`;
        li.appendChild(span);
        ulTree.appendChild(li);
        node.domElement = span;
        li.appendChild(ul);
    }

    if (node.type === "leaf") {
        return;
    }

    //let ul = document.createElement("ul");
    //li.appendChild(ul);

    printTree(node.trueBranch, ul);
    printTree(node.falseBranch, ul);
}

// if (node.type === "leaf") {
//     while (node.name.length !== 0) {
//         let li = document.createElement("li");
//         let span = document.createElement("span");
//         console.log(node.name)
//         span.innerHTML = `${node.name.pop()}`;
//         li.appendChild(span);
//         ulTree.appendChild(li);
//         node.domElement = span;
//     }
// } else {
//     let li = document.createElement("li");
//     let span = document.createElement("span");
//     span.innerHTML = `${node.name}`;
//     li.appendChild(span);
//     ulTree.appendChild(li);
//     node.domElement = span;
// }
//
// if (node.type === "leaf") {
//     return;
// }
//
// let ul = document.createElement("ul");
// li.appendChild(ul);
//
// printTree(node.trueBranch, ul);
// printTree(node.falseBranch, ul);

function clearTree(parent, node) {
    if (node == null || !node.childElementCount) {
        return;
    }

    parent.removeChild(node);
    node.childNodes.forEach(childNode => {
       clearTree(node, childNode);
    });
}

async function generateTree() {
    let trainingData = csvNormalizer(csvText.value);

    if (trainingData.length !== 0) {
        clearTree(ulTree, ulTree.childNodes[0]);
        let tree = new Tree(trainingData);
        tree.createTree(0, trainingData);
        printTree(tree.root, ulTree);
    } else {
        window.log.textContent = "Неверные данные";
        window.log_block.style.borderColor = "red";
        await sleep(1500);

        window.log.textContent = defaultLog;
        window.log_block.style.borderColor = defaultColor;
    }
}

/*
Соперник,Играем,Лидеры,Дождь,Победа
Выше,Дома,На месте,Да,Нет
Выше,Дома,На месте,Нет,Да
Выше,Дома,Пропускают,Нет,Нет
Ниже,Дома,Пропускают,Нет,Да
Ниже,В гостях,Пропускают,Нет,Нет
Ниже,Дома,Пропускают,Да,Да
Выше,В гостях,На месте,Да,Нет
Ниже,В гостях,На месте,Нет,Да
 */
/*
color,diam,weight,fruit
Green,3,500,Apple
Yellow,3,100,Apple
Red,1,60,Grape
Red,1,0,Grape
Yellow,3,60,Lemon
Green,3,500,Apple
Blue,6,150,Apple
Red,2,40,Grape
Green,4,20,Grape
White,7,20,Lemon
 */