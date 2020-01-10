const express = require('express')

const placeControllers = require('../controllers/controller-places')
const router = express.Router()

router.get('/:pid', placeControllers.getPlaceById)

router.get('/user/:uid', placeControllers.getPlaceByUserId)

module.exports = router