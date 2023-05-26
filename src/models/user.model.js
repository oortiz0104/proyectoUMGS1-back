'use strict'
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: String,
  surname: String,
  username: String,
  password: String,
  email: String,
  phone: String,
  role: String,
  deleted: { type: Boolean, default: false },
})

module.exports = mongoose.model('user', userSchema)
