const express = require('express')

const router = express.Router()

router.get('/', (req, res, next) => {
    console.log('GET request in places')
    res.json({
        message: 'It\'s Alive!'
    })
})

module.exports = router