(function (env) {
  var env = ['development', 'test'].indexOf(env) > -1 ? env : 'test';

  var mongoose = require('mongoose');

  var seeder = require('mongoose-seed');
  seeder.connect('mongodb://localhost/ionic_quotes_' + env, function() {
    
    // Load Mongoose models 
    seeder.loadModels([
      'models/user.js',
      'models/lyst.js',
      'models/entry.js'
    ]);
   
    // Clear specified collections 
    seeder.clearModels(['User', 'Lyst', 'Entry'], function() {
      // Callback to populate DB once collections have been cleared 
      seeder.populateModels(data[0]); // add users
      seeder.populateModels(data[1]); // add lysts
      seeder.populateModels(data[2]); // add entries

      setTimeout(function () {
        process.exit();
      }, 1000); // should not take longer than 1s
    });
  });
   
  // Data array containing seed data - documents organized by Model 
  var data = [
    [{ 
      'model': 'User',
      'documents': [
        {
          '_id': mongoose.Types.ObjectId('574da29e88c4ccbb24d0014d'),
          'username': 'admin@ionicquotes.io',
          'password': '$2a$10$U2hEZ0SseYKNmloK9m2HOenASA6GfGRWzKPCLQ6ryM/LMeIwPjWS6',
          'fullname': 'admin user',
          'role': 'admin'
        },
        {
          '_id': mongoose.Types.ObjectId('574da29e88c4ccbb24d0014e'),
          'username': 'user@ionicquotes.io',
          'password': '$2a$10$U2hEZ0SseYKNmloK9m2HOeQ83nNJFkbnldBHMfhZxOEeA8ZGdwGa.',
          'fullname': 'regular user',
          'role': 'user'
        }
      ]
    }],

    [{ 
      'model': 'Lyst',
      'documents': [
        {
          '_id': mongoose.Types.ObjectId('57593de19896f7a0d787e2da'),
          '_creator': mongoose.Types.ObjectId('574da29e88c4ccbb24d0014d'),
          'name': 'admin lyst',
          'visible': true,
          'entries': [
            mongoose.Types.ObjectId('575acc52bc31a132deb22721')
          ],
          'followers': []
        },
        {
          '_id': mongoose.Types.ObjectId('57593de69896f7a0d787e2db'),
          '_creator': mongoose.Types.ObjectId('574da29e88c4ccbb24d0014e'),
          'name': 'user lyst',
          'visible': true,
          'entries': [
            mongoose.Types.ObjectId('575acc72bc31a132deb22722'),
            mongoose.Types.ObjectId('575acc7abc31a132deb22723')
          ],
          'followers': [mongoose.Types.ObjectId('574da29e88c4ccbb24d0014d')]
        }
      ]
    }],

    [{ 
      'model': 'Entry',
      'documents': [
        {
          '_id': mongoose.Types.ObjectId('575acc52bc31a132deb22721'),
          '_source': mongoose.Types.ObjectId('57593de19896f7a0d787e2da'),
          'description': 'admin lyst entry',
          'coords': [-77, 28],
          'rating': 4
        },
        {
          '_id': mongoose.Types.ObjectId('575acc72bc31a132deb22722'),
          '_source': mongoose.Types.ObjectId('57593de69896f7a0d787e2db'),
          'description': 'user lyst entry 1',
          'coords': [-77.5, 27]
        },
        {
          '_id': mongoose.Types.ObjectId('575acc7abc31a132deb22723'),
          '_source': mongoose.Types.ObjectId('57593de69896f7a0d787e2db'),
          'description': 'user lyst entry 2',
          'coords': [-78, 26]
        }
      ]
    }]
  ];

})(process.env.NODE_ENV || process.argv[2]);