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
}(this));
