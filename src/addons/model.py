import numpy as np
from scipy import signal
import matplotlib.pyplot as plt
from network import Model
import Layers
from tensorflow import keras



def binarize(array):
    mask = np.zeros((array.shape[0],10))
    for i in range(array.shape[0]):
        mask[i][array[i]] = 1
    return mask


(X_train, y_train), (X_test, y_test) = np.asarray(
    keras.datasets.mnist.load_data())

#Normalization
X_train = (X_train / 255).astype(np.float32)
X_test = (X_test / 255).astype(np.float32)
y_train=binarize(y_train)
y_test=y_test


model = Model()
model.add(Layers.Conv2D(1, 20, kernel_size=4, padding=1,
          stride=1))
model.add(Layers.Activation("relu"))
model.add(Layers.Conv2D(20, 16, kernel_size=3, padding=0,
          stride=2))
model.add(Layers.Activation("relu"))
model.add(Layers.MaxPooling(3, 2))
model.add(Layers.Flatten())
model.add(Layers.Dense(576, 32))
model.add(Layers.Activation("relu"))
model.add(Layers.Dense(32, 10))
model.add(Layers.Activation("softmax"))

#model.backward(X_test[0:10].reshape(10,28,28,1),binarize(y_test[0:10]))
model.train(X_train,y_train,learning_rate=0.0025,epochs=15,batch_size=2048)
#model.save("weights.json")
#model.load("weights.json")
print(model.accuracy(X_test,y_test))

'''
model.forward(X_test[10].reshape(1,28,28,1))
model.backward(X_test[10].reshape(1,28,28,1),binarize(y_test[10].reshape(1,1)).reshape(10,1))
'''
