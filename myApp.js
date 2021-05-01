require('dotenv').config();
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const { 
    v1: uuidv1,
  } = require('uuid');


let excerciseSchema = new Schema({
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: Date, default: Date.now, required: true},
    userId: {type: String, required: true}
  });

let userSchema = new Schema({
    username: {type: String, required: true},
    userId: {type: String, required: true}
  });

let User = mongoose.model('User', userSchema);
let Excercise = mongoose.model('Excercise', excerciseSchema);
//Reset db 
User.deleteMany({}, function(err, result){
    if(err) return console.log(util.inspect(err));
    console.log("cleaned up ", result.deletedCount, " users");
  }); 
  Excercise.deleteMany({}, function(err, result){
    if(err) return console.log(util.inspect(err));
    console.log("cleaned up ", result.deletedCount, " excercises");
  }); 


const createAndSaveExcercise = (done, userId, description, duration, date, res) => {
    User.findOne({userId: userId}, (err, userData) => {
        if (err) {
            return done(err, res);
        }
        var excercise = new Excercise({description: description, userId: userData.userId,
                                       duration: duration, date: date});
        excercise.save((err, data) => {
            return done(err, res, data, userData.userName);
        });
    });
}

const handleCreateExcercise = (err, res, excerciseData, userName) => {
    // TO DO: hay que rearmar el json que se manda, tiene un monton de cosas que no son necesarias
    // y ya estaria andando.
    if (err) {
        res.json({"error": "Failed to create excercise " + err });
        return;
    }
    excerciseData["username"] = userName;
    res.json(excerciseData);
}



var createAndSaveUser = function(done, name, res) {

    var user = new User({username: name, userId: uuidv1()});
    User.find({username: name}, (err, doc) => {
        if (doc.length) {
            console.log("A user with that name already exists " + doc);
            return done(true, doc[0], res);
        } else {
            user.save((err, data)=>{
             if (err) {
                console.log("Error happened while saving: " + err);
                return done(err, data, res)
             }
             return done(null, data, res)
            });
        }
    })
}

const findAllUsers = (done, res) => {
    User.find({}, (err, data) => {
      if (err) return done(err, data, res);
      return done(null, data, res);
    });
};

var handleFindAllUsers = (err, data, res) => {
    if (err) {
        res.json({"error": "Failed to find all users " + err });
        return;
    }
    res.json(data);
    return;
}

var handleCreateUser = function(error, data, res) {
    console.log("Error: " + error );
    if (error) {
        res.json({"error": "Failed to save User with that username"})
        return;
    }
    console.group("Data is: " + data);
    res.json({username: data.username, _id: data.userId});
}
exports.handleCreateExcercise = handleCreateExcercise;
exports.createAndSaveExcercise = createAndSaveExcercise;
exports.createAndSaveUser = createAndSaveUser;
exports.handleCreateUser = handleCreateUser;
exports.findAllUsers = findAllUsers;
exports.handleFindAllUsers = handleFindAllUsers;

