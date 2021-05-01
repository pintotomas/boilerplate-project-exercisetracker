require('dotenv').config();
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const { 
    v1: uuidv1,
  } = require('uuid');


let userSchema = new Schema({
    username: {type: String, required: true},
    userId: {type: String, required: true}
  });
  
let User = mongoose.model('User', userSchema);
//Reset urls 
User.deleteMany({}, function(err, result){
    if(err) return console.log(util.inspect(err));
    console.log("cleaned up ", result.deletedCount, " records");
  }); 

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

exports.createAndSaveUser = createAndSaveUser;
exports.handleCreateUser = handleCreateUser;
exports.findAllUsers = findAllUsers;
exports.handleFindAllUsers = handleFindAllUsers;

