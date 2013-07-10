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
	
	var clicks = 0;
	window.addEventListener('click', function(){
		imgData = ctx.getImageData(0, 0, W, H);
		if(clicks === 0){
			var newImgData = edgeDetect(imgData);
			ctx.putImageData(newImgData, 0, 0);
		}else if(clicks === 1){
			var newerImgData = edgeThin(imgData);
			ctx.putImageData(newerImgData, 0, 0);
		}
		clicks++;
	});
	
	function edgeDetect(imgData){
		var imgDataCopy = copyImageData(ctx, imgData);
		var THRESHOLD = 10;
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

	function edgeThin(imgData){//2-pass algorithm
		//iterate through each pixel and do an 3x3 search on the neighbors
		//mark if
		//*it has no neighbors
		//*it's nw, n, ne || nw, w, sw || sw, s, se || ne, e, se || nw, n, e || ne, n, w || nw, w, s || sw, w, n || w, s, se, || e, s, sw || n, e, se || s, e, ne is filled
		//	___________________
		//	|	nw	|	 n	|	ne	|
		//	|_____|_____|_____|
		//	|	 w	|	 o	|	 e	|
		//	|_____|_____|_____|
		//	|	sw	|	 s	|	se	|
		//	|_____|_____|_____|
		var imgDataCopy = copyImageData(ctx, imgData);
		for(var y = 0; y < imgData.height; y++){
			for(var x = 0; x < imgData.width; x++){
				var i = x * 4 + y * imgData.width * 4;
				var o = imgDataCopy.data[i];
				var n = imgDataCopy.data[i - imgData.width * 4];
				var nw = imgDataCopy.data[i - imgData.width * 4 - 4];
				var ne = imgDataCopy.data[i - imgData.width * 4 + 4];
				var w = imgDataCopy.data[i - 4];
				var e = imgDataCopy.data[i + 4];
				var s = imgDataCopy.data[i + imgData.width * 4];
				var sw = imgDataCopy.data[i + imgData.width * 4 - 4];
				var se = imgDataCopy.data[i + imgData.width * 4 + 4];
				if(((n && nw && ne && w && e && s && sw && se) ||
					(!nw && !n && !ne) ||
					(!nw && !w && !sw) ||
					(!sw && !s && !se) ||
					(!ne && !e && !se) ||
					(!nw && !n && !e) ||
					(!ne && !n && !w) ||
					(!nw && !w && !s) ||
					(!sw && !w && !n) ||
					(!w && !s && !se) ||
					(!e && !s && !sw) ||
					(!n && !e && !se) ||
					(!s && !e && !ne) ||
					(!w && !nw && !n) ||
					(!n && !ne && !e) ||
					(!e && !se && !s) ||
					(!w && !sw && !s) ||
					(!n && !w) ||
					(!n && !e) ||
					(!s && !w) ||
					(!s && !e)) &&
					(!o)){
					setPixel(i, 255, imgDataCopy);
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
