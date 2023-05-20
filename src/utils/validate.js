'use strict'

const User = require('../models/user.model')
const CellarUbication = require('../models/cellarUbication.model')
const State = require('../models/state.model')
const NewPC = require('../models/newPC.model')
const NewPCRegister = require('../models/newPCRegister.model')
const UsedPC = require('../models/usedPC.model')
const UsedPCRegister = require('../models/usedPCRegister.model')

const bcrypt = require('bcrypt-nodejs')

exports.validateData = (data) => {
  let keys = Object.keys(data),
    msg = ''

  for (let key of keys) {
    if (data[key] !== null && data[key] !== undefined && data[key] !== '')
      continue
    msg += `El parámetro ${key} es obligatorio\n`
  }
  return msg.trim()
}

//* Usuarios ---------------------------------------------------------------------------------------

exports.findUser = async (username) => {
  try {
    let exist = await User.findOne({ username: username }).lean()
    return exist
  } catch (err) {
    console.log(err)
    return err
  }
}

exports.checkPassword = async (password, hash) => {
  try {
    return bcrypt.compareSync(password, hash)
  } catch (err) {
    console.log(err)
    return err
  }
}

exports.encrypt = async (password) => {
  try {
    return bcrypt.hashSync(password)
  } catch (err) {
    console.log(err)
    return err
  }
}

exports.checkUpdate = async (params) => {
  try {
    if (params.password || Object.entries(params).length === 0 || params.role) {
      return false
    } else {
      return true
    }
  } catch (err) {
    console.log(err)
    return err
  }
}

exports.checkUpdate_OnlyAdmin = async (params) => {
  try {
    if (Object.entries(params).length === 0 || params.password) {
      return false
    } else {
      return true
    }
  } catch (err) {
    console.log(err)
    return err
  }
}

exports.alreadyUser = async (username) => {
  try {
    let exist = User.findOne({ username: username }).lean()
    return exist
  } catch (err) {
    console.log(err)
    return err
  }
}

//* Ubicación en bodega ---------------------------------------------------------------------------------------

exports.findCellarUbication = async (cellarNumber) => {
  try {
    let exist = await CellarUbication.findOne({ cellarNumber: cellarNumber }).lean()
    return exist
  } catch (err) {
    console.log(err)
    return err
  }
}

//* Estados ---------------------------------------------------------------------------------------

exports.findState = async (name) => {
  try {
    let exist = await State.findOne({ name: name }).lean()
    return exist
  } catch (err) {
    console.log(err)
    return err
  }
}
