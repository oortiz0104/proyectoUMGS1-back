'use strict'

const User = require('../models/user.model');

const bcrypt = require('bcrypt-nodejs');

exports.validateData = (data) => {
    let keys = Object.keys(data),
        msg = '';

    for (let key of keys) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `El parámetro ${key} es obligatorio\n`
    }
    return msg.trim();
}

//* Usuarios ---------------------------------------------------------------------------------------

exports.findUser = async (username) => {
    try {
        let exist = await User.findOne({ username: username }).lean();
        return exist;
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash) => {
    try {
        return bcrypt.compareSync(password, hash);
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.encrypt = async (password) => {
    try {
        return bcrypt.hashSync(password);
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkUpdate = async (params) => {
    try {
        if (params.password || Object.entries(params).length === 0 || params.role || params.reservations || params.history || params.bills) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkUpdate_OnlyAdmin = async (params) => {
    try {
        if (Object.entries(params).length === 0 || params.password || params.reservations || params.history || params.bills) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.alreadyUser = async (username) => {
    try {
        let exist = User.findOne({ username: username }).lean()
        return exist;
    } catch (err) {
        console.log(err)
        return err;
    }
}