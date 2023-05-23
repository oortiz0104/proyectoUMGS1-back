'use strict'
const mongoose = require('mongoose')

const cellarUbicationSchema = mongoose.Schema({
  cellarNumber: String,
  shelve: String,
  occupied: Boolean,
  deleted: { type: Boolean, default: false },
})

module.exports = mongoose.model('cellarUbication', cellarUbicationSchema)
