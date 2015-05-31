;(function(exports){

  function Canny(canvElem) {
    var canvas = canvElem;

    this.sobel = function(imgData) {//find intensity gradient of image
      var imgDataCopy = canvas.copyImageData(imgData);
      var dirMap = [];
      var gradMap = [];
      //perform vertical convolution
      var xfilter = [[-1, 0, 1],
                     [-2, 0, 2],
                     [-1, 0, 1]];
      //perform horizontal convolution
      var yfilter = [[1, 2, 1],
                     [0, 0, 0],
                     [-1, -2, -1]];

      console.time('Sobel Filter Time');
      canvas.runImg(3, function(current, neighbors) {
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

        var dir = roundDir(Math.atan2(edgeY, edgeX) * (180/Math.PI));
        dirMap[current] = dir;

        var grad = Math.round(Math.sqrt(edgeX * edgeX + edgeY * edgeY));
        gradMap[current] = grad;

        canvas.setPixel(current, grad, imgDataCopy);
      });
      console.timeEnd('Sobel Filter Time');

      function checkCornerOrBorder(i, width, height) {//returns true if a pixel lies on the border of an image
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

    this.nonMaximumSuppress = function(imgData) {
      var imgDataCopy = canvas.copyImageData(imgData);
      console.time('NMS Time');
      canvas.runImg(3, function(current, neighbors) {
        var pixNeighbors = getNeighbors(imgData.dirMap[current]);

        //pixel neighbors to compare
        var pix1 = imgData.gradMap[neighbors[pixNeighbors[0].x][pixNeighbors[0].y]];
        var pix2 = imgData.gradMap[neighbors[pixNeighbors[1].x][pixNeighbors[1].y]];

        if (pix1 > imgData.gradMap[current] || pix2 > imgData.gradMap[current]) {//suppress
          canvas.setPixel(current, 0, imgDataCopy);
        } else if (pix2 === imgData.gradMap[current] && pix1 < imgData.gradMap[current]) {
          canvas.setPixel(current, 0, imgDataCopy);
        }
      });
      console.timeEnd('NMS Time');

      function getNeighbors(dir) {
        var degrees = {0 : [{x:1, y:2}, {x:1, y:0}], 45 : [{x: 0, y: 2}, {x: 2, y: 0}], 90 : [{x: 0, y: 1}, {x: 2, y: 1}], 135 : [{x: 0, y: 0}, {x: 2, y: 2}]};
        return degrees[dir];
      }

      return imgDataCopy;
    };

    this.hysteresis = function(imgData){ //mark strong and weak edges, discard others as false edges; only keep weak edges that are connected to strong edges
      var that = this;
      return function() {
        var imgDataCopy = canvas.copyImageData(imgData);
        var realEdges = []; //where real edges will be stored with the 1st pass
        var t1 = 150; //high threshold value
        var t2 = 100; //low threshold value

        //first pass
        console.time('Hysteresis Time');
        canvas.runImg(null, function(current) {
          if (imgData.data[current] > t1 && realEdges[current] === undefined) {//accept as a definite edge
            var group = that.traverseEdge(current, imgData, t2, []);
            for(var i = 0; i < group.length; i++){
              realEdges[group[i]] = true;
            }
          }
        });

        //second pass
        canvas.runImg(null, function(current) {
          if (realEdges[current] === undefined) {
            canvas.setPixel(current, 0, imgDataCopy);
          } else {
            canvas.setPixel(current, 255, imgDataCopy);
          }
        });
        console.timeEnd('Hysteresis Time');

        return imgDataCopy;
      };
    };


    this.invertColors = function(imgData) {
      var imgDataCopy = canvas.copyImageData(imgData);
      console.time('Invert Colors Time');
      canvas.runImg(null, function(current) {
        canvas.setPixel(current, {r: 255 - imgDataCopy.data[current], g: 255 - imgDataCopy.data[current + 1], b: 255 - imgDataCopy.data[current + 2]}, imgDataCopy);
      });
      console.timeEnd('Invert Colors Time');
      return imgDataCopy;
    };

    this.showDirMap = function(imgData) {//just a quick function to look at the direction results
      return function() {
        var imgDataCopy = canvas.copyImageData(imgData);
        canvas.runImg(null, function(i) {
          if (imgData.dirMap[i] === 0) {
            canvas.setPixel(i, {r: 255, g: 0, b: 0}, imgDataCopy);
          } else if (imgData.dirMap[i] === 45) {
            canvas.setPixel(i, {r: 0, g: 255, b: 0}, imgDataCopy);
          } else if (imgData.dirMap[i] === 90) {
            canvas.setPixel(i, {r: 0, g: 0, b: 255}, imgDataCopy);
          } else if (imgData.dirMap[i] === 135) {
            canvas.setPixel(i, {r: 255, g: 255, b: 0}, imgDataCopy);
          } else {
            canvas.setPixel(i, {r: 255, g: 0, b: 255}, imgDataCopy);
          }
        });
        return imgDataCopy;
      };
    };

    this.showGradMap = function(imgData) {
      return function() {
        var imgDataCopy = canvas.copyImageData(imgData);
        canvas.runImg(null, function(i) {
          if (imgData.gradMap[i] < 0) {
            canvas.setPixel(i, {r: 255, g: 0, b: 0}, imgDataCopy);
          } else if (imgData.gradMap[i] < 200) {
            canvas.setPixel(i, {r: 0, g: 255, b: 0}, imgDataCopy);
          } else if (imgData.gradMap[i] < 400) {
            canvas.setPixel(i, {r: 0, g: 0, b: 255}, imgDataCopy);
          } else if (imgData.gradMap[i] < 600) {
            canvas.setPixel(i, {r: 255, g: 255, b: 0}, imgDataCopy);
          } else if (imgData.gradMap[i] < 800) {
            canvas.setPixel(i, {r: 0, g: 255, b: 255}, imgDataCopy);
          } else {
            canvas.setPixel(i, {r: 255, g: 0, b: 255}, imgDataCopy);
          }
        });
        return imgDataCopy;
      };
    };

    //helper functions
    this.sum = function(arr) {//receives an array and returns sum
      var result = 0;
      for (var i = 0; i < arr.length; i++) {
        if (/^\s*function Array/.test(String(arr[i].constructor))) {
          result += this.sum(arr[i]);
        } else {
          result += arr[i];
        }
      }
      return result;
    };

    this.traverseEdge = function(current, imgData, threshold, traversed) {//traverses the current pixel until a length has been reached
      var group = [current]; //initialize the group from the current pixel's perspective
      var neighbors = this.getNeighborEdges(current, imgData, threshold, traversed);//pass the traversed group to the getNeighborEdges so that it will not include those anymore
      for(var i = 0; i < neighbors.length; i++){
        group = group.concat(this.traverseEdge(neighbors[i], imgData, threshold, traversed.concat(group)));//recursively get the other edges connected
      }
      return group; //if the pixel group is not above max length, it will return the pixels included in that small pixel group
    };


    this.getNeighborEdges = function(i, imgData, threshold, includedEdges) {
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

    this.getAllEdges = function(imgData) {
      var that = this;
      var traversed = [];
      var edges = [];
      console.time('Get Edges Time');
      canvas.runImg(null, function(current) {
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
  }

  exports.Canny = Canny;

}(this));
