window.onload = initialize_network;
let weights, l0, l1, l2, model;
let matrix = math.zeros([28, 28]);

async function initialize_network() {
    weights = await fetch_data();
    l0 = weights['layer0']
    l1 = weights['layer1']
    l2 = weights['layer2']
    model = new Model();
    model.add(new LayerDense(28 * 28, 32, "relu", l0.weights, l0.biases))
    model.add(new LayerDense(32, 16, "relu", l1.weights, l1.biases))
    model.add(new LayerDense(16, 10, "softmax", l2.weights, l2.biases))
}

async function evaluate() {
    let response = model.forward(nj.array(matrix).reshape(28 * 28, 1)).tolist()
    drawProbs(response);
}


function clearMatrix() {
    matrix = math.zeros([28, 28]);
}

function writeToMatrix(start, end) {
    let x_s = Math.floor(27 * start.x / canvas.width);
    let y_s = Math.floor(27 * start.y / canvas.height);
    let x_e = Math.floor(27 * end.x / canvas.width);
    let y_e = Math.floor(27 * end.y / canvas.height);
    matrix[y_s][x_s] = 1;
    matrix[y_e][x_e] = 1;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            matrix[y_s + y][x_s + x] = Math.min(1, matrix[y_s + y][x_s + x] + 0.1);
            matrix[y_e + y][x_e + x] = Math.min(1, matrix[y_e + y][x_e + x] + 0.1);
        }
    }
}

