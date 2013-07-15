;(function(exports){
	//get necessary variables
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var imgData;
	//sytle canvas
	canvas.width = 600;
	canvas.height = 400;
	canvas.style.display = 'block';
	canvas.style.margin = '50px auto';

	//add image to page so it can be accessed
	var img = document.createElement('img');
	img.src = 'groovy.jpg';
	img.style.display = 'none';
	document.body.appendChild(img);
	

	//load image data
	ctx.drawImage(img, 0, 0);
	
	img.onload = function() {
		imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	}

	var grayBtn = document.getElementById('gray');
	var blurBtn = document.getElementById('blur');
	var edgeBtn = document.getElementById('edge');
	var invertBtn = document.getElementById('invert');
	var resetBtn = document.getElementById('reset');

	grayBtn.onclick = function() {
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var newImgData = grayscale(currImgData);
		ctx.putImageData(newImgData, 0, 0);
	}

	blurBtn.onclick = function() {//for applying Gaussian filter
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var size = document.getElementById('size').value;
		size = parseInt(size) || 3;//default to 3 if size is empty
		var newImgData = gaussianBlur(currImgData, 1.5, 3);
		ctx.putImageData(newImgData, 0, 0);
	}
	
	edgeBtn.onclick = function() {
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var result = sobel(currImgData);
		imgData.dirMap = result.dir; //store the direction somewhere for the meantime as code is currently performing Canny steps one by one
		ctx.putImageData(result.img, 0, 0);
	}
	
	invertBtn.onclick = function() {
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var newImgData = invertColors(currImgData);
		ctx.putImageData(newImgData, 0, 0);
	}

	resetBtn.onclick = function() {
		ctx.putImageData(imgData, 0, 0);//put back the original image to the canvas
	}

	function grayscale(imgData) {
		var imgDataCopy = copyImageData(ctx, imgData);
		runImg(imgData.height, imgData.width, size, function(current) { 
			var grayLevel = (0.3 * imgDataCopy.data[current]) + (0.59 * imgDataCopy.data[current + 1]) + (0.11 * imgDataCopy.data[current + 2]);
			imgDataCopy.data[current]=grayLevel;
			imgDataCopy.data[current + 1]=grayLevel;
			imgDataCopy.data[current + 2]=grayLevel;
		});
		return imgDataCopy;
	}
	
	function gaussianBlur(imgData, sigma, size) {
		var imgDataCopy = copyImageData(ctx, imgData);
		var kernel = generateKernel(sigma, size);
		runImg(imgData.height, imgData.width, size, function(current, neighbors) {
			//iterate through each of the neighbors plus the current pixel to apply some function, in this case, multiply to the kernel and add
			var resultR = 0;
			var resultG = 0;
			var resultB = 0;
			if (checkCornerOrBorder(current, imgData.width, imgData.height) === false) { //check if it is less than 0, more than the total length, beyong the left or right edges, then set to the center pixel
				for (var i = 0; i < size; i++) {
					for (var j = 0; j < size; j++) {
						resultR += imgData.data[neighbors[i][j]] * kernel[i][j];//return the existing pixel value multiplied by the kernel matrix
						resultG += imgData.data[neighbors[i][j] + 1] * kernel[i][j];
						resultB += imgData.data[neighbors[i][j] + 2] * kernel[i][j];
					}
				}
			}
			imgDataCopy.data[current] = resultR;
			imgDataCopy.data[current + 1] = resultG;
			imgDataCopy.data[current + 2] = resultB;
		});
		return imgDataCopy;
	}
	
	function sobel(imgData) {//find intensity gradient of image
		var imgDataCopy = copyImageData(ctx, imgData);
		var dirMap = [];
		//perform vertical convolution
		var xfilter = [[-1, 0, 1],
									 [-2, 0, 2],
									 [-1, 0, 1]];
		//perform horizontal convolution
		var yfilter = [[1, 2, 1],
									 [0, 0, 0],
									 [-1, -2, -1]];

		runImg(imgData.height, imgData.width, 3, function(current, neighbors) {
			var edgeX = 0;
			var edgeY = 0;
			if (checkCornerOrBorder(current, imgData.width, imgData.height) === false) { //check if it is less than 0, more than the total length, beyong the left or right edges, then set to the center pixel
				for (var i = 0; i < 3; i++) {
					for (var j = 0; j < 3; j++) {
						edgeX += imgData.data[neighbors[i][j]] * xfilter[i][j];
						edgeY += imgData.data[neighbors[i][j]] * yfilter[i][j];
					}
				}
			}
			
			edgeX = edgeX === 0? edgeX + 0.001: edgeX;
			var dir = roundDir(Math.round(Math.atan(edgeY/edgeX) * (180/Math.PI)));
			dirMap[current] = dir;

			var grad = Math.round(Math.sqrt(edgeX * edgeX + edgeY * edgeY));
			imgDataCopy.data[current] = grad;
			imgDataCopy.data[current + 1] = grad;
			imgDataCopy.data[current + 2] = grad;
		});

		//perform diagonal1 convolution
		//perform diagonal2 convolution
		return {img: imgDataCopy, dir: dirMap};
	}

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
		var normalize = 1/sum(matrix);
		for (var i = 0; i < matrix.length; i++) {
			for (var j = 0; j < matrix[i].length; j++) {
				matrix[i][j] = Math.round(normalize * matrix[i][j] * 1000)/1000;
			}
		}
		return matrix;
	}
	
	function invertColors(imgData) {
		var imgDataCopy = copyImageData(ctx, imgData);
		runImg(imgData.height, imgData.width, null, function(current) {
			imgDataCopy.data[current] = 255 - imgDataCopy.data[current];
			imgDataCopy.data[current + 1] = 255 - imgDataCopy.data[current + 1];
			imgDataCopy.data[current + 2] = 255 - imgDataCopy.data[current + 2];
		});
		return imgDataCopy;
	}
	
	//helper functions
	function runImg(height, width, size, fn) {
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				var i = x * 4 + y * width * 4;
				var matrix = getMatrix(x, y, size, width, height);
				fn(i, matrix);
			}
		}
	}

	/*
	 * args: center x, center y, size of matrix, width of larger matrix, height of larger matrix
	 */
	function getMatrix(cx, cy, size, width, height) {//will generate a 2d array of sizexsize
		var matrix = [];
		for (var i = 0, y = -(size-1)/2; i < size; i++, y++) {
			matrix[i] = [];
			for (var j = 0, x = -(size-1)/2; j < size; j++, x++) {
				matrix[i][j] = (cx + x) * 4 + (cy + y) * width * 4;
			}
		}
		return matrix;
	}
	
	function checkCornerOrBorder(i, width, height) {//returns true if a pixel lies on the border of an image
		return i - (width * 4) < 0 || i % (width * 4) === 0 || i % (width * 4) === (width * 4) - 4  || i + (width * 4) > width * height * 4;
	}

	function roundDir(deg) {
		var roundVal = 0;
		if ((deg >= 0 && deg <= 22.5) || (deg > 157.5 && deg <= 180)) {
			roundVal = 0;
		} else if (deg > 22.5 && deg <= 67.5) {
			roundVal = 45;
		} else if (deg > 67.5 && deg <= 112.5) {
			roundVal = 90;
		} else if (deg > 112.5 && deg <= 157.5) {
			roundVal = 135;
		}
		return roundVal;
	}
	
	function sum(arr) {//receives an array and returns sum
		var result = 0;
		for (var i = 0; i < arr.length; i++) {
			if (/^\s*function Array/.test(String(arr[i].constructor))) {
				result += sum(arr[i]);
			} else {
				result += arr[i];
			}
		}
		return result;
	}

	function copyImageData(ctx, src){
			var dst = ctx.createImageData(src.width, src.height);
			dst.data.set(src.data);
			return dst;
	}

	function setPixel(i, val, imgData){
		imgData.data[i] = val;
		imgData.data[i + 1] = val;
		imgData.data[i + 2] = val;
	}

	function getPixel(i, imgData){
	  if (i > imgData.data.length)
			return false;
		return (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2])/3;
	}
}(this));
