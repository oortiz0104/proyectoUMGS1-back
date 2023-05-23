'use strict'
const mongoose = require('mongoose')

const usedPCRegisterSchema = mongoose.Schema({
  check_in: Date,
  check_out: Date,
  user: { type: mongoose.Schema.ObjectId, ref: 'user' },
  pc: { type: mongoose.Schema.ObjectId, ref: 'usedPC' },
})

module.exports = mongoose.model('usedPCRegister', usedPCRegisterSchema)
