'use strict'

const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');

const bcrypt = require('bcrypt-nodejs');
const fs = require('fs')

exports.validateData = (data) => {
    let keys = Object.keys(data),
        msg = '';

    for (let key of keys) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `El parámetro ${key} es obligatorio\n`
    }
    return msg.trim();
}

exports.validateExtension = async (ext, filePath) => {
    try {
        if (ext == 'png' ||
            ext == 'jpg' ||
            ext == 'jpeg' ||
            ext == 'gif') {
            return true;
        } else {
            fs.unlinkSync(filePath);
            return false;
        }
    } catch (err) {
        console.log(err)
        return err
    }
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

//* Hoteles ---------------------------------------------------------------------------------------

exports.findHotel = async (name) => {
    try {
        let exist = await Hotel.findOne({ name: name }).lean()
        return exist;
    } catch (err) {
        console.log(err)
        return err;
    }
}

exports.findUserHotel = async (userId) => {
    try {
        let exist = await User.findOne({ _id: userId }).lean();
        return exist;
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkDeleteHotel = async (_id) => {
    try {
        let exist = await Hotel.findOne({ _id }).lean()
        return exist;
    } catch (err) {
        console.log(err)
        return err;
    }
}

exports.checkUpdateHotel = async (params) => {
    try {
        if (Object.entries(params).length === 0 || params.adminHotel || params.image || params.timesRequest) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkUpdateHotel_OnlyAdmin = async (params) => {
    try {
        if (Object.entries(params).length === 0 || params.image || params.timesRequest) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

//* Servicios ---------------------------------------------------------------------------------------

exports.checkUpdateService = async (params) => {
    if (Object.entries(params).length === 0 || params.hotel) {
        return false;
    } else {
        return true;
    }
}

//* Eventos ---------------------------------------------------------------------------------------

exports.checkUpdateEvent = async (params) => {
    if (Object.entries(params).length === 0 || params.hotel) {
        return false;
    } else {
        return true;
    }
}

//* Habitaciones ------------------------------------------------------------------------------------

exports.checkUpdateRoom = async (params) => {
    if (Object.entries(params).length === 0 || params.hotel || params.currentUser) {
        return false;
    } else {
        return true;
    }
}