(function (exports) {
  'use strict';

  function Filters(cvs) {
    var canvas = cvs;

    this.threshold = function (imgData, t) {
      var imgDataCopy = canvas.copyImageData(imgData);
      var threshold = t || 100; //default threshold
      canvas.runImg(null, function (current) {
        var grayLevel = (0.3 * imgData.data[current]) + (0.59 * imgData.data[current + 1]) + (0.11 * imgData.data[current + 2]);
        if (grayLevel >= threshold) {
          canvas.setPixel(current, 255, imgDataCopy);
        } else {
          canvas.setPixel(current, 0, imgDataCopy);
        }
      });
      return imgDataCopy;
    };
  }

  exports.Filters = Filters;

}(this));
