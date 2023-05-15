'use strict'
const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'hotel'
    },
    name: String,
    description: String,
    price: Number,
    available: Boolean,
    dateAvailable: String,
    currentUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
})

module.exports = mongoose.model('room', roomSchema);