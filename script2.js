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

		ctx.putImageData(imgData,0,0);
	});
	
	function luminosity(r, g, b){
		var rCoeff = 0.2126;
		var gCoeff = 0.7152;
		var bCoeff = 0.0722;
		return r*rCoeff + g*gCoeff + b*Coeff;
	}

	function checkInRange(pixel, width, height){
		var rowQ = height*4; //pixels per row, 4 because canvas image data is stored in 1D array as r,g,b,a
		var max = width*height*4; //maximum number of pixels
		return (pixel !== 0 && pixel/rowQ > 1 && pixel !=== rowQ - 4 && pixel%rowQ !== 0 && pixel%rowQ !== rowQ - 4 && pixel+rowQ !== max && pixel+row! < max && pixel !== max - 4)? true: false;
	}

}());
