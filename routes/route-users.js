const express = require('express')

const userControllers = require('../controllers/controller-users');

const router = express.Router();

router.get('/', userControllers.getUsers)

router.post('/signup', userControllers.createUser)

router.post('/login', userControllers.loginUser)

module.exports = router;