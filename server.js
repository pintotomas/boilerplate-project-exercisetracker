const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const createAndSaveUser = require("./myApp.js").createAndSaveUser;
const handleCreateUser = require("./myApp.js").handleCreateUser;
const findAllUsers = require("./myApp.js").findAllUsers;
const handleFindAllUsers = require("./myApp.js").handleFindAllUsers;



app.route("/api/users")
    .get(function(req, res) {
      findAllUsers(handleFindAllUsers, res);
})
    .post(function(req, res) {
        console.log(req.body.username);
        if (req.body.username == undefined) {
          res.json({"error": "Username field not found in request body"});
          return;
        }
        if (req.body.username == "") {
          res.json({"error": "Username cannot be empty"});
          return;
        }
        createAndSaveUser(handleCreateUser , req.body.username, res);
    })


const handleCreateExcercise = require("./myApp.js").handleCreateExcercise;
const createAndSaveExcercise = require("./myApp.js").createAndSaveExcercise;

app.route("/api/users/:_id/exercises")
    .get(function(req, res) {
      
})
    .post(function(req, res) {
        console.log(req.body);
        if (req.body.duration == undefined || req.body.description == undefined || req.params._id == undefined) {
          res.json({"error": "duration or description or _id field not found in request body/params"});
          return;
        }
        if (req.body.username == "" || req.body.description == "" || req.params._id == "") {
          res.json({"error": "The only empty field can be date"});
          return;
        }
        createAndSaveExcercise(handleCreateExcercise, req.params._id, req.body.description, req.body.duration, req.body.date, res);
    })

