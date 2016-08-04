var express = require('express'),
    _       = require('lodash');

var userLystRouter = module.exports = express.Router();

var mongoose = require('mongoose'),
    User = require('../../models/user'),
    Lyst = require('../../models/lyst');

var errMsgs = {
  duplicateLystId : function (id) { return 'A lyst with the ID - ' + id + ' - already exists.'; },
  invalidLystId   : function (id) { return 'Lyst ID - ' + id + ' - is invalid.'; }
};

// parameter whitelisting
var fields = {
  create: ['_id', 'name'],
  update: ['name']
};

var projection = '-__v -visible -followers';

function findUserAndCallback(userId, callback) {
  User.findById(userId, function (err, user) {
    var fail;

    if (err)
      fail = { status: 500, payload: { message: err.message } };

    if (!user)
      fail = { status: 404, payload: { message: 'User with ID - ' + userId + ' - does not exist.' } };

    callback(fail);
  });
}

// this will return an erroneous response - No user with given ID so creator cannot be set
userLystRouter.post('/lysts', function (req, res) {
  var userId = req._details.userId;

  findUserAndCallback(userId, function (fail) {
    if (fail)
      return res.status(fail.status).send(fail.payload);

    var lystData = _.pick(req.body, fields.create);
    lystData._creator = userId;
    lyst = new Lyst(lystData);
    lyst.save(function (err) {
      if (err) {
        if (/duplicate key error.+\$_id/.test(err.message))
          return res.status(500).send({ message: errMsgs.duplicateLystId(lystData._id) });
        else
          return res.status(500).send({ 
            message: err.message, 
            errors: err.errors 
          });
      }

      res.status(201).send();
    });
  });
});

userLystRouter.get('/lysts', function (req, res) {
  var userId = req._details.userId;
  
  Lyst
    .aggregate([
      { $match: { _creator: userId } },
      { $unwind: '$entries' },
      { 
        $lookup: {
          from: 'entries',
          localField: 'entries',
          foreignField: '_id',
          as: 'entries'
        } 
      },
      { 
        $project: { 
          _id: 1,
          name: 1,
          popularity: { $size: '$followers' },
          entry: { $arrayElemAt: ['$entries', 0] }
        } 
      },
            {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          popularity: { $first: '$popularity' },
          entryCount: { $sum: 1 },
          avgRating: { $avg: '$entry.rating' }
        }
      },
      { $sort: { name: 1, popularity: -1, avgRating: -1, entryCount: -1 } },
      { $limit: 10 }
    ])
    .exec(function (err, results) {
      if (err)
        return res.status(500).send({ message: err.message });

      res.send({ data: results });
    });
});

function toObjectId(id) {
  try {
    return mongoose.Types.ObjectId(id);
  } catch (e) {
    return 0;
  }
}

userLystRouter.use('/lysts/:id', function (req, res, next) {
  var paramId = req.params.id,
      BSONId = toObjectId(paramId);
  if (!BSONId)
    // only for non 24 character hexadecimal strings like 'not an ID'
    return res.status(400).send({ message: errMsgs.invalidLystId(paramId) });

  req._details.lystId = BSONId;

  next();
});

userLystRouter.get('/lysts/:id', function (req, res) {
  var userId = req._details.userId,
      lystId = req._details.lystId;

  Lyst
    .aggregate([
      { 
        $match: { 
          _id: lystId, 
          _creator: userId 
        } 
      },
      { $unwind: '$entries' },
      { 
        $lookup: {
          from: 'entries',
          localField: 'entries',
          foreignField: '_id',
          as: 'entries'
        } 
      },
      { 
        $project: { 
          _id: 1,
          name: 1,
          popularity: { $size: '$followers' },
          entry: { $arrayElemAt: ['$entries', 0] }
        } 
      },
      { 
        $project: { 
          _id: 1,
          name: 1,
          popularity: 1,
          entry: { 
            _id: 1, 
            description: 1, 
            coords: 1, 
            rating: 1 
          }
        } 
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          popularity: { $first: '$popularity' },
          entries: { $push: '$entry' },
          // entryCount: { $sum: 1 },
          // avgRating: { $avg: '$entry.rating' }
        }
      },
      { $limit: 1 }
    ])
    .exec(function (err, results) {
      if (err)
        return res.status(500).send({ message: err.message });
      // results[0] is undefined if results is empty
      res.send({ data: results[0] || null });
    });
});

userLystRouter.put('/lysts/:id', function (req, res) {
  var userId = req._details.userId,
      lystId = req._details.lystId,
      lystData = _.pick(req.body, fields.update);

  Lyst.update({ 
    _id: lystId,
    _creator: userId
  }, lystData, {
    runValidators: true
  }, function (err) {
    if (err) 
      return res.status(500).send({ 
        message: err.message,
        errors: err.errors 
      });

    res.status(201).send();
  });
});

userLystRouter.delete('/lysts/:id', function (req, res) {
  var userId = req._details.userId,
      lystId = req._details.lystId;

  Lyst.findOne({ 
    _id: lystId,
    _creator: userId
  }, function (err, lyst) {
    if (err) 
      return res.status(500).send({ message: err.message });

    if (!lyst) 
      return res.status(204).send();
    
    lyst.remove(function (err) {
      if (err) 
        return res.status(500).send({ message: err.message });  

      res.status(204).send();
    });
  });
});

userLystRouter.use('/lysts/:id', require('./user-lyst-follower-routes'));
userLystRouter.use('/lysts/:id', require('./user-lyst-entry-routes'));