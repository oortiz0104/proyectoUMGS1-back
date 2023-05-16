'use strict'
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  check_in: Date,
  check_out: Date,
  user: { type: mongoose.Schema.ObjectId, ref: 'user' },
  pc: { type: mongoose.Schema.ObjectId, ref: 'newPC' },
  state: { type: mongoose.Schema.ObjectId, ref: 'state' },
})

module.exports = mongoose.model('newPCRegister', userSchema)
