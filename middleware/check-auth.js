const jwt = require('jsonwebtoken')
require("dotenv").config();

const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            throw new Error('Authentication failed!')
        }
        const decodedToken = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.userData = { userId: decodedToken.userId }
        next()
    } catch (error) {
        return next(new HttpError("Authenication failed!", 403));
    }
}