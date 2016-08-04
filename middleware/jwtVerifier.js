var jwt = require('jsonwebtoken'),
    _ = require('lodash');

/* This is used to 
   1. extract the user from the JWT 
   2. check if the user has admin priviledges */
function jwtVerifier(req, res, next) {
  req._details = req._details || {};

  var authHeader = req.headers.authorization && req.headers.authorization.match(/^Bearer (\S+\.\S+\.\S+)$/);
  if (!authHeader)
    return res.status(401).send({ message: "Token must be sent in the Authorization header as 'Bearer <token>'" });

  var token  = authHeader[1];
  jwt.verify(token, process.env.SERVER_SECRET, function (err, decoded) {
    if (err) {
      // console.log('rejected by jwtVerifier');
      return res.status(401).send({ message: "Token verification failed with reason \'" + err.message + "'." });
    }

    // JWT was signed using the user and server secret
    req._details = _.assign(req._details, {
      decoded: decoded, // identifies the user who claims the JWT by _id
      isAdmin: decoded.role === 'admin'
    });

    next();
  });
}

module.exports = function (app, routePrefix) {
  return app.use(routePrefix, jwtVerifier);
};
