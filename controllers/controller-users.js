const { validationResult } = require("express-validator");

const HttpError = require('../models/http-error')
const User = require('../models/user')

const getUsers = async (req, res, next) => {
    let users

    // Could put e.g. 'name email' instead
    try {
        users = await User.find({}, '-password')
    } catch (error) {
        return next('Fetching users failed, please try again later', 500)
    }

    res.json({ users: users.map(user => user.toObject({ getters: true })) })
}

const createUser = async (req, res, next) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      console.log(validationErrors)
      return next(new HttpError("Invalid inputs, please check your entry.", 422))
    }

    const { name, email, password } = req.body

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
      places: []
    });

    try {
        await newUser.save()
    } catch (err) {
        return next(new HttpError('Creating account failed, please try again later', 500))
    }

    res.status(201).json({ user: newUser.toObject({ getters: true }) })
}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body

    let existingUser
    try {
        existingUser = await User.findOne({ email })
    } catch (err) {
        return next(new HttpError('Login failed, please try again later', 500))
    }

    if (!existingUser || existingUser.password !== password) {
        return next(
          new HttpError('Invalid credentials, please try again later', 422)
        );
    }

    res.json({ message: 'Logged in successfully' })
}

module.exports = {
    getUsers,
    createUser,
    loginUser
}