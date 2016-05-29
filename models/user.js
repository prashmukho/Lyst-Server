var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// mongoose.connect('mongodb://localhost/ionic-test');

var userSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);