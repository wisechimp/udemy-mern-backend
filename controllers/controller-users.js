const { validationResult } = require("express-validator");

const HttpError = require('../models/http-error')
const User = require('../models/user')

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

const createUser = async (req, res, next) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors)
      return next(new HttpError("Invalid inputs, please check your entry.", 422))
    }

    const { name, email, password, places } = req.body

    let existingUser
    try {
        existingUser = await User.findOne({ email })
    } catch (err) {
        return next(new HttpError('Signup failed, please try again later', 500))
    }

    if (existingUser) {
        return next(
          new HttpError('Signup failed, please try again later', 422)
        );
    }
    
    let newUser = new User({
      name,
      email,
      password,
      image:
        "https://pbs.twimg.com/profile_images/1002712133/Questioning_400x400.jpg",
      places
    });

    try {
        await newUser.save()
    } catch (err) {
        return next(new HttpError('Creating account failed, please try again later', 500))
    }

    res.status(201).json({ user: newUser.toObject({ getters: true }) })
}

const loginUser = (req, res, next) => {
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find(u => u.email === email)
    if (!identifiedUser || identifiedUser.password !== password) {
        return next(new HttpError('Invalid credentials', 401))
    }

    res.json({ message: 'Logged in successfully' })
}

module.exports = {
    getUsers,
    createUser,
    loginUser
}