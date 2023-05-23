'use strict'

const {
  validateData,
  findNewPC,
  checkUpdateNewPC,
} = require('../utils/validate')
const NewPC = require('../models/newPC.model')
const CellarUbication = require('../models/cellarUbication.model')
const NewPCRegister = require('../models/newPCRegister.model')
const moment = require('moment')

exports.test = (req, res) => {
  return res.send({
    message: 'Ruta de prueba para el controlador de ubicaciones',
  })
}

//* Funciones admistrador ---------------------------------------------------------------------------------------

exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.sub
    const params = req.body
    const data = {
      brand: params.brand,
      model: params.model,
      serialNumber: params.serialNumber,
      purchaseOrder: params.purchaseOrder,
      ubication: params.ubication,
      state: 'Entrada',
      deleted: false,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const checkPC = await findNewPC(data.serialNumber)
    if (checkPC) {
      return res.status(400).send({
        message: 'El número de serial ya se encuentra registrado',
      })
    }

    const checkUbication = await CellarUbication.findOne({
      _id: data.ubication,
    })
    if (!checkUbication) {
      return res.status(400).send({
        message: 'La ubicación ingresada se ha eliminado o no existe',
      })
    }

    if (checkUbication.occupied) {
      return res.status(400).send({
        message: 'La ubicación ingresada se encuentra ocupada',
      })
    }

    if (checkUbication.deleted) {
      return res.status(400).send({
        message: 'La ubicación ingresada se encuentra eliminada',
      })
    }

    let newPC = new NewPC(data)
    await newPC.save()

    let newPCRegister = new NewPCRegister({
      check_in: moment().format('YYYY-MM-DD HH:mm:ss'),
      check_out: null,
      user: userId,
      pc: newPC._id,
    })
    await newPCRegister.save()

    let updateUbication = await CellarUbication.findOneAndUpdate(
      { _id: data.ubication },
      { occupied: true },
      { new: true }
    )

    return res.send({
      message: 'Equipo nuevo registrado correctamente',
      newPC,
      newPCRegister,
      updateUbication,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error registrando el equipo' })
  }
}

exports.checkOutNewPC = async (req, res) => {
  try {
    const newPCId = req.params.id

    const newPC = await NewPC.findOne({ _id: newPCId })
    if (!newPC) {
      return res.status(400).send({ message: 'Equipo nuevo no encontrado' })
    }

    if (newPC.state === 'Salida') {
      return res
        .status(400)
        .send({ message: 'El equipo ya se encuentra en salida' })
    }

    if (newPC.deleted) {
      return res
        .status(400)
        .send({ message: 'El equipo se encuentra eliminado' })
    }

    let updateNewPCRegister = await NewPCRegister.findOneAndUpdate(
      { pc: newPCId, check_out: null },
      { check_out: moment().format('YYYY-MM-DD HH:mm:ss') },
      { new: true }
    )

    let newPCUpdate = await NewPC.findOneAndUpdate(
      { _id: newPCId },
      { state: 'Salida' },
      { new: true }
    )

    let updateUbication = await CellarUbication.findOneAndUpdate(
      { _id: newPC.ubication },
      { occupied: false },
      { new: true }
    )

    return res.send({
      message: 'Equipo nuevo marcado como salida',
      updateNewPCRegister,
      newPCUpdate,
      updateUbication,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error registrando el equipo' })
  }
}

exports.getNewPC = async (req, res) => {
  try {
    const newPCId = req.params.id

    const newPC = await NewPC.findOne({
      _id: newPCId,
      deleted: false,
    }).populate('ubication')
    if (!newPC) {
      return res.status(400).send({ message: 'Equipo nuevo no encontrado' })
    }

    return res.send({ message: 'Equipo nuevo encontrado', newPC })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo la ubicación' })
  }
}

exports.getNewPCs = async (req, res) => {
  try {
    const newPCs = await NewPC.find({ deleted: false }).populate('ubication')
    return res.send({ message: 'Equipos nuevos encontrados', newPCs })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo los equipos' })
  }
}

exports.searchNewPC = async (req, res) => {
  try {
    const params = req.body
    const data = {
      serialNumber: params.serialNumber,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const newPCs = await NewPC.find({
      serialNumber: { $regex: params.serialNumber, $options: 'i' },
      deleted: false,
    })
    return res.send({ message: 'Equipos nuevos encontrados', newPCs })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Error obteniendo los nuevos equipos' })
  }
}

exports.updateNewPC = async (req, res) => {
  try {
    const newPCId = req.params.id
    const params = req.body

    const newPC = await NewPC.findOne({ _id: newPCId })
    if (!newPC) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado el equipo nuevo' })
    }

    const checkUpdated = await checkUpdateNewPC(params)
    if (checkUpdated) {
      return res
        .status(400)
        .send({ message: 'Parámetros no válidos para actualizar' })
    }

    const checkNewPC = await findNewPC(params.serialNumber)
    if (checkNewPC && params.serialNumber !== newPC.serialNumber) {
      return res.status(400).send({
        message: 'El número de serial ya se encuentra registrado',
      })
    }

    const checkUbication = await CellarUbication.findOne({
      _id: params.ubication,
      deleted: false,
    })
    if (!checkUbication && params.ubication !== newPC.ubication) {
      return res.status(400).send({
        message: 'La ubicación seleccionada no se encuentra disponible',
      })
    }

    const updateNewPC = await NewPC.findOneAndUpdate({ _id: newPCId }, params, {
      new: true,
    })
      .lean()
      .populate('ubication')
    if (!updateNewPC) {
      return res
        .status(400)
        .send({ message: 'No se ha podido actualizar el equipo nuevo' })
    }

    const updateUbication = await CellarUbication.findOneAndUpdate(
      { _id: newPC.ubication },
      { occupied: false },
      { new: true }
    )

    const updateNewUbication = await CellarUbication.findOneAndUpdate(
      { _id: params.ubication },
      { occupied: true },
      { new: true }
    )

    return res.send({
      message: 'Equipo nuevo actualizado correctamente',
      updateNewPC,
      updateUbication,
      updateNewUbication,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Error actualizando el equipo nuevo' })
  }
}

exports.deleteNewPC = async (req, res) => {
  try {
    const newPCId = req.params.id

    const findNewPC = await NewPC.findOne({ _id: newPCId })
    if (!findNewPC) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado el equipo nuevo' })
    }

    const findCellarUbication = await CellarUbication.findOne({
      _id: findNewPC.ubication,
    })
    if (!findCellarUbication) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado la ubicación' })
    }

    const deleteNewPC = await NewPC.findOneAndUpdate(
      { _id: newPCId },
      { deleted: true, state: 'Eliminado' },
      { new: true }
    )
    if (!deleteNewPC) {
      return res
        .status(400)
        .send({ message: 'No se ha podido eliminar el equipo nuevo' })
    }

    await CellarUbication.findOneAndUpdate(
      { _id: findNewPC.ubication },
      { occupied: false },
      { new: true }
    )
    if (!findCellarUbication) {
      return res
        .status(400)
        .send({ message: 'No se ha podido actualizar la ubicación' })
    }

    await NewPCRegister.findOneAndUpdate(
      { newPC: newPCId },
      { check_out: moment().format('YYYY-MM-DD HH:mm:ss') },
      { new: true }
    )

    return res.send({ message: 'Equipo nuevo eliminado correctamente' })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error eliminando la ubicación' })
  }
}
