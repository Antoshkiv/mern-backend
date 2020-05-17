const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routs');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes); //=> /api/places...
app.use('/api/users', usersRoutes); //=> /api/users...

app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error  occurred!' });
});

mongoose
  .connect('mongodb+srv://admin:XG2Yd2cbwZN0NN5E@cluster0-rq5bo.mongodb.net/places?retryWrites=true&w=majority')
  .then(() => {
    app.listen(5000);
  })
  .catch((error) => {
    console.error(error);
  });
