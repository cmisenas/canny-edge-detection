;(function(exports){
  var SOBEL_X_FILTER = [[-1, 0, 1],
                        [-2, 0, 2],
                        [-1, 0, 1]];
  var SOBEL_Y_FILTER = [[1, 2, 1],
                        [0, 0, 0],
                        [-1, -2, -1]];

  function Canny(canvElem) {
    this.canvas = canvElem;
  }

  //find intensity gradient of image
  Canny.prototype.sobel = function() {
    var imgData = this.canvas.getCurrImgData(),
        imgDataCopy = this.canvas.getCurrImgData(),
        dirMap = [],
        gradMap = [],
        that = this;

    console.time('Sobel Filter Time');
    this.canvas.runImg(3, function(current, neighbors) {
      var edgeX = edgeY = 0,
          pixel = new Pixel(current, imgDataCopy.width, imgDataCopy.height);

      if (!pixel.isBorder()) {
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            edgeX += imgData.data[neighbors[i][j]] * SOBEL_X_FILTER[i][j];
            edgeY += imgData.data[neighbors[i][j]] * SOBEL_Y_FILTER[i][j];
          }
        }
      }

      dirMap[current] = roundDir(Math.atan2(edgeY, edgeX) * (180/Math.PI));;
      gradMap[current] = Math.round(Math.sqrt(edgeX * edgeX + edgeY * edgeY));

      that.canvas.setPixel(current, gradMap[current], imgDataCopy);
    });
    console.timeEnd('Sobel Filter Time');

    this.canvas.dirMap = dirMap;
    this.canvas.gradMap = gradMap;
    return imgDataCopy;
  };

  Canny.prototype.nonMaximumSuppress = function() {
    var imgDataCopy = this.canvas.getCurrImgData(),
        that = this;

    console.time('NMS Time');
    this.canvas.runImg(3, function(current, neighbors) {
      var pixNeighbors = getPixelNeighbors(that.canvas.dirMap[current]);

      //pixel neighbors to compare
      var pix1 = that.canvas.gradMap[neighbors[pixNeighbors[0].x][pixNeighbors[0].y]];
      var pix2 = that.canvas.gradMap[neighbors[pixNeighbors[1].x][pixNeighbors[1].y]];

      if (pix1 > that.canvas.gradMap[current] ||
          pix2 > that.canvas.gradMap[current] ||
          (pix2 === that.canvas.gradMap[current] &&
          pix1 < that.canvas.gradMap[current])) {
        that.canvas.setPixel(current, 0, imgDataCopy);
      }
    });
    console.timeEnd('NMS Time');

    return imgDataCopy;
  };

  //mark strong and weak edges, discard others as false edges; only keep weak edges that are connected to strong edges
  Canny.prototype.hysteresis = function(){
    var that = this,
        imgData = this.canvas.getCurrImgData(),
        imgDataCopy = this.canvas.getCurrImgData(),
        realEdges = [], //where real edges will be stored with the 1st pass
        t1 = 150, //high threshold value
        t2 = 100; //low threshold value

    //first pass
    console.time('Hysteresis Time');
    this.canvas.runImg(null, function(current) {
      if (imgData.data[current] > t1 && realEdges[current] === undefined) {//accept as a definite edge
        var group = that._traverseEdge(current, imgData, t2, []);
        for(var i = 0; i < group.length; i++){
          realEdges[group[i]] = true;
        }
      }
    });

    //second pass
    this.canvas.runImg(null, function(current) {
      if (realEdges[current] === undefined) {
        that.canvas.setPixel(current, 0, imgDataCopy);
      } else {
        that.canvas.setPixel(current, 255, imgDataCopy);
      }
    });
    console.timeEnd('Hysteresis Time');

    return imgDataCopy;
  };

  Canny.prototype.showDirMap = function() {//just a quick function to look at the direction results
    var that = this,
        imgDataCopy = this.canvas.getCurrImgData();
    this.canvas.runImg(null, function(i) {
      switch(that.canvas.dirMap[i]){
        case 0:
          that.canvas.setPixel(i, COLORS.RED, imgDataCopy);
          break;
        case 45:
          that.canvas.setPixel(i, COLORS.GREEN, imgDataCopy);
          break;
        case 90:
          that.canvas.setPixel(i, COLORS.BLUE, imgDataCopy);
          break;
        case 135:
          that.canvas.setPixel(i, COLORS.YELLOW, imgDataCopy);
          break;
        default:
          that.canvas.setPixel(i, COLORS.PINK, imgDataCopy);
      }
    });
    return imgDataCopy;
  };

  Canny.prototype.showGradMap = function() {
    var that = this,
        imgDataCopy = this.canvas.getCurrImgData();
    this.canvas.runImg(null, function(i) {
      if (that.canvas.gradMap[i] < 0) {
        that.canvas.setPixel(i, COLORS.RED, imgDataCopy);
      } else if (that.canvas.gradMap[i] < 200) {
        that.canvas.setPixel(i, COLORS.GREEN, imgDataCopy);
      } else if (that.canvas.gradMap[i] < 400) {
        that.canvas.setPixel(i, COLORS.BLUE, imgDataCopy);
      } else if (that.canvas.gradMap[i] < 600) {
        that.canvas.setPixel(i, COLORS.YELLOW, imgDataCopy);
      } else if (that.canvas.gradMap[i] < 800) {
        that.canvas.setPixel(i, COLORS.AQUA, imgDataCopy);
      } else {
        that.canvas.setPixel(i, COLORS.PINK, imgDataCopy);
      }
    });
    return imgDataCopy;
  };

  Canny.prototype._traverseEdge = function(current, imgData, threshold, traversed) {//traverses the current pixel until a length has been reached
    var group = [current]; //initialize the group from the current pixel's perspective
    var neighbors = getEdgeNeighbors(current, imgData, threshold, traversed);//pass the traversed group to the getEdgeNeighbors so that it will not include those anymore
    for(var i = 0; i < neighbors.length; i++){
      group = group.concat(this._traverseEdge(neighbors[i], imgData, threshold, traversed.concat(group)));//recursively get the other edges connected
    }
    return group; //if the pixel group is not above max length, it will return the pixels included in that small pixel group
  };

  exports.Canny = Canny;
}(this));
