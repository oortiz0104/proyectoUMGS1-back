'use strict'
const mongoose = require('mongoose')

const newPCSchema = mongoose.Schema({
  brand: String,
  model: String,
  serialNumber: String,
  purchaseOrder: String,
  ubication: { type: mongoose.Schema.ObjectId, ref: 'cellarUbication' },
  state: String,
})

module.exports = mongoose.model('newPC', newPCSchema)
