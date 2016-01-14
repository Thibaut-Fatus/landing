var http = require('http');
var fs = require('fs');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var validator = require('validator');
var qs = require('querystring');
var nodemailer = require('nodemailer');
var googleapis = require('googleapis');

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
    authenticate(email)
};

var authenticate = function(email) {
    var key = require('/home/thibaut/dev/wa/landing/Theme/landing.json')
    var SCOPES = [
          "https://www.googleapis.com/auth/gmail.compose"
//          "https://www.googleapis.com/auth/gmail.send",
//          "https://www.googleapis.com/auth/gmail.insert",
//          "https://www.googleapis.com/auth/gmail.readonly",
//          "https://www.googleapis.com/auth/gmail.modify"
          //"https://mail.google.com/"
    ]
    client = new googleapis.auth.JWT(
          /*
           *
           *
           *   ON PEUT PAS UTILISER JWT AVEC GMAIL !
           *   IL FAUT PASSER EN OAUTH
           *
           *
           *
           */
          key.client_email,
          null /* path to private_key.pem */,
          key.private_key,
          SCOPES,
//          "subscribe@landing-1190.iam.gserviceaccount.com");
          "thibaut@weassur.com");
    client.authorize(function(err, tokens) {
        if (err) {
            console.log(err);
            return;
        } else {
            sendMail2(email, client);
            writeMail(email);
        }
    })
};

var sendMail2 = function(email, client) {
    console.log("entering")
    var gmail = googleapis.gmail({version: 'v1', auth: client})
    console.log("authorized");

    var email_lines = [];

    email_lines.push("From: \"Thibaut\" <thibaut@weassur.com>");
    email_lines.push("To: thibaut@weassur.com");
    email_lines.push('Content-type: text/html;charset=iso-8859-1');
    email_lines.push('MIME-Version: 1.0');
    email_lines.push("Subject: Nice");
    email_lines.push("");
    email_lines.push("ca");
    email_lines.push("<b>marche</b>");

    var content = email_lines.join("\r\n").trim();
    var base64EncodedEmail = new Buffer(content).toString('base64');
    base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_')
    console.log(base64EncodedEmail);
    gmail.users.messages.send({
        userId: "thibaut@weassur.com",
        ressource: {
            raw: base64EncodedEmail
        },
        media: null
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
    //var mailFounders = {
    //    from: 'thibaut@weassur.com',
    //    to: "founders@weassur.com",
    //    subject: 'Nouvel inscrit !',
    //    //text: text //, // plaintext body
    //    html: email
    //};
    //transporter.sendMail(mailFounders, function(error, info) {
    //    if (error) {
    //        console.log('ERROR mail founders: ' + email);
    //        console.log(error);
    //    } else {
    //        console.log('Message sent to founders : ' + email);
    //    };
    //});
};

var writeMail = function(email) {
    fs.appendFile(mailsFile, email + "\n", function (err) {
        if (err) {
            console.log("unable to write mail ! " + email);
        }
    });
};

server.listen(8888);
