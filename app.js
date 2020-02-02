require('dotenv/config'); // Use .env

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();

const ONE_HOUR = 1000 * 60 * 60;

// DB Config
const {
  PORT = 5000,
  NODE_ENV = 'development',
  DB_CONNECT,
  SESSION_NAME = 'sid',
  SESSION_SECRET = 'session-secret',
  SESS_LIFETIME = ONE_HOUR
} = process.env;

const IN_PROD = NODE_ENV === 'production';

// Connect to Mongo
mongoose.connect(DB_CONNECT,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB Connected...');
  })
  .catch(error => {
    console.log(error);
  });

mongoose.Promise = global.Promise;
const db = mongoose.connection;

// Set headers
app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.use(cookieParser());

// Configure session
app.use(session({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: db }),
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite: true,
    secure: IN_PROD
  }
}));

// Middleware
app.use(express.json());

// Routes
app.use('/', require('./src/routes/index'));
app.use('/sprint', require('./src/routes/sprints'));
app.use('/story', require('./src/routes/stories'));
app.use('/voter', require('./src/routes/voters'));

app.listen(PORT, console.log(`Server started on port ${PORT}`));
