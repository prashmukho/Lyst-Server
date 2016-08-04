var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

function _requiredMsg(path) {
  return 'Entry validation failed for path `' + path + '` with missing value.';
}

function _getType(thing) {
  return toString.call(thing).replace(/\[|\]/g, '').split(' ')[1];
}

var placeSchema = new Schema({
  _source: {
    type: Schema.Types.ObjectId, 
    ref: 'Lyst',
    required: [true, _requiredMsg('_source')],
    index: true
  },

  description: { 
    type: String,
    required: [true, _requiredMsg('description')]
  },

  coords: { 
    type: [Number],
    required: [true, _requiredMsg('coords')],
    validate: {
      validator: function (value) { 
        return value.length === 2 && 
               value[0] >= -180   && 
               value[0] <= 180    &&
               value[1] >= -90    && 
               value[1] <= 90;

      },
      message: 'An Entry requires coords to be set as [<longitude>, <latitude>]!'
    },
    index: '2dsphere'
  },

  rating: {
    type: Number,
    min: [1, "An Entry's rating cannot be less than 1!"],
    max: [5, "An Entry's rating cannot be greater than 5!"],
    default: 3
  }
});

module.exports = mongoose.model('Entry', placeSchema);