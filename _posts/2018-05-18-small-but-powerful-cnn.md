---
layout: post
title:  3 Small But Powerful Convolutional Networks
tags:   [deep_learning, cv]
description: The architectures of MobileNet, ShuffleNet, and EffNet, and why they are so efficient.
img: //public/assets/shuffle_net.png
---

*This article was at first published in [Towards Data Science](https://towardsdatascience.com/3-small-but-powerful-convolutional-networks-27ef86faa42d),
it has also been translated in [Chinese](https://yq.aliyun.com/articles/592935).*


Many CNN architectures have been developed to attain the best accuracy on ImageNet.
Computing power is not limited for this competition, why bother?

However you may want to run your model on an old laptop, maybe without GPU, or
even on your mobile phone. Let’s see three CNN architectures that are efficient
while sacrificing few accuracy performance.

## MobileNet

[Arxiv link](https://arxiv.org/abs/1704.04861).

MobileNet uses **depthwise separable convolutions**. This convolution block was at
first introduced by [Xception](https://arxiv.org/abs/1610.02357). A depthwise
separable convolution is made of two operations: a depthwise convolution and a
pointwise convolution.

A normal convolution works on the 2d dimension of the feature maps (symbolized
by the kernel size), and on the input and output channels. It has a computational
cost of $$D_f^2 * M * N * D_k^2$$; with $$D_f$$ the dimension of the input feature maps,
$$M$$ and $$N$$ the number of input and output channels, and $$D_k$$ the kernel size.

![conv](/public/assets/convolution.png)

A **depthwise convolution** maps a single convolution on each input channel
separately. Therefore its number of ouput channel is the same of the number of
input channel. It computational cost is $$D_f^2 * M * D_k^2$$.

![conv](/public/assets/depthwise_conv.png)

The last operation is a **pointwise convolution**. It is a convolution with a kernel
size of 1x1 that simply combine the features created by the depthwise convolution.
It computational cost is $$M * N * D_f^2$$.

![conv](/public/assets/pointwise_conv.png)

The computational cost of the depthwise separable convolution is the sum of the
costs of the depthwise and pointwise operations. Compared to a normal convolution
it offers a computation reduction of $$\frac{1}{N} + \frac{1}{D_k^2}$$.
With a kernel size of 3x3, it results in 8 times less operations!

MobileNet also provides two parameters allowing to reduce further more its
number of operations: The **width multiplier** $$\alpha$$ (between 0 and 1) thins the number
of channels. At each layer instead of producing $$N$$ channels, it will produce
$$\alpha * N$$. This multiplier can be used to handle a trade-off between the desired
latency and the performance. Another multiplier exists: the **resolution
multiplier**. It scales the input size of the image, between 224 to 128.
Because the MobileNet uses a global average pooling instead of a flatten,
you can train your MobileNet on 224x224 images, then use it on 128x128 images!

## ShuffleNet

[Arxiv link](https://arxiv.org/abs/1707.01083).

ShuffleNet introduces the three variants of the Shuffle unit. It is composed of
pointwise **group convolution** and **channel shuffle**.

![conv](/public/assets/shuffle_net.png)

A **group convolution** is simply several convolutions, each taking a portion of
the input channels. In the following image you can see a group convolution,
with 3 groups, each taking one of the 3 input channels.

![conv](/public/assets/group_conv.png)

It greatly diminishes the computational cost. Let us take a practicable example:
If there are 4 input channels, and 8 output channels and we choose to have two
groups, each taking 2 input channels and 4 output channels.

With one group the computational cost would be $$D_f^2 * D_k^2 * 4 * 8$$, while with
two groups the cost is $$(D_f^2 * D_k^2 * 2 * 4) * 2$$ or
$$D_f^2 * D_k^2 * 4 * 4$$. Twice less operations! The authors reached best
results with 8 groups, thus the reduction is even more important.

*Note that a group convolution with as much group and output channels as there
are input channels is strictly identical to a depthwise convolution.*

The **channel shuffle** helps to mix the features developped by each group together.

![channel shuffle](/public/assets/channel_shuffle.png)

## EffNet

[Arxiv link](https://arxiv.org/abs/1801.06434).

EffNet uses **spatial separable convolutions**. It is very similar to
MobileNet’s depthwise separable convolutions.

![effnet](/public/assets/effnet.png)

The separable depthwise convolution is the rectangle colored in blue for
EffNet block. It is made of depthwise convolution with a line kernel (1x3),
followed by a separable pooling, and finished by a depthwise convolution with a
column kernel (3x1).

Let’s see the computational gain. A normal depthwise with a 3x3 kernel would
have a cost of $$3^2 * D_f^2 * M$$. The first depthwise with a 1x3 kernel has a
computational cost of $$3 * D_f^2 * M$$. The separable pooling halves the
feature maps height and has a marginal cost. The second depthwise, with a 3x1
kernel, has then a cost of $$3 * D_f^2/2 * M$$. Thus the whole cost is
$$1.5 * (3 * D_f^2 * M)$$. Half less than the normal depthwise!

Another optimization done by EffNet over MobileNet and ShuffleNet, is the
absence of “normal convolution” at the beginning:

![perf effnet](/public/assets/perf_effnet.png)

To quote the authors:

> Both MobileNet and ShuffleNet avoided replacing the first layer with the claim
> that this layer is already rather cheap to begin with. We respectfully
> disagree with this claim and believe that every optimisation counts.
> After having optimised the rest of the layers in the network, the first
> layer becomes proportionally larger. In our experiments, replacing the
> first layer with our EffNet block saves ∼ 30% of the computations for the
> respective layer.

## TL; DR

MobileNet, ShuffleNet, and EffNet are CNN architectures conceived to optimize
the number of operations. **Each replaced the classical convolution with their
own version.**

**MobileNet** ([github](https://github.com/arthurdouillard/keras-mobilenet))
depthwise separable convolution uses a depthwise
convolution followed by a pointwise convolution. In a addition it introduces
two hyperparameters: the width multiplier that thins the number of channels,
and the resolution multiplier that reduces the feature maps spatial dimensions.

**ShuffleNet** ([github](https://github.com/arthurdouillard/keras-shufflenet))
uses pointwise convolution in groups. In order to combine the features produced
by each group, a shuffle layer is also introduced.

Finally **EffNet** ([github](https://github.com/arthurdouillard/keras-effnet))
uses spatial separable convolution, which is simply a depthwise convolution
splitted along the x and y axis with a separable pooling between them.

![perf effnet](/public/assets/perf_effnet2.png)
