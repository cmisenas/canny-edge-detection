(function () {
  'use strict';

  var $byId = document.getElementById.bind(document);

  var loadBtn = $byId('load');
  var canvas = new Canvas('canvas');

  loadBtn.onclick = function () {
    var usrImg = $byId('usrImg').value;
    console.log(usrImg);
    canvas.loadImg('img' + usrImg.substr(usrImg.lastIndexOf('\\')));
  };

  var canny = new Canny(canvas);

  var grayBtn = $byId('gray');
  var blurBtn = $byId('blur');
  var sobelBtn = $byId('sobel');
  var nmsBtn = $byId('nms');
  var hysBtn = $byId('hys');
  var dirBtn = $byId('dirmap');
  var gradBtn = $byId('gradmap');
  var invertBtn = $byId('invert');
  var resetBtn = $byId('reset');

  grayBtn.onclick = function () {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height);
    var newImgData = canny.grayscale(currentImgData);
    canvas.ctx.putImageData(newImgData, 0, 0);
  };

  blurBtn.onclick = function () {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height);
    var size = Number($byId('size').value);
    size = (size <= 1 || size > 21) ? 3 : (size % 2 === 0) ? size - 1 : size;
    var sigma = Number($byId('sigma').value);
    sigma = (sigma < 1 || sigma > 10) ? 1.5 : sigma;
    var newImgData = canny.gaussianBlur(currentImgData, sigma, size);
    canvas.ctx.putImageData(newImgData, 0, 0);
  };

  sobelBtn.onclick = function () {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height);
    var result = canny.sobel(currentImgData);
    canvas.ctx.putImageData(result, 0, 0);

    nmsBtn.disabled = false;

    nmsBtn.onclick = function () {
      var newImgData = canny.nonMaximumSuppress(result);
      canvas.ctx.putImageData(newImgData, 0, 0);

      dirBtn.disabled = false;
      gradBtn.disabled = false;
      hysBtn.disabled = false;

      newImgData.dirMap = result.dirMap;
      newImgData.gradMap = result.gradMap;
      var dirMap = canny.showDirMap(newImgData),
        gradMap = canny.showGradMap(newImgData),
        hysImgData = canny.hysteresis(newImgData);

      hysBtn.onclick = function () {
        var newImgData = hysImgData();
        canvas.ctx.putImageData(newImgData, 0, 0);
      };

      dirBtn.onclick = function () {
        var newImgData = dirMap();
        canvas.ctx.putImageData(newImgData, 0, 0);
      };

      gradBtn.onclick = function () {
        var newImgData = gradMap();
        canvas.ctx.putImageData(newImgData, 0, 0);
      };
    };
  };

  invertBtn.onclick = function () {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height);
    var newImgData = canny.invertColors(currentImgData);
    canvas.ctx.putImageData(newImgData, 0, 0);
  };

  resetBtn.onclick = function () {
    canvas.ctx.putImageData(canvas.currentImg.imgData, 0, 0);//put back the original image to the canvas
  };

}());
