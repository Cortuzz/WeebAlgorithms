import numpy as np
import matplotlib.pyplot as plt
from keras.datasets import mnist

np.random.seed(0)

def binarize(array):
    mask=np.zeros((array.shape[0],10))
    for i in range(array.shape[0]):
        mask[i][array[i]]=1
    return mask

def cost(y_hat,y):
    return -np.sum(y*np.log(y_hat))

#abstract class
class Activaton:
    def relu(x):
        y = np.copy(x)
        y[y<0] = 0
        return y
    def sigmoid(x):
        return (1/1+np.exp(-x))

    def d_sigmoid(x):
        return -np.exp(-x)/((1+np.exp(-x))*(1+np.exp(-x)))

    def softmax(x):
        y = np.exp(x)
        return  y / np.sum(np.exp(x))
    def d_relu(x):
        y = np.copy(x)
        y[y<0] = 0
        y[y>0]=1
        return y
class Layer_Dense:
    def __init__(self,n_input,n_neurons,activaton_function=None):
        if(activaton_function=="relu"):
            self.activaton=Activaton.relu
            self.derivative=Activaton.d_relu
        elif(activaton_function=="sigmoid"):
            self.activaton=Activaton.sigmoid
            self.derivative=Activaton.d_sigmoid
        elif(activaton_function=="softmax"):
            self.activaton=Activaton.softmax
        else:
            raise Exception("gg")
        self.weights=np.random.randn(n_neurons,n_input)/np.sqrt(n_neurons)
        self.biases=np.random.randn(n_neurons,1)
    def forward(self,input):
        self.linear_comb=np.dot(self.weights,input)+self.biases
        self.output=self.activaton(self.linear_comb)
class Model:
    def __init__(self):
        self.size=0
        self.layers=[]
    def add(self,layer):
        self.size+=1
        self.layers.append(layer)

    def forward(self,input):
        self.layers[0].forward(input)
        for i in range(1,self.size):
            self.layers[i].forward(self.layers[i-1].output)

        output=self.layers[self.size-1].output
        return output

    def backward(self,input,y):
        output=self.forward(input)
        m=output.shape[1]
        grads=[0]*self.size
        delta=output-y
        for i in range(self.size-1,0,-1):
            d_w=np.dot(delta,self.layers[i-1].output.T)/m
            d_b=np.sum(delta, axis=1, keepdims=True) / m
            grads[i]=[d_w,d_b]
            delta=np.dot(self.layers[i].weights.T,delta)*self.layers[i-1].derivative(self.layers[i-1].linear_comb)

        d_w=np.dot(delta,input.T)/m
        d_b=np.sum(delta, axis=1, keepdims=True) / m
        grads[0]=[d_w,d_b]
        loss=cost(output,y)
        return grads,loss

    def update_weights(self,grads,lr):
        for i in range(self.size):
            self.layers[i].weights-=lr*grads[i][0]
            self.layers[i].biases-=lr*grads[i][1]

    def train(self,X,y,learning_rate=0.2,epochs=10,batch_size=400):
        X=X.reshape(X.shape[0],28*28)
        for i in range(epochs):
            print(cost(self.forward(X[0].reshape(28*28,1)),y[0].reshape(10,1)))
            for j in range(0,X.shape[0],batch_size):
                X_batch=X[j:j+batch_size]
                y_batch=y[j:j+batch_size]
                X_batch=X_batch.reshape(28*28,batch_size)
                y_batch=y_batch.reshape(10,batch_size)
                grads,loss=self.backward(X_batch,y_batch)
                self.update_weights(grads,learning_rate)
            print(f"epoch {i}")

def accuracy(n,X_test,y_test):
    ans=0
    for i in range(n):
        a=model.forward(X_test[i].reshape(28*28,1))
        predicted=np.argmax(a)
        if(predicted==np.argmax(y_test[i])):
            ans+=1
        else:
            print("predicted: ",predicted,"given ", np.argmax(y_test[i]))
    print("accuracy: ",ans/n)

(X_train,y_train),(X_test,y_test)=np.asarray(mnist.load_data())
X_train=X_train/255
X_test=X_test/255
y_train=binarize(y_train)
y_test=binarize(y_test)
#plt.imshow(X_train[0],cmap=plt.cm.binary)
#plt.show()

model=Model()
model.add(Layer_Dense(28*28,32,"relu"))
model.add(Layer_Dense(32,16,"relu"))
model.add(Layer_Dense(16,10,"softmax"))

accuracy(1000,X_test,y_test)

model.train(X_train,y_train,0.002,15,1)

accuracy(1000,X_test,y_test)
