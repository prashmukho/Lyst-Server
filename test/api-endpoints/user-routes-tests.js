var chakram = require('chakram'),
    expect = chakram.expect;

var mongoose = require('mongoose');

describe('Authentication', function () {
  
  describe('POST /sessions/create', function () {
    var loginUrl = 'http://localhost:3001/sessions/create';

    describe('valid credentials' , function () {

      var success;
    
      before(function () {
        return success = chakram.post(loginUrl, {
          username: 'user@ionicquotes.io',
          password: 'thisdudeisanoob'
        });
      });

      it('should respond with status code 201', function () {
        return expect(success).to.have.status(201);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header("content-type", /application\/json/);
      });

      it('should return a JWT after authenticating a user', function () {
        return expect(success).to.have.schema({ 
          "type": "object",
          "properties": { 
            "id_token": { "type": "string" }
          },
          "maxProperties": 1, // no data besides token
          "required": ["id_token"]
        });
      });

      it('should ignore fields other than username and password sent in the body', function () {
        var response = chakram.post(loginUrl, {
          username: 'user@ionicquotes.io',
          password: 'thisdudeisanoob',
          random: 'iamabot'
        });
        return expect(success).to.have.status(201);
      });

    });

    describe('missing credentials' , function () {

      it('should require a username to be sent in the body', function () {
        var response = chakram.post(loginUrl, {
          password: 'thisdudeisanoob'
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'Please provide both a username and password.');
        return chakram.wait();
      });

      it('should require a password to be sent in the body', function () {
        var response = chakram.post(loginUrl, {
          username: 'user@ionicquotes.io'
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'Please provide both a username and password.');
        return chakram.wait();
      });

    });

    describe('invalid credentials' , function () {

      it('should reject an incorrect username', function () {
        var response = chakram.post(loginUrl, {
          username: 'nouser@ionicquotes.io',
          password: 'thisdudeisanoob'
        });
        expect(response).to.have.status(401);
        expect(response).to.have.json('message', 
                                      'The username and password combination is incorrect.');
        return chakram.wait();
      });

      it('should reject an incorrect password', function () {
        var response = chakram.post(loginUrl, {
          username: 'user@ionicquotes.io',
          password: 'thisdudeisasavant'
        });
        expect(response).to.have.status(401);
        expect(response).to.have.json('message', 
                                      'The username and password combination is incorrect.');
        return chakram.wait();
      });

    });
  });
});

describe('User model API', function() {
  // works with seed data so run node seed.js
  // user #1
  var expiredAdminJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNDY2MTY2OTM0LCJleHAiOjE0NjYxNjY5MzV9.up8HYycfqa8gt6Ceamjb_lr1rUhOWoO8GFRQnZqoHv8',
      compromisedAdminJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaW5qZWN0Ijoid2hhdGlzdGhpc2RvaW5naGVyZT8iLCJpYXQiOjE0NjYxNjgxNjAsImV4cCI6MTQ2NjE4NjE2MH0.Qw0MRJlGCop7b7VIcL1_5Tn0UYamGRn31EK6bu3NfSk',
      adminJWT  = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNDY0Nzg1MDk1fQ.Qw0MRJlGCop7b7VIcL1_5Tn0UYamGRn31EK6bu3NfSk',
      adminId   = '574da29e88c4ccbb24d0014d';
  // user #2 
  var expiredUserJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImlhdCI6MTQ2NjE2NjMwNywiZXhwIjoxNDY2MTY2MzA4fQ.QQy-FolexB7mlf9IRzvzMni0bS9Fr3uLcPChdzY-VsQ',
      compromisedUserJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImluamVjdCI6IndoYXRpc3RoaXNkb2luZ2hlcmU_IiwiaWF0IjoxNDY2MTY3OTc3LCJleHAiOjE0NjYxODU5Nzd9.-GU9BxEqCJN3Kzl47gLSxz65nB33t_yv4JWTZcXjNH0',
      userJWT   = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImlhdCI6MTQ2NDc4NTE0NX0.-GU9BxEqCJN3Kzl47gLSxz65nB33t_yv4JWTZcXjNH0',
      userId    = '574da29e88c4ccbb24d0014e';

  var usersUrl = 'http://localhost:3001/users';

  var newUserId1 = '5750f79c7e9fbf596305d7e3',
      newUserId2 = '5750f79c7e9fbf596305d7e4';

  var deletedUserId = '574da29e88c4ccbb24d00001',
      deletedUserJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAwMDEiLCJ1c2VybmFtZSI6Imh1bHVsdUBpb25pY3F1b3Rlcy5pbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNDY4NDY5NDAzfQ.0O3kPsSXjnXfKVL1leFxuNHgS_q4-g364tlgEwyEFXs';

  describe('POST /users', function () {

    describe('valid request', function () {

      var success;

      before(function () {
        return success = chakram.post(usersUrl, {
          _id: newUserId1,
          username: 'testuser1@ionicquotes.io',
          password: 'thisdudeisatotalnoob',
          fullname: 'test user',
          role: 'user' // optional
        });
      });

      it('should respond with status code 201', function () {
        return expect(success).to.have.status(201);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header('content-type', /application\/json/);
      });

      it('should return a JWT after creating a user', function () {
        return expect(success).to.have.schema({ 
          "type": "object",
          "properties": { 
            "id_token": {
              "type": "string",
              "pattern": /^\S+\.\S+\.\S+$/
            }
          },
          "maxProperties": 1, // no data besides token
          "required": ["id_token"]
        });
      });

      it('should ignore non-schema fields sent in the body', function () {
        var response = chakram.post(usersUrl, {
          _id: newUserId2,
          username: 'testuser2@ionicquotes.io',
          password: 'thisdudeisatotalnoob',
          fullname: 'zealous user',
          random: 'iamabot'
        });
        return expect(response).to.have.status(201);
      });

    });

    describe('invalid request', function () { 

      describe('missing fields', function () { 

        it('should require a username to be sent in the body', function () {
          var response = chakram.post(usersUrl, {
            password: 'thisdudeisanoob',
            fullname: 'regular user'
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.username.message', 
                                        'User validation failed for path `username` with missing value.');
          return chakram.wait();
        });

        it('should require a password to be sent in the body', function () {
          var response = chakram.post(usersUrl, {
            username: 'user@ionicquotes.io',
            fullname: 'regular user'
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.password.message', 
                                        'User validation failed for path `password` with missing value.');
          return chakram.wait();
        });

        it('should require a full name to be sent in the body', function () {
          var response = chakram.post(usersUrl, {
            username: 'user@ionicquotes.io',
            password: 'thisdudeisanoob'
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.fullname.message', 
                                        'User validation failed for path `fullname` with missing value.');
          return chakram.wait();
        });

      });

      describe('validation errors', function () {

        it('should not allow duplication of usernames', function () {
          var response = chakram.post(usersUrl, {
            username: 'user@ionicquotes.io',
            password: 'thisdudeisabiggernoob',
            fullname: 'regular user'
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('message', 
                                        'A user with the email - user@ionicquotes.io - already exists.');
          return chakram.wait();
        });

        it('should reject a malformed ID', function () {
          var response = chakram.post(usersUrl, {
            _id: 'not an ID',
            username: 'user@ionicquotes.io',
            password: 'thisdudeisabiggernoob',
            fullname: 'regular user'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors._id.message', 
                                        "Cast to ObjectID failed for value \"not an ID\" at path \"_id\"");
          return chakram.wait();
        });

        it('should reject a bad email address', function () {
          var response = chakram.post(usersUrl, {
            username: 'user@ionicquotes.iamsowrong',
            password: 'thisdudeisabiggernoob',
            fullname: 'regular user'
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.username.message', 
                                        'User validation failed for path `username` with value `user@ionicquotes.iamsowrong`. Must be a valid email address.');
          return chakram.wait();
        });

        it('should reject a bad full name', function () {
          var response = chakram.post(usersUrl, {
            username: 'user@ionicquotes.iamsowrong',
            password: 'thisdudeisabiggernoob',
            fullname: 'nolastname'
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.fullname.message', 
                                        'User validation failed for path `fullname` with value `nolastname`. Must resemble `<firstname> <lastname>`.');
          return chakram.wait();
        });

        it('should only accept roles sent as admin or user', function () {
          var response = chakram.post(usersUrl, {
            username: 'user@ionicquotes.io',
            password: 'thisdudeisabiggernoob',
            fullname: 'regular user',
            role: 'guest'
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.role.message',
                                        'User validation failed for path `role` with value `guest`. Must belong to {admin,user}.');
          return chakram.wait();
        });

      });
    });
  });
  
  describe('GET /users', function () {

    describe('valid request' , function () {

      var success;
    
      before(function () {
        return success = chakram.get(usersUrl, {
          'auth': { 'bearer': adminJWT }
        });
      });

      it('should respond with status code 200', function () {
        return expect(success).to.have.status(200);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header('content-type', /application\/json/);
      });

      it('should retrieve an array of User objects', function () {
        return expect(success).to.have.schema('data', { 
          "type": "array",
          "items": { 
            "type": "object",
            "properties": {
              "_id": { 
                "type": "string",
                "pattern": /^[a-f0-9]{24}$/
              },
              "username": { 
                "type": "string",
                "pattern": /^([a-zA-Z0-9]+[_\-])*[a-zA-Z0-9]+@([a-zA-Z0-9]+\-)*[a-zA-Z0-9]+\.[a-z]{2,3}$/
              },
              "fullname": { 
                "type": "string",
                "pattern": /^\w+ \w+$/
              },
              "role": { 
                "type": "string",
                "enum": ["admin", "user"]
              }
            },
            "maxProperties": 4, // no password sent back
            "required": ["_id", "username", "fullname", "role"]
          },
          "minItems": 2, // from seed data
          "uniqueItems": true // IDs and usernames are unique
        });
      });

    });

    describe('invalid request' , function () {

      describe('authorization errors', function () {

        it("should require an authorization header", function () {
          var response = chakram.get(usersUrl);
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.get(usersUrl, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.get(usersUrl, {
            'auth': { 'bearer': expiredAdminJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.get(usersUrl, {
            'auth': { 'bearer': compromisedAdminJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it("should not allow a non-admin to access this resource", function () {
          var response = chakram.get(usersUrl, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        'Token is not authorized to access this resource.');
          return chakram.wait();
        });

      });
    });
  });

  describe('GET /users/:id', function () {
    var userUrl = usersUrl + '/' + userId,
        adminUrl = usersUrl + '/' + adminId;

    describe('valid request' , function () {

      var success;
    
      before(function () {
        return success = chakram.get(userUrl, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 200', function () {
        return expect(success).to.have.status(200);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header("content-type", /application\/json/);
      });

      it('should retrieve the specified User object', function () {
        expect(success).to.have.schema('data', { 
          "type": "object",
          "properties": {
            "_id": { 
              "type": "string",
              "pattern": /^[a-f0-9]{24}$/
            },
            "username": { 
              "type": "string",
              "pattern": /^([a-zA-Z0-9]+[_\-])*[a-zA-Z0-9]+@([a-zA-Z0-9]+\-)*[a-zA-Z0-9]+\.[a-z]{2,3}$/
            },
            "fullname": { 
              "type": "string",
              "pattern": /^\w+ \w+$/
            },
            "role": { 
              "type": "string",
              "enum": ["admin", "user"]
            }
          },
          "maxProperties": 4, // no password sent back
          "required": ["_id", "username", "fullname", "role"]
        });
        expect(success).to.have.json('data._id', userId);
        return chakram.wait();
      });

      it("should expose another user's info to an admin", function () {
        var response = chakram.get(userUrl, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(200);
      });

      it("should ignore a nonexistent user", function () {
        var response = chakram.get(usersUrl + '/' + deletedUserId, {
          'auth': { 'bearer': adminJWT }
        });
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', null);
        return chakram.wait();
      });

    });

    describe('invalid request' , function () {

      it("should reject a malformed ID", function () {
        var response = chakram.get(usersUrl + '/not an ID', {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'User ID - not an ID - is invalid.');
        return chakram.wait();
      });

      describe('authorization errors', function () {

        it("should require an authorization header", function () {
          var response = chakram.get(userUrl);
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.get(userUrl, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.get(userUrl, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.get(userUrl, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it("should not expose another user's info to a non-admin", function () {
          var response = chakram.get(adminUrl, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        'Token is not authorized to access this resource.');
          return chakram.wait();
        });

      });
    });
  });

  describe('PUT /users/:id', function () {
    var userUrl = usersUrl + '/' + userId,
        adminUrl = usersUrl + '/' + adminId;

    describe('valid request' , function () {

      var success;
    
      before(function () {
        return success = chakram.put(userUrl, {
          username: 'sillyuser@ionicquotes.io',
          fullname: 'new name'
        }, { 
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 201', function () {
        return expect(success).to.have.status(201);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header("content-type", /application\/json/);
      });

      it('should return a JWT after updating a user', function () {
        return expect(success).to.have.schema({ 
          "type": "object",
          "properties": { 
            "id_token": {
              "type": "string",
              "pattern": /^\S+\.\S+\.\S+$/
            }
          },
          "maxProperties": 1, // no data besides token
          "required": ["id_token"]
        });
      });

      it("should allow passwords to be updated if password_confimation is also sent and matches", function () {
        var response = chakram.put(userUrl, {
          password: 'thisdudehasguts',
          password_confirmation: 'thisdudehasguts'
        }, {
          'auth': { 'bearer': userJWT }
        });
        return expect(response).to.have.status(201);
      });

      it('should ignore non-schema fields sent in the body', function () {
        var response = chakram.put(userUrl, {
          username: 'webcrawler@ionicquotes.io',
          fullname: 'metal head',
          random: 'iamabot'
        }, {
          'auth': { 'bearer': userJWT }
        });
        return expect(response).to.have.status(201);
      });

      it("should allow another user's info to be updated by an admin", function () {
        var response = chakram.put(userUrl, {
          username: 'user@ionicquotes.io',
          password: 'thisdudeisanoob',
          password_confirmation: 'thisdudeisanoob',
          fullname: 'regular user'
        }, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(201);
      });     

    });

    describe('invalid request' , function () {

      it("should reject a malformed ID", function () {
        var response = chakram.put(usersUrl + '/not an ID', {
          role: 'will not change'
        }, {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'User ID - not an ID - is invalid.');
        return chakram.wait();
      });

      it("should reject updating a nonexistent user", function () {
        var response = chakram.put(usersUrl + '/' + deletedUserId, {
          role: 'will not change'
        }, {
          'auth': { 'bearer': deletedUserJWT }
        });
        expect(response).to.have.status(404);
        expect(response).to.have.json('message', 
                                      'User with ID - ' + deletedUserId + ' - does not exist.');
        return chakram.wait();
      });

      it("should not allow passwords to be updated if password_confimation does not match", function () {
        var response = chakram.put(userUrl, {
          password: 'thisdudehasguts',
          password_confirmation: 'thisdudehasnoguts' // same result if omitted
        }, {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'Password `thisdudehasguts` and confirmation `thisdudehasnoguts` do not match.');
        return chakram.wait();
      });

      describe('validation errors', function () {

        it("should prevent setting username to an empty string", function () {
          var response = chakram.put(userUrl, {
            username: ''
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.username.message', 
                                        'User validation failed for path `username` with missing value.');
          return chakram.wait();
        });

        it("should prevent setting fullname to an empty string", function () {
          var response = chakram.put(userUrl, {
            fullname: ''
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.fullname.message', 
                                        'User validation failed for path `fullname` with missing value.');
          return chakram.wait();
        });

        it('should ensure non-duplication of usernames', function () {
          var response = chakram.put(userUrl, {
            username: 'admin@ionicquotes.io'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('message',
                                        'A user with the email - admin@ionicquotes.io - already exists.');
          return chakram.wait();
        });

        it('should only accept roles sent as admin or user', function () {
          var response = chakram.put(userUrl, {
            role: 'guest'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.role.message', 
                                        'User validation failed for path `role` with value `guest`. Must belong to {admin,user}.');
          return chakram.wait();
        });

        it('should reject a bad email address', function () {
          var response = chakram.put(userUrl, {
            username: 'user@ionicquotes.iamsowrong'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.username.message', 
                                        'User validation failed for path `username` with value `user@ionicquotes.iamsowrong`. Must be a valid email address.');
          return chakram.wait();
        });

        it("should reject a bad full name", function () {
          var response = chakram.put(userUrl, {
            fullname: 'first and last'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.fullname.message', 
                                        'User validation failed for path `fullname` with value `first and last`. Must resemble `<firstname> <lastname>`.');
          return chakram.wait();
        });

      });

      describe('authorization errors', function () {

        it("should require an authorization header", function () {
          var response = chakram.put(userUrl, {
            fullname: 'no change'
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.put(userUrl, {
            fullname: 'no change'
          }, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.put(userUrl, {
            fullname: 'no change'
          }, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.put(userUrl, {
            fullname: 'no change'
          }, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });


        it("should not allow another user's info to be updated by a non-admin", function () {
          var response = chakram.put(adminUrl, {
            fullname: 'no change'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        'Token is not authorized to access this resource.');
          return chakram.wait();
        });

      });
    });
  });

  describe('DELETE /users/:id', function () {

    describe('valid request' , function () {

      var success;

      before(function () {
        return success = chakram.delete(usersUrl + '/' + newUserId1, {}, {
          'auth': { 'bearer': adminJWT }
        });
      });

      it('should respond with status code 204', function () {
        return expect(success).to.have.status(204);
      });

      it('should not have a content-type header set', function () {
        return expect(success).to.not.have.header('content-type');
      });

      it("should allow another user to be deleted by an admin", function () {
        var response = chakram.delete(usersUrl + '/' + newUserId2, {}, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(204);
      });  

      it('should ignore nonexistent/ deleted users', function () {
        var response = chakram.delete(usersUrl + '/' + deletedUserId, {}, {
          'auth': { 'bearer': deletedUserJWT }
        });
        return expect(response).to.have.status(204);
      });

    });

    describe('invalid request' , function () {

      it('should reject a malformed user ID ', function () {
        var response = chakram.delete(usersUrl + '/not an ID', {}, {
          'auth': { 'bearer': adminJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'User ID - not an ID - is invalid.');
        return chakram.wait();
      });

      describe('authorization errors', function () {

        it('should require an authorization header', function () {
          var response = chakram.delete(usersUrl + '/' + userId, {});
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.delete(usersUrl + '/' + userId, {}, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.delete(usersUrl + '/' + userId, {}, {
            'auth': { 'bearer': expiredAdminJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.delete(usersUrl + '/' + userId, {}, {
            'auth': { 'bearer': compromisedAdminJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to delete another user', function () {
          var response = chakram.delete(usersUrl + '/' + adminId, {}, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        'Token is not authorized to access this resource.');
          return chakram.wait();
        });

      });
    });
  });
});