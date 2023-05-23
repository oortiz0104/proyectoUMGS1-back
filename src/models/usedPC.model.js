'use strict'
const mongoose = require('mongoose')

const usedPCSchema = mongoose.Schema({
  brand: String,
  model: String,
  serialNumber: String,
  ubication: { type: mongoose.Schema.ObjectId, ref: 'cellarUbication' },
  state: String,
  deleted: { type: Boolean, default: false },
})

module.exports = mongoose.model('usedPC', usedPCSchema)
