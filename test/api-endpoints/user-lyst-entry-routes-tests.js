var chakram = require('chakram'),
    expect = chakram.expect;

var mongoose = require('mongoose');

describe('Entry model API', function () {
  // works with seed data in the test database so run 'node seed.js'
  // user #1
  var expiredAdminJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNDY2MTY2OTM0LCJleHAiOjE0NjYxNjY5MzV9.up8HYycfqa8gt6Ceamjb_lr1rUhOWoO8GFRQnZqoHv8',
      compromisedAdminJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaW5qZWN0Ijoid2hhdGlzdGhpc2RvaW5naGVyZT8iLCJpYXQiOjE0NjYxNjgxNjAsImV4cCI6MTQ2NjE4NjE2MH0.Qw0MRJlGCop7b7VIcL1_5Tn0UYamGRn31EK6bu3NfSk',
      adminJWT  = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGQiLCJ1c2VybmFtZSI6ImFkbWluQGlvbmljcXVvdGVzLmlvIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNDY0Nzg1MDk1fQ.Qw0MRJlGCop7b7VIcL1_5Tn0UYamGRn31EK6bu3NfSk',
      adminId   = '574da29e88c4ccbb24d0014d',
      adminLystId = '57593de19896f7a0d787e2da',
      adminLystEntryId = '575acc52bc31a132deb22721';
  // user #2 
  var expiredUserJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImlhdCI6MTQ2NjE2NjMwNywiZXhwIjoxNDY2MTY2MzA4fQ.QQy-FolexB7mlf9IRzvzMni0bS9Fr3uLcPChdzY-VsQ',
      compromisedUserJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImluamVjdCI6IndoYXRpc3RoaXNkb2luZ2hlcmU_IiwiaWF0IjoxNDY2MTY3OTc3LCJleHAiOjE0NjYxODU5Nzd9.-GU9BxEqCJN3Kzl47gLSxz65nB33t_yv4JWTZcXjNH0',
      userJWT   = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzRkYTI5ZTg4YzRjY2JiMjRkMDAxNGUiLCJ1c2VybmFtZSI6InVzZXJAaW9uaWNxdW90ZXMuaW8iLCJyb2xlIjoidXNlciIsImlhdCI6MTQ2NDc4NTE0NX0.-GU9BxEqCJN3Kzl47gLSxz65nB33t_yv4JWTZcXjNH0',
      userId    = '574da29e88c4ccbb24d0014e', 
      userLystId = '57593de69896f7a0d787e2db',
      userLystEntryId = '575acc72bc31a132deb22722';

  var deletedLystId = '5789eddf4c32e4ab94000000',
      deletedEntryId = '5789f3646263ee9095000000';

  var baseUrl = 'http://localhost:3001',
      adminLystsUrl = baseUrl + '/users/' + adminId + '/lysts',
      adminLystEntriesUrl = adminLystsUrl + '/' + adminLystId + '/entries',
      userLystsUrl = baseUrl + '/users/' + userId + '/lysts',
      userLystEntriesUrl = userLystsUrl + '/' + userLystId + '/entries';

  var newLystEntryId1 = '575d6b17ff8389d81409de07',
      newLystEntryId2 = '575d6b18ff8389d81409de08',
      newLystEntryId3 = '575d6b19ff8389d81409de09';

  describe('POST /users/:userId/lysts/:lystId/entries', function () {

    describe('valid request', function () {

      var success;

      before(function () {
        return success = chakram.post(userLystEntriesUrl, {
          _id: newLystEntryId1,
          description: 'new user entry',
          coords: [-180, -90]
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

      it('should ignore all fields except those for ID, description, and coords in the body', function () {
        var response = chakram.post(userLystEntriesUrl, {
          _id: newLystEntryId2,
          description: 'new user entry',
          coords: [180, 90],
          _source: { will: 'not be set' }, // Lyst ID is inferred from the route
          rating: -1, // min value is 1 but it won't matter
          random: 'iamabot'
        }, {
          'auth': { 'bearer': userJWT }
        });
        return expect(response).to.have.status(201);
      });

      it('should allow an admin to create a Lyst entry on behalf of another user', function () {
        var response = chakram.post(userLystEntriesUrl, {
          _id: newLystEntryId3,
          description: 'new user entry',
          coords: [-77, 28]
        }, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(201);
      });

    });

    describe('invalid request', function () {

      it('should reject a nonexistent source', function () {
        var response = chakram.post(userLystsUrl + '/' + deletedLystId + '/entries', {
          _id: '575d131fe1a6befe096f4c5b',
          description: 'new user entry',
          coords: [-77, 28]
        }, {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(404);
        expect(response).to.have.json('message', 
                                      'Lyst with ID - ' + deletedLystId + ' - does not exist.');
        return chakram.wait();
      });

      describe('missing fields', function () { 

        it('should require a description to be sent in the body', function () {
          var response = chakram.post(userLystEntriesUrl, {
            _id: '575d131fe1a6befe096f4c5b',
            coords: [-77, 28]
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.description.message', 
                                        'Entry validation failed for path `description` with missing value.');
          return chakram.wait();
        });

        it('should require a coords array to be sent in the body', function () {
          var response = chakram.post(userLystEntriesUrl, {
            _id: '575d131fe1a6befe096f4c5b',
            description: 'new user entry',
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.coords.message', 
                                        'Entry validation failed for path `coords` with missing value.');
          return chakram.wait();
        });

      });

      describe('validation errors', function () { 

        it('should reject duplicate IDs', function () {
          var response = chakram.post(userLystEntriesUrl, {
            _id: userLystEntryId,
            description: 'new user entry',
            coords: [-77, 28]
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('message', 
                                        'An entry with the ID - ' + userLystEntryId + ' - already exists.');
          return chakram.wait();
        });

        it('should reject a malformed ID', function () {
          var response = chakram.post(userLystEntriesUrl, {
            _id: 'not an ID',
            description: 'new user entry',
            coords: [-77, 28]
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors._id.message', 
                                        "Cast to ObjectID failed for value \"not an ID\" at path \"_id\"");
          return chakram.wait();
        });

        it('should reject a malformed coords value', function () {
          var response = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: 'not an array'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.coords.message', 
                                        "Cast to Array failed for value \"not an array\" at path \"coords\"");

          var response2 = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [-77, 'not a number']
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response2).to.have.status(500);
          expect(response2).to.have.json('errors.coords.message', 
                                        "Cast to Array failed for value \"-77,not a number\" at path \"coords\"");
          return chakram.wait();
        });

        it('should reject a meaningless coords value', function () {
          var response = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [-180, -91] // invalid latitude (between -90 & 90)
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.coords.message', 
                                        'An Entry requires coords to be set as [<longitude>, <latitude>]!');

          response2 = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [180, 91] // invalid longitude (between -180 & 180)
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response2).to.have.status(500);
          expect(response2).to.have.json('errors.coords.message', 
                                        'An Entry requires coords to be set as [<longitude>, <latitude>]!');

          var response3 = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [-181, -90] // invalid latitude (between -90 & 90)
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response3).to.have.status(500);
          expect(response3).to.have.json('errors.coords.message', 
                                        'An Entry requires coords to be set as [<longitude>, <latitude>]!');

          var response4 = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [181, 90] // invalid latitude (between -90 & 90)
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response4).to.have.status(500);
          expect(response4).to.have.json('errors.coords.message', 
                                        'An Entry requires coords to be set as [<longitude>, <latitude>]!');
          
          return chakram.wait();
        });

      });

      describe('authorization errors', function () {

        it("should require an authorization header", function () {
          var response = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [-77, 28]            
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [-77, 28] 
          }, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [-77, 28] 
          }, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.post(userLystEntriesUrl, {
            description: 'new user entry',
            coords: [-77, 28] 
          }, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to create a Lyst entry on behalf of another user', function () {
          var response = chakram.post(adminLystEntriesUrl, {
            description: 'new user entry',
            coords: [-77, 28]
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

  describe('GET /users/:userId/lysts/:lystId/entries', function () {

    describe('valid request', function () {

      var success; 

      before(function () {
        return success = chakram.get(userLystEntriesUrl, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 200', function () {
        return expect(success).to.have.status(200);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header('content-type', /application\/json/);
      });

      it('should retrieve an array of Lyst entries', function () {
        return expect(success).to.have.schema('data', {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "_id": { "type": "string" },
              "_source": { "type": "string" },
              "coords": { 
                "type": "array",
                "items": { "type": "number" }
              },
              "description": { "type": "string" },
              "rating": { "type": "number" },
            },
            "required": ["_id", "_source", "coords", "description", "rating"]
          },
          "uniqueItems": true
        });
      }); 

      it('should allow an admin to retrieve the Lyst entries of another user', function () {
        var response = chakram.get(userLystEntriesUrl, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(success).to.have.status(200);
      });

      it('should ignore a nonexistent source', function () {
        var response = chakram.get(userLystsUrl + '/' + deletedLystId + '/entries', {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', []); 
        return chakram.wait();
      });

    });

    describe('invalid request' , function () {

      describe('authorization errors' , function () {
    
        it("should require an authorization header", function () {
          var response = chakram.get(userLystEntriesUrl);
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.get(userLystEntriesUrl, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.get(userLystEntriesUrl, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.get(userLystEntriesUrl, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to retrieve the Lyst entries of another user', function () {
          var response = chakram.get(adminLystEntriesUrl, {
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

  describe('GET /users/:userId/lysts/:lystId/entries/:entryId', function () {
    var adminLystEntryUrl = adminLystEntriesUrl + '/' + adminLystEntryId,
        userLystEntryUrl = userLystEntriesUrl + '/' + userLystEntryId;

    describe('valid request', function () {

      var success; 

      before(function () {
        return success = chakram.get(userLystEntryUrl, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 200', function () {
        return expect(success).to.have.status(200);
      });

      it('should have the content-type header set to application/json', function () {
        return expect(success).to.have.header('content-type', /application\/json/);
      });

      it('should retrieve the specified Lyst entry', function () {
        expect(success).to.have.schema('data', {
          "type": "object",
          "properties": {
            "_id": { "type": "string" },
            "_source": { "type": "string" },
            "coords": { 
              "type": "array",
              "items": { "type": "number" }
            },
            "description": { "type": "string" },
            "rating": { "type": "number" },
          },
          "required": ["_id", "_source", "coords", "description", "rating"]
        });
        expect(success).to.have.json('data.description', 'user lyst entry 1');
        expect(success).to.have.json('data.coords', [-77.5, 27]);
        expect(success).to.have.json('data._source', userLystId);
        return chakram.wait();
      });  

      it('should allow an admin to retrieve the Lyst entry of another user', function () {
        var response = chakram.get(userLystEntryUrl, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(200);
      });

      it('should ignore a nonexistent source and/or entry', function () {
        var response = chakram.get(userLystsUrl + '/' + deletedLystId + '/entries/' + deletedEntryId, {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', null); 
        return chakram.wait();
      });

    });

    describe('invalid request' , function () {

      it('should reject a malformed Entry ID', function () {
        var response = chakram.get(userLystEntriesUrl + '/not an ID', {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'Entry ID - not an ID - is invalid.');
        return chakram.wait();
      });

      describe('authorization errors' , function () {
    
        it("should require an authorization header", function () {
          var response = chakram.get(userLystEntryUrl);
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.get(userLystEntryUrl, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.get(userLystEntryUrl, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.get(userLystEntryUrl, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to retrieve the Lyst entry of another user', function () {
          var response = chakram.get(adminLystEntryUrl, {
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

  describe('PUT /users/:userId/lysts/:lystId/entries/:entryId', function () {
    var adminLystEntryUrl = adminLystEntriesUrl + '/' + adminLystEntryId,
        userLystEntryUrl = userLystEntriesUrl + '/' + userLystEntryId;

    describe('valid request', function () {

      var success; 

      before(function () {
        return success = chakram.put(userLystEntryUrl, {
          description: 'updated entry description',
          coords: [-80, 30]
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

      it('should ignore all fields except description, and coords sent in the body', function () {
        var response = chakram.put(userLystEntryUrl, {
          description: 'updated entry description 2',
          coords: [-77, 28],
          _id: 'not an ID but who cares', // ID cannot be updated once set
          _source: 'not an ID either', // of type ObjectId in schema
          rating: 'not a number but who cares', // of type Number in schema
          random: 'iamabot'
        }, {
          'auth': { 'bearer': userJWT }
        });
        return expect(response).to.have.status(201);
      });

      it('should allow an admin to update the Lyst entry of another user', function () {
        var response = chakram.put(userLystEntryUrl, {
          description: 'user lyst entry 1',
          coords: [-77.5, 27]
        }, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(201);
      });

      it('should ignore a nonexistent source and/or entry', function () {
        var response = chakram.put(userLystsUrl + '/' + deletedLystId + '/entries/' + deletedEntryId, {
          description: 'no dice'
        }, {
          'auth': { 'bearer': userJWT }
        });
        return expect(response).to.have.status(201);
      });

    });

    describe('invalid request' , function () {

      it('should reject a malformed Entry ID', function () {
        var response = chakram.put(userLystEntriesUrl + '/not an ID', {
          description: 'will not change'
        }, {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(400);
        expect(response).to.have.json('message', 
                                      'Entry ID - not an ID - is invalid.');
        return chakram.wait();
      });

      describe('validation errors' , function () {
    
        it("should prevent setting description to an empty string", function () {
          var response = chakram.put(userLystEntryUrl, {
            description: ''
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.description.message', 
                                        'Entry validation failed for path `description` with missing value.');
          return chakram.wait();
        });

        it("should prevent setting coords to an empty string", function () {
          var response = chakram.put(userLystEntryUrl, {
            coords: ''
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.coords.message', 
                                        'Entry validation failed for path `coords` with missing value.');
          return chakram.wait();
        });

        it('should reject a malformed coords value', function () {
          var response = chakram.put(userLystEntryUrl, {
            description: 'will not change',
            coords: 'not an array of numbers'
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('message', 
                                        "Cast to number failed for value \"not an array of numbers\" at path \"coords\"");

          var response2 = chakram.put(userLystEntryUrl, {
            description: 'new user entry',
            coords: [-77, 'not a number']
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response2).to.have.status(500);
          expect(response2).to.have.json('message', 
                                        "Cast to [number] failed for value \"[-77,\"not a number\"]\" at path \"coords\"");
          return chakram.wait();
        });

        it('should reject a meaningless coords value', function () {
          var response = chakram.put(userLystEntryUrl, {
            description: 'new user entry',
            coords: [-180, -91] // invalid latitude (between -90 & 90)
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response).to.have.status(500);
          expect(response).to.have.json('errors.coords.message', 
                                        'An Entry requires coords to be set as [<longitude>, <latitude>]!');

          response2 = chakram.put(userLystEntryUrl, {
            description: 'new user entry',
            coords: [180, 91] // invalid longitude (between -180 & 180)
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response2).to.have.status(500);
          expect(response2).to.have.json('errors.coords.message', 
                                        'An Entry requires coords to be set as [<longitude>, <latitude>]!');

          var response3 = chakram.put(userLystEntryUrl, {
            description: 'new user entry',
            coords: [-181, -90] // invalid latitude (between -90 & 90)
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response3).to.have.status(500);
          expect(response3).to.have.json('errors.coords.message', 
                                        'An Entry requires coords to be set as [<longitude>, <latitude>]!');

          var response4 = chakram.put(userLystEntryUrl, {
            description: 'new user entry',
            coords: [181, 90] // invalid latitude (between -90 & 90)
          }, {
            'auth': { 'bearer': userJWT }
          });
          expect(response4).to.have.status(500);
          expect(response4).to.have.json('errors.coords.message', 
                                        'An Entry requires coords to be set as [<longitude>, <latitude>]!');
          return chakram.wait();
        });

      });

      describe('authorization errors' , function () {
    
        it("should require an authorization header", function () {
          var response = chakram.put(userLystEntryUrl, {
            description: 'will not change'
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.put(userLystEntryUrl, {
            description: 'will not change'
          }, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject an expired JWT", function () {
          var response = chakram.put(userLystEntryUrl, {
            description: 'will not change'
          }, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject a compromised JWT", function () {
          var response = chakram.put(userLystEntryUrl, {
            description: 'will not change'
          }, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to update the Lyst of another user', function () {
          var response = chakram.put(adminLystEntryUrl, {
            description: 'will not change'
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

  describe('DELETE /users/:userId/lysts/:lystId/entries', function () {

    describe('valid request', function () {

      var success; 

      before(function () {
        return success = chakram.delete(userLystEntriesUrl, {
          ids: [newLystEntryId1]
        }, {
          'auth': { 'bearer': userJWT }
        });
      });

      it('should respond with status code 204', function () {
        return expect(success).to.have.status(204);
      });

      it('should not send back any content', function () {
        return expect(success).to.not.have.header('content-type');
      });

      it('should allow an admin to delete the Lyst entries of another user', function () {
        var response = chakram.delete(userLystEntriesUrl, {
          ids: [newLystEntryId2, newLystEntryId3]
        }, {
          'auth': { 'bearer': adminJWT }
        });
        return expect(response).to.have.status(204);
      });

      it('should skip a malformed Entry ID and ignore nonexistent/ deleted entries', function () {
        var response = chakram.delete(userLystEntriesUrl, {
          ids: ['not an ID', '100000000000000000000000']
        }, {
          'auth': { 'bearer': userJWT }
        });
        expect(response).to.have.status(200);
        expect(response).to.have.json('missed', ['not an ID']);
        return chakram.wait();
      });

    });

    describe('invalid request' , function () {

      describe('authorization errors' , function () {
    
        it("should require an authorization header", function () {
          var response = chakram.delete(userLystEntriesUrl, {
            ids: [userLystEntryId]
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message', 
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject invalid JWTs", function () {
          var response = chakram.delete(userLystEntriesUrl, {
            ids: [userLystEntryId]
          }, {
            'auth': { 'bearer': 'not a real JWT' }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token must be sent in the Authorization header as 'Bearer <token>'");
          return chakram.wait();
        });

        it("should reject expired JWTs", function () {
          var response = chakram.delete(userLystEntriesUrl, {
            ids: [userLystEntryId]
          }, {
            'auth': { 'bearer': expiredUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token verification failed with reason 'jwt expired'.");
          return chakram.wait();
        });

        it("should reject compromised JWTs", function () {
          var response = chakram.delete(userLystEntriesUrl, {
            ids: [userLystEntryId]
          }, {
            'auth': { 'bearer': compromisedUserJWT }
          });
          expect(response).to.have.status(401);
          expect(response).to.have.json('message',
                                        "Token verification failed with reason 'invalid signature'.");
          return chakram.wait();
        });

        it('should not allow a non-admin to delete the Lyst entry of another user', function () {
          var response = chakram.delete(adminLystEntriesUrl, {
            ids: [adminLystEntryId]
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
