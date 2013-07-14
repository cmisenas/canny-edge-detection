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

	var blurBtn = document.getElementById('blur');
	var resetBtn = document.getElementById('reset');

	blurBtn.onclick = function() {//for applying Gaussian filter
		var currImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var size = document.getElementById('size').value;
		size = parseInt(size) || 3;//default to 3 if size is empty
	}

	resetBtn.onclick = function() {
		ctx.putImageData(imgData, 0, 0);//put back the original image to the canvas
	}
	
	function edgeDetect(imgData){
		//only work on a copy of the image data
		var imgDataCopy = copyImageData(ctx, imgData);
		var THRESHOLD = 20;
		for(var y = 0; y < imgData.height; y++){
			for(var x = 0; x < imgData.width; x++){
				var i = x * 4 + y * imgData.width * 4;
				var pix1 = getPixel(i, imgData);
				var pix2 = getPixel(i + imgData.width * 4, imgData) || pix1; //get the pixel directly below it or set it to the same pixel for cases like bottom edges
				var pix3 = getPixel(i + 4, imgData) || pix1; //get the pixel next to it or set it to the same pixel for cases like the right edges
				if(Math.abs(pix1 - pix2) < THRESHOLD && Math.abs(pix1 - pix3) < THRESHOLD){//edge NOT detected
					setPixel(i, 255, imgDataCopy);
				}else{//edge detected
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
		var imgDataCopy = removeFalseEdges(imgDataCopy);
		return imgDataCopy;
	}
	
	function removeFalseEdges(imgData){
		var imgDataCopy = copyImageData(ctx, imgData);
		for(var y = 0; y < imgData.height; y++){
			for(var x = 0; x < imgData.width; x++){
				var i = x * 4 + y * imgData.width * 4;
				var o = imgDataCopy.data[i];
				//get it's neighboring pixels in n, s, e, w, ne, nw, se & sw
				var n = imgDataCopy.data[i - imgData.width * 4];
				var nw = imgDataCopy.data[i - imgData.width * 4 - 4];
				var ne = imgDataCopy.data[i - imgData.width * 4 + 4];
				var w = imgDataCopy.data[i - 4];
				var e = imgDataCopy.data[i + 4];
				var s = imgDataCopy.data[i + imgData.width * 4];
				var sw = imgDataCopy.data[i + imgData.width * 4 - 4];
				var se = imgDataCopy.data[i + imgData.width * 4 + 4];
				if((!!o && !!n && !!nw && !!ne && !!w && !!e && !!sw && !!s && !!se)//remove black pixels that are alone
					 ){
					setPixel(i, 255, imgDataCopy);
				}
			}
		}
		return imgDataCopy;
	}

	function removeSmallEdges(imgData){
		var imgDataCopy = copyImageData(ctx, imgData);
		for(var y = 0; y < imgData.height; y++){
			for(var x = 0; x < imgData.width; x++){
				var i = x * 4 + y * imgData.width * 4;
				var o = imgDataCopy.data[i];
				if(o === 0){//only care if the current pixel is an edge/black
					var group = traverse(i, imgData, []);
					if(group.length < 10){//only delete the group if it is less than 10 in size
						for(var j = 0; j < group.length; j++){
							setPixel(group[j], 255, imgDataCopy);
						}
					}
				}
			}
		}
		return imgDataCopy;
	}

	function traverse(i, imgData, traversed){//traverses the current pixel until a length has been reached
		var group = [i]; //initialize the group from the current pixel's perspective
		var neighbors = getNeighborEdges(i, imgData, traversed);//i want to pass the traversed group to the getNeighborEdges so that it will not include those anymore
		for(var i = 0; i < neighbors.length; i++){
			group = group.concat(traverse(neighbors[i], imgData, traversed.concat(group)));//recursively get the other edges connected
		}
		return group; //if the pixel group is not above max length, it will return the pixels included in that small pixel group
	}

	function getNeighborEdges(i, imgData, includedEdges){
		var neighbors = [];
		var directions = [
			i + 4, //e
			i - imgData.width * 4 + 4, //ne
			i - imgData.width * 4, //n
			i - imgData.width * 4 - 4, //nw
			i - 4, //w
			i + imgData.width * 4 - 4, //sw
			i + imgData.width * 4, //s
			i + imgData.width * 4 + 4 //se
		];
		for(var j = 0; j < directions.length; j++)
			if(imgData.data[directions[j]] === 0 && includedEdges.indexOf(directions[j]) === -1)
				neighbors.push(directions[j]);	
		return neighbors;
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
