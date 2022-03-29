let set = MNIST.set(70000, 10000)
let trainingSet = set.test;
let testSet = set.training;


function cost(y_hat,y) {
    return -math.sum(math.multiply(y, math.log(y_hat)))
}


class Activation {
    static relu(x) {
        let y = math.clone(x)
        y[y<0] = 0
        return y
    }

    static softmax(x) {
        let y = math.exp(x)
        return math.divide(y, math.sum(math.exp(x)))
    }

    static d_relu(x) {
        let y = math.clone(x)
        y[y<0] = 0
        y[y>0]= 1
        return y
    }
}

class LayerDense {
    constructor(n_input, n_neurons, activationFunction, weights, biases) {
        if (activationFunction==="relu") {
            this.activaton=Activation.relu
            this.derivative=Activation.d_relu
        } else {
            this.activaton=Activation.softmax
        }

        if (weights && biases) {
            this.weights = math.matrix(weights);
            this.biases = math.matrix(biases);
        } else {
            this.weights= math.random([n_neurons,n_input], 0, 1 / math.sqrt(n_neurons))
            this.biases= math.random([n_neurons, 1])
        }
    }

    forward(input) {
        this.linear_comb = math.add(math.multiply(this.weights,input), this.biases);
        this.output = this.activaton(this.linear_comb)
    }
}


class Model {
    constructor() {
        this.size=0
        this.layers=[]
    }

    add(layer) {
        this.size+=1
        this.layers.push(layer)
    }

    forward(input) {
        this.layers[0].forward(input)
        for (let i = 1; i < this.size; i++) {
            this.layers[i].forward(this.layers[i-1].output)
        }

        return this.layers[this.size - 1].output
    }

    backward(input,y) {
        let output=this.forward(input)
        let m =output.shape[1]
        let grads=[0]*this.size
        let delta=output-y
        let d_w
        let d_b

        for (let i = this.size - 1; i > 0; i--) {
            d_w=math.multiply(delta,this.layers[i-1].output.T) / m
            d_b=math.sum(delta) / m // math.sum(delta, axis=1, keepdims=true)
            grads[i]=[d_w,d_b]

            delta=math.multiply(this.layers[i].weights.T,delta)*this.layers[i-1].derivative(this.layers[i-1].linear_comb)
        }

        d_w=math.multiply(delta,input.T)/m
        d_b=math.sum(delta) / m // math.sum(delta, axis=1, keepdims=True) / m
        grads[0]=[d_w,d_b]
        let loss=cost(output,y)
        return [grads, loss]
    }
    /*
    update_weights(grads,lr) {
        for i in range(self.size):
        self.layers[i].weights-=lr*grads[i][0]
        self.layers[i].biases-=lr*grads[i][1]
    }

    train(self,X,y,learning_rate=0.2,epochs=10,batch_size=400) {
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
    }*/
}

let digit = mnist[7].get();
let model = new Model();

let weights1 = []
let biases1 = []
let weights2 = []
let biases2 = []
let weights3 = []
let biases3 = []

for (let weight of layer0.weights) {
    weights1.push(weight);
}
for (let weight of layer1.weights) {
    weights2.push(weight);
}
for (let weight of layer2.weights) {
    weights3.push(weight);
}

for (let bias of layer0.biases) {
    biases1.push(bias);
}
for (let bias of layer1.biases) {
    biases2.push(bias);
}for (let bias of layer2.biases) {
    biases3.push(bias);
}

model.add(new LayerDense(28*28,32,"relu", weights1, biases1))
model.add(new LayerDense(32,16,"relu", weights2, biases2))
model.add(new LayerDense(16,10,"softmax", weights3, biases3))

console.log(model.forward(math.reshape(digit, [28 * 28, 1])))

trainingSet.forEach(data => {

});

//import { layer1, layer2, layer3 } from '../../addons/weights.txt'