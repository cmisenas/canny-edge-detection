var http = require('http'),
  fs = require('fs'),
  url = require('url');

var serveStaticFile = function (filename, type, response) {
  fs.readFile(filename, function (error, data) {
    if (data) {
      response.writeHead(200, {'Content-Type': type});
      response.end(data);
    } else {
      serveErrorPage(response);
    }
  });
};

var serveErrorPage = function (response) {
  fs.readFile('error.html', 'utf8', function (error, data) {
    response.writeHead(404);
    if (error) {
      response.end('File Not Found!');
    } else {
      response.end(data);
    }
  });
};


var startServer = function () {
  var PORT = 8000;
  var app = http.createServer(function (req, res) {
    var pathname = url.parse(req.url).pathname.substring(1);
    if (pathname === '') {
      serveStaticFile('index.html', 'text/html', res);
    } else {
      var type = pathname.indexOf('.js') > -1 ? 'text/javascript' :
        pathname.indexOf('.html') > -1 ? 'text/html' :
          pathname.indexOf('.css') > -1 ? 'text/css' :
            pathname.indexOf('.png') > -1 ? 'image/png' :
              pathname.indexOf('.jpg') > -1 || pathname.indexOf('.jpeg') > -1 ? 'image/jpeg' :
                'text/plain';
      serveStaticFile(pathname, type, res);
    }
  }).listen(PORT);
  console.log("Server started on port", PORT);
  return app;
};

startServer();
