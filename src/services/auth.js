'use strict'

const jwt = require('jwt-simple');
const secretKey = 'SecretKey';

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'La petición no contiene la cabecera de autenticación' });
    } else {
        try {
            let token = req.headers.authorization.replace(/['"]+/g, '');
            var payload = jwt.decode(token, secretKey);
        } catch (err) {
            console.log(err);
            return res.status(400).send({ message: 'El token no es valido o ha expirado' });
        }
        req.user = payload;
        next();
    }
}

exports.isAdmin = (req, res, next) => {
    try {
        const role = req.user.role;
        if (role === 'ADMIN') {
            return next();
        } else {
            return res.status(403).send({ message: 'Acceso denegado a la función' });
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.isHotelAdmin = (req, res, next) => {
    try {
        const role = req.user.role;
        if (role === 'HOTELADMIN') {
            return next();
        } else {
            return res.status(403).send({ message: 'Acceso denegado a la función' });
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.isClient = (req, res, next) => {
    try {
        const role = req.user.role;
        if (role === 'CLIENT') {
            return next();
        } else {
            return res.status(403).send({ message: 'Acceso denegado a la función' });
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}