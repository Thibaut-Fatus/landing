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
      // 1e4 ~~~ 10kB
      if (body.length > 1e4)
        req.connection.destroy();
    });

    req.on('end', function () {
      var post = qs.parse(body);
      var email = post['email']
      if (validator.isEmail(email)) {
        console.log(email);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Merci pour votre inscription !');
      } else {
        console.log('not good')
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end("Malheureusement nous n'avons pas pu enregistrer votre email.");
      }
    });
  } else {
    var done = finalhandler(req, res);
    serve(req, res, done);
  }
});

server.listen(8888);
