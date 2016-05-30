var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: { type: String, default: 'New User' },

  username: { 
    type: String, 
    required: [true, 'Username is required!'],
    validate: {
      validator: function (v) {
        return /\w+@\w+\.\w{2,3}/.test(v);
      },
      message: 'Username must be a valid email address!'
    },
    index: { unique: true }
  },

  password: { 
    type: String, 
    required: [true, 'Password is required!']
  }
});

module.exports = mongoose.model('User', userSchema);