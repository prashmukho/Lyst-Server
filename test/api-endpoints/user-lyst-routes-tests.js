var chakram = require('chakram'),
    expect = chakram.expect;

var mongoose = require('mongoose');

describe('Lyst model API', function () {
  // works with seed data so run node seed.js
  // user #1
  var expiredAdminJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNDY2MTY2OTM0LCJleHAiOjE0NjYxNjY5MzV9.up8HYycfqa8gt6Ceamjb_lr1rUhOWoO8GFRQnZqoHv8',
      compromisedAdminJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaW5qZWN0Ijoid2hhdGlzdGhpc2RvaW5naGVyZT8iLCJpYXQiOjE0NjYxNjgxNjAsImV4cCI6MTQ2NjE4NjE2MH0.Qw0MRJlGCop7b7VIcL1_5Tn0UYamGRn31EK6bu3NfSk',
      adminJWT  = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNDY0Nzg1MDk1fQ.Qw0MRJlGCop7b7VIcL1_5Tn0UYamGRn31EK6bu3NfSk',
      adminId   = '574da29e88c4ccbb24d0014d',
      adminLystId = '57593de19896f7a0d787e2da';
  // user #2 
  var expiredUserJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImlhdCI6MTQ2NjE2NjMwNywiZXhwIjoxNDY2MTY2MzA4fQ.QQy-FolexB7mlf9IRzvzMni0bS9Fr3uLcPChdzY-VsQ',
      compromisedUserJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImluamVjdCI6IndoYXRpc3RoaXNkb2luZ2hlcmU_IiwiaWF0IjoxNDY2MTY3OTc3LCJleHAiOjE0NjYxODU5Nzd9.-GU9BxEqCJN3Kzl47gLSxz65nB33t_yv4JWTZcXjNH0',
      userJWT   = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImlhdCI6MTQ2NDc4NTE0NX0.-GU9BxEqCJN3Kzl47gLSxz65nB33t_yv4JWTZcXjNH0',
      userId    = '574da29e88c4ccbb24d0014e', 
      userLystId = '57593de69896f7a0d787e2db';

  var deletedUserId = '574da29e88c4ccbb24d00001',
      deletedUserJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAwMDEiLCJ1c2VybmFtZSI6Imh1bHVsdUBpb25pY3F1b3Rlcy5pbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNDY4NDY5NDAzfQ.0O3kPsSXjnXfKVL1leFxuNHgS_q4-g364tlgEwyEFXs', 
      deletedLystId = '5789eddf4c32e4ab94000000';

  var baseUrl = 'http://localhost:3001',
      adminLystsUrl = baseUrl + '/users/' + adminId + '/lysts',
      userLystsUrl = baseUrl + '/users/' + userId + '/lysts';

  var newLystId1 = '575af84be7f250a6ef37f64f',
      newLystId2 = '575af851e7f250a6ef37f650',
      newLystId3 = '575af978664462ceeff17004';

  describe('POST /users/:userId/lysts', function () {

    describe('valid request', function () {

      var success;

      before(function () {
        return success = chakram.post(userLystsUrl, {
          _id: newLystId1,
          name: 'userlyst1'
        }, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 201', function () {
        return expect(success).to.have.status(201);
      });

      it('should not send back any content', function () {
        return expect(success).to.not.have.header('content-type');
      });

      it('should ignore all fields except those for ID, and name sent in the body', function () {
        var response = chakram.post(userLystsUrl, {
          _id: newLystId2,
          name: 'userlyst2',
          _creator: 'not an ID but who cares', // User ID is inferred from the route
          entries: 'not an array but who cares', // of type Array in schema
          random: 'iamabot'
        }, {
          'auth': { 'bearer': userJWT }
        });
        return expect(response).to.have.status(201);
      });

      it('should allow an admin to create a Lyst on behalf of another user', function () {
        var response = chakram.post(userLystsUrl, {
          _id: newLystId3,
          name: 'userlyst3'
        }, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(201);
      });

    });

    describe('invalid request', function () {

      it('should reject a nonexistent creator', function () {
        var response = chakram.post(baseUrl + '/users/' + deletedUserId + '/lysts', {
          description: 'new lyst',
          coords: [-77, 28]
        }, {
          'auth': { 'bearer': deletedUserJWT }
        });
        expect(response).to.have.status(404);
        expect(response).to.have.json('message', 
                                      'User with ID - ' + deletedUserId + ' - does not exist.'); 
        return chakram.wait();
      });

      describe('missing fields', function () { 

        it('should require a name to be sent in the body', function () {
          var response = chakram.post(userLystsUrl, {}, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.name.message', 
                                        'Lyst validation failed for path `name` with missing value.');
          return chakram.wait();
        });

      });

      describe('validation errors', function () { 

        it('should reject duplicate IDs', function () {
          var response = chakram.post(userLystsUrl, {
            _id: userLystId,
            name: 'somenewlist'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('message', 
                                        'A lyst with the ID - ' + userLystId + ' - already exists.');
          return chakram.wait();
        });

        it('should reject a malformed ID', function () {
          var response = chakram.post(userLystsUrl, {
            _id: 'not an ID',
            name: 'somenewlist'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors._id.message', 
                                        "Cast to ObjectID failed for value \"not an ID\" at path \"_id\"");
          return chakram.wait();
        });

      });

      describe('authorization errors', function () {

        it("should require an authorization header", function () {
          var response = chakram.post(userLystsUrl, {
            name: 'somenewlist'
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.post(userLystsUrl, {
            name: 'somenewlist'
          }, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.post(userLystsUrl, {
            name: 'somenewlist'
          }, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.post(userLystsUrl, {
            name: 'somenewlist'
          }, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to create a Lyst on behalf of another user', function () {
          var response = chakram.post(adminLystsUrl, {
            name: 'somenewlist',
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

  describe('GET /users/:userId/lysts', function () {

    describe('valid request', function () {

      var success; 

      before(function () {
        return success = chakram.get(userLystsUrl, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 200', function () {
        return expect(success).to.have.status(200);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header('content-type', /application\/json/);
      });

      it('should retrieve an array of Lyst objects', function () {
        return expect(success).to.have.schema('data', {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "_id": { "type": "string" },
              "name": { "type": "string" },
              "popularity": { "type": "number" },
              "entryCount": { "type": "number" },
              "avgRating": { "type": "number" }
            },
            "maxProperties": 5,
            "required": ["_id", "name", "popularity", "entryCount", "avgRating"]
          },
          "minItems": 1,
          "uniqueItems": true
        });
      }); 

      it('should allow an admin to retrieve the Lysts of another user', function () {
        var response = chakram.get(userLystsUrl, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(success).to.have.status(200);
      });

      it('should ignore a nonexistent creator', function () {
        var response = chakram.get(baseUrl + '/users/' + deletedUserId + '/lysts', {
          'auth': { 'bearer': deletedUserJWT }
        });
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', []); 
        return chakram.wait();
      });

    });

    describe('invalid request' , function () {

      describe('authorization errors' , function () {
    
        it("should require an authorization header", function () {
          var response = chakram.get(userLystsUrl);
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.get(userLystsUrl, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.get(userLystsUrl, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.get(userLystsUrl, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to retrieve the Lysts of another user', function () {
          var response = chakram.get(adminLystsUrl, {
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

  describe('GET /users/:userId/lysts/:lystId', function () {
    var adminLystUrl = adminLystsUrl + '/' + adminLystId,
        userLystUrl = userLystsUrl + '/' + userLystId;

    describe('valid request', function () {

      var success; 

      before(function () {
        return success = chakram.get(userLystUrl, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 200', function () {
        return expect(success).to.have.status(200);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header('content-type', /application\/json/);
      });

      it('should retrieve the specified Lyst object', function () {
        expect(success).to.have.schema('data', {
          "type": "object",
          "properties": {
            "_id": { "type": "string" },
            "name": { "type": "string" },
            "popularity": { "type": "number" },
            "entries": { 
              "type": "array",
              "items": { "type": "object" },
              "uniqueItems": true
            }
          },
          "maxProperties": 4,
          "required": ["_id", "name", "popularity", "entries"]
        });
        expect(success).to.have.json('data.name', 'user lyst');
        return chakram.wait();
      });  

      it('should allow an admin to retrieve the Lyst of another user', function () {
        var response = chakram.get(userLystUrl, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(200);
      });

      it('should ignore a nonexistent creator and/or lyst', function () {
        var response = chakram.get(baseUrl + '/users/' + deletedUserId + '/lysts/' + deletedLystId, {
          'auth': { 'bearer': deletedUserJWT }
        });
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', null); 
        return chakram.wait();
      });

    });

    describe('invalid request' , function () {

      it('should reject a malformed Lyst ID', function () {
        var response = chakram.get(userLystsUrl + '/not an ID', {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'Lyst ID - not an ID - is invalid.');
        return chakram.wait();
      });

      describe('authorization errors' , function () {
    
        it("should require an authorization header", function () {
          var response = chakram.get(userLystUrl);
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.get(userLystUrl, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.get(userLystUrl, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.get(userLystUrl, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to retrieve the Lyst of another user', function () {
          var response = chakram.get(adminLystUrl, {
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

  describe('PUT /users/:userId/lysts/:lystId', function () {
    var adminLystUrl = adminLystsUrl + '/' + adminLystId,
        userLystUrl = userLystsUrl + '/' + userLystId;

    describe('valid request', function () {

      var success; 

      before(function () {
        return success = chakram.put(userLystUrl, {
          name: 'new user lyst name'
        }, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 201', function () {
        return expect(success).to.have.status(201);
      });

      it('should not send back any content', function () {
        return expect(success).to.not.have.header('content-type');
      }); 

      it('should ignore all non-name fields sent in the body', function () {
        var response = chakram.put(userLystUrl, {
          name: "only this may change",
          _id: 'not an ID but who cares', // ID cannot be updated once set
          _creator: 'not an ID either', // of type ObjectId in schema
          entries: 'not an array but who cares', // of type Array in schema
          followers: 'updated via another route', // of type Array in schema
          random: 'iamabot'
        }, {
          'auth': { 'bearer': userJWT }
        });
        return expect(response).to.have.status(201);
      });

      it('should allow an admin to update the Lyst of another user', function () {
        var response = chakram.put(userLystUrl, {
          name: 'user lyst'
        }, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(201);
      });

      it('should ignore a nonexistent creator and/or lyst', function () {
        var response = chakram.put(baseUrl + '/users/' + deletedUserId + '/lysts/' + deletedLystId, {
          name: 'nothing to change here'
        }, {
          'auth': { 'bearer': deletedUserJWT }
        });
        return expect(response).to.have.status(201);
      });

    });

    describe('invalid request' , function () {

      it('should reject a malformed Lyst ID', function () {
        var response = chakram.put(userLystsUrl + '/' + 'not an ID', {
          name: 'will not change'
        }, {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'Lyst ID - not an ID - is invalid.');
        return chakram.wait();
      });

      describe('validation errors' , function () {
    
        it("should prevent setting name to an empty string", function () {
          var response = chakram.put(userLystUrl, {
            name: ''
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.name.message', 
                                        'Lyst validation failed for path `name` with missing value.');
          return chakram.wait();
        });

      });

      describe('authorization errors' , function () {
    
        it("should require an authorization header", function () {
          var response = chakram.put(userLystUrl, {
            name: 'will not change'
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.put(userLystUrl, {
            name: 'will not change'
          }, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.put(userLystUrl, {
            name: 'somenewlist'
          }, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.put(userLystUrl, {
            name: 'somenewlist'
          }, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to update the Lyst of another user', function () {
          var response = chakram.put(adminLystUrl, {
            name: 'will not change'
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

  describe('DELETE /users/:userId/lysts/:lystId', function () {

    describe('valid request', function () {

      var success; 

      before(function () {
        return success = chakram.delete(userLystsUrl + '/' + newLystId1, {}, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 204', function () {
        return expect(success).to.have.status(204);
      });

      it('should not send back any content', function () {
        return expect(success).to.not.have.header('content-type');
      });

      it('should allow an admin to delete the Lyst(s) of another user', function () {
        var response1 = chakram.delete(userLystsUrl + '/' + newLystId2, {}, {
          'auth': { 'bearer': adminJWT }
        });
        expect(response1).to.have.status(204);
        
        var response2 = chakram.delete(userLystsUrl + '/' + newLystId3, {}, {
          'auth': { 'bearer': adminJWT }
        });
        expect(response2).to.have.status(204);

        return chakram.wait();
      });

      it('should ignore a nonexistent creator and/or lyst', function () {
        var response = chakram.delete(baseUrl + '/users/' + deletedUserId + '/lysts/' + deletedLystId, {}, {
          'auth': { 'bearer': deletedUserJWT }
        });
        return expect(response).to.have.status(204);
      });

    });

    describe('invalid request' , function () {
      var userLystUrl = userLystsUrl + '/' + userLystId,
          adminLystUrl = adminLystsUrl + '/' + adminLystId;

      it('should reject a malformed Lyst ID', function () {
        var response = chakram.delete(userLystsUrl + '/' + 'not an ID', {}, {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'Lyst ID - not an ID - is invalid.');
        return chakram.wait();
      });

      describe('authorization errors' , function () {
    
        it("should require an authorization header", function () {
          var response = chakram.delete(userLystUrl, {
            // ids: [userLystId]
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.delete(userLystUrl, {
            // ids: [userLystId]
          }, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.delete(userLystUrl, {
            // ids: [userLystId]
          }, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.delete(userLystUrl, {
            // ids: [userLystId]
          }, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to delete the Lyst of another user', function () {
          var response = chakram.delete(adminLystUrl, {
            // ids: [adminLystId]
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
});
