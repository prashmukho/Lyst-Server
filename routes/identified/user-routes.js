var express = require('express'),
    _       = require('lodash'),
    jwt     = require('jsonwebtoken'),
    bcrypt = require('bcryptjs'),
    jwtVerifier = require('../../middleware/jwtVerifier'),
    accessController = require('../../middleware/accessController'),
    adminPermitter = require('../../middleware/adminPermitter');

var userRouter = module.exports = express.Router();

var mongoose = require('mongoose'), 
    User = require('../../models/user');

var errMsgs = {
  badCredentials:     'The username and password combination is incorrect.',
  missingCredentials: 'Please provide both a username and password.',
  
  passwordNotConfirmed: function (one, two) {
    return 'Password `' + one + '` and confirmation `' + two + '` do not match.'
  },
  userDoesNotExist: function (userId) { return 'User with ID - ' + userId + ' - does not exist.'; },
  usernameTaken   : function (email) { return 'A user with the email - ' + email + ' - already exists.'; },
  duplicateUserId : function (id) { return 'A user with the ID - ' + id + ' - already exists.'; }
};

// parameter whitelisting
var fields = {
  login:  ['username', 'password'],
  create: ['_id', 'username', 'password', 'fullname', 'role'],
  update: ['username', 'password', 'fullname', 'role'],
  search: ['username', 'fullname', 'role']
};

function createToken(user) {
  var userData = _.pick(user, fields.search.concat(['_id']));
  return jwt.sign(userData, process.env.SERVER_SECRET, { 
    expiresIn: 5 * 60 * 60 // 5 hours in seconds
  });
}

userRouter.post('/sessions/create', function (req, res) {
  var credentials = _.pick(req.body, fields.login);
  if (!credentials.username || !credentials.password)
    return res.status(400).send({ message: errMsgs.missingCredentials });

  User.findOne({ username: credentials.username }, function (err, user) {
    if (err) 
      return res.status(500).send({ message: err.message });

    if (!user)
      return res.status(401).send({ message: errMsgs.badCredentials });

    bcrypt.compare(credentials.password, user.password, function (err, passed) {
      if (err) 
        return res.status(500).send({ message: err.message });

      if (!passed)
        return res.status(401).send({ message: errMsgs.badCredentials });
        
      res.status(201).send({ id_token: createToken(user) });  
    });
  });
});

var projection = '-__v -password';

function getBcryptHashAndCallback(password, callback) {
  if (!password)
    return callback(null, '');

  var fail;
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      fail = { status: 500, message: err.message };
      return callback(fail, null);
    }

    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        fail = { status: 500, message: err.message };
        return callback(fail, null);
      }

      callback(fail, hash);
    });
  });
}

function saveUser(user, callback) {
  user.save(function (err) {
    var fail;

    if (err) {
      if (/duplicate key error/.test(err.message)) {
        if (/\$username/.test(err.message))
          fail = { 
            status: 500, 
            payload: { message: errMsgs.usernameTaken(user.username) } 
          };
        else if (/\$_id/.test(err.message))
          fail = { 
            status: 500, 
            payload: { message: errMsgs.duplicateUserId(user._id) } 
          };
      } else {
        fail = {
          status: 500, 
          payload: { message: err.message, errors: err.errors }
        };
      }
    }

    callback(fail, user);
  });
}

function onUserSave(fail, user) {
  if (fail)
    return this.status(fail.status).send(fail.payload);

  this.status(201).send({ id_token: createToken(user) });
}

userRouter.post('/users', function (req, res) {
  var userData = _.pick(req.body, fields.create);

  // if (userData.password !== req.body.password_confirmation)
  //   return res.status(400).send({ 
  //     message: errMsgs.passwordNotConfirmed(
  //       userData.password, 
  //       req.body.password_confirmation
  //     )
  //   });

  getBcryptHashAndCallback(userData.password, function (fail, hash) {
    if (fail)
      return res.status(fail.status).send({ message: fail.message });

    userData.password = hash;
    var user = new User(userData);
    saveUser(user, onUserSave.bind(res));
  });
});


/* MIDDLEWARE */
jwtVerifier(userRouter, '/users');

/* MIDDLEWARE */
accessController(userRouter, '/users/:id');


userRouter.get('/users/:id', function (req, res) {
  User.findById(req._details.userId, projection, function (err, user) {
    if (err) 
      return res.status(500).send({ message: err.message });

    res.json({ data: user });
  });
});

function findUserAndCallback(userId, ifNone, callback) {
  User.findById(userId, projection, function (err, user) {
    var fail;

    if (err)
      fail = { status: 500, payload: { message: err.message } };

    if (!user)
      fail = { status: ifNone.status, payload: { message: ifNone.message } };

    return callback(fail, user);
  });
}

userRouter.put('/users/:id', function (req, res) {
  var userId = req._details.userId;
  findUserAndCallback(userId, { 
    status: 404, 
    message: errMsgs.userDoesNotExist(userId)
  }, function (fail, user) {
    if (fail)
      return res.status(fail.status).send(fail.payload);

    var userData = _.pick(req.body, fields.update);
    if (userData.password) {
      if (userData.password === req.body.password_confirmation)
        getBcryptHashAndCallback(userData.password, function (fail, hash) {
          if (fail)
            return res.status(fail.status).send({ message: fail.message });

          userData.password = hash;
          var updatedUser = _.assign(user, userData);
          saveUser(updatedUser, onUserSave.bind(res));
        });
      else
        return res.status(400).send({ 
            message: errMsgs.passwordNotConfirmed(
              userData.password,
              req.body.password_confirmation
            )
          });
    } else {
      var updatedUser = _.assign(user, userData);
      saveUser(updatedUser, onUserSave.bind(res));
    }
  });
});

userRouter.delete('/users/:id', function (req, res) {
  var userId = req._details.userId;
  findUserAndCallback(userId, {
    status: 204
  }, function (fail, user) {
    if (fail)
      return res.status(fail.status).send(fail.payload);

    user.remove(function (err) {
      if (err) 
        return res.status(500).send({ message: err.message });

      res.status(204).send();      
    });
  });
});

userRouter.use('/users/:id', require('./user-lyst-routes.js'));

/* MIDDLEWARE */
adminPermitter(userRouter, '/users');

function _createFilter(queryParams) {
  var filter = {};
  if (Object.keys(queryParams).length) {
    filter = _.pick(queryParams, fields.search);
    for (key in filter) {
      if (/^\/.+\/$/.test(filter[key]))
        filter[key] = RegExp(filter[key].replace(/^\/|\/$/g, ''));
    }
  }
  
  return filter;
}

userRouter.get('/users', function (req, res) {
  var filter = _createFilter(req.query);
  User.find(filter, projection, function (err, users) {
    if (err) 
      return res.status(500).send({ message: err.message });

    res.json({ data: users });
  });
});
