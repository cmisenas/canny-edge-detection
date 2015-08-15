;(function(exports){
  var SOBEL_X_FILTER = [[-1, 0, 1],
                        [-2, 0, 2],
                        [-1, 0, 1]];
  var SOBEL_Y_FILTER = [[1, 2, 1],
                        [0, 0, 0],
                        [-1, -2, -1]];
  var ROBERTS_X_FILTER = [[1, 0],
                          [0, -1]];
  var ROBERTS_Y_FILTER = [[0, 1],
                          [-1, 0]];
  var PREWITT_X_FILTER = [[-1, 0, 1],
                          [-1, 0, 1],
                          [-1, 0, 1]];
  var PREWITT_Y_FILTER = [[-1, -1, -1],
                          [0, 0, 0],
                          [1, 1, 1]];

  var OPERATORS = { "sobel": {
                      x: SOBEL_X_FILTER,
                      y: SOBEL_Y_FILTER,
                      len: SOBEL_X_FILTER.length
                    },
                    "roberts": {
                      x: ROBERTS_X_FILTER,
                      y: ROBERTS_Y_FILTER,
                      len: ROBERTS_Y_FILTER.length
                    },
                    "prewitt": {
                      x: PREWITT_X_FILTER,
                      y: PREWITT_Y_FILTER,
                      len: PREWITT_Y_FILTER.length
                    }
                  };

  function Canny(canvElem) {
    this.canvas = canvElem;
  }

  //find intensity gradient of image
  Canny.prototype.gradient = function(op) {
    var imgData = this.canvas.getCurrentImg(),
        imgDataCopy = this.canvas.getCurrentImg(),
        dirMap = [],
        gradMap = [],
        that = this;

    console.time('Sobel Filter Time');
    this.canvas.convolve(function(neighbors, x, y, pixelIndex, cvsIndex) {
      var edgeX = edgeY = 0,
          rgba = Array.prototype.slice.call(imgDataCopy.data, cvsIndex, cvsIndex + 4),
          pixel = new Pixel(x, y, rgba);

      if (!pixel.isBorder()) {
        for (var i = 0; i < OPERATORS[op].len; i++) {
          for (var j = 0; j < OPERATORS[op].len; j++) {
            edgeX += imgData.data[neighbors[i][j]] * OPERATORS[op]["x"][i][j];
            edgeY += imgData.data[neighbors[i][j]] * OPERATORS[op]["y"][i][j];
          }
        }
      }

      dirMap[cvsIndex] = roundDir(Math.atan2(edgeY, edgeX) * (180/Math.PI));
      gradMap[cvsIndex] = Math.round(Math.sqrt(edgeX * edgeX + edgeY * edgeY));

      that.canvas.setPixel({x: x, y: y}, gradMap[cvsIndex]);
    }, 3);
    console.timeEnd('Sobel Filter Time');

    this.canvas.dirMap = dirMap;
    this.canvas.gradMap = gradMap;
    return imgDataCopy;
  };

  Canny.prototype.nonMaximumSuppress = function() {
    var imgDataCopy = this.canvas.getCurrentImg(),
        that = this;

    console.time('NMS Time');
    this.canvas.convolve(function(neighbors, x, y, pixelIndex, cvsIndex) {
      var pixNeighbors = getPixelNeighbors(that.canvas.dirMap[cvsIndex]);

      //pixel neighbors to compare
      var pix1 = that.canvas.gradMap[neighbors[pixNeighbors[0].x][pixNeighbors[0].y]];
      var pix2 = that.canvas.gradMap[neighbors[pixNeighbors[1].x][pixNeighbors[1].y]];

      if (pix1 > that.canvas.gradMap[cvsIndex] ||
          pix2 > that.canvas.gradMap[cvsIndex] ||
          (pix2 === that.canvas.gradMap[cvsIndex] &&
          pix1 < that.canvas.gradMap[cvsIndex])) {
        that.canvas.setPixel(cvsIndex, 0);
      }
    }, 3);
    console.timeEnd('NMS Time');

    return imgDataCopy;
  };

  // TODO: Do not use sparse array for storing real edges
  //mark strong and weak edges, discard others as false edges; only keep weak edges that are connected to strong edges
  Canny.prototype.hysteresis = function(){
    var that = this,
        imgDataCopy = this.canvas.getCurrentImg(),
        realEdges = [], //where real edges will be stored with the 1st pass
        t1 = fastOtsu(this.canvas), //high threshold value
        t2 = t1/2; //low threshold value

    //first pass
    console.time('Hysteresis Time');
    this.canvas.map(function(x, y, pixelIndex, cvsIndex) {
      if (imgDataCopy.data[cvsIndex] > t1 && realEdges[cvsIndex] === undefined) {//accept as a definite edge
        var group = that._traverseEdge(cvsIndex, imgDataCopy, t2, []);
        for(var i = 0; i < group.length; i++){
          realEdges[group[i]] = true;
        }
      }
    });

    //second pass
    this.canvas.map(function(x, y, pixelIndex, cvsIndex) {
      if (realEdges[cvsIndex] === undefined) {
        that.canvas.setPixel({x: x, y: y}, 0);
      } else {
        that.canvas.setPixel({x: x, y: y}, 255);
      }
    });
    console.timeEnd('Hysteresis Time');

    return imgDataCopy;
  };

  //just a quick function to look at the direction results
  Canny.prototype.showDirMap = function() {
    var that = this,
        imgDataCopy = this.canvas.getCurrentImg();
    this.canvas.map(function(x, y, pixelIndex, cvsIndex) {
      switch(that.canvas.dirMap[cvsIndex]){
        case 0:
          that.canvas.setPixel({x: x, y: y}, COLORS.RED);
          break;
        case 45:
          that.canvas.setPixel({x: x, y: y}, COLORS.GREEN);
          break;
        case 90:
          that.canvas.setPixel({x: x, y: y}, COLORS.BLUE);
          break;
        case 135:
          that.canvas.setPixel({x: x, y: y}, COLORS.YELLOW);
          break;
        default:
          that.canvas.setPixel({x: x, y: y}, COLORS.PINK);
      }
    });
    return imgDataCopy;
  };

  // TODO: Evaluate function use/fulness
  Canny.prototype.showGradMap = function() {
    var that = this,
        imgDataCopy = this.canvas.getCurrentImg();
    this.canvas.map(function(x, y, pixelIndex, cvsIndex) {
      if (that.canvas.gradMap[cvsIndex] < 0) {
        that.canvas.setPixel(cvsIndex, COLORS.RED);
      } else if (that.canvas.gradMap[cvsIndex] < 200) {
        that.canvas.setPixel(cvsIndex, COLORS.GREEN);
      } else if (that.canvas.gradMap[cvsIndex] < 400) {
        that.canvas.setPixel(cvsIndex, COLORS.BLUE);
      } else if (that.canvas.gradMap[cvsIndex] < 600) {
        that.canvas.setPixel(cvsIndex, COLORS.YELLOW);
      } else if (that.canvas.gradMap[i] < 800) {
        that.canvas.setPixel(cvsIndex, COLORS.AQUA);
      } else {
        that.canvas.setPixel(cvsIndex, COLORS.PINK);
      }
    });
    return imgDataCopy;
  };

  // TODO: Optimize prime!
  //traverses the current pixel until a length has been reached
  Canny.prototype._traverseEdge = function(current, imgData, threshold, traversed) {
    //initialize the group from the current pixel's perspective
    var group = [current];
    //pass the traversed group to the getEdgeNeighbors so that it will not include those anymore
    var neighbors = getEdgeNeighbors(current, imgData, threshold, traversed);
    for(var i = 0; i < neighbors.length; i++){
      //recursively get the other edges connected
      group = group.concat(this._traverseEdge(neighbors[i], imgData, threshold, traversed.concat(group)));
    }
    return group;
    //if the pixel group is not above max length,
    //it will return the pixels included in that small pixel group
  };

  exports.Canny = Canny;
}(this));
