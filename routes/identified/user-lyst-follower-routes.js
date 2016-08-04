var express = require('express'),
    _       = require('lodash');

var userLystFollowerRouter = module.exports = express.Router();

var mongoose = require('mongoose'),
    Lyst = require('../../models/lyst');

userLystFollowerRouter.post('/followers', function (req, res) {
  var followerId = req._details.userId,
      lystId = req._details.lystId;

  Lyst.update({ 
    _id: lystId,
    _creator: { $nin: [followerId] },
    visible: true 
  }, { 
    $addToSet: { followers: followerId }
  }, function (err) {
    if (err)
      return res.status(500).send({ message: err.message });

    //TODO: CREATE notification with lyst._id and followerId
    res.status(201).send();
  });
});

userLystFollowerRouter.delete('/followers', function (req, res) {
  var followerId = req._details.userId,
      lystId = req._details.lystId;

  Lyst.update({ 
    _id: lystId,
    _creator: { $nin: [followerId] },
    followers: followerId
  }, { 
    $pull: { followers: { $in: [followerId] } }
  }, function (err) {
    if (err)
      return res.status(500).send({ message: err.message });

    //TODO: DELETE notification with lyst._id and followerId
    res.status(204).send();
  });
});