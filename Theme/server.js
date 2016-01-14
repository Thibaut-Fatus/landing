var http = require('http');
var fs = require('fs');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var validator = require('validator');
var qs = require('querystring');
var nodemailer = require('nodemailer');
var gmailPasswd = process.env.GMAIL_SUBSCRIBE_PWD
var mailsFile = __dirname + "/emails.csv"


var serve = serveStatic(__dirname);

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
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Merci pour votre inscription !');
                handleMail(email);
            } else {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end("Malheureusement nous n'avons pas pu enregistrer votre email.");
            }
        });
    } else {
        var done = finalhandler(req, res);
        serve(req, res, done);
    }
});

var handleMail = function(email) {
    sendMail(email);
    writeMail(email);
};

var writeMail = function(email) {
    fs.appendFile(mailsFile, email + "\n", function (err) {
        if (err) {
            console.log("unable to write mail ! " + email);
        }
    });
};

var sendMail = function(email) {
    console.log(gmailPasswd);
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'thibaut@weassur.com',
            pass: gmailPasswd
        }
    });
    var mailOptions = {
        from: 'thibaut@weassur.com',
        to: email,
        subject: 'Merci pour votre inscription !',
        //text: text //, // plaintext body
        html: '<b>Bonjour !</b><br/>Nous avons noté votre intérêt pour notre service. Vous serez tenu au courant lorsque celui-ci sera disponible !<br/></br>Olivier, pour WeAssur'
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('ERROR : ' + email);
            console.log(error);
        } else {
            console.log('Message sent: ' + email);
        };
    });
    var mailFounders = {
        from: 'thibaut@weassur.com',
        to: "founders@weassur.com",
        subject: 'Nouvel inscrit !',
        //text: text //, // plaintext body
        html: email
    };
    transporter.sendMail(mailFounders, function(error, info) {
        if (error) {
            console.log('ERROR mail founders: ' + email);
            console.log(error);
        } else {
            console.log('Message sent to founders : ' + email);
        };
    });
};

server.listen(8888);
