'use strict'

const {
  validateData,
  findUser,
  checkPassword,
  checkUpdate,
  checkUpdate_OnlyAdmin,
  encrypt,
} = require('../utils/validate')
const User = require('../models/user.model')

const jwt = require('../services/jwt')

exports.test = (req, res) => {
  return res.send({
    message: 'Mensaje de prueba desde el controlador de usuarios',
  })
}

//* Funciones admistrador ---------------------------------------------------------------------------------------

exports.register_OnlyAdmin = async (req, res) => {
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
      return res.staus(401).send({ message: 'El rol no es válido' })
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

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findOne({ _id: userId, deleted: false })
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

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({
      deleted: false,
    })
    return res.send({ message: 'Usuarios encontrados:', users })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo los usuarios' })
  }
}

exports.searchUser = async (req, res) => {
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
      deleted: false,
    })
    return res.send({
      message: 'Usuarios encontrados:',
      user,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error buscando el usuario' })
  }
}

exports.update_OnlyAdmin = async (req, res) => {
  try {
    const userId = req.params.id
    const params = req.body
    const data = {
      name: params.name,
      surname: params.surname,
      email: params.email,
      phone: params.phone,
      role: params.role,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const user = await User.findOne({ _id: userId, deleted: false })
    if (!user) {
      return res
        .status(400)
        .send({ message: 'El usuario ingresado no se ha podido encontrar' })
    }

    if (user.role === 'ADMIN') {
      return res
        .status(400)
        .send({ message: 'No puedes actualizar a un administrador' })
    }

    const checkUpdated = await checkUpdate_OnlyAdmin(params)
    if (checkUpdated === false) {
      return res
        .status(400)
        .send({ message: 'Parámetros no válidos para actualizar' })
    }

    const checkUser = await findUser(params.username)
    if (checkUser && user.username != params.username) {
      return res.status(400).send({
        message: 'Nombre de usuario ya esta en uso, utiliza uno diferente',
      })
    }

    if (params.role != 'ADMIN' || params.role != 'EMPLOYEE') {
      return res.status(401).send({ message: 'El rol ingresado no es valido' })
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

exports.delete_OnlyAdmin = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findOne({ _id: userId, deleted: false })
    if (!user) {
      return res
        .status(400)
        .send({ message: 'El usuario ingresado no se ha podido encontrar' })
    }

    if (user.role === 'ADMIN') {
      return res
        .status(400)
        .send({ message: 'No puedes eliminar a un administrador' })
    }

    const deleteUser = await User.findOneAndUpdate(
      { _id: userId },
      { deleted: true },
      { new: true }
    ).lean()
    if (!deleteUser) {
      return res
        .status(400)
        .send({ message: 'Usuario no encontrado o ya ha sido eliminado' })
    }

    return res.send({ message: 'Cuenta eliminada' })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error eliminando el usuario' })
  }
}

//* Funciones usuario no registrado ---------------------------------------------------------------------------------------

exports.login = async (req, res) => {
  try {
    const params = req.body
    let data = {
      username: params.username,
      password: params.password,
    }

    let msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    let checkUser = await findUser(params.username)
    let checkPass = await checkPassword(params.password, checkUser.password)
    delete checkUser.password
    delete checkUser.bills
    delete checkUser.history
    delete checkUser.reservations

    if (checkUser && checkPass) {
      const token = await jwt.createToken(checkUser)
      return res.send({ message: 'Sesión iniciada', token, checkUser })
    }

    return res
      .status(401)
      .send({ message: 'Usuario y/o contraseña incorrectas' })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Usuario y/o contraseña incorrectas' })
  }
}

exports.register = async (req, res) => {
  try {
    const params = req.body
    let data = {
      name: params.name,
      username: params.username,
      email: params.email,
      password: params.password,
      role: 'EMPLOYEE',
    }
    let msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    let checkUser = await findUser(data.username)

    if (checkUser) {
      return res.status(400).send({
        message: 'Nombre de usuario ya en uso, utiliza uno diferente',
      })
    }

    data.surname = params.surname
    data.password = await encrypt(params.password)
    data.phone = params.phone

    let user = new User(data)
    await user.save()
    return res.send({ message: 'Usuario guardado exitosamente' })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error al registrarse' })
  }
}

//* Funciones usuario registrado ---------------------------------------------------------------------------------------

exports.myProfile = async (req, res) => {
  try {
    const userId = req.user.sub
    const user = await User.findOne({ _id: userId, deleted: false }).lean()
    delete user.password
    delete user.__v

    if (!user) {
      return res
        .status(400)
        .send({ message: 'El usuario no se ha podido encontrar' })
    }

    return res.send({ message: 'Este es tu usuario:', user })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo el usuario' })
  }
}

exports.update = async (req, res) => {
  try {
    const userId = req.user.sub
    const params = req.body
    const data = {
      name: params.name,
      surname: params.surname,
      email: params.email,
      phone: params.phone,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const user = await User.findOne({ _id: userId, deleted: false })
    if (!user) {
      return res
        .status(400)
        .send({ message: 'El usuario ingresado no se ha podido encontrar' })
    }

    if (user.role === 'ADMIN') {
      return res
        .status(400)
        .send({ message: 'No puedes editar una cuenta de administrador' })
    }

    const checkUpdated = await checkUpdate(params)
    if (checkUpdated === false) {
      return res
        .status(400)
        .send({ message: 'Parámetros no válidos para actualizar' })
    }

    const checkUser = await findUser(params.username)
    if (checkUser && user.username != params.username) {
      return res
        .status(400)
        .send({ message: 'Este nombre de usuario ya esta en uso' })
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

exports.delete = async (req, res) => {
  try {
    const userId = req.user.sub

    const checkUser = await User.findOne({ _id: userId, deleted: false })
    if (!checkUser) {
      return res
        .status(400)
        .send({ message: 'El usuario ingresado no se ha podido encontrar' })
    }

    if (checkUser.role === 'ADMIN') {
      return res
        .status(400)
        .send({ message: 'No puedes eliminar una cuenta de administrador' })
    }

    const deleteUser = await User.findOneAndUpdate(
      { _id: userId },
      { deleted: true },
      { new: true }
    ).lean()
    if (!deleteUser) {
      return res.status(400).send({ message: 'Usuario no encontrado' })
    }

    return res.send({ message: 'Cuenta eliminada' })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error eliminando el usuario' })
  }
}
