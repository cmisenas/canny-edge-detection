;(function(exports) {
  var canvas = new Canvas('canvas'),
      canny = new Canny(canvas),
      filters = new Filters(canvas);

  var grayBtn = document.getElementById('gray'),
      blurBtn = document.getElementById('blur'),
      sobelBtn = document.getElementById('sobel'),
      nmsBtn = document.getElementById('nms'),
      hysBtn = document.getElementById('hys'),
      dirBtn = document.getElementById('dirmap'),
      gradBtn = document.getElementById('gradmap'),
      invertBtn = document.getElementById('invert'),
      resetBtn = document.getElementById('reset');

  function checkForImg() {
    var params = window.location.search;
    var imgFile;
    if (params !== '' && params.indexOf("img=") > -1) {
      imgFile = params.substring(params.indexOf("img=") + 4);
      canvas.loadImg('uploads/' + imgFile);
    }
  }

  grayBtn.onclick = function() {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height);
    var newImgData = filters.grayscale(currentImgData);
    canvas.ctx.putImageData(newImgData, 0, 0);
  };

  blurBtn.onclick = function() {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height);
    var size = Number(document.getElementById('size').value);
    size = (size <= 1 || size > 21) ? 3 : (size % 2 === 0) ? size - 1 : size;
    var sigma = Number(document.getElementById('sigma').value);
    sigma = (sigma < 1 || sigma > 10) ? 1.5 : sigma;
    var newImgData = filters.gaussianBlur(currentImgData, sigma, size);
    canvas.ctx.putImageData(newImgData, 0, 0);
  };

  sobelBtn.onclick = function() {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height),
        result = canny.sobel(currentImgData);
    canvas.setImgData(result);

    nmsBtn.disabled = false;

    nmsBtn.onclick = function() {
      var nmsImgData = canny.nonMaximumSuppress(result);
      canvas.setImgData(nmsImgData);
      dirBtn.disabled = false;
      gradBtn.disabled = false;
      hysBtn.disabled = false;
      nmsImgData.dirMap = result.dirMap;
      nmsImgData.gradMap = result.gradMap;

      hysBtn.onclick = function() {
        var newImgData = canny.hysteresis(nmsImgData);
        canvas.setImgData(newImgData);
      };

      dirBtn.onclick = function() {
        var newImgData = canny.showDirMap(nmsImgData);
        canvas.setImgData(newImgData);
      };

      gradBtn.onclick = function() {
        var newImgData = canny.showGradMap(nmsImgData);
        canvas.setImgData(newImgData);
      };
    };
  };

  invertBtn.onclick = function() {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height),
        newImgData = filters.invertColors(currentImgData);
    canvas.setImgData(newImgData);
  };

  resetBtn.onclick = function() {
    canvas.setImgData(canvas.origImg.imgData);//put back the original image to the canvas
  };

  checkForImg();
}(this));
