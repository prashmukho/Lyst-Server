/* This is used to 
   1. prevent a non-admin from accessing a resource */
function adminPermitter(req, res, next) {
  if (!req._details.isAdmin) {
    // console.log('rejected by adminPermitter');
    return res.status(401).send({ message: 'Token is not authorized to access this resource.' });
  }

  next();
}

module.exports = function (app, routePrefix) {
  return app.use(routePrefix, adminPermitter);
};
