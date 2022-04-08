class Node {
    constructor(type, level, value, columnOfValue, name, impurity) {
        this.type = type;
        this.level = level;
        this.value = value;
        this.columnOfValue = columnOfValue;
        this.name = name;
        this.impurirty = impurity
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

    getGiniImpurityForLeaf(data) {
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

    getTotalGiniImpurity(dataForTrueBranch, dataForFalseBranch) {
        let probabilityTrue = dataForTrueBranch.length / (dataForTrueBranch.length + dataForFalseBranch.length);
        let probabilityFalse = dataForFalseBranch.length / (dataForTrueBranch.length + dataForFalseBranch.length);

        return probabilityTrue * this.getGiniImpurityForLeaf(dataForTrueBranch) + probabilityFalse * this.getGiniImpurityForLeaf(dataForFalseBranch);
    }

    createNameForNode(columnName, value) {
        let name = columnName;

        if (typeof value !== "string") {
            name += ` < ${value}`;
        } else {
            name += ` = ${value}`;
        }

        name += " ?";
        return name;
    }

    divideBranches(data, column, value) {
        let dataForTrueBranch = [];
        let dataForFalseBranch = [];

        if (typeof value === "string") {
            for (let i = 0; i < data.length; i++) {
                if (data[i][column] === value) {
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
        let uniqueParams = [];
        let bestSplitNode = new Node("split", -1, "", -1, "", Infinity);
        let sameImpurity = [bestSplitNode];

        for (let i = 0; i < headline.length - 1; i++) {
            for (let j = 0; j < data.length - 1; j++) {
                if (!uniqueParams.includes(data[j][i])) {
                    let nameForNode = this.createNameForNode(headline[i], data[j][i]);
                    let [dataForTrueBranch, dataForFalseBranch] = this.divideBranches(data, i, data[j][i]);

                    if (dataForTrueBranch.length !== 0 && dataForFalseBranch.length !== 0) {

                        let currentImpurity = this.getTotalGiniImpurity(dataForTrueBranch, dataForFalseBranch);

                        if (currentImpurity < bestSplitNode.impurirty) {
                            bestSplitNode = new Node("split", -1, data[j][i], i, nameForNode, currentImpurity);
                            sameImpurity = [bestSplitNode];
                        } else if (currentImpurity == bestSplitNode.impurirty) {
                            sameImpurity.push(new Node("split", -1, data[j][i], i, nameForNode, currentImpurity));
                        }

                        uniqueParams.push(data[j][i]);
                    }
                }
            }
        }

        return sameImpurity[Math.floor(Math.random() * sameImpurity.length)];
    }

    createLeaf(level, data) {
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

        return new Node("leaf", level, uniqueParams, lastColumn, names);
    }

    createDecisionNode(level, node, trueBranch, falseBranch) {
        node.type = "decision";
        node.level = level;
        node.trueBranch = trueBranch;
        node.falseBranch = falseBranch;

        return node;
    }

    createTree(level, data) {
        level++;

        let bestSplitNode = this.getBestSplit(data);
        if (bestSplitNode.impurirty === Infinity) {
            return this.createLeaf(level, data);
        }

        let [dataForTrueBranch, dataForFalseBranch] = this.divideBranches(data, bestSplitNode.columnOfValue, bestSplitNode.value);
        if (this.getGiniImpurityForLeaf(data) === this.getTotalGiniImpurity(dataForTrueBranch, dataForFalseBranch)) {
            return this.createLeaf(level, data);
        }

        let trueBranch = this.createTree(level, dataForTrueBranch);
        let falseBranch = this.createTree(level, dataForFalseBranch);
        this.root = this.createDecisionNode(level, bestSplitNode, trueBranch, falseBranch);

        return this.root;
    }
}

// Green,3,500,Apple
// Yellow,3,100,Apple
//
//
// Green,3,500,Apple
// Yellow,3,100,Apple
// Yellow,3,60,Lemon
// Green,3,500,Apple
// Blue,6,150,Apple
// Green,4,20,Grape
// White,7,20,Lemon