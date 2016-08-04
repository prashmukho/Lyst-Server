var express = require('express'),
    _       = require('lodash');

var userLystShareRouter = module.exports = express.Router();

var mongoose = require('mongoose'),
    Lyst = require('../../models/lyst'),
    Share = require('../../models/share');

userLystShareRouter.post('/share', function (req, res) {
  var receiverId = toObjectId(req.body.receiverId),
      sharerId = req._details.userId,
      lystId = req._details.lystId;

  Share.findOrCreate(lystId, sharerId, function (err, share) {
    if (err)
      return res.status(500).send({ err.message });

    res.status(201).send();
  });
});

userLystShareRouter.put('/share', function (req, res) {
  var receiverId = req._details.userId,
      lystId = req._details.lystId,
      reply = req.body.reply;

  if (reply) {
    Share.findOneAndUpdate({ 
      _subject: lystId
    }, {
      $addToSet: { group: receiverId } 
    }, function (err, share) {
      if (err)
        return res.status(500).send({ err.message });

      res.status(201).send();  
    });
  } else {
    res.send();
  }
});

userLystShareRouter.delete('/share', function (req, res) {
  var userId = req._details.userId,
      lystId = req._details.lystId;

  Share
    .findOne({ _subject: lystId })
    .populate('_subject')
    .exec(function (err, share) {
      if (err)
        return res.status(500).send({ message: err.message });

      if (share._subject._creator === userId)
        ; // delete the share entirely along with all related notifications
      else
        ; // pull userId from the share's group array and delete the associated notification

      res.status(201).send();
    });
});