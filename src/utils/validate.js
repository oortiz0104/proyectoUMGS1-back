'use strict'

const User = require('../models/user.model')
const CellarUbication = require('../models/cellarUbication.model')
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
    if (
      params.password ||
      Object.entries(params).length === 0 ||
      params.role ||
      params.deleted ||
      params.occupied
    ) {
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

//* Ubicación en bodega ---------------------------------------------------------------------------------------

exports.findCellarUbication = async (cellarNumber, shelve) => {
  try {
    let exist = await CellarUbication.findOne({
      cellarNumber: cellarNumber ?? '',
      shelve: shelve ?? '',
      deleted: false,
    }).lean()
    return exist
  } catch (err) {
    console.log(err)
    return err
  }
}

//* PC Nuevos ---------------------------------------------------------------------------------------

exports.findNewPC = async (serialNumber) => {
  try {
    let exist = await NewPC.findOne({ serialNumber: serialNumber }).lean()
    return exist
  } catch (err) {
    console.log(err)
    return err
  }
}

exports.findeNewPCPurchaseOrder = async (purchaseOrder) => {
  try {
    let exist = await NewPC.findOne({ purchaseOrder: purchaseOrder }).lean()
    return exist
  } catch (err) {
    console.log(err)
    return err
  }
}

exports.checkUpdateNewPC = async (params) => {
  try {
    if (params.state || Object.entries(params).length === 0 || params.deleted) {
      return true
    } else {
      return false
    }
  } catch (err) {
    console.log(err)
    return err
  }
}

//* PC Usados ---------------------------------------------------------------------------------------

exports.findUsedPC = async (serialNumber) => {
  try {
    let exist = await UsedPC.findOne({ serialNumber: serialNumber }).lean()
    return exist
  } catch (err) {
    console.log(err)
    return err
  }
}