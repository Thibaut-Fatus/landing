var http = require('http');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var validator = require('validator');
var qs = require('querystring');

var serve = serveStatic("./");

var server = http.createServer(function(req, res) {
  if (req.method === "POST") {
    var body = '';

    req.on('data', function (data) {
      body += data;

      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
        req.connection.destroy();
    });

    req.on('end', function () {
      var post = qs.parse(body);
      var email = post["email"]
      if (validator.isEmail(email)) {
        console.log(email);
      }
    });
    res.end();
  } else {
    var done = finalhandler(req, res);
    serve(req, res, done);
  }
});

server.listen(8888);
