const express = require('express')
const { check } = require('express-validator')

const userControllers = require('../controllers/controller-users');

const router = express.Router();

router.get('/', userControllers.getUsers)

router.post(
    '/signup',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ],
    userControllers.createUser)

router.post('/login', userControllers.loginUser)

module.exports = router;