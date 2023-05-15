'use strict'
const mongoose = require('mongoose')

const billSchema = mongoose.Schema({
    date: { type: Date, default: Date.now() },
    total: Number,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'hotel'
    },
    reservation: {
        type: mongoose.Schema.ObjectId,
        ref: 'reservation'
    }
})

module.exports = mongoose.model('bill', billSchema)