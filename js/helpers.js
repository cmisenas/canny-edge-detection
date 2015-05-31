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
}(this));
