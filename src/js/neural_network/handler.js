window.onload = initialize_network;
let weights, l0, l1, l2, l3, model;
let matrix = math.zeros([28, 28]);

let convMatrix = math.zeros([25, 25]);
let convMatrix1 = math.zeros([12, 12]);

let avgConvMatrix1 = math.zeros([25, 25]);
let avgConvMatrix2 = math.zeros([12, 12]);

async function initialize_network() {
    weights = await fetch_data();
    l0 = weights['layer0']
    l1 = weights['layer1']
    l2 = weights['layer2']
    l3 = weights['layer3']
    model = new Model();
    model.add(new LayerConv2d(1, 10, 4, 0,
        1, "relu", l0.kernels, l0.biases))
    model.add(new LayerConv2d(10, 10, 3, 0,
        2, "relu", l1.kernels, l1.biases))
    model.add(new LayerDense(1440, 32, "relu", l2.weights, l2.biases))
    model.add(new LayerDense(32, 10, "softmax", l3.weights, l3.biases))
}

function evaluate() {
    let response = model.forward(nj.array(matrix).reshape(28, 28, 1)).tolist()
    drawProbs(response);
}

function displayConv(ctx, matrix, size, depth) {
    matrix = matrix.tolist();
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let color = Math.round(255 * matrix[y][x][depth]);
            if (size === 25) {
                avgConvMatrix1[y][x] = Math.min(avgConvMatrix1[y][x] + color / 7, 240);
            }
            drawRect(ctx, x, y, 1, 1, rgbToHex(240 - color, 248 - color, 255 - color))
        }
    }
}

function displayAverage(ctx, matrix, size) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let color = matrix[y][x];
            drawRect(ctx, x, y, 1, 1, rgbToHex(240 - color, 248 - color, 255 - color))
        }
    }
}

function clearMatrix() {
    matrix = math.zeros([28, 28]);

    avgConvMatrix1 = math.zeros([25, 25]);
    avgConvMatrix2 = math.zeros([12, 12]);
}

function writeToMatrix(microContext) {
    let data = microContext.getImageData(0, 0, 28, 28).data

    for (let y = 0; y < 28; y++) {
        for (let x = 0; x < 28; x++) {
            let index = (y * 28 + x) * 4 + 3;
            matrix[y][x] = data[index] / 255;
        }
    }
}
