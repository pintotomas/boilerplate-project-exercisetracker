require('dotenv').config();
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const util = require('util');
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
            //console.log("Error createAndSaveExercise - " + err);
            return done(err, res);
        }
        var excercise = new Excercise({description: description, userId: userData.userId,
                                       duration: duration, date: date});
        
        excercise.save((err, data) => {
            return done(err, res, data, userData);
        });
    });
}

const handleCreateExcercise = (err, res, excerciseData, userData) => {
    // TO DO: hay que rearmar el json que se manda, tiene un monton de cosas que no son necesarias
    // y ya estaria andando.
    if (err) {
        res.json({"error": "Failed to create excercise " + err });
        return;
    }
    //console.log("Excercise created success: " + excerciseData);
    result = {"_id": userData.userId, username: userData.username,
     date: excerciseData.date.toDateString(), duration: excerciseData.duration,
     description: excerciseData.description};
    //console.log("handleCreateExcercise - return json is " + util.inspect(result));
    res.json(result);
}

const findLogsForUser = (done, userId, from, to, limit, res) => {
    console.log("Entered findLogsFoUser");
    var from = "1000-01-01";
    var to = "9999-01-01";
    var limit = 10000;
    if (from) {
        fromFilter = from;
    }
    if (to) {
        toFilter = to;
    }

    if (limit) {
        limitFilter = limit;
    }

    var filters = {userId: userId, 
        date: {
            $gte: new Date(fromFilter),
            $lt: new Date(toFilter)
        }};
    console.log("findLogsForUser - filter json is " + util.inspect(filters));



    User.find({userId: userId}).exec((err, userDoc) => {
        if (!userDoc.length) {
            return done(true);
        } 
        var userExcercises = Excercise.find(filters).limit(limitFilter).exec((err, excercisesDoc) => {
            if (err) {
                return done(err, res);
            }
            return done(err, res, userDoc[0], excercisesDoc);
    })
});}

const handleFindLogsForUser = (err, res, userDoc, excerciseDoc) => {
    if (err) {
        res.json({"error": "Failed to find all users " + err });
        return;
    }
    result = {username: userDoc.username,
              _id: userDoc.userId, 
              count: excerciseDoc.length,
              log: [excerciseDoc]};
    console.log("handleFindLogsForUser - return json is " + util.inspect(result));
    res.json(result);
}

var createAndSaveUser = function(done, name, res) {
    var user = new User({username: name, userId: uuidv1()});
    User.find({username: name}, (err, doc) => {
        if (doc.length) {
            //console.log("A user with that name already exists " + doc);
            return done(true, doc[0], res);
        } else {
            user.save((err, data)=>{
             if (err) {
                //console.log("Error happened while saving: " + err);
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
    //console.group("Data is: " + data);
    res.json({username: data.username,
             _id: data.userId});
}

exports.findLogsForUser = findLogsForUser;
exports.handleFindLogsForUser = handleFindLogsForUser;
exports.handleCreateExcercise = handleCreateExcercise;
exports.createAndSaveExcercise = createAndSaveExcercise;
exports.createAndSaveUser = createAndSaveUser;
exports.handleCreateUser = handleCreateUser;
exports.findAllUsers = findAllUsers;
exports.handleFindAllUsers = handleFindAllUsers;

