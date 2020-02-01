const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config'); // Use .env

const app = express();

// DB Config
const db = require('./src/config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB Connected...');
  })
  .catch(error => {
    console.log(error);
  });

// Middleware
app.use(express.json());

// Routes
app.use('/', require('./src/routes/index'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
