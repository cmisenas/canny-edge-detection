;(function(exports) {
	
	function Canvas(id, w, h, res) {
		this.elem = document.getElementById(id);
		this.width = w || 620;
		this.height = h || 420;
		if (this.elem === null) {
			this.elem = document.createElement('canvas');
			this.elem.id = id;
			this.elem.width = this.width;
			this.elem.height = this.height;
			document.body.insertBefore(this.elem, document.body.firstChild);
		}
		this.ctx = this.elem.getContext('2d');
		this.images = [];
		this.currentImg = {};

		var resizable = res || true;
		if (resizable === true) {
			this.elem.onmouseover = this.resize;
			this.elem.onmouseout = function() {
				this.style.cursor = 'auto';
			}
		}
	}

	Canvas.prototype.resize = function(e) {
		if (e.pageX === this.offsetLeft && e.pageY !== this.offsetTop) {
			this.style.cursor = 'w-resize';
		} else if (e.pageX !== this.offsetLeft && e.pageY === this.offsetTop) {
			this.style.cursor = 'n-resize';
		} else if (e.pageX === this.offsetLeft + this.width - 1 && e.pageY !== this.offsetTop + this.height - 1) {
			this.style.cursor = 'e-resize';
		} else if (e.pageX !== this.offsetLeft + this.width - 1 && e.pageY === this.offsetTop + this.height - 1) {
			this.style.cursor = 's-resize';
		}
	}

	Canvas.prototype.loadImg = function(img, sx, sy) {
		this.images.push(img);
		this.currentImg.index = this.images.indexOf(img);
		
		var that = this;
		var usrImg = new Image();
		usrImg.onload = function() {
			that.ctx.drawImage(usrImg, sx || 10, sy || 10);
			that.currentImg.imgData = that.ctx.getImageData(0, 0, that.elem.width, that.elem.height);
		}
		usrImg.src = img;
	}

	exports.Canvas = Canvas;

}(this));
