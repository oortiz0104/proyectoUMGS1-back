'use strict'
const mongoose = require('mongoose')

const cellarUbicationSchema = mongoose.Schema({
  cellarNumber: Number,
  shelve: String,
  occupied: Boolean,
})

module.exports = mongoose.model('cellarUbication', cellarUbicationSchema)
