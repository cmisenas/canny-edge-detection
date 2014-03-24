var http = require('http'),
    fs = require('fs'),
    url = require('url');

var serveStaticFile = function(filename, type, response) {
  fs.readFile(filename, function (error, data) {
    if (data) {
      response.writeHead(200, { 'Content-Type': type });
      response.end(data);
    } else {
      serveErrorPage(response);
    }
  });
};

var serveErrorPage = function(response) {
  fs.readFile('error.html', 'utf8', function (error, data){
    response.writeHead(404);
    if (error) {
      response.end('File Not Found!');
    } else {
      response.end(data);
    }
  });
};

var getBoundary = function(contentHeader) {
  return contentHeader.substr(contentHeader.indexOf('boundary=') + 'boundary='.length);
};

var containsFileHeaders = function(asciiChunk) {
  if(asciiChunk.indexOf('Content-Disposition') > -1 || asciiChunk.indexOf('Content-Type') > -1) {
    return true;
  } else {
    return false;
  }
};

var removeHeaders = function (chunk) {
  var delimiter = "\r\n";
  var cleanBuffer;
  chunkArr = chunk.split(delimiter);
  cleanBufferArr = [];
  for(var i = 0; i < chunkArr.length; i++) {
    if(!containsFileHeaders(chunkArr[i])) {
      cleanBufferArr.push(chunkArr[i]);
    }
  }
  if(cleanBufferArr[0] === '') {
    cleanBufferArr = cleanBufferArr.slice(1)
  }
  cleanBuffer = cleanBufferArr.join(delimiter);

  return cleanBuffer;
};

var uploadFile = function(request, response, boundary) {
  var file = fs.createWriteStream('copy');
  var fileSize = request.headers['content-length'];
  var chunkNumber = 0;
  var currentUploadSize = 0;

  request.on('data', function(chunk) {
    var chunkLength = chunk.length;
    var shouldWriteBuffer = true;
    currentUploadSize += chunkLength;
    chunkNumber++;
    uploadProgress = Math.round((currentUploadSize/fileSize) * 100);

    if (chunkNumber == 1) {
      chunk = chunk.slice(42);
    } else if (uploadProgress === 100) {
      if(chunkLength < 44) {
        shouldWriteBuffer = false;
      } else {
        chunk = chunk.slice(0, chunk.length - 44);
      }
    }

    var asciiChunk = chunk.toString('binary');
    if (containsFileHeaders(asciiChunk)) {
      chunk = new Buffer(removeHeaders(asciiChunk), 'binary');
    }

    if (shouldWriteBuffer) {
      var bufferStore = file.write(chunk);
      if(bufferStore == false) {
        request.pause();
      }
    }
  });

   file.on('drain', function() {
       request.resume();
   });

  request.on('end', function() {
    response.writeHead(200);
    response.end("Upload done.");
  });
};

var startServer = function() {
  var PORT = 8000;
  var app = http.createServer(function(request, response){
    var pathname = url.parse(request.url).pathname.substring(1);
    if (pathname === '') {
      serveStaticFile('index.html', 'text/html', response);
    } else if (pathname === 'upload' &&
               request.method.toUpperCase() === 'POST' &&
               request.headers['content-type'].indexOf('multipart/form-data') > -1) {
      console.log('Uploading...');
      boundary = getBoundary(request.headers['content-type'])
      uploadFile(request, response, boundary)
    } else {
      var type = pathname.indexOf('.js') > -1 ? 'text/javascript' :
                 pathname.indexOf('.html') > -1 ? 'text/html' :
                 pathname.indexOf('.css') > -1 ? 'text/css' :
                 pathname.indexOf('.png') > -1 ? 'image/png' :
                 pathname.indexOf('.jpg') > -1 || pathname.indexOf('.jpeg') > -1 ? 'image/jpeg' :
                 'text/plain';
      serveStaticFile(pathname, type, response);
    }
  }).listen(PORT);
  console.log("Server started on port", PORT);
  return app;
};

startServer();
