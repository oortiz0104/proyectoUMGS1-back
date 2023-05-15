'use strict'
const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'hotel'
    },
    name: String,
    description: String,
    category: String,
    dateEvent: Date
})

module.exports = mongoose.model('event', eventSchema)