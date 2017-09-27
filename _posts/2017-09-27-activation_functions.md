---
layout: post
title:  Activation functions
tags:   [deep_learning, tensorflow]
---

# 1. Physiology

The activation functions in a neural network are very similar to the way neurons
in your brain can *fire up*.

![Structure of a typical neuron](/public/assets/neuron_physiology.png)

It means that when the cell is receiving enough signals coming from other
neurons through its dentrites (on the left), the neuron will *fire up* and send
a signal passing by its axon.

As you may guess, this is a chain reaction where given enough fired neurons, a
signal will circulate in many different neurons.

# 2. Deep Learning 

A neural network, computer speaking, is made of several layers:

- A layer of input
- A layer of output
- 0 or more hidden layers

Each of these layers has a certain number of neurons, symbolized by a weight and
a bias. Usually the deeper the network, the smaller are the consecutive layers.
This speeds up drastically the computing operations.

![A neural network](/public/assets/neural_network.png)

On the previous schema, there is only one output neuron, thus this network will
be used for regression problem: When the result has to be a continuous value.
For classification problem, such as [CIFAR-10](https://www.cs.toronto.edu/~kriz/cifar.html)
where you have to predict between 10 classes, you will have 10 output neurons.
Each of them holding a probability to be the right class.

Each of these layers will have an activation functions that will decide whether
to *fire* or not the current neuron (symbolized by a weight and bias)

# 3. Different kinds of activation functions

## 3.1. Sigmoid

One of the oldest one, and very rarely used nowadays.

Its mathematical form is:
$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

![Sigmoid plot](/public/assets/sigmoid_plot.png)

Given a real-valued number, this function returns a number ranging between 0 and
1.
This is very similar to how real neurons fire: Sigmoid returning 1 means that
the network's neuron is fully-saturated.

**Tensorflow**:

{% highlight python %}
W = tf.Variable(tf.truncated_normal([L0, L1], stddev=0.1)))
b = tf.Variable(tf.constant(0.1, shape=[L1]))
Y = tf.nn.sigmoid(tf.matmul(X, W) + b)
{% endhighlight %}

With L0 and L1 being the number of neurons of, respectively, the current layer
and the next layer.

As said before, the sigmoid is not used anymore because of two major drawbacks:

**Sigmoid saturation**:

When the sigmoid saturates at either 0 or 1, the gradient is close to 0. In a
[3 dimensions representation](https://en.wikipedia.org/wiki/Gradient_descent#/media/File:Gradient_ascent_(surface).png)
it means that we are, respectively, in a local minimum (bottom of a valley) or
local maximum (on top of a plateau.) During backpropagation this zero-valued
gradient will not help to learn anything.

**Sigmoid output not centered**:

The signal coming into a neuron is always positive, thus the sigmoid will also
outputs only positive values.

Because of this, during backpropagation the values added to all the weights will
be either all positive or all negative.

If we add for initial weights $$ W = [0, -1, 1, 2]$$ and the optimal weights are
$$ W* = [1, 0, -2, 3]$$:

With a *same sign update* we can reach the optimal values in two steps:

1. $$ [0, -1, 1, 2] + [+1, +1, +0, +1]$$
2. $$ [1, 0, -2, 3] + [-0, -0, -3, -0]$$

While the *different sign update* we can finish in one single step:

1. $$ [0, -1, 1, 2] + [+1, +1, -3, +1]$$

The main idea is that non-centered output won't produce errors but it will take
more time to train a network.

## 3.2 Tanh

The hyperbolic tangent, *tanh*, is defined likewise:
$$tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$$

## 3.3 ReLU

Coming soon.

## 3.4 Leaky ReLU

Coming soon.

## 3.5 Maxout

Coming soon.

## 3.6 Softmax

Coming soon.

# 4. Conclusion

Coming soon.

# 5. Sources

Coursera:
- [Activation functions](https://www.coursera.org/learn/neural-networks-deep-learning/lecture/4dDC1/activation-functions)
- [Why do you need non-linear activation functions?](https://www.coursera.org/learn/neural-networks-deep-learning/lecture/OASKH/why-do-you-need-non-linear-activation-functions)

CS231n:
- [Commonly used activation functions](http://cs231n.github.io/neural-networks-1/#actfun)