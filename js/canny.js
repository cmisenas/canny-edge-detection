;(function(exports){
  function Canny(canvElem) {
    this.canvas = canvElem;
  }

  //find intensity gradient of image
  Canny.prototype.sobel = function(imgData) {
    var imgDataCopy = this.canvas.copyImageData(imgData),
        dirMap = [],
        gradMap = [],
        dir, grad,
        that = this;

    //perform vertical convolution
    var xfilter = [[-1, 0, 1],
                   [-2, 0, 2],
                   [-1, 0, 1]];
    //perform horizontal convolution
    var yfilter = [[1, 2, 1],
                   [0, 0, 0],
                   [-1, -2, -1]];

    console.time('Sobel Filter Time');
    this.canvas.runImg(3, function(current, neighbors) {
      var edgeX = 0;
      var edgeY = 0;
      if (checkCornerOrBorder(current, imgDataCopy.width, imgDataCopy.height) === false) {
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            edgeX += imgData.data[neighbors[i][j]] * xfilter[i][j];
            edgeY += imgData.data[neighbors[i][j]] * yfilter[i][j];
          }
        }
      }

      dir = roundDir(Math.atan2(edgeY, edgeX) * (180/Math.PI));
      dirMap[current] = dir;

      grad = Math.round(Math.sqrt(edgeX * edgeX + edgeY * edgeY));
      gradMap[current] = grad;

      that.canvas.setPixel(current, grad, imgDataCopy);
    });
    console.timeEnd('Sobel Filter Time');

    function checkCornerOrBorder(i, width, height) {
      //returns true if a pixel lies on the border of an image
      return i - (width * 4) < 0 || i % (width * 4) === 0 || i % (width * 4) === (width * 4) - 4  || i + (width * 4) > width * height * 4;
    }

    function roundDir(deg) {//rounds degrees to 4 possible orientations: horizontal, vertical, and 2 diagonals
      deg = deg < 0 ? deg + 180 : deg;
      var roundVal;
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

    imgDataCopy.dirMap = dirMap;
    imgDataCopy.gradMap = gradMap;
    return imgDataCopy;
  };

  Canny.prototype.nonMaximumSuppress = function(imgData) {
    var imgDataCopy = this.canvas.copyImageData(imgData),
        that = this;
    console.time('NMS Time');
    this.canvas.runImg(3, function(current, neighbors) {
      var pixNeighbors = getNeighbors(imgData.dirMap[current]);

      //pixel neighbors to compare
      var pix1 = imgData.gradMap[neighbors[pixNeighbors[0].x][pixNeighbors[0].y]];
      var pix2 = imgData.gradMap[neighbors[pixNeighbors[1].x][pixNeighbors[1].y]];

      if (pix1 > imgData.gradMap[current] || pix2 > imgData.gradMap[current]) {//suppress
        that.canvas.setPixel(current, 0, imgDataCopy);
      } else if (pix2 === imgData.gradMap[current] && pix1 < imgData.gradMap[current]) {
        that.canvas.setPixel(current, 0, imgDataCopy);
      }
    });
    console.timeEnd('NMS Time');

    function getNeighbors(dir) {
      var degrees = {0 : [{x:1, y:2}, {x:1, y:0}], 45 : [{x: 0, y: 2}, {x: 2, y: 0}], 90 : [{x: 0, y: 1}, {x: 2, y: 1}], 135 : [{x: 0, y: 0}, {x: 2, y: 2}]};
      return degrees[dir];
    }

    return imgDataCopy;
  };

  //mark strong and weak edges, discard others as false edges; only keep weak edges that are connected to strong edges
  Canny.prototype.hysteresis = function(imgData){
    var that = this;
    return function() {
      var imgDataCopy = that.canvas.copyImageData(imgData);
      var realEdges = []; //where real edges will be stored with the 1st pass
      var t1 = 150; //high threshold value
      var t2 = 100; //low threshold value

      //first pass
      console.time('Hysteresis Time');
      that.canvas.runImg(null, function(current) {
        if (imgData.data[current] > t1 && realEdges[current] === undefined) {//accept as a definite edge
          var group = that.traverseEdge(current, imgData, t2, []);
          for(var i = 0; i < group.length; i++){
            realEdges[group[i]] = true;
          }
        }
      });

      //second pass
      that.canvas.runImg(null, function(current) {
        if (realEdges[current] === undefined) {
          that.canvas.setPixel(current, 0, imgDataCopy);
        } else {
          that.canvas.setPixel(current, 255, imgDataCopy);
        }
      });
      console.timeEnd('Hysteresis Time');

      return imgDataCopy;
    };
  };


  Canny.prototype.invertColors = function(imgData) {
    var imgDataCopy = this.canvas.copyImageData(imgData),
        that = this;
    console.time('Invert Colors Time');
    this.canvas.runImg(null, function(current) {
      that.canvas.setPixel(current, {r: 255 - imgDataCopy.data[current], g: 255 - imgDataCopy.data[current + 1], b: 255 - imgDataCopy.data[current + 2]}, imgDataCopy);
    });
    console.timeEnd('Invert Colors Time');
    return imgDataCopy;
  };

  Canny.prototype.showDirMap = function(imgData) {//just a quick function to look at the direction results
    var that = this;
    return function() {
      var imgDataCopy = that.canvas.copyImageData(imgData);
      that.canvas.runImg(null, function(i) {
        if (imgData.dirMap[i] === 0) {
          that.canvas.setPixel(i, {r: 255, g: 0, b: 0}, imgDataCopy);
        } else if (imgData.dirMap[i] === 45) {
          that.canvas.setPixel(i, {r: 0, g: 255, b: 0}, imgDataCopy);
        } else if (imgData.dirMap[i] === 90) {
          that.canvas.setPixel(i, {r: 0, g: 0, b: 255}, imgDataCopy);
        } else if (imgData.dirMap[i] === 135) {
          that.canvas.setPixel(i, {r: 255, g: 255, b: 0}, imgDataCopy);
        } else {
          that.canvas.setPixel(i, {r: 255, g: 0, b: 255}, imgDataCopy);
        }
      });
      return imgDataCopy;
    };
  };

  Canny.prototype.showGradMap = function(imgData) {
    var that = this;
    return function() {
      var imgDataCopy = that.canvas.copyImageData(imgData);
      that.canvas.runImg(null, function(i) {
        if (imgData.gradMap[i] < 0) {
          that.canvas.setPixel(i, {r: 255, g: 0, b: 0}, imgDataCopy);
        } else if (imgData.gradMap[i] < 200) {
          that.canvas.setPixel(i, {r: 0, g: 255, b: 0}, imgDataCopy);
        } else if (imgData.gradMap[i] < 400) {
          that.canvas.setPixel(i, {r: 0, g: 0, b: 255}, imgDataCopy);
        } else if (imgData.gradMap[i] < 600) {
          that.canvas.setPixel(i, {r: 255, g: 255, b: 0}, imgDataCopy);
        } else if (imgData.gradMap[i] < 800) {
          that.canvas.setPixel(i, {r: 0, g: 255, b: 255}, imgDataCopy);
        } else {
          that.canvas.setPixel(i, {r: 255, g: 0, b: 255}, imgDataCopy);
        }
      });
      return imgDataCopy;
    };
  };

  Canny.prototype.traverseEdge = function(current, imgData, threshold, traversed) {//traverses the current pixel until a length has been reached
    var group = [current]; //initialize the group from the current pixel's perspective
    var neighbors = this.getNeighborEdges(current, imgData, threshold, traversed);//pass the traversed group to the getNeighborEdges so that it will not include those anymore
    for(var i = 0; i < neighbors.length; i++){
      group = group.concat(this.traverseEdge(neighbors[i], imgData, threshold, traversed.concat(group)));//recursively get the other edges connected
    }
    return group; //if the pixel group is not above max length, it will return the pixels included in that small pixel group
  };


  Canny.prototype.getNeighborEdges = function(i, imgData, threshold, includedEdges) {
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
      if(imgData.data[directions[j]] >= threshold && (includedEdges === undefined || includedEdges.indexOf(directions[j]) === -1))
        neighbors.push(directions[j]);

    return neighbors;
  };

  Canny.prototype.getAllEdges = function(imgData) {
    var that = this,
        traversed = [],
        edges = [];
    console.time('Get Edges Time');
    this.canvas.runImg(null, function(current) {
      if (imgData.data[current] === 255 && traversed[current] === undefined) {//assumes that an edge has white value
        var group = that.traverseEdge(current, imgData, 255, []);
        edges.push(group);
        for(var i = 0; i < group.length; i++){
          traversed[group[i]] = true;
        }
      }
    });
    console.timeEnd('Get Edges Time');
    return edges;
  };

  exports.Canny = Canny;
}(this));
