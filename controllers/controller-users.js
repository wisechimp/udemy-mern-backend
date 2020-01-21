const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require("dotenv").config();

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
    
    // Should be delivered by https so it's can't be picked out in transit.
    // Controlled by the service you use to deploy your backend
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next (new HttpError(
            'Could not create user, please try again',
            500
        ))
    }
        
    let newUser = new User({
      name,
      email,
      password: hashedPassword,
      image: req.file.path,
      places: []
    });

    try {
        await newUser.save()
    } catch (err) {
        return next(new HttpError('Creating account failed, please try again later', 500))
    }

    let token
    try {
        token = jwt.sign(
          { userId: newUser.id, email: newUser.email },
          process.env.JWTPRIVATEKEY,
          { expiresIn: "1h" }
        );
    } catch (error) {
        return next(
          new HttpError("Creating account failed, please try again later", 500)
        );
    }

    res.status(201).json({ userId: newUser.id, email: newUser.email, token: token })
}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body

    let existingUser
    try {
        existingUser = await User.findOne({ email })
    } catch (err) {
        return next(new HttpError('Login failed, please try again later', 500))
    }

    if (!existingUser) {
        return next(
          new HttpError("Invalid credentials, could not log you in", 401)
        );
    }

    let isValidPassword = false
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);   
    } catch (error) {
        return next(new HttpError('Could not log you in. Please check your credentials and try again', 500))
    }

    if (!isValidPassword) {
        return next(new HttpError("Invalid credentials, could not log you in", 401))
    }

    let token
    try {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.JWTPRIVATEKEY,
        { expiresIn: "1h" }
      );
    } catch (error) {
      return next(
        new HttpError("Loggin in failed, please try again later", 500)
      );
    }

    res.json({ message: 'Logged in successfully', userId: existingUser.id, email: existingUser.email, token: token })
}

module.exports = {
    getUsers,
    createUser,
    loginUser
}