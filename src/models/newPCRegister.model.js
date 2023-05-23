'use strict'
const mongoose = require('mongoose')

const newPCRegisterSchema = mongoose.Schema({
  check_in: Date,
  check_out: Date,
  user: { type: mongoose.Schema.ObjectId, ref: 'user' },
  pc: { type: mongoose.Schema.ObjectId, ref: 'newPC' },
})

module.exports = mongoose.model('newPCRegister', newPCRegisterSchema)
