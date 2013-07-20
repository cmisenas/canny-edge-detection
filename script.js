;(function() {
	var loadBtn = document.getElementById('load');
	var canvas = new Canvas('canvas');
	loadBtn.onclick = function() {
		var usrImg = document.getElementById('usrImg').value;
		canvas.loadImg(usrImg.substr(usrImg.lastIndexOf('\\')));
	}

	var grayBtn = document.getElementById('gray');
	var blurBtn = document.getElementById('blur');
	var edgeBtn = document.getElementById('edge');
	var hysBtn = document.getElementById('hys');
	var dirBtn = document.getElementById('dirmap');
	var gradBtn = document.getElementById('gradmap');
	var invertBtn = document.getElementById('invert');
	var resetBtn = document.getElementById('reset');

	grayBtn.onclick = function() {
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var newImgData = grayscale(currImgData);
		ctx.putImageData(newImgData, 0, 0);
	}

	blurBtn.onclick = function() {//for applying Gaussian filter
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var size = Number(document.getElementById('size').value);
		size = (size <= 1 || size > 21) ? 3 : (size % 2 === 0) ? size - 1 : size;
		var sigma = Number(document.getElementById('sigma').value);
		sigma = (sigma < 1 || sigma > 10) ? 1.5 : sigma;
		var newImgData = gaussianBlur(currImgData, sigma, size);
		ctx.putImageData(newImgData, 0, 0);
	}

	edgeBtn.onclick = function() {
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var result = sobel(currImgData);
		var newImgData = nonMaximumSuppress(result);
		ctx.putImageData(newImgData, 0, 0);
		newImgData.dirMap = result.dirMap;
		newImgData.gradMap = result.gradMap;
		dirBtn.disabled = false;
		gradBtn.disabled = false;
		hysBtn.disabled = false;
		var dirMap = showDirMap(newImgData);
		var gradMap = showGradMap(newImgData);
		var hysImgData = hysteresis(newImgData);
		hysBtn.onclick = function() {
			var newImgData = hysImgData();
			ctx.putImageData(newImgData, 0, 0);
		}	
		dirBtn.onclick = function() {
			var newImgData = dirMap();
			ctx.putImageData(newImgData, 0, 0);
		}	
		gradBtn.onclick = function() {
			var newImgData = gradMap();
			ctx.putImageData(newImgData, 0, 0);
		}	
	}

	invertBtn.onclick = function() {
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var newImgData = invertColors(currImgData);
		ctx.putImageData(newImgData, 0, 0);
	}

	resetBtn.onclick = function() {
		ctx.putImageData(imgData, 0, 0);//put back the original image to the canvas
	}
}());
