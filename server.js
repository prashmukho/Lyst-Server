var logger          = require('morgan'),
    cors            = require('cors'),
    http            = require('http'),
    express         = require('express'),
    errorhandler    = require('errorhandler'),
    dotenv          = require('dotenv'),
    bodyParser      = require('body-parser'),
    mongoose        = require('mongoose');
// Express application
var app = express();
// Environment variables
dotenv.load();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// Parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Cross-origin resource sharing
app.use(cors());

if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));
  app.use(errorhandler())
}

// ionic quotes app uses these
app.use(require('./anonymous-routes'));
app.use(require('./protected-routes'));

app.use(require('./routes/anonymous/lyst-routes'));
app.use(require('./routes/identified/user-routes'));

app.use(function (err, req, res, next) {
  if (err)
    return res.status(500).send({ message: err.message })
  
  next();
});

app.use(function (err, req, res, next) {
  res.status(404).send({ message: 'Not found.' });
});

mongoose.connect('mongodb://localhost/ionic_quotes_' + process.env.NODE_ENV);

var port = process.env.PORT || 3001;
http.Server(app).listen(port, function (err) {
  console.log('Running in ' + process.env.NODE_ENV + ' mode.');
  console.log('Listening at http://localhost:' + port);
});

