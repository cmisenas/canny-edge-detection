Canny Edge Detection
====================
Works the following way:

1. Convert the canvas image to grayscale
2. Smooth the image to reduce noise as much as possible. 
In this implementation, Gaussian filter can be applied (max kernel size is 21).
3. Determine the gradient intensity (amount of change) and direction for each pixel.
This is done by convolving image with Sobel filter.
4. Thin the resulting edges with non-maximum suppression.
5. Remove weak/false edges. 
A process called hysteresis is used where there are two thresholds--high and low--to be compared to each pixel.
