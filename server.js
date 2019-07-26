// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var logger = require("morgan");

var Note = require("./models/note.js"); // couldn't read the model folder
var Article = require("./models/article.js");


// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");


// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;
// Configure middleware
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(express.static("./public"));
app.set('views', __dirname + '/views');
app.engine("handlebars", exphbs({ defaultLayout: "main", layoutsDir: __dirname + "/views/layouts" }));
app.set("view engine", "handlebars");



// connect to MongoDB
mongoose.connect("mongodb://localhost/mjscrape", { useNewUrlParser: true });

//=========Routes==========//
//GET all articles
app.get("/", function (req, res) {
  Article.find({})
    .exec(function (error, foundIt) {
      if (error) {
        res.send(error);
      }
      else {
        var article = {
          Article: foundIt
        };
        res.render("index", article);
      }
    });
});



// A GET request to scrape Mother Jones website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.motherjones.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Now, we grab every h3 within a "hed" tag, and do the following:
    $("h3.hed").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).parent("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
    res.redirect("/");
    console.log("Successfully Scraped");
  }
  );
});

app.post("/notes/:id", function (req, res) {
  var newNote = new Note(req.body);
  newNote.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("this is the DOC " + doc);
      Article.findOneAndUpdate({
        "_id": req.params.id
      },
        { $push: { "note": doc._id } }, {new: true},  function (err, doc) {
          if (err) {
            console.log(err);
          } else {
            console.log("note saved: " + doc);
            res.redirect("/notes/" + req.params.id);
          }
        });
    }
  });
});

app.get("/notes/:id", function (req, res) {
  console.log("This is the req.params: " + req.params.id);
  Article.find({
    "_id": req.params.id
  }).populate("note")
    .exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        var notesObj = {
          Article: doc
        };
        console.log(notesObj);
        res.render("notes", notesObj);
      }
    });
});

app.get("/delete/:id", function (req, res) {
  Note.remove({
    "_id":req.params.id
  }).exec(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("note deleted");
      res.redirect("/" );
    }
  });
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on PORT" + PORT + "!");
});
