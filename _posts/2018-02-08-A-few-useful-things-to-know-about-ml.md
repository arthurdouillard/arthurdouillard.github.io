---
layout: post
title:  A Few Useful Things To Know About Machine Learning
tags:   [papers, ml]
descripton: An overview of the "Black Art" of Machine Learning.
img: /public/assets/bias-variance.png
---

This post contains the notes taken from reading of the following paper:

* [A few useful things to know about Machine Learning](https://homes.cs.washington.edu/~pedrod/papers/cacm12.pdf)
by [Pedro Domingos](https://scholar.google.com/citations?user=KOrhfVMAAAAJ&hl=en).

This paper does not introduce any novelties in the field of Machine Learning, nor
some kinds of benchmarks, but rather offers a overview of the *black art* of
Machine Learning. Domingos covers a wide area of Machine Learning, but each
parts are not explored in depth.

# The Right Algorithm

Domingos splits the problem of choosing the right algorithm in three sub-problems:

- Finding the good **representation** (*hyperplanes, rules, decision trees, etc.*)
- The **objective function** to optimize (*accuracy, likelihood, cross-entropy, etc.*)
- The **optimization method** (*quadratric, beam search, gradient descent, etc.*)

The optimal combinaisons should be taken according to several parameters: The accuracy,
the training time, the problem type, etc.

# Evaluating The Algorithm

Domingos notes that while a high accuracy may seem *good*, it is not a sufficient
indicator. A high score of accuracy on the *train data* may simply mean that the
algorithm has an *overfit* problem, and thus generalize badly on new unseen data.

A common pitfall would be to train the algorithm on the train data and tweak
the various parameters in order to maximize our score on the *test data*. This may
lead to an overfit on also the test data!

The generalization problems (*how can I estimate my generalization?* and *how
can I improve my generalization*) are detailled in the further sections.

# The Bias-Variance Trade-off

When building a model it is interesting to decompose the generalization error
into two components: the *bias* and the *variance*.


> **Bias** is a learner's tendency to consistenly learn the same wrong thing.
>
> **Variance** is the tendency to learn random things irrespective of the real signal.

![Bias-Variance trade-off in dart-throwing](/public/assets/bias-variance.svg)

This trade-off explains why a powerful learner may not be better than a weak learner.
If my powerful learner has a very low bias, he is performing very well on the
train data. However if my powerful learner has also a high variance, it may
have learned noise from the train data that would be completely irrelevant
for the test data and behave randomly.

# Reducing The Variance

There are several ways to reduce the variance:

### Train, Validation, and Test

Before training your model, the data should be split in three parts:

- **Train**: On which the model will learn.
- **Validation**: On which we will optimize model's performance by tweaking the parameters.
- **Test**: To test the model, only at the end.

![Train-Validation-Test split](/public/assets/train-validation-test.svg)

In a certain way, we are overfitting on *validation* by tweaking the parameters
according to the *validation*'s performance. In order to mitigate this we can
use the cross-validation:

### Cross-Validation

We are still training the model on *train*, and tweaking the parameters in order
to optimize *validation*.

However instead of evaluating a fixed validation set, we are evaluating the average
performance of several folds of the data:

![k-fold cross-validations](/public/assets/cross-validation.svg)

Note that if there is too many parameters choices, the cross-validation may
not be able to avoid overfit.

### Regularization

Another way to way to avoid overfit is to add *regularization*. It will force
the model to be simpler.

Let's say the model has a set of weights $$W$$, an evaluation function $$f(X)$$
(that depends of the weights), and a loss function $$L(X, Y)$$.

Without regularization the model will try to optimize:

$$L(X, f(X))$$

With a regularization $$R(W)$$:

$$L(X, f(X)) + \lambda R(W)$$

The regularization is multiplied by a factor $$\lambda$$ that is determined empirically,
throught cross-validation for example.

There is several regularizations possible. The two most common are **L1**
(also known as *LASSO*), and **L2** (also known as *Ridge*):

L1 is the absolute norm:

$$\|W\|_{1} = \Sigma_{i=1}^{n} |w_i|$$

While L2 is:

$$\|W\|_{2} = \Sigma_{i=1}^{n} w_i^2$$

# The Curse Of Dimensionality

In addition of overfitting, a model can also fail to learn high-dimensional
data.

For example, let's imagine that we want to use a decision tree to learn
data which features are binary discrete values. If there are 10 features, it would
mean that there is a thousand possible samples. If there are 100 features (which
is common), there are a thousand billion of billion of billion possible samples.
It is unlearnable, either because the model will never generalize correctly, or
the model will take a non-practical amount of time to learn.

Thankfully, the data's features are often not completely independant and many
features are just noise. The *blessing of non-uniformity* as Domingos calls,
implies the samples are often spread on a lower-dimensional manifold.

To reduce the dimension, i.e. choosing the right features, [many algorithms](https://en.wikipedia.org/wiki/Dimensionality_reduction) exist:
PCA, NMF, LDA, etc.

The  reduction of dimensionality is an often necessary step before feeding the
model with the data.

# Feature Engineering Is The Key

Feature Engineering is the action of transforming raw data into something that
is more learnable by the model. It is very dependant on the data's type, and here
lies most of the *black art* of Machine Learning.

Two examples:

For text data, several processing are very useful:
- **tokenization** to split the words of the sentence.
- **lemmatization** to get the lemma (*loved, loving, lover -> love*)
- **POS-Tagging** to get the grammar label of a token (*be -> verb, car -> noun*)

For image data, in the case of object detection we can extract interesting
features with the [HOG algorithm](https://www.learnopencv.com/histogram-of-oriented-gradients/)
and feed these features to a SVM to [improve significantly the performances](https://github.com/Mougatine/human-recognition/blob/master/tirf_project.ipynb).

While feature engineering is major part of Machine Learning, it is less important
in Deep Learning: with Convolutional Neural Network (CNN) the model is learning
by itself the [convolutional matrices](https://cs.stanford.edu/people/karpathy/convnetjs/demo/cifar10.html) extracting the interesting features.

# Model Ensembles

In order to achieve the best performance we want to decrease both bias and variance.
It is often complicated to optimize this trade-off. A great way to achieve this
is to combine several models, kind of like a *wisdom of the crowd*.

There are three main categories of ensembles:

### Bagging

Used in the **Random Forest**, bagging generates plenty of model. Each has a low
bias but a high variance. A voting system is set up between them to choose the
output, thus lowering the individual variances.

### Boosting

Used in **Adaboost** or in **Gradient Boosting**, boosting generates at first
a simple weak learner: It should just be a bit better than a random guess. At each
iteration of the training, a new weak learner is added to the global learner. The
new weak learner focuses on the previously poorly predicted data.

At each iteration the bias is reduced as the overall model improves. There is a
diminished risk of overfitting with boosting: Because each iteration's learner
focuses on poorly predicted data, the risk of *over-learning* data is small.

### Stacking

The stacking ensemble is the easiest to understand: Each model is connected to
another: The output of one is the input of another.

# Data, Data, And Data

While Domingos offers us great insights into Machine Learning, and various
methods to improve our models, he notes one constant:

> More data beats a cleverer algorithm

It is often more advisable to focus the efforts on getting as much data as
possible, and begin with a simple model, than to expect a complex model to
generalize from few data.

### Available Data

There are plenty of resources availables:
- [UCL Datasets](https://archive.ics.uci.edu/ml/datasets.html)
- [Kaggle Datasets](https://www.kaggle.com/datasets)
- [CIFAR](https://www.cs.toronto.edu/~kriz/cifar.html),
[ImageNet](http://www.image-net.org/), [COCO](http://cocodataset.org/#home)
- ...