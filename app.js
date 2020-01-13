const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/route-places')
const usersRoutes = require('./routes/route-users')
const HttpError = require('./models/http-error')

const app = express()

app.use(bodyParser.json())

app.use('/api/places', placesRoutes)

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404)
    next(error)
})

// Express recognises this as a middleware function that may
// give an error and makes this the default action 
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }

    res.status(error.code || 500)
    res.json({
        message: error.message || 'An unknown error occurred'
    })
})

app.listen(5000)