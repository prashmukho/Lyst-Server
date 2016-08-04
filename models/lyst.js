var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Entry = require('./entry');

function _requiredMsg(path) {
  return 'Lyst validation failed for path `' + path + '` with missing value.';
}

var lystSchema = new Schema({
  _creator: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, _requiredMsg('_creator')],
    index: true
  },

  visible: {
    type: Boolean,
    default: false,
    index: true
  },

  name: {
    type: String,
    required: [true, _requiredMsg('name')],
    index: true
  },

  entries: [{
    type: Schema.Types.ObjectId, 
    ref: 'Entry'
  }],

  followers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  }]
});

lystSchema.pre('remove', function (next) {
  var lyst = this;
  Entry.find({ _source: lyst._id }, function (err, entries) {
    if (err) 
      return next(err);

    var errors = [];
    entries.forEach(function (entry) { 
      entry.remove(function (err) {
        if (err) 
          errors.push(err);
      });
    });

    if (errors.length) {
      var err = new Error('Some associated entries could not be deleted.');
      err.errors = errors;
      return next(err);
    }
    
    next()
  });
});

// var notificationSchema = new Schema({
//   kind: {
//     type: String,
//     enum: ['place']
//   },

//   recipient: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'User'
//   },

//   message: String
// });

module.exports = mongoose.model('Lyst', lystSchema);