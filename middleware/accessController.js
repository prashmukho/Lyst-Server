var mongoose = require('mongoose'),
    _ = require('lodash');

/* This is used to 
   1. extract the user ID from the url
   2. check if the user ID in the url matches that in the JWT 
   3. process the request before passing it to accessController middleware */
function userInterpreter(req, res, next) {
  function toObjectId(id) {
    try {
      return mongoose.Types.ObjectId(id);
    } catch (e) {
      return 0;
    }
  }

  // user ID present in the url as '/users/:id/...'
  // userId property set on 'req' for convenience here to avoid code repetition
  var paramId = req.params.id,
      BSONId = toObjectId(paramId);
  if (!BSONId)
    return res.status(400).send({ message: 'User ID - ' + paramId + ' - is invalid.' });
  
  req._details = _.assign(req._details, { 
    userId: BSONId,
    isUser: req._details.decoded._id === paramId
  });

  next();
};

/* This is used to 
   1. prevent a non-admin user from accessing another user's info 
   2. determine access priviledges based on the result of userInterpreter middleware */
function accessController(req, res, next) {
  if (!(req._details.isAdmin || req._details.isUser)) {
    // console.log('rejected by accessController');
    return res.status(401).send({ message: 'Token is not authorized to access this resource.' });
  }

  next();
}

module.exports = function (app, routePrefix) {
  return app.use(routePrefix, userInterpreter, accessController);
};