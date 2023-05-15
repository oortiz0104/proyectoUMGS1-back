'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'SecretKey';

exports.createToken = async (user) => {
    try {
        const payload = {
            sub: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            password: user.password,
            phone: user.phone,
            role: user.role,
            iat: moment().unix(),
            exp: moment().add(12, 'hours').unix()
        }
        return jwt.encode(payload, secretKey)

    } catch (err) {
        console.log(err);
        return err;
    }
}