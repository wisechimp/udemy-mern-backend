const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/route-places')
const usersRoutes = require('./routes/route-users')

const app = express()

app.use('/api/places', placesRoutes)
app.use('/api/user', usersRoutes)

app.listen(5000)