'use strict'
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  cellarNumber: Number,
  shelve: String,
})

module.exports = mongoose.model('cellarUbication', userSchema)
