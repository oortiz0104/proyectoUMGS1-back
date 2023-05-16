'use strict'
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  brand: String,
  model: String,
  serialNumber: String,
  purchaseOrder: String,
  ubication: { type: mongoose.Schema.ObjectId, ref: 'cellarUbication' },
  state: { type: mongoose.Schema.ObjectId, ref: 'state' },
})

module.exports = mongoose.model('newPC', userSchema)
