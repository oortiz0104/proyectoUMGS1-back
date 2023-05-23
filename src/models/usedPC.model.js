'use strict'
const mongoose = require('mongoose')

const usedPCSchema = mongoose.Schema({
  brand: String,
  model: String,
  serialNumber: String,
  ubication: { type: mongoose.Schema.ObjectId, ref: 'cellarUbication' },
  state: String,
})

module.exports = mongoose.model('usedPC', usedPCSchema)
