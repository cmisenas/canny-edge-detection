;(function(exports) {

  function Filters(cvs) {
    var canvas = cvs;

    this.threshold = function(imgData, t) {
      var imgDataCopy = canvas.copyImageData(imgData);
      var threshold = t || 100; //default threshold
      canvas.runImg(null, function(current) {
        var grayLevel = (0.3 * imgData.data[current]) + (0.59 * imgData.data[current + 1]) + (0.11 * imgData.data[current + 2]);
        if (grayLevel >= threshold) {
          canvas.setPixel(current, 255, imgDataCopy);
        } else {
          canvas.setPixel(current, 0, imgDataCopy);
        }
      });
      return imgDataCopy;
    };

    this.grayscale = function(imgData) {
      var imgDataCopy = canvas.copyImageData(imgData);
      console.time('Grayscale Time');
      canvas.runImg(null, function(current) {
        var grayLevel = (0.3 * imgDataCopy.data[current]) + (0.59 * imgDataCopy.data[current + 1]) + (0.11 * imgDataCopy.data[current + 2]);
        canvas.setPixel(current, grayLevel, imgDataCopy);
      });
      console.timeEnd('Grayscale Time');
      return imgDataCopy;
    };

    this.gaussianBlur = function(imgData, sigma, size) {
      var imgDataCopy = canvas.copyImageData(imgData);
      var that = this;
      var kernel = generateKernel(sigma, size);

      console.time('Blur Time');
      canvas.runImg(size, function(current, neighbors) {
        var resultR = 0;
        var resultG = 0;
        var resultB = 0;
        for (var i = 0; i < size; i++) {
          for (var j = 0; j < size; j++) {
            var pixel = canvas.getPixel(neighbors[i][j], imgData);
            resultR += pixel.r * kernel[i][j];//return the existing pixel value multiplied by the kernel matrix
            resultG += pixel.g * kernel[i][j];
            resultB += pixel.b * kernel[i][j];
          }
        }
        canvas.setPixel(current, {r: resultR, g: resultG, b: resultB}, imgDataCopy);
      });
      console.timeEnd('Blur Time');

      function generateKernel(sigma, size) {
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
        var normalize = 1/that.sum(matrix);
        for (var k = 0; k < matrix.length; k++) {
          for (var l = 0; l < matrix[k].length; l++) {
            matrix[k][l] = Math.round(normalize * matrix[k][l] * 1000)/1000;
          }
        }
        return matrix;
      }

      return imgDataCopy;
    };
  }

  exports.Filters = Filters;

}(this));
