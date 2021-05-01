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

var handleCreateUser = function(error, data, res) {
    console.log("Error: " + error );
    if (error) {
        res.json({"error": "Failed to save User with that username"})
        return;
    }
    res.json({username: data.username, _id: data.userid});
}

exports.createAndSaveUser = createAndSaveUser;
exports.handleCreateUser = handleCreateUser;
