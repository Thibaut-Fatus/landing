var http = require('http');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var validator = require('validator');

var serve = serveStatic("./");

var server = http.createServer(function(req, res) {
  if (req.method === "POST") {
    console.log(req);
    //validator.isEmail(
  } else {
    var done = finalhandler(req, res);
    serve(req, res, done);
  }
});

server.listen(8888);
