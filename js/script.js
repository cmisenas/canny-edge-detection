;(function(exports) {
  var canvas = new Canvas('canvas');
  var canny = new Canny(canvas),
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
      console.log(imgFile);
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
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height);
    var result = canny.sobel(currentImgData);
    canvas.ctx.putImageData(result, 0, 0);

    nmsBtn.disabled = false;

    nmsBtn.onclick = function() {
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

      hysBtn.onclick = function() {
        var newImgData = hysImgData();
        canvas.ctx.putImageData(newImgData, 0, 0);
      };

      dirBtn.onclick = function() {
        var newImgData = dirMap();
        canvas.ctx.putImageData(newImgData, 0, 0);
      };

      gradBtn.onclick = function() {
        var newImgData = gradMap();
        canvas.ctx.putImageData(newImgData, 0, 0);
      };
    };
  };

  invertBtn.onclick = function() {
    var currentImgData = canvas.ctx.getImageData(0, 0, canvas.elem.width, canvas.elem.height);
    var newImgData = filters.invertColors(currentImgData);
    canvas.ctx.putImageData(newImgData, 0, 0);
  };

  resetBtn.onclick = function() {
    canvas.ctx.putImageData(canvas.currentImg.imgData, 0, 0);//put back the original image to the canvas
  };

  checkForImg();
}(this));
