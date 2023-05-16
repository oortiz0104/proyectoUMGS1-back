'use strict'
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  check_in: Date,
  check_out: Date,
  user: { type: mongoose.Schema.ObjectId, ref: 'user' },
  pc: { type: mongoose.Schema.ObjectId, ref: 'usedPC' },
  state: { type: mongoose.Schema.ObjectId, ref: 'state' },
})

module.exports = mongoose.model('usedPCRegister', userSchema)
