function cost(y_hat, y) {
    return -nj.sum(nj.dot(y, nj.log(y_hat)));
}

function denseRelu(x) {
    for (let i = 0; i < x.shape[0]; i++) {
        x.set(i, 1, x.get(i, 1) > 0 ? x.get(i, 1) : 0);
    }
    return x
}

function convRelu(x) {
    for (let i = 0; i < x.shape[0]; i++) {
        for (let j = 0; j < x.shape[1]; j++) {
            for (let k = 0; k < x.shape[2]; k++) {
                x.set(i, j, k, x.get(i, j, k) > 0 ? x.get(i, j, k) : 0);
            }
        }

    }
    return x
}

function softmax(x) {
    let y = nj.exp(x)
    return nj.divide(y, nj.sum(nj.exp(x)))
}


class LayerConv2d {
    constructor(in_channels, out_channels, kernel_size, padding, stride, activationFunction = "relu", kernels, biases) {
        this.stride = stride;
        this.padding = padding;
        if (activationFunction === "relu") {
            this.activaton = convRelu;
        } else if (activationFunction === "sigmoid") {
            this.activaton = sigmoid;
        } else {
            this.activaton = softmax;
        }

        if (kernels && biases) {
            this.kernels = nj.array(kernels);
            this.biases = nj.array(biases);
        } else {
            this.kernels = nj.random([kernel_size, kernel_size, in_channels, out_channels]) / nj.sqrt(kernel_size * kernel_size * in_channels * out_channels);
            this.biases = nj.random([out_channels, 1]);
        }
    }

    forward(input) {
        this.linear_comb = convolution(input, this.kernels, this.padding, this.stride);
        this.output = this.activaton(this.linear_comb);
    }
}

class LayerDense {
    constructor(n_input, n_neurons, activationFunction, weights, biases) {
        if (activationFunction === "relu") {
            this.activaton = denseRelu;
        } else {
            this.activaton = softmax;
        }

        if (weights && biases) {
            this.weights = nj.array(weights);
            this.biases = nj.array(biases);
        } else {
            this.weights = nj.random([n_neurons, n_input]) / nj.sqrt(n_neurons);
            this.biases = nj.random([n_neurons, 1]);
        }
    }

    forward(input) {
        this.linear_comb = nj.add(nj.dot(this.weights.T, input), this.biases);
        this.output = this.activaton(this.linear_comb);
    }
}

class Model {
    constructor() {
        this.size = 0;
        this.layers = [];
    }

    add(layer) {
        this.size += 1;
        this.layers.push(layer);
    }

    forward(input) {
        this.layers[0].forward(input)
        convMatrix = this.layers[0].output.clone()
        for (let i = 1; i < this.size; i++) {
            if (this.layers[i] instanceof LayerDense) {
                let prev_input = this.layers[i - 1].output;
                prev_input = prev_input.reshape(prev_input.size, 1);
                this.layers[i].forward(prev_input)
            } else {
                this.layers[i].forward(this.layers[i - 1].output);
                convMatrix1 = this.layers[i].output.clone()
            }

        }

        return this.layers[this.size - 1].output;
    }

}
