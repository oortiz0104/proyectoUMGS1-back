'use strict'
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: String,
    surname: String,
    username: String,
    password: String,
    email: String,
    image: String,
    phone: String,
    role: String,
    currentReservation: {
        type: mongoose.Schema.ObjectId,
        ref: 'reservation'
    },
    reservations: [{
        type: mongoose.Schema.ObjectId,
        ref: 'reservation'
    }],
    history: [{
        type: mongoose.Schema.ObjectId,
        ref: 'hotel'
    }],
    bills: [{
        type: mongoose.Schema.ObjectId,
        ref: 'bill'
    }]
});

module.exports = mongoose.model('user', userSchema)