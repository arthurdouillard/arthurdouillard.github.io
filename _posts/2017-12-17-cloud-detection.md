---
layout: post
title:  Detecting cloud cover on satellite images with custom K-means
tags:   [cv, ml]
---

# The context

Many Computer Vision applications use images taken from satellites: Fire
progression, cultures growth, [iceberg localization](https://www.kaggle.com/c/statoil-iceberg-classifier-challenge)...

We may think that taking a picture from above would give us crystal clear
images. However the images are often cluttered by clouds! On average, clouds
cover 52% of the surface of the earth [[1]](https://en.wikipedia.org/wiki/Cloud_cover).

For a commercial use, an image is considered usable when the cloud cover is
under 20% [[2]](https://github.com/Mougatine/teledetection/blob/master/paper.pdf).

Before doing anything on an image taken from satellite, we should be able to
determine its clouds coverage. This blog article will describe the algorithm
developed by L.Beaudoin et al [[2]](https://github.com/Mougatine/teledetection/blob/master/paper.pdf).

# Cloud cover detection

The algorithm implemented uses a custom K-Means that we applied on a single image:

1. Apply a grayscale filter on the image.
2. Take group of pixels (central, up, right, down, and left).
3. Create centers in a homogenous way, ranging from 0 to 255.
4. Determine which group of pixels belongs to which centers by minimizing the
Manhattan distance: $$\Sigma_{i=1}^{n} |p_i - q_i|$$.
5. Update all centers by taking the median value of its associated pixels.
6. Repeat until convergence.
7. Take the $$N$$ centers with highest values (higher means whiter).

Note that k-means differ from the classic one by taking a group of pixels
instead of a single one, using the Manhattan distance instead of the Euclidian
distance, and updating with the median value instead of the mean value.

This algorithm uses several parameters that were tweaked by the authors
empirically:

- The number of centers: Between 7 and 9.
- When choosing the centers, take the first and second highest centers.

# Results

To display the good behavior of the algorithm we highlighted the clouds in red:

![Example 1](/public/assets/cloud1.png)

![Example 2](/public/assets/cloud2.png)

The cloud cover is simply the number of pixels cataloged as clouds divided by
the total number of clouds.

# Sources

- 1: [https://en.wikipedia.org/wiki/Cloud_cover](https://en.wikipedia.org/wiki/Cloud_cover)

- 2: [https://github.com/Mougatine/teledetection/blob/master/paper.pdf](https://github.com/Mougatine/teledetection/blob/master/paper.pdf)
