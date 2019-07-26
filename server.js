var mongoose = require("mongoose"); //dependencies
var express = require("express");
var expressHbs = require("express-handlebars");
var bodyParser = require("body-parser");

var PORT = process.env.PORT || 3000; //use port 3000

var app = express(); //express app

var router = express.Router(); //A Router instance is a complete middleware and routing system
require("./config/routes")(router);

app.use(express.static(__dirname + "/public'"));

app.engine("handlebars", expressHbs({ // npm syntax
    defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ //will parse objects from JSON strings
    extended: false
}));

app.use(router);

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var mongdb = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(mongdb, function(error){
if (error){
    console.log(error);
}
else {
    console.log("mongoose connected");
}
});
    
app.listen(PORT, function() {
    console.log("Listening on port: " + PORT);
}); 