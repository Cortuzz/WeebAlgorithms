window.onload = initialize_network;
let weights, l0, l1, l2, model;
let matrix = math.zeros([28, 28]);

async function initialize_network() {
    weights = await fetch_data();
    l0 = weights['layer0']
    l1 = weights['layer1']
    l2 = weights['layer2']
    l3 = weights['layer3']
    model = new Model();
    model.add(new LayerConv2d(1, 4, kernel_size=4, padding=0,
          stride=1, activationFunction="relu",l0.kernels,l0.biases))
    model.add(new LayerConv2d(4, 3, kernel_size=3, padding=0,
              stride=2, activationFunction="relu",l1.kernels,l1.biases))
    model.add(new LayerDense(432, 32, "relu",l2.weights,l2.biases))
    model.add(new LayerDense(32, 10, "softmax",l3.weights,l3.biases))
}

async function evaluate() {
    let response = model.forward(nj.array(matrix).reshape(28,28, 1)).tolist()
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
