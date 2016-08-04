var express = require('express'),
    _       = require('lodash');

var userLystEntryRouter = module.exports = express.Router();

var mongoose = require('mongoose'),
    Lyst = require('../../models/lyst'),
    Entry = require('../../models/entry');

var errMsgs = {
  duplicateEntryId : function (id) { return 'An entry with the ID - ' + id + ' - already exists.'; },
  invalidEntryId   : function (id) { return 'Entry ID - ' + id + ' - is invalid.'; }
};

var projection = '-__v';

function findLystAndCallback(lystId, callback) {
  Lyst.findById(lystId, function (err, lyst) {
    var fail;

    if (err)
      fail = { status: 500, payload: { message: err.message } };

    if (!lyst)
      fail = { status: 404, payload: { message: 'Lyst with ID - ' + lystId + ' - does not exist.' } };

    callback(fail, lyst);
  });
}

userLystEntryRouter.post('/entries', function (req, res) {
  var lystId = req._details.lystId;
  findLystAndCallback(lystId, function (fail, lyst) {
    if (fail)
      return res.status(fail.status).send(fail.payload);
    // source is inferred from the route
    var entryData = _.pick(req.body, ['_id', 'description', 'coords']);
    entryData._source = lystId;
    entry = new Entry(entryData);
    entry.save(function (err) {
      if (err) {
        if (/duplicate key error.+\$_id/.test(err.message))
          return res.status(500).send({ message: errMsgs.duplicateEntryId(entryData._id) });
        else
          return res.status(500).send({ 
            message: err.message, 
            errors: err.errors 
          });
      }

      lyst.update({
        $addToSet: { entries: entry._id }
      }, function (err) { 
        if (err)
          return res.status(500).send({ message: err.message });
        
        res.status(201).send();
      });
    });
  });
});

userLystEntryRouter.get('/entries', function (req, res) {
  var lystId = req._details.lystId;
  Entry.find({ _source: lystId }, projection, function (err, entries) {
    if (err) 
      return res.status(500).send({ message: err.message });

    res.json({ data: entries });
  });
});

function isMongooseId(id) {
  try {
    return { success: true, id: mongoose.Types.ObjectId(id) };
  } catch (_) { 
    return { success: false, id: id }; 
  }
}

userLystEntryRouter.delete('/entries', function (req, res) {
  var lystId = req._details.lystId, 
      entryIds = [], 
      missed = [],
      ids = (req.body || req.query).ids;

  if (ids && toString.call(ids).replace(/\[|\]/g, '').split(' ')[1] === 'Array') {
    var results = ids.map(function (id) { return isMongooseId(id); });
    results.forEach(function (result) {
      ( result.success ? entryIds : missed ).push(result.id);
    });
  }

  Entry.remove({ 
    _id: { $in: entryIds },
    _source: lystId
  }, function (err) {
    if (err) 
      return res.status(500).send({ message: err.message });

    Lyst.update({ _id: lystId }, {
      $pull: { entries: { $in: entryIds } }
    }, function (err) {
      if (err) 
        return res.status(500).send({ message: err.message });

      if (missed.length)
        return res.send({ missed: missed });

      res.status(204).send();
    });
  });
});

function toObjectId(id) {
  try {
    return mongoose.Types.ObjectId(id);
  } catch (e) {
    return 0;
  }
}

userLystEntryRouter.use('/entries/:id', function (req, res, next) {
  var paramId = req.params.id,
      BSONId = toObjectId(paramId);
  if (!BSONId)
    // only for non 24 character hexadecimal strings like 'not an ID'
    return res.status(400).send({ message: errMsgs.invalidEntryId(paramId) });

  req._details.entryId = BSONId;

  next();
});

userLystEntryRouter.get('/entries/:id', function (req, res) {
  var lystId = req._details.lystId,
      entryId = req._details.entryId;

  Entry.findOne({ 
    _id: entryId,
    _source: lystId 
  }, projection, function (err, entry) {
    if (err) 
      return res.status(500).send({ message: err.message });

    res.json({ data: entry });
  });
});

userLystEntryRouter.put('/entries/:id', function (req, res) {
  var lystId = req._details.lystId,
      entryId = req._details.entryId,
      entryData = _.pick(req.body, ['description', 'coords']);

  Entry.update({ 
    _id: entryId,
    _source: lystId
  }, entryData, {
    runValidators: true,
  }, function (err) {
    if (err) 
      return res.status(500).send({ 
        message: err.message,
        errors: err.errors 
      });

    res.status(201).send();
  });
});