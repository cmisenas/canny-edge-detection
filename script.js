;(function(exports){
	//get necessary variables
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var imgData;
	//set canvas width and height
	var W = 600;
	var H = 400;
	//sytle canvas
	canvas.width = W;
	canvas.height = H;
	canvas.style.display = 'block';
	canvas.style.margin = '50px auto';

	//add image to page so it can be accessed
	var img = document.createElement('img');
	img.src = 'shapes.jpg';
	img.style.display = 'none';
	document.body.appendChild(img);
	

	//load image data
	ctx.drawImage(img, 0, 0);
	
	window.addEventListener('click', function(){
		imgData = ctx.getImageData(0, 0, W, H);
		var newImgData = edgeDetect(imgData);
		ctx.putImageData(newImgData, 0, 0);
	});
	
	function edgeDetect(imgData){
		var imgDataCopy = copyImageData(ctx, imgData);
		var THRESHOLD = 30;
		for(var y = 0; y < imgData.height; y++){
			for(var x = 0; x < imgData.width; x++){
				var i = x * 4 + y * imgData.width * 4;
				var pix1 = getPixel(i, imgData);
				var pix2 = getPixel(i + imgData.width * 4, imgData) || pix1;
				var pix3 = getPixel(i + 4, imgData) || pix1;
				if(Math.abs(pix1 - pix2) < THRESHOLD && Math.abs(pix1 - pix3) < THRESHOLD){
					setPixel(i, 255, imgDataCopy);
				}else{
					setPixel(i, 0, imgDataCopy);
				}
			}
		}
		return imgDataCopy;
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
	  if (i > imgData.data.length){
			return false;
		}
		return (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2])/3;
	}
	exports.getPixel = getPixel;
}(this));
