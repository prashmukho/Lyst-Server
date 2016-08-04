var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Error = mongoose.Error,
    Lyst = require('./lyst');

var validRoles = ['admin', 'user'];

function _requiredMsg(path) {
  return 'User validation failed for path `' + path + '` with missing value.';
}

var userSchema = new Schema({
  role: { 
    type: String, 
    enum: {
      values: validRoles,
      message: 'User validation failed for path `{PATH}` with value `{VALUE}`. Must belong to {' + validRoles + '}.'
    },
    default: 'user'
  },

  username: { 
    type: String, 
    required: [true, _requiredMsg('username')],
    match: [ 
      /^\s*([a-zA-Z0-9]+[_\-])*[a-zA-Z0-9]+@([a-zA-Z0-9]+\-)*[a-zA-Z0-9]+\.[a-z]{2,3}\s*$/, 
      'User validation failed for path `{PATH}` with value `{VALUE}`. Must be a valid email address.'
    ],
    index: { unique: true },
    lowercase: true,
    trim: true
  },

  fullname: {
    type: String,
    required: [true, _requiredMsg('fullname')],
    match: [
      /^\s*\w+[ ]\w+\s*$/, 
      'User validation failed for path `{PATH}` with value `{VALUE}`. Must resemble `<firstname> <lastname>`.'
    ],
    trim: true
  },

  password: { 
    type: String, 
    required: [true, _requiredMsg('password')]
  }
});

function RemoveError(msg) {
  Error.call(this, msg);
  this.errors = { _id: null, message: null };
}
RemoveError.prototype = Object.create(Error.prototype);
RemoveError.prototype.constructor = RemoveError;
RemoveError.prototype.toString = function () {
  var message;
  message = this.message.replace('{ID}', this.errors._id);
  return message.replace('{MESSAGE}', this.errors.message);
};

userSchema.pre('remove', function (next) {
  var user = this;
  Lyst.find({ _creator: user._id }, function (err, lysts) {
    if (err) 
      return next(err);

    var completed = 0, errors = [];
    lysts.forEach(function (lyst) {
      lyst.remove(function (err) {
        if (err) {
          var error = new RemoveError('Removal of User #{ID} failed with reason {MESSAGE}');
          error.errors._id = lyst._id;
          error.errors.message = err.message;
          errors.push(error);
        }

        console.log(++completed);

        // if (completed === lysts.length && errors.length) {
        //   var topLevelErrors = new Error('Some associated lysts could not be deleted.');
        //   topLevelErrors.errors = errors;
        //   next(topLevelErrors);
        // } else {
        //   next();
        // }

        if (completed === lysts.length)
          return next();
      });
    });

    next();
  });
});

module.exports = mongoose.model('User', userSchema);