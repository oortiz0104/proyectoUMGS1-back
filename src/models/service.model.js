'use strict'
const mongoose = require('mongoose')

const serviceSchema = mongoose.Schema({
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'hotel'
    },
    name: String,
    description: String,
    price: Number
});

module.exports = mongoose.model('service', serviceSchema)