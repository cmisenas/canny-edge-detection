;(function(exports) {
  //helper functions
  exports.sumArr = function(arr) {//receives an array and returns sum
    var result = 0;
    for (var i = 0; i < arr.length; i++) {
      if (/^\s*function Array/.test(String(arr[i].constructor))) {
        result += exports.sumArr(arr[i]);
      } else {
        result += arr[i];
      }
    }
    return result;
  };

  exports.COLORS = {
    RED: {r: 255, g: 0, b: 0},
    GREEN: {r: 0, g: 255, b: 0},
    BLUE: {r: 0, g: 0, b: 255},
    YELLOW: {r: 255, g: 255, b: 0},
    PINK: {r: 255, g: 0, b: 255},
    AQUA: {r: 0, g: 255, b: 255}
  };

  exports.roundDir = function(deg) {//rounds degrees to 4 possible orientations: horizontal, vertical, and 2 diagonals
    var deg = deg < 0 ? deg + 180 : deg;

    if ((deg >= 0 && deg <= 22.5) || (deg > 157.5 && deg <= 180)) {
      return 0;
    } else if (deg > 22.5 && deg <= 67.5) {
      return 45;
    } else if (deg > 67.5 && deg <= 112.5) {
      return 90;
    } else if (deg > 112.5 && deg <= 157.5) {
      return 135;
    }
  };

  exports.getPixelNeighbors = function(dir) {
    var degrees = {0 : [{x:1, y:2}, {x:1, y:0}], 45 : [{x: 0, y: 2}, {x: 2, y: 0}], 90 : [{x: 0, y: 1}, {x: 2, y: 1}], 135 : [{x: 0, y: 0}, {x: 2, y: 2}]};
    return degrees[dir];
  };

  exports.getEdgeNeighbors = function(i, imgData, threshold, includedEdges) {
    var neighbors = [],
        pixel = new Pixel(i, imgData.width, imgData.height);
    for(var j = 0; j < pixel.neighbors.length; j++)
      if(imgData.data[pixel.neighbors[j]] >= threshold && (includedEdges === undefined || includedEdges.indexOf(pixel.neighbors[j]) === -1))
        neighbors.push(pixel.neighbors[j]);

    return neighbors;
  };
}(this));
