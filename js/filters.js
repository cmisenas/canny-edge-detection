;(function(exports) {
  function Filters(cvs) {
    this.canvas = cvs;
  }

  var getGrayLevel = function(pixel){
    return ((0.3 * pixel.r) + (0.59 * pixel.g) + (0.11 * pixel.b));
  };

  var generateKernel = function(sigma, size){
    var matrix = [];
    var E = 2.718;//Euler's number rounded of to 3 places
    for (var y = -(size - 1)/2, i = 0; i < size; y++, i++) {
      matrix[i] = [];
      for (var x = -(size - 1)/2, j = 0; j < size; x++, j++) {
        //create matrix round to 3 decimal places
        matrix[i][j] = 1/(2 * Math.PI * Math.pow(sigma, 2)) * Math.pow(E, -(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2))/(2 * Math.pow(sigma, 2)));
      }
    }
    //normalize the matrix to make its sum 1
    var normalize = 1/sumArr(matrix);
    for (var k = 0; k < matrix.length; k++) {
      for (var l = 0; l < matrix[k].length; l++) {
        matrix[k][l] = Math.round(normalize * matrix[k][l] * 1000)/1000;
      }
    }
    return matrix;
  };

  Filters.prototype.threshold = function(imgData, t) {
    var imgDataCopy = this.canvas.getCurrImgData(),
        threshold = t || 100, //default threshold
        that = this,
        grayLevel;

    this.canvas.runImg(null, function(current) {
      grayLevel = getGrayLevel(that.canvas.getPixel(current, imgData));
      if (grayLevel >= threshold) {
        that.canvas.setPixel(current, 255, imgDataCopy);
      } else {
        that.canvas.setPixel(current, 0, imgDataCopy);
      }
    });

    return imgDataCopy;
  };

  Filters.prototype.grayscale = function(imgData) {
    var imgDataCopy = this.canvas.getCurrImgData(),
        that = this,
        grayLevel;

    console.time('Grayscale Time');
    this.canvas.runImg(null, function(current) {
      grayLevel = getGrayLevel(that.canvas.getPixel(current, imgDataCopy));
      that.canvas.setPixel(current, grayLevel, imgDataCopy);
    });
    console.timeEnd('Grayscale Time');

    return imgDataCopy;
  };

  Filters.prototype.gaussianBlur = function(imgData, sigma, size) {
    var imgDataCopy = this.canvas.getCurrImgData(),
        that = this,
        kernel = generateKernel(sigma, size);

    console.time('Blur Time');
    this.canvas.runImg(size, function(current, neighbors) {
      var resultR = resultG = resultB = 0,
          pixel;
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          pixel = that.canvas.getPixel(neighbors[i][j], imgData);
          resultR += pixel.r * kernel[i][j];//return the existing pixel value multiplied by the kernel matrix
          resultG += pixel.g * kernel[i][j];
          resultB += pixel.b * kernel[i][j];
        }
      }
      that.canvas.setPixel(current, {r: resultR, g: resultG, b: resultB}, imgDataCopy);
    });
    console.timeEnd('Blur Time');

    return imgDataCopy;
  };

  Filters.prototype.invertColors = function(imgData) {
    var imgDataCopy = this.canvas.getCurrImgData(),
        that = this,
        pixel;

    console.time('Invert Colors Time');
    this.canvas.runImg(null, function(current) {
      pixel = that.canvas.getPixel(current, imgDataCopy);
      that.canvas.setPixel(current, {r: 255 - pixel.r, g: 255 - pixel.g, b: 255 - pixel.b}, imgDataCopy);
    });
    console.timeEnd('Invert Colors Time');

    return imgDataCopy;
  };

  exports.Filters = Filters;
}(this));
