import numpy as np
import Layers
from progress.bar import Bar
import json
np.random.seed(0)


def cost(y_hat, y, epsilon=1e-08):
    y_hat = np.clip(y_hat, epsilon, 1. - epsilon)
    return -np.sum(y * np.log(y_hat))


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
            self.layers[i].forward(self.layers[i - 1].output)

        return self.layers[self.size - 1].output

    def evaluate(self, input):
        self.layers[0].forward(input)
        for i in range(1, self.size):
            if(isinstance(self.layers[i], Layers.BatchNorm)):
                self.layers[i].evaluate(self.layers[i - 1].output)
            else:
                self.layers[i].forward(self.layers[i - 1].output)

        return self.layers[self.size - 1].output

    def backward(self, input, y):
        output = self.forward(input)

        grads = [0] * self.size
        delta = output - y

        for i in range(self.size - 2, 0, -1):
            curr_layer = self.layers[i]
            if(isinstance(curr_layer, (Layers.MaxPooling, Layers.Flatten, Layers.Activation))):
                delta = curr_layer.backward(delta, self.layers[i - 1].output)
            else:
                (d_b, d_w, delta) = curr_layer.backward(
                    delta, self.layers[i - 1].output)
                grads[i] = [d_w, d_b]

        (d_b, d_w, delta) = self.layers[0].backward(
            delta, input)
        grads[0] = [d_w, d_b]

        loss = cost(output, y)
        return grads, loss

    def update_weights(self, grads, lr):
        for i in range(self.size):
            layer = self.layers[i]
            if(isinstance(layer, Layers.Conv2D)):
                layer.kernels -= lr * grads[i][0].numpy()
                layer.biases -= lr * grads[i][1]
            elif(isinstance(layer, Layers.Dense)):
                layer.weights -= lr * grads[i][0]
                layer.biases -= lr * grads[i][1]
            elif(isinstance(layer,Layers.BatchNorm)):
                layer.gamma -= lr * grads[i][0]
                layer.beta -= lr * grads[i][1]

    def train(self, X, y, learning_rate=0.02, epochs=10, batch_size=512):
        """
        Parameters
        ----------
        X : numpy array
            The input dataset
        y : numpy array
            The target variables dataset (must be binarized)
        learning_rate : float, optional
            The learning rate (default is 0.02)
        epochs: int
            Number of iterations (default is 10)
        batch_size: int
            Number of samples in one batch (default is 512)
        """
        for i in range(epochs):
            avg_loss = 0
            cnt = 0
            bar = Bar("Proccesing",
                      max=X.shape[0] // batch_size, suffix="%(percent)d%%")
            for j in range(0, X.shape[0], batch_size):
                if(j + batch_size > X.shape[0]):
                    X_batch = np.concatenate(
                        (X[j:], X[:batch_size + j - X.shape[0]])).reshape(batch_size, 28, 28, 1)
                    y_batch = np.concatenate(
                        (y[j:], y[:batch_size + j - y.shape[0]]))
                else:
                    X_batch = X[j:j +
                                batch_size].reshape(batch_size, 28, 28, 1)
                    y_batch = y[j:j + batch_size]
                grads, loss = self.backward(X_batch, y_batch)
                self.update_weights(grads, learning_rate)
                avg_loss += loss
                cnt += 1
                bar.next()
            bar.finish()
            sample_cost = cost(self.forward(X[0].reshape(
                1, 28, 28, 1)), y[0])
            print(f"epoch {i}", "avg loss over batch:", avg_loss /
                  (cnt * batch_size), "sample loss:", sample_cost)

    def load(self, file_path):
        dict = json.load(open(file_path))
        try:
            for i in range(self.size):
                if(isinstance(self.layers[i], Layers.Dense)):
                    self.layers[i].weights = np.array(
                        dict[f"layer{i}"]["weights"])
                    self.layers[i].biases = np.array(
                        dict[f"layer{i}"]["biases"])
                elif(isinstance(self.layers[i], Layer.Conv2D)):
                    self.layers[i].kernels = np.array(
                        dict[f"layer{i}"]["kernels"])
                    self.layers[i].biases = np.array(
                        dict[f"layer{i}"]["biases"])
        except:
            raise Exception("network and weights architectures are different")

    def save(self, file_path):
        file = open(file_path, "w")
        data = {}
        for i in range(self.size):
            if(isinstance(self.layers[i], Layers.Dense)):
                data[f"layer{i}"] = {"weights": self.layers[i].weights.tolist(),
                                     "biases": self.layers[i].biases.tolist()}
            elif(isinstance(self.layers[i], Layers.Conv2D)):
                data[f"layer{i}"] = {"kernels": self.layers[i].kernels.tolist(),
                                     "biases": self.layers[i].biases.tolist()}

        json.dump(data, file)
        file.close()

    def accuracy(self, X, y):
        '''
        y must not be binarized
        '''
        acc = 0
        ans = self.forward(X.reshape(X.shape[0], 28, 28, 1))
        predicted = np.argmax(ans, axis=1)
        acc = np.sum(predicted == y) / y.shape[0]
        return acc
