Canny Edge Detection
====================
Works the following way:

1. Convert the canvas image to grayscale
2. Smooth the image to reduce noise as much as possible.
In this implementation, Gaussian filter can be applied (max kernel size is 21).
3. Determine the gradient intensity (amount of change) and direction for each pixel.
This is done by convolving image with the chosen filter.
Currently, there are 3 operators you may choose from:
  * Sobel
  * Prewitts
  * Cross
4. Thin the resulting edges with non-maximum suppression.
5. Remove weak/false edges.
A process called hysteresis is used where there are two thresholds--high and low--to be compared to each pixel.

##Usage
You'll need [Node.js](http://nodejs.org/) installed.
Go to root directory of the project and start by entering the following on your terminal:
```
node js/server.js
```
Access program on port 8000.

##TODO
+ [ ] Cleanup image uploading.
+ [ ] Fix non-maximum suppression thresholding (especially bad with Cross filter)
+ [x] Add other filters


##License
Distributed under the terms of the [GNU General Public License version 3](http://www.gnu.org/copyleft/gpl.html).

```
Copyright (C) 2013 cmisenas

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
```
