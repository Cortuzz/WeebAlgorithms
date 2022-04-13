function cost(y_hat, y) {
    return -nj.sum(nj.dot(y, nj.log(y_hat)))
}


function relu(x) {
    let y = x.clone();
    for (let i = 0; i < y.shape[0]; i++) {
        y.set(i, 1, y.get(i, 1) > 0 ? y.get(i, 1) : 0);
    }
    return y
}

function softmax(x) {
    let y = nj.exp(x)
    return nj.divide(y, nj.sum(nj.exp(x)))
}

function d_relu(x) {
    let y = x.clone()
    for (let i = 0; i < y.shape[0]; i++) {
        y.set(i, 1, y.get(i, 1) > 0 ? 1 : 0);
    }
    return x
}


class LayerDense {
    constructor(n_input, n_neurons, activationFunction, weights, biases) {
        if (activationFunction === "relu") {
            this.activaton = relu
            this.derivative = d_relu
        } else {
            this.activaton = softmax
        }

        if (weights && biases) {
            this.weights = nj.array(weights);
            this.biases = nj.array(biases);
        } else {
            this.weights = nj.random([n_neurons, n_input]) / nj.sqrt(n_neurons)
            this.biases = nj.random([n_neurons, 1])
        }
    }

    forward(input) {
        this.linear_comb = nj.add(nj.dot(this.weights, input), this.biases);
        this.output = this.activaton(this.linear_comb)
    }
}


class Model {
    constructor() {
        this.size = 0
        this.layers = []
    }

    add(layer) {
        this.size += 1
        this.layers.push(layer)
    }

    forward(input) {
        this.layers[0].forward(input)
        for (let i = 1; i < this.size; i++) {
            this.layers[i].forward(this.layers[i - 1].output)
        }

        return this.layers[this.size - 1].output
    }   
}

