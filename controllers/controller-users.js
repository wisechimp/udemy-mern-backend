const uuid = require('uuid/v4')
const { validationResult } = require("express-validator");

const HttpError = require('../models/http-error')

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Cheeky Monkey',
        email: 'monkey@monkey.com',
        password: 'bananas'
    }
]

const getUsers = (req, res, next) => {
    res.json({ users: DUMMY_USERS })
}

const createUser = (req, res, next) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors)
      throw new HttpError("Invalid inputs, please check your entry.", 422)
    }

    const { name, email, password } = req.body

    const existingUser = DUMMY_USERS.find(u => u.email === email)
    if (existingUser) {
        throw new HttpError("Invalid email address", 422);
    }

    const newUser = {
        id: uuid(),
        name,
        email,
        password
    }

    DUMMY_USERS.push(newUser)
    res.status(201).json({ user: newUser })
}

const loginUser = (req, res, next) => {
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find(u => u.email === email)
    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Invalid credentials', 401)
    }

    res.json({ message: 'Logged in successfully' })
}

module.exports = {
    getUsers,
    createUser,
    loginUser
}