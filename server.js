var mongoose = require("mongoose");
var express = require("express");
var exphbs = require("express-handlebars");

var PORT = process.env.PORT || 3000;

var app = express();

var router = express.Router();

app.use(express.static(__dirname + "/public'"));

app.use(router);
    
app.listen(PORT, function() {
    console.log("Listening on port: " + PORT);
}); 