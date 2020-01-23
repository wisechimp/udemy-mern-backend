const fs = require('fs')
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config();

const placesRoutes = require('./routes/route-places')
const usersRoutes = require('./routes/route-users')
const HttpError = require('./models/http-error')

const app = express()

app.use(bodyParser.json())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

/* app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  next()
}) */

app.use(cors())

app.options('/api', cors()) // to enable preflight

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404)
    next(error)
})

// Express recognises this as a middleware function that may
// give an error and makes this the default action 
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err)
    })
  }

  if (res.headerSent) {
      return next(error)
  }

  res.status(error.code || 500)
  res.json({
      message: error.message || 'An unknown error occurred'
  })
})

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch(error => {
    console.log(error);
  });

