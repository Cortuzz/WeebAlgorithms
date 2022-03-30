function cost(y_hat, y) {
    return -math.sum(math.multiply(y, math.log(y_hat)))
}

class Activation {
    static relu(x) {
        let y = math.clone(x)
        y[y < 0] = 0
        return y
    }

    static softmax(x) {
        let y = math.exp(x)
        return math.divide(y, math.sum(math.exp(x)))
    }

    static d_relu(x) {
        let y = math.clone(x)
        y[y < 0] = 0
        y[y > 0] = 1
        return y
    }
}

class LayerDense {
    constructor(n_input, n_neurons, activationFunction, weights, biases) {
        if (activationFunction === "relu") {
            this.activaton = Activation.relu
            this.derivative = Activation.d_relu
        } else {
            this.activaton = Activation.softmax
        }

        if (weights && biases) {
            this.weights = math.matrix(weights);
            this.biases = math.matrix(biases);
        } else {
            this.weights = math.random([n_neurons, n_input], 0, 1 / math.sqrt(n_neurons))
            this.biases = math.random([n_neurons, 1])
        }
    }

    forward(input) {
        this.linear_comb = math.add(math.multiply(this.weights, input), this.biases);
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

    backward(input, y) {
        let output = this.forward(input)
        let m = output.shape[1]
        let grads = [0] * this.size
        let delta = output - y
        let d_w
        let d_b

        for (let i = this.size - 1; i > 0; i--) {
            d_w = math.multiply(delta, this.layers[i - 1].output.T) / m
            d_b = math.sum(delta) / m // math.sum(delta, axis=1, keepdims=true)
            grads[i] = [d_w, d_b]

            delta = math.multiply(this.layers[i].weights.T, delta) * this.layers[i - 1].derivative(this.layers[i - 1].linear_comb)
        }

        d_w = math.multiply(delta, input.T) / m
        d_b = math.sum(delta) / m // math.sum(delta, axis=1, keepdims=True) / m
        grads[0] = [d_w, d_b]
        let loss = cost(output, y)
        return [grads, loss]
    }
}

