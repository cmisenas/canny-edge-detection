;(function(){
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
	img.src = 'baby.jpg';
	img.style.display = 'none';
	document.body.appendChild(img);
	

	//load image data
	ctx.drawImage(img, 0, 0);

	window.addEventListener('click', function(){
		imgData = ctx.getImageData(0, 0, W, H);
		edgeDetect(imgData);		
		/*************************
		 EDGE DETECTION ALGORITHMS
		 *************************/
		//edge detection using Canny algorithm



		//edge detection using Canny-Deriche algorithm



		//edge detection using Differential algorithm



		//edge detection using Sobel algorithm



		//edge detection using Prewitt algorithm



		//edge detection using Roberts cross algorithm




		/***************************
		 CORNER DETECTION ALGORITHMS
		 ***************************/

		/*************************
		 BLOG DETECTION ALGORITHMS
		 *************************/

		/**************************
		 RIDGE DETECTION ALGORITHMS
		 **************************/

		/**************************
		 HOUGH TRANSFORM ALGORITHMS
		 **************************/

		/***************************
		 STRUCTURE TENSOR ALGORITHMS
		 ***************************/

		ctx.putImageData(imgData,0,0);
	});
	
	function edgeDetect(imgData){
		//dumb implementation of edge detect through iteration
		var THRESHOLD = 10;
		var IMAGE_WIDTH = imgData.width;
		var IMAGE_HEIGHT = imgData.height;
		var HEIGHT_INC = 	IMAGE_WIDTH * 4;
		for(var i = 0, maxlen = imgData.data.length - HEIGHT_INC; i < maxlen; i+=4){
			if(i%HEIGHT_INC !== 0 || i%HEIGHT_INC-4 !== 0 || i/HEIGHT_INC < 1){
				var pix1 = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2])/3;
				var y = i+HEIGHT_INC;
				var pix2 = (imgData.data[y] + imgData.data[y+1] + imgData.data[y+2])/3;
				var pix3 = (imgData.data[i+4] + imgData.data[i+1+4] + imgData.data[i+2+4])/3;
				if(Math.abs(pix1 - pix2) < THRESHOLD && Math.abs(pix1 - pix3) < THRESHOLD){
					imgData.data[i] = 255;
					imgData.data[i+1] = 255;
					imgData.data[i+2] = 255;
				}else{
					imgData.data[i] = 0;
					imgData.data[i+1] = 0;
					imgData.data[i+2] = 0;
				}
			}
		}
	}
	
	function invertColors(imgData){
		//invert colors
		for (var i=0;i<imgData.data.length;i+=4){
			imgData.data[i]=255-imgData.data[i];
			imgData.data[i+1]=255-imgData.data[i+1];
			imgData.data[i+2]=255-imgData.data[i+2];
			imgData.data[i+3]=255;
		}
	}

	function grayscale(imgData){
		//grayscale image
		for(var i = 0; i < imgData.data.length; i += 4){
			var grayLevel = (0.3 * imgData.data[i]) + (0.59 * imgData.data[i+1]) + (0.11 * imgData.data[i+2]);
			imgData.data[i]=grayLevel;
			imgData.data[i+1]=grayLevel;
			imgData.data[i+2]=grayLevel;
		}
	}
	
	function redChannel(imgData){
		//color channels - R
		for(var i = 0; i < imgData.data.length; i += 4){
			imgData.data[i]=imgData.data[i]*2;
			imgData.data[i+1]=imgData.data[i+1]/3;
			imgData.data[i+2]=imgData.data[i+2]/3;
		}
	}
	
	function greenChannel(imgData){
		//color channels - G
		for(var i = 0; i < imgData.data.length; i += 4){
			imgData.data[i]=imgData.data[i]/3;
			imgData.data[i+1]=imgData.data[i+1]*2;
			imgData.data[i+2]=imgData.data[i+2]/3;
		}

	}

	function blueChannel(imgData){
		//color channels - B
		for(var i = 0; i < imgData.data.length; i += 4){
			imgData.data[i]=imgData.data[i]/3;
			imgData.data[i+1]=imgData.data[i+1]/3;
			imgData.data[i+2]=imgData.data[i+2]*4;
		}
	}

	function blur(imgData){
		//dumb implementation of blur
		var IMAGE_WIDTH = imgData.width;
		var IMAGE_HEIGHT = imgData.height;
		var ROW_LEVEL = 	IMAGE_WIDTH * 4;
		for(var i = 0, maxlen = imgData.data.length; i < maxlen; i += 4){
			if(i === 0){//upper left corner
				imgData.data[i]  = (imgData.data[i] + imgData.data[i+4] + imgData.data[i+ROW_LEVEL])/3;//set the current red to the average of next x and bottom y
				imgData.data[i+1]  = (imgData.data[i+1] + imgData.data[i+1+4] + imgData.data[i+1+ROW_LEVEL])/3;//set the current green to the average of next x and bottom y
				imgData.data[i+2]  = (imgData.data[i+2] + imgData.data[i+2+4] + imgData.data[i+2+ROW_LEVEL])/3;//set the current blue to the average of next x and bottom y
			}else if(i === ROW_LEVEL - 4){//upper right corner
				imgData.data[i] = (imgData.data[i] + imgData.data[i-4] + imgData.data[i+ROW_LEVEL])/3;//set the current red to the average of previous x and bottom y
				imgData.data[i+1] = (imgData.data[i+1] + imgData.data[i+1-4] + imgData.data[i+2+ROW_LEVEL])/3;//set the current green to the average of previous x and bottom y
				imgData.data[i+2] = (imgData.data[i+2] + imgData.data[i+2-4] + imgData.data[i+1+ROW_LEVEL])/3;//set the current blue to the average of previous x and bottom y 
			}else if(i + ROW_LEVEL === maxlen){//bottom left corner
				imgData.data[i] = (imgData.data[i] + imgData.data[i+4] + imgData.data[i-ROW_LEVEL])/3;//set the current red to the average of next x and top y
				imgData.data[i+1] = (imgData.data[i+1] + imgData.data[i+1+4] + imgData.data[i+1-ROW_LEVEL])/3;//set the current green to the average of next x and top y
				imgData.data[i+2] = (imgData.data[i+2] + imgData.data[i+2+4] + imgData.data[i+2-ROW_LEVEL])/3;//set the current blue to the average of next x and top y	
			}else if(i === maxlen - 4){//bottom right corner
				imgData.data[i] = (imgData.data[i] + imgData.data[i-4] + imgData.data[i-ROW_LEVEL])/3;//set the current red to the average of previous x and top y
				imgData.data[i+1] = (imgData.data[i+1] + imgData.data[i+1-4] + imgData.data[i+1-ROW_LEVEL])/3;//set the current green to the average of previous x and top y
				imgData.data[i+2] = (imgData.data[i+2] + imgData.data[i+2-4] + imgData.data[i+2-ROW_LEVEL])/3;//set the current blue to the average of previous x and top y
			}else if(i/ROW_LEVEL < 1){//upper edge
				imgData.data[i] = (imgData.data[i] + imgData.data[i-4] + imgData.data[i+4] + imgData.data[i+ROW_LEVEL])/4;//set the current red to the average of previous x, next x and bottom y
				imgData.data[i+1] = (imgData.data[i+1] + imgData.data[i+1-4] + imgData.data[i+1+4] + imgData.data[i+1+ROW_LEVEL])/4;//set the current green to the average of previous x, next x and bottom y
				imgData.data[i+2] = (imgData.data[i+2] + imgData.data[i+2-4] + imgData.data[i+2+4] + imgData.data[i+2+ROW_LEVEL])/4;//set the current blue to the average of previous x, next x and bottom y
			}else if(i%ROW_LEVEL === 0){//left edge
				imgData.data[i] = (imgData.data[i] + imgData.data[i+4] + imgData.data[i-ROW_LEVEL] + imgData.data[i+ROW_LEVEL])/4;//set the current red to the average of next x, top y and bottom y
				imgData.data[i+1] = (imgData.data[i+1] + imgData.data[i+1+4] + imgData.data[i+1-ROW_LEVEL] + imgData.data[i+1+ROW_LEVEL])/4;//set the current green to the average of next x, top y and bottom y
				imgData.data[i+2] = (imgData.data[i+2] + imgData.data[i+2+4] + imgData.data[i+2-ROW_LEVEL] + imgData.data[i+2+ROW_LEVEL])/4;//set the current blue to the average of next x, top y and bottom y
			}else if(i%ROW_LEVEL === ROW_LEVEL-4){//right edge
				imgData.data[i] = (imgData.data[i] + imgData.data[i-4] + imgData.data[i-ROW_LEVEL] + imgData.data[i+ROW_LEVEL])/4;//set the current red to the average of previous x, top y and bottom y
				imgData.data[i+1] = (imgData.data[i+1] + imgData.data[i+1-4] + imgData.data[i+1-ROW_LEVEL] + imgData.data[i+ROW_LEVEL])/4;//set the current green to the average of previous x, top y and bottom y
				imgData.data[i+2] = (imgData.data[i+2] + imgData.data[i+2-4] + imgData.data[i+2-ROW_LEVEL] + imgData.data[i+ROW_LEVEL])/4;//set the current blue to the average of previous x, top y and bottom y
			}else if(i+ROW_LEVEL > maxlen){//bottom edge
				imgData.data[i] = (imgData.data[i] + imgData.data[i-4] + imgData.data[i+4] + imgData.data[i-ROW_LEVEL])/4;//set the current red to the average of previous x, next x and top y
				imgData.data[i+1] = (imgData.data[i+1] + imgData.data[i+1-4] + imgData.data[i+1+4] + imgData.data[i+1-ROW_LEVEL])/4;//set the current green to the average of previous x, next x and top y
				imgData.data[i+2] = (imgData.data[i+2] + imgData.data[i+2-4] + imgData.data[i+2+4] + imgData.data[i+2-ROW_LEVEL])/4;//set the current blue to the average of previous x, next x and top y
			}else{//middle of the img
				imgData.data[i] = (imgData.data[i] + imgData.data[i-4] + imgData.data[i+4] + imgData.data[i-ROW_LEVEL] + imgData.data[i+ROW_LEVEL])/5;//set the current red to the average of previous x, next x, top y and bottom y
				imgData.data[i+1] = (imgData.data[i+1] + imgData.data[i+1-4] + imgData.data[i+1+4] + imgData.data[i+1-ROW_LEVEL] + imgData.data[i+1+ROW_LEVEL])/5;//set the current green to the average of previous x, next x, top y and bottom y
				imgData.data[i+2] = (imgData.data[i+2] + imgData.data[i+2-4] + imgData.data[i+2+4] + imgData.data[i+2-ROW_LEVEL] + imgData.data[i+2+ROW_LEVEL])/5;//set the current blue to the average of previous x, next x, top y and bottom y
			}
		}
	}

}());
