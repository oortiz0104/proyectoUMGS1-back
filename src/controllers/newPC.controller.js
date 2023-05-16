'use strict'

const {
  validateData,
  validateExtension,
  findUser,
  checkPassword,
  checkUpdate,
  checkUpdate_OnlyAdmin,
  encrypt,
} = require('../utils/validate')
const User = require('../models/user.model')
const NewPC = require('../models/newPC.model')

const jwt = require('../services/jwt')

exports.test = (req, res) => {
  return res.send({
    message: 'Mensaje de prueba desde el controlador de nuevos equipos',
  })
}

//* Funciones admistrador ---------------------------------------------------------------------------------------

exports.addPC = async (req, res) => {
  try {
    const params = req.body
    const data = {
      name: params.name,
      username: params.username,
      email: params.email,
      password: params.password,
      role: params.role,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const checkUser = await findUser(data.username)
    if (checkUser) {
      return res.status(400).send({
        message: 'Nombre de usuario ya esta en uso, utiliza uno diferente',
      })
    }

    if (params.role != 'ADMIN' || params.role != 'EMPLOYEE') {
      return res.staus(400).send({ message: 'El rol no es válido' })
    }

    data.surname = params.surname
    data.password = await encrypt(params.password)
    data.phone = params.phone

    let user = new User(data)
    await user.save()
    return res.send({ message: 'Usuario guardado exitosamente', user })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error al registrarse' })
  }
}

exports.getPC = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findOne({ _id: userId })
    if (!user) {
      return res
        .staus(400)
        .send({ message: 'El usuario ingresado no se ha podido encontrar' })
    }

    return res.send({ message: 'Usuario encontrado:', user })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo el usuario' })
  }
}

exports.getPCs = async (req, res) => {
  try {
    const users = await User.find()
    return res.send({ message: 'Usuarios encontrados:', users })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo los usuarios' })
  }
}

exports.searchPC = async (req, res) => {
  try {
    const params = req.body
    const data = {
      username: params.username,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const user = await User.find({
      username: { $regex: params.username, $options: 'i' },
    })
    return res.send(user)
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error buscando el usuario' })
  }
}

exports.updatePC = async (req, res) => {
  try {
    const userId = req.params.id
    const params = req.body

    const user = await User.findOne({ _id: userId })

    if (!user) {
      return res
        .status(400)
        .send({ message: 'El usuario ingresado no se ha podido encontrar' })
    }

    const checkUpdated = await checkUpdate_OnlyAdmin(params)
    if (checkUpdated === false) {
      return res
        .status(400)
        .send({ message: 'Parámetros no válidos para actualizar' })
    }

    const checkUser = await findUser(params.username)
    if (checkUser && user.username != params.username) {
      return res.status(201).send({
        message: 'Nombre de usuario ya esta en uso, utiliza uno diferente',
      })
    }

    if (params.role != 'ADMIN') {
      return res.status(201).send({ message: 'El rol ingresado no es valido' })
    }

    const updateUser = await User.findOneAndUpdate({ _id: userId }, params, {
      new: true,
    }).lean()

    if (!updateUser) {
      return res
        .status(400)
        .send({ message: 'No se ha podido actualizar el usuario' })
    }

    return res.send({ message: 'Usuario actualizado', updateUser })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error actualizando el usuario' })
  }
}

exports.deletePC = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findOne({ _id: userId })
    if (!user) {
      return res.send({ message: 'Usuario no encontrado' })
    }

    const deleteUser = await User.findOneAndDelete({ _id: userId })
    if (!deleteUser) {
      return res
        .status(500)
        .send({ message: 'Usuario no encontrado o ya ha sido eliminado' })
    }

    return res.send({ message: 'Cuenta eliminada' })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error eliminando el usuario' })
  }
}
