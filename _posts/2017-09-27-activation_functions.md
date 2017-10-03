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

Each of these layers but the last one will have an activation functions that 
will decide whether to *fire* or not the current neuron (symbolized by a weight
and bias.)

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
it means that we are, respectively, at a local maximum (on top of a plateau) or
at a local minimum (bottom of a valley.) During backpropagation this zero-valued
gradient will not help to learn anything.

Another problem with the saturation aspect of sigmoid (but also tanh, *see
further*) is the [vanishing gradient problem](https://en.wikipedia.org/wiki/Vanishing_gradient_problem).
Sigmoid is returning values capped between 0 and 1, thus when chaining several
layers the signal is going to decreased until to be almost null.

**Sigmoid output not centered**:

The signal coming out of a neuron is always positive, thus the sigmoid will also
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

![Tanh plot](/public/assets/tanh_plot.png)

As you can see, the tanh function saturates like the sigmoid, but in the range
-1 to 1. However it is 0-centered, thus the tanh function will at least learn
faster than the sigmoid.

If you have to choose between sigmoid and tanh, pick the latter.

**Tensorflow**:

{% highlight python %}
W = tf.Variable(tf.truncated_normal([L0, L1], stddev=0.1)))
b = tf.Variable(tf.constant(0.1, shape=[L1]))
Y = tf.nn.tanh(tf.matmul(X, W) + b)
{% endhighlight %}

## 3.3 ReLU

The *ReLU* (Rectified Linear Unit) is a simple yet efficient activation function:
$$relu(x) = max(0, x)$$

![ReLU plot](/public/assets/relu_plot.png)

**Tensorflow**:

{% highlight python %}
W = tf.Variable(tf.truncated_normal([L0, L1], stddev=0.1)))
b = tf.Variable(tf.constant(0.1, shape=[L1]))
Y = tf.nn.tanh(tf.matmul(X, W) + b)
{% endhighlight %}

This function has several advantages:

- It has been found to speed up the convergence of the gradient by a
  [factor of 6](http://www.cs.toronto.edu/~fritz/absps/imagenet.pdf) compared to
  sigmoid and tanh.
- It is a very simple and costless function.

However, it has one problem:

**Dying ReLU**:

If the weights get updated in a manner that whatever the input, the ReLU
function would only get negative values, this neuron can be considered as
*dead* because it will always output 0.

One way to deal with this is to set a low-enough learning rate. Indeed, the
bigger the learning rate is, the bigger will be the magnitude of the weights'
update. Thus more risks to fall in the *negative zone* and get a dead ReLU.

Another way to fix this problem is the *PReLU*:

## 3.4 PReLU

*PReLU*, or *Parametric ReLU*, was created to fix the *dying ReLU* problem.
While with positive input the function stays the same, with negative input
the output is no longer 0.

$$prelu(x, \alpha) = 𝟙(x < 0)(\alpha * x) + 𝟙(x >= 0)(x)$$

$$\alpha$$ is called the coefficient of leakage.

![PReLU plot](/public/assets/prelu_plot.png)

(In this plot, $$\alpha = 0.5$$ for a better visualization)

As you can see on the plot, for negative values the activation function will
still outputs non-null values, thus the *dying ReLU* problem is avoided.

Other variations of ReLU exist, such as RReLU or ELU. You can find more
information on these papers: [Bing Xu et al.](https://arxiv.org/abs/1505.00853),
[Clevert et al.](https://arxiv.org/abs/1511.07289).

**Tensorflow**:

PReLU is not present in Tensorflow, however it is very easy to code:

{% highlight python %}
prelu = lambda x, alpha: tf.maximum(x * alpha, x)

W = tf.Variable(tf.truncated_normal([L0, L1], stddev=0.1)))
b = tf.Variable(tf.constant(0.1, shape=[L1]))
Y = prelu(tf.matmul(X, W) + b, 0.5)
{% endhighlight %}

**Leaky ReLU**:

A common form of PReLU is the *Leaky ReLU*, this is basically a PReLU with
$$\alpha = 0.01$$.

## 3.5 Maxout

*Maxout* is a quite recent activation function developped by
[Goodfellow et al.](https://arxiv.org/abs/1302.4389) in 2013.

While PReLU was computing the maximum between $$x$$ and $$\alpha * x$$, the
maxout function is computing the maximum between two (or more) different inputs.

The input $$x$$ showed in the previous example is: $$x = w^Tx + b$$.

For a maxout neuron taking two inputs, its formula would be:

$$max(w_1^Tx + b_1, w_2^Tx + b_2)$$.

A more in-depth explanation can be found
[here](http://www.simon-hohberg.de/2015/07/19/maxout.html).


## 3.6 Softmax

Finally the *softmax** function is a bit different than the others: It won't be
used in a hidden layer but as the output function of your neural network.

$$softmax(z)_j = \frac{e^{z_j}}{\sum_{k=1}^{K}e^{z_k}}\ for\ j = 1, ..., K$$

With $$K$$ being the number of possible classes to... classify.

The sum of all $$j$$-class will be equal to 1.

For example if I want to classify an animal between a dog, a cat, and a turtle;
$$j = 3$$ and I could get for an input image values such as $$0.34$$, $$0.45$$,
and $$0.21$$. Those are the probabilities of the classification.

# 4. Linear vs Non-Linear

You may have remarked that all the functions described in this article are
non-linear. A linear function would make a several-hidden-layers neural network
useless!

Composition of linear functions make another linear function, thus all the
layers could be, mathematically, squashed into a single one.

# 5. Conclusion

TL;DR:

- For hidden layers, use **ReLU** as a baseline. Expand to PReLU, ELU, or Maxout in
  case of dying neurons or slow-convergence.
- For output layer in a classification problem: use **softmax**.
- Four output layer in a regression problem: use a linear function.

# 7. Sources

Sources not cited directly in the article:

- [Coursera: Activation functions](https://www.coursera.org/learn/neural-networks-deep-learning/lecture/4dDC1/activation-functions)
- [Coursera: Why do you need non-linear activation functions?](https://www.coursera.org/learn/neural-networks-deep-learning/lecture/OASKH/why-do-you-need-non-linear-activation-functions)
- [CS231n: Commonly used activation functions](http://cs231n.github.io/neural-networks-1/#actfun)
- [Tensorflow: activation functions](https://www.tensorflow.org/versions/r0.12/api_docs/python/nn/activation_functions_)