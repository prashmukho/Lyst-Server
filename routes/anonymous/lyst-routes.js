var express = require('express'),
    _       = require('lodash');

var lystRouter = module.exports = express.Router();

var mongoose = require('mongoose'),
    Lyst = require('../../models/lyst');
    
var projection = '-__v -followers',
    searchFields = ['name'];

function _createFilter(queryParams) {
  var filter = _.pick(queryParams || {}, searchFields);
  for (key in filter)
    filter[key] = /^\/.+\/$/.test(filter[key]) ?
                  new RegExp(filter[key].replace(/^\/|\/$/g, '')) :
                  filter[key];
  return filter;
}

// search by name, eg. GET /lysts/search?name=fried%20food
lystRouter.get('/lysts/search', function (req, res) {
  var filter = _createFilter(_.assign(req.query, { visible: true }));
  Lyst
    .aggregate([
      { $match: filter },
      { 
        $lookup: {
          from: 'users',
          localField: '_creator',
          foreignField: '_id',
          as: '_creator'
        } 
      },
      { 
        $project: { 
          _id: 1,
          _creator: { $arrayElemAt: ['$_creator', 0] },
          name: 1,
          followers: 1,
          entries: 1
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
          _creator: {
            fullname: 1
          },
          name: 1,
          popularity: { $size: '$followers' },
          entry: { $arrayElemAt: ['$entries', 0] }
        } 
      },
      {
        $group: {
          _id: '$_id',
          _creator: { $first: '$_creator' },
          name: { $first: '$name' },
          popularity: { $first: '$popularity' },
          entryCount: { $sum: 1 },
          avgRating: { $avg: '$entry.rating' }
        }
      },
      { $sort: { name: 1, popularity: -1, avgRating: -1 } },
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

lystRouter.get('/lysts/:id', function (req, res) {
  var lystId = toObjectId(req.params.id);

  if (!lystId)
    return res.send({ data: null });

  Lyst
    .aggregate([
      { $match: { _id: lystId, visible: true } },
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

      res.send({ data: results[0] });
    });
});



