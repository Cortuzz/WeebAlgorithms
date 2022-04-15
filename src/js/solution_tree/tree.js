let maxTreeLevel = 0;

class Node {
    constructor(type, level, value, columnOfValue, name, impurity, fromTrueBranch) {
        this.type = type;
        this.level = level;
        this.value = value;
        this.columnOfValue = columnOfValue;
        this.name = name;
        this.impurirty = impurity;
        this.fromTrueBranch = !!fromTrueBranch;

        this.domElement = [ ];

        this.trueBranch = null;
        this.falseBranch = null;
    }
}


class Tree {
    constructor(data) {
        this.trainingData = data;
        this.root = null;
    }

    getAlignmentNumber(data, column, value) {
        let count = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i][column] === value) {
                count++;
            }
        }
        return count;
    }

    getGiniIndex(data) {
        let impurity = 0;
        let uniqueParams = [];
        let lastColumn = headline.length - 1;

        for (let i = 0; i < data.length; i++) {
            if (!uniqueParams.includes(data[i][lastColumn])) {
                let probability = this.getAlignmentNumber(data, lastColumn, data[i][lastColumn]) / data.length;
                impurity += Math.pow(probability, 2);
                uniqueParams.push(data[i][lastColumn]);
            }
        }

        return 1 - impurity;
    }

    getTotalGiniSplit(dataForTrueBranch, dataForFalseBranch) {
        let probabilityTrue = dataForTrueBranch.length / (dataForTrueBranch.length + dataForFalseBranch.length);
        let probabilityFalse = dataForFalseBranch.length / (dataForTrueBranch.length + dataForFalseBranch.length);

        return probabilityTrue * this.getGiniIndex(dataForTrueBranch) + probabilityFalse * this.getGiniIndex(dataForFalseBranch);
    }

    createNameForNode(columnName, value) {
        let name = columnName;

        if (typeof value === "number") {
            name += ` < ${value}`;
        } else {
            name += ` is `

            for (let i = 0; i < value.length - 1; i++) {
                name += `${value[i]} or `;
            }

            name += `${value[value.length - 1]}`;
        }

        return name;
    }

    divideBranches(data, column, value) {
        let dataForTrueBranch = [];
        let dataForFalseBranch = [];

        if (typeof value !== "number") {
            for (let i = 0; i < data.length; i++) {
                if (value.includes(data[i][column])) {
                    dataForTrueBranch.push(data[i]);
                } else {
                    dataForFalseBranch.push(data[i]);
                }
            }
        }
        else {
            for (let i = 0; i < data.length; i++) {
                if (data[i][column] < value) {
                    dataForTrueBranch.push(data[i]);
                } else {
                    dataForFalseBranch.push(data[i]);
                }
            }
        }

        return [dataForTrueBranch, dataForFalseBranch];
    }

    getBestSplit(data) {
        let bestSplitNode = new Node("split", -1, "", -1, "", Infinity);
        let sameImpurity = [bestSplitNode];

        for (let i = 0; i < headline.length - 1; i++) {
            let uniqueParams = [];

            if (typeof data[0][i] === "number") {
                data.sort(function(a, b) {
                    if (a[i] > b[i]) {
                        return 1;
                    } else {
                        return -1;
                    }
                });

                for (let j = 0; j < data.length - 1; j++) {
                    let value = (data[j][i] + data[j + 1][i]) / 2;

                    if (!uniqueParams.includes(value)) {
                        uniqueParams.push((data[j][i] + data[j + 1][i]) / 2);
                    }

                    if (!uniqueParams.includes(data[j][i])) {
                        uniqueParams.push(data[j][i]);
                    }
                }

                if (!uniqueParams.includes(data[data.length - 1][i])) {
                    uniqueParams.push(data[data.length - 1][i]);
                }
            } else {
                let column = [];

                for (let j = 0; j < data.length; j++) {
                    if (!column.includes(data[j][i])) {
                        column.push(data[j][i]);
                    }
                }

                uniqueParams = getCombinations(column);
                uniqueParams.splice(uniqueParams.length - 1, 1);
            }

            for (let j = 0; j < uniqueParams.length; j++) {
                let nameForNode = this.createNameForNode(headline[i], uniqueParams[j]);
                let [dataForTrueBranch, dataForFalseBranch] = this.divideBranches(data, i, uniqueParams[j]);

                if (dataForTrueBranch.length !== 0 && dataForFalseBranch.length !== 0) {

                    let currentImpurity = this.getTotalGiniSplit(dataForTrueBranch, dataForFalseBranch);

                    if (currentImpurity < bestSplitNode.impurirty) {
                        bestSplitNode = new Node("split", -1, uniqueParams[j], i, nameForNode, currentImpurity);
                        sameImpurity = [bestSplitNode];
                    } else if (currentImpurity === bestSplitNode.impurirty) {
                        sameImpurity.push(new Node("split", -1, uniqueParams[j], i, nameForNode, currentImpurity));
                    }
                }
            }
        }

        return sameImpurity[Math.floor(Math.random() * sameImpurity.length)];
    }

    createLeaf(level, data, isTrueBranch) {
        let uniqueParams = [];
        let names = [];
        let lastColumn = headline.length - 1;

        for (let i = 0; i < data.length; i++) {
            if (!uniqueParams.includes(data[i][lastColumn])) {
                let probability = this.getAlignmentNumber(data, lastColumn, data[i][lastColumn]) / data.length;
                names.push(`${data[i][lastColumn]}: ${(probability * 100).toFixed(2)}%`);
                uniqueParams.push(data[i][lastColumn]);
            }
        }

        return new Node("leaf", level, uniqueParams, lastColumn, names, undefined, isTrueBranch);
    }

    createDecisionNode(level, node, trueBranch, falseBranch, fromTrueBranch) {
        node.type = "decision";
        node.level = level;
        node.trueBranch = trueBranch;
        node.falseBranch = falseBranch;
        node.fromTrueBranch = fromTrueBranch;

        return node;
    }

    createTree(level, data, isTrueBranch) {
        level++;
        maxTreeLevel = Math.max(level, maxTreeLevel);

        let bestSplitNode = this.getBestSplit(data);

        if (bestSplitNode.impurirty === Infinity || level > maxDeep) {
            this.root = this.createLeaf(level, data, isTrueBranch);
            return this.root;
        }

        let [dataForTrueBranch, dataForFalseBranch] = this.divideBranches(data, bestSplitNode.columnOfValue, bestSplitNode.value);
        if (this.getGiniIndex(data) === this.getTotalGiniSplit(dataForTrueBranch, dataForFalseBranch)) {
            this.root = this.createLeaf(level, data, isTrueBranch);
            return this.root;
        }

        let trueBranch = this.createTree(level, dataForTrueBranch, true);
        let falseBranch = this.createTree(level, dataForFalseBranch, false);
        this.root = this.createDecisionNode(level, bestSplitNode, trueBranch, falseBranch, isTrueBranch);

        return this.root;
    }

    async predict(predictData) {
        let currentNode = this.root;

        while (currentNode.type !== "leaf") {
            currentNode.domElement.style.background = "#7037b6";

            if (typeof currentNode.value !== "number") {
                console.log(currentNode.value, predictData[currentNode.columnOfValue])
                if (currentNode.value.includes(predictData[currentNode.columnOfValue])) {
                    currentNode = currentNode.trueBranch;
                } else {
                    currentNode = currentNode.falseBranch;
                }
            } else {
                if (predictData[currentNode.columnOfValue] < currentNode.value) {
                    currentNode = currentNode.trueBranch;
                } else {
                    currentNode = currentNode.falseBranch;
                }
            }

            await sleep(1000 / maxTreeLevel);
        }

        currentNode.domElement.forEach(element => {
            element.style.background = "forestgreen";
        });
    }
}
