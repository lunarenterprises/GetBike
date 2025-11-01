var express = require("express");
var cors = require("cors");
var app = express();
var bodyparser = require("body-parser");
var https = require("https")
var http = require('http')
const fs = require('fs');
require('dotenv').config({ encoding: 'latin1' })

if (process.env.NODE_ENV == "production") {
    // Hardcoded SSL certificate paths
    const privateKey = fs.readFileSync('/etc/ssl/private.key', 'utf8').toString();
    const certificate = fs.readFileSync('/etc/ssl/certificate.crt', 'utf8').toString();
    const ca = fs.readFileSync('/etc/ssl/ca_bundle.crt', 'utf8').toString();

    const options = { key: privateKey, cert: certificate, ca: ca };
    server = https.createServer(options, app);
    console.log("Running in production with HTTPS");
} else {
    server = http.createServer(app);
    console.log("Running in development with HTTP");
}

app.use(
    bodyparser.urlencoded({
        extended: false,
    })
);

app.use(bodyparser.json());
app.use(cors());
app.use(express.static('./', {
    maxAge: '1d' // Cache images for one day
}));

var mainRoute = require("./router");

app.use("/getbike", mainRoute);

server.listen(6032, () => {
    console.log("server running on port 6032");

})
