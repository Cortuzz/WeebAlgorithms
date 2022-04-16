import numpy as np
from tensorflow import raw_ops
np.random.seed(0)


class Activation:
    def __init__(self, activation_function):
        self.output = None
        self.gradient = None
        if activation_function == "relu":
            self.activation = Activation.relu
            self.derivative = Activation.d_relu
        elif activation_function == "sigmoid":
            self.activation = Activation.sigmoid
            self.derivative = Activation.d_sigmoid
        elif(activation_function == "softmax"):
            self.activation = Activation.softmax
            self.derivative = None
        else:
            raise Exception("not supported activation function")

    def relu(x):
        y = np.copy(x)
        y[y < 0] = 0
        return y

    def d_relu(x):
        y = np.copy(x)
        y[y < 0] = 0
        y[y > 0] = 1
        return y

    def sigmoid(x):
        return raw_ops.Sigmoid(x=x).numpy()

    def d_sigmoid(x):
        return Activation.sigmoid(x) * (1 - Activation.sigmoid(x))

    def softmax(x):
        return raw_ops.Softmax(logits=x).numpy()

    def forward(self, input):
        self.output = self.activation(input)

    def backward(self, delta, input):
        self.gradient = self.derivative(input) * delta
        return self.gradient


class Conv2D:
    def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0):
        self.gradient = None
        self.output = None
        self.stride = stride
        self.padding = [*[0] * 2, *[padding] * 2, *[padding] * 2, *[0] * 2]
        self.kernels = self.__initialize_kernel(
            (kernel_size, kernel_size, in_channels, out_channels))
        self.biases = np.zeros(out_channels, dtype=np.float32)

    def __initialize_kernel(self, size):
        stdev = 1 / np.sqrt(np.prod(size))
        return np.random.normal(size=size, scale=stdev).astype(np.float32)

    def forward(self, image):
        self.output = raw_ops.Conv2D(input=image, filter=self.kernels, strides=[
            1, self.stride, self.stride, 1], padding="EXPLICIT", explicit_paddings=self.padding).numpy() + self.biases

    def backward(self, delta, input):
        m = delta.shape[0]
        d_b = np.sum(delta, axis=(0, 1, 2)) / m
        d_w = raw_ops.Conv2DBackpropFilter(input=input, filter_sizes=self.kernels.shape, out_backprop=delta, strides=[
            1, self.stride, self.stride, 1], padding="EXPLICIT", explicit_paddings=self.padding, data_format='NHWC')
        self.gradient = raw_ops.Conv2DBackpropInput(input_sizes=input.shape, filter=self.kernels, out_backprop=delta, strides=[
            1, self.stride, self.stride, 1], padding="EXPLICIT", explicit_paddings=self.padding)

        return d_b, d_w, self.gradient


class MaxPooling:
    def __init__(self, kernel_size, stride=1):
        self.gradient = None
        self.output = None
        self.stride = stride
        self.kernel_size = kernel_size

    def forward(self, image):
        self.output = raw_ops.MaxPool(input=image, ksize=[1, self.kernel_size, self.kernel_size, 1],
                                      strides=[1, self.stride, self.stride, 1], padding="VALID").numpy()

    def backward(self, delta, input):
        self.gradient = raw_ops.MaxPoolGrad(orig_input=input, orig_output=self.output, grad=delta, ksize=[1, self.kernel_size, self.kernel_size, 1],
                                            strides=[1, self.stride, self.stride, 1], padding="VALID").numpy()
        return self.gradient


class Flatten:
    def __init__(self):
        self.gradient = None
        self.output = None

    def forward(self, input):
        self.output = input.reshape(input.shape[0], np.prod(input.shape[1:]))

    def backward(self, delta, input):
        self.gradient = delta.reshape(input.shape)
        return self.gradient


class Dense:
    def __init__(self, n_input, n_neurons):
        self.gradient = None
        self.output = None
        self.weights = np.random.normal(size=(
            n_neurons, n_input), scale=1 / np.sqrt(n_input * n_neurons)).astype(np.float32).T
        self.biases = np.zeros(n_neurons, dtype=np.float32)

    def forward(self, input):
        self.output = np.dot(input, self.weights) + self.biases

    def backward(self, delta, input):
        m = delta.shape[0]
        d_b = np.sum(delta, axis=0)
        d_w = np.dot(input.T, delta)
        self.gradient = np.dot(delta, self.weights.T)

        return d_b / m, d_w / m, self.gradient


class BatchNorm:
    def __init__(self, n_input, momentum=0.2,epsilon=1e-08):
        self.eps=epsilon
        self.alpha = momentum
        self.gradient = None
        self.output = None
        self.mean_move = 0
        self.stdev_move = 0
        self.gamma = np.ones(n_input)
        self.beta = np.zeros(n_input)

    def evaluate(self, input):
        std_stable=np.sqrt(self.stdev_move**2+self.eps)
        self.output = self.gamma * (input - self.mean_move) / std_stable + self.beta

    def forward(self, input):
        mean = np.mean(input, axis=0)
        stdev = np.sqrt(np.var(input, axis=0)+self.eps)
        self.mean_move = self.alpha * self.mean_move + (1 - self.alpha) * mean
        self.stdev_move = self.alpha * self.stdev_move + (1 - self.alpha) * stdev
        self.output = self.gamma * (input - mean) / stdev + self.beta

    def backward(self, delta, input):
        m = input.shape[0]
        mean = np.mean(input, axis=0)
        stdev = np.sqrt(np.var(input, axis=0)+self.eps)
        x_hat = (input - mean) / stdev
        d_beta = np.sum(delta, axis=0)
        d_gamma = np.sum(delta * x_hat, axis=0)
        dx_norm = self.gamma * delta
        self.gradient = 1 / m / stdev * (m * dx_norm - np.sum(dx_norm, axis=0) -
                                         x_hat * np.sum(dx_norm * dx_norm, axis=0))
        return d_beta, d_gamma, self.gradient
