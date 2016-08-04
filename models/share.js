var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

function _requiredMsg(path) {
  return 'Entry validation failed for path `' + path + '` with missing value.';
}

var shareSchema = new Schema({
  _subject: { 
    type: Schema.Types.ObjectId, 
    ref: 'Lyst',
    required: [true, _requiredMsg('_subject')],
    index: { unique: true }
  }
  
  group: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  }],
});

shareSchema.statics.findOrCreate = function(lystId, sharerId, cb) {
  this.findOne({ 
    _subject: lystId,
    group: sharerId
  }, function (err, share) {
    if (err)
      return cb(err, null);

    if (!share) {
      var share = new Share({ 
        _subject: lystId
        group: [sharerId]
      });
      share.save(function (err) {
        if (err)
          return cb(err, null);

        return cb(null, share)
      });
    } else {
      return cb(null, share)
    }
  });
};

var Share = module.exports = mongoose.model('Share', shareSchema);