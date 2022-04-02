import numpy as np
from scipy import signal
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow import nn
from imageProccesing import ImageProccessing
import json
np.random.seed(0)


def binarize(array):
    mask = np.zeros((array.shape[0], 10))
    for i in range(array.shape[0]):
        mask[i][array[i]] = 1
    return mask


def cost(y_hat, y):
    return -np.sum(y * np.log(y_hat))


# abstract class
class Activation:
    def relu(x):
        y = np.copy(x)
        y[y < 0] = 0
        return y

    def sigmoid(x):
        y = np.exp(x) / (1 + np.exp(x))

    def d_sigmoid(x):
        return Activation.sigmoid(x) * (1 - Activation.sigmoid(x))

    def softmax(x):
        y = np.exp(x)
        return y / np.sum(y, axis=0)

    def d_relu(x):
        y = np.copy(x)
        y[y < 0] = 0
        y[y > 0] = 1
        return y


class LayerConv2d:
    def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0, activation_function="relu", kernels=None):
        self.output = None
        self.stride = stride
        self.padding = padding
        if kernels is None:
            self.kernels = self.__initialize_kernel(
                (kernel_size, kernel_size, in_channels, out_channels))
        else:
            self.kernels = kernels
        self.bias = np.zeros((out_channels, 1), dtype=np.float32)

        if activation_function == "relu":
            self.activation = Activation.relu
            self.derivative = Activation.d_relu
        elif activation_function == "sigmoid":
            self.activation = Activation.sigmoid
            self.derivative = Activation.d_sigmoid
        else:
            raise Exception("not supported activation function")

    def __initialize_kernel(self, size):
        stddev = 1 / np.sqrt(np.prod(size))
        return np.random.normal(size=size, scale=stddev).astype(np.float32)

    def forward1(self, image):
        self.linear_comb = ImageProccessing.my_convolution(
            image, self.kernels, self.stride, self.padding) + self.bias.reshape(1, 1, *self.bias.shape[::-1])
        self.output = self.activation(self.linear_comb)

    def forward(self, image):
        image = np.pad(image, ((0, 0), (self.padding, self.padding),
                               (self.padding, self.padding), (0, 0)))
        self.linear_comb = nn.convolution(image, self.kernels, strides=[
            self.stride] * 2, data_format="NHWC").numpy() + self.bias.reshape(1, 1, *self.bias.shape[::-1])
        self.output = self.activation(self.linear_comb)


class MaxPooling:
    def __init__(self, kernel_size, stride=1, padding=0):
        self.output = None
        self.stride = stride
        self.padding = padding
        self.kernel_size = kernel_size

    def forward1(self, image):
        self.output = ImageProccessing.my_max_pool(
            image, self.kernel_size, self.padding, self.stride)

    def forward(self, image):
        image = np.pad(image, ((0, 0), (self.padding, self.padding),
                       (self.padding, self.padding), (0, 0)))
        self.output = nn.max_pool(image, self.kernel_size,
                                  self.stride, "VALID", data_format="NHWC").numpy()


class LayerDense:
    def __init__(self, n_input, n_neurons, activation_function=None, weights=None):
        self.linear_comb = None
        self.output = None
        if activation_function == "relu":
            self.activation = Activation.relu
            self.derivative = Activation.d_relu
        elif activation_function == "sigmoid":
            self.activation = Activation.sigmoid
            self.derivative = Activation.d_sigmoid
        elif activation_function == "softmax":
            self.activation = Activation.softmax
        else:
            raise Exception("not supported activation function")

        if weights is None:
            self.weights = np.random.randn(
                n_neurons, n_input) / np.sqrt(n_neurons)
            self.biases = np.random.randn(n_neurons, 1)
        else:
            self.weights = weights[0]
            self.biases = weights[1]

    def forward(self, input):
        self.linear_comb = np.dot(self.weights, input) + self.biases
        self.output = self.activation(self.linear_comb)


class Model:
    def __init__(self):
        self.size = 0
        self.layers = []

    def add(self, layer):
        self.size += 1
        self.layers.append(layer)

    def forward(self, input):
        self.layers[0].forward(input)
        for i in range(1, self.size):
            if(isinstance(self.layers[i], LayerDense) and isinstance(self.layers[i - 1], (LayerConv2d, MaxPooling))):
                input = self.layers[i - 1].output
                input = input.reshape(input.shape[0], np.prod(input.shape[1:]))
                self.layers[i].forward(input.T)
            else:
                self.layers[i].forward(self.layers[i - 1].output)
            print(f"layer {i}")

        output = self.layers[self.size - 1].output
        return output

    def backward(self, input, y):
        output = self.forward(input)
        m = output.shape[1]
        grads = [0] * self.size
        delta = output - y
        for i in range(self.size - 1, 0, -1):
            d_b = np.sum(delta, axis=1, keepdims=True) / m
            d_w = np.dot(delta, self.layers[i - 1].output.T) / m
            grads[i] = [d_w, d_b]
            delta = np.dot(self.layers[i].weights.T, delta) * self.layers[i - 1].derivative(
                self.layers[i - 1].linear_comb)

        d_w = np.dot(delta, input.T) / m
        d_b = np.sum(delta, axis=1, keepdims=True) / m
        grads[0] = [d_w, d_b]
        loss = cost(output, y)
        return grads, loss

    def update_weights(self, grads, lr):
        for i in range(self.size):
            self.layers[i].weights -= lr * grads[i][0]
            self.layers[i].biases -= lr * grads[i][1]

    def train(self, X, y, learning_rate=0.2, epochs=10, batch_size=400):
        X = X.reshape(X.shape[0], 28 * 28)
        for i in range(epochs):
            for j in range(0, X.shape[0], batch_size):
                X_batch = X[j:j + batch_size]
                y_batch = y[j:j + batch_size]
                X_batch = X_batch.T
                y_batch = y_batch.T
                grads, loss = self.backward(X_batch, y_batch)
                self.update_weights(grads, learning_rate)
            print(f"epoch {i}", " cost:", cost(self.forward(
                X[0].reshape(28 * 28, 1)), y[0].reshape(10, 1)))

    def load(self, file_path):
        dict = json.load(open(file_path))
        try:
            for i in range(self.size):
                self.layers[i].weights = np.array(dict[f"layer{i}"]["weights"])
                self.layers[i].biases = np.array(dict[f"layer{i}"]["biases"])
        except:
            raise Exception("network and weights architectures are different")

    def save(self):
        file = open("weights.json", "w")
        data = {}
        count = 0
        for layer in self.layers:
            data[f"layer{count}"] = {"weights": layer.weights.tolist(),
                                     "biases": layer.biases.tolist()}
            count += 1
        json.dump(data, file)
        file.close()


def accuracy(n, X_test, y_test, show_misses=False):
    ans = 0
    for i in range(n):
        a = model.forward(X_test[i].reshape(28 * 28, 1))
        predicted = np.argmax(a)
        if predicted == np.argmax(y_test[i]):
            ans += 1
        elif(show_misses == True):
            print("predicted: ", predicted, "given ", np.argmax(y_test[i]))
    print(ans / n)


model = Model()
model.add(LayerConv2d(1, 32, kernel_size=3, padding=2,
          stride=2, activation_function="relu"))
model.add(MaxPooling(3))
model.add(LayerConv2d(32, 16, kernel_size=3, padding=1,
          stride=1, activation_function="relu"))

model.add(MaxPooling(4, stride=2))
model.add(LayerDense(400, 32, "relu"))
model.add(LayerDense(32, 16, "relu"))
model.add(LayerDense(16, 10, "softmax"))


(X_train, y_train), (X_test, y_test) = np.asarray(
    keras.datasets.mnist.load_data())

X_train = (X_train / 255).astype(np.float32)
X_test = (X_test / 255).astype(np.float32)
y_train = binarize(y_train)
y_test = binarize(y_test)


batch = X_train[:200].reshape((200, 28, 28, 1))
batch_y = y_train[:200].T


ans = model.forward(batch, batch_y)
#plt.imshow(batch[24], cmap="binary")
#plt.imshow(ans[2, :, :, 1], cmap="binary")
# plt.show()

'''
test = np.loadtxt('five.txt', delimiter=",")
plt.imshow(X_train[0], cmap=plt.cm.binary)
plt.show()
plt.imshow(test, cmap=plt.cm.binary)
plt.show()

model.train(X_train, y_train, 0.002, 1, 1)
model.save()

accuracy(10000, X_train, y_train)
accuracy(10000, X_test, y_test)
'''
