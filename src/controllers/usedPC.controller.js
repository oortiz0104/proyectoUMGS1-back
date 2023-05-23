'use strict'

const {
  validateData,
  findNewPC,
  findUsedPC,
  checkUpdateNewPC,
} = require('../utils/validate')
const UsedPC = require('../models/usedPC.model')
const UsedPCRegister = require('../models/usedPCRegister.model')
const CellarUbication = require('../models/cellarUbication.model')
const moment = require('moment')

exports.test = (req, res) => {
  return res.send({
    message: 'Ruta de prueba para el controlador de equipos usados',
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
      ubication: params.ubication,
      state: 'Entrada',
      deleted: false,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const checkNewPC = await findNewPC(data.serialNumber)
    const checkUsedPC = await findUsedPC(data.serialNumber)
    if (checkNewPC || checkUsedPC) {
      return res.status(400).send({
        message: 'El número de serial ya se encuentra registrado',
      })
    }

    const checkUbication = await CellarUbication.findOne({
      _id: data.ubication,
    })
    if (!checkUbication) {
      return res.status(400).send({
        message: 'La ubicación ingresada no existe',
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

    let usedPC = new UsedPC(data)
    await usedPC.save()

    let usedPCRegister = new UsedPCRegister({
      check_in: moment().format('YYYY-MM-DD HH:mm:ss'),
      check_out: null,
      user: userId,
      pc: usedPC._id,
    })
    await usedPCRegister.save()

    let updateUbication = await CellarUbication.findOneAndUpdate(
      { _id: data.ubication },
      { occupied: true },
      { new: true }
    )

    return res.send({
      message: 'Equipo usado registrado correctamente',
      usedPC,
      usedPCRegister,
      updateUbication,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error registrando el equipo' })
  }
}

exports.checkOut = async (req, res) => {
  try {
    const usedPCId = req.params.id

    const usedPC = await UsedPC.findOne({ _id: usedPCId })
    if (!usedPC) {
      return res.status(400).send({ message: 'Equipo nuevo no encontrado' })
    }

    if (usedPC.state === 'Salida') {
      return res
        .status(400)
        .send({ message: 'El equipo ya se encuentra en salida' })
    }

    if (usedPC.deleted) {
      return res
        .status(400)
        .send({ message: 'El equipo se encuentra eliminado' })
    }

    let updateUsedPCRegister = await UsedPCRegister.findOneAndUpdate(
      { pc: usedPCId, check_out: null },
      { check_out: moment().format('YYYY-MM-DD HH:mm:ss') },
      { new: true }
    )

    let usedPCUpdate = await UsedPC.findOneAndUpdate(
      { _id: usedPCId },
      { state: 'Salida' },
      { new: true }
    )

    let updateUbication = await CellarUbication.findOneAndUpdate(
      { _id: usedPC.ubication },
      { occupied: false },
      { new: true }
    )

    return res.send({
      message: 'Equipo usado marcado como salida',
      updateUsedPCRegister,
      usedPCUpdate,
      updateUbication,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error sacando el equipo' })
  }
}

exports.getUsedPC = async (req, res) => {
  try {
    const usedPCId = req.params.id

    const usedPC = await UsedPC.findOne({
      _id: usedPCId,
      deleted: false,
    }).populate('ubication')
    if (!usedPC) {
      return res.status(400).send({ message: 'Equipo usado no encontrado' })
    }

    return res.send({ message: 'Equipo usado encontrado', usedPC })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo el equipo' })
  }
}

exports.getUsedPCs = async (req, res) => {
  try {
    const usedPCs = await UsedPC.find({ deleted: false }).populate('ubication')
    return res.send({ message: 'Equipos usados encontrados', newPCs: usedPCs })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo los equipos' })
  }
}

exports.searchUsedPC = async (req, res) => {
  try {
    const params = req.body
    const data = {
      serialNumber: params.serialNumber,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const usedPCs = await UsedPC.find({
      serialNumber: { $regex: params.serialNumber, $options: 'i' },
      deleted: false,
    })
    return res.send({ message: 'Equipos usados encontrados', newPCs: usedPCs })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Error obteniendo los equipos usados' })
  }
}

exports.updateUsedPC = async (req, res) => {
  try {
    const usedPCId = req.params.id
    const params = req.body
    const data = {
      brand: params.brand,
      model: params.model,
      serialNumber: params.serialNumber,
      ubication: params.ubication,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const usedPC = await UsedPC.findOne({ _id: usedPCId })
    if (!usedPC) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado el equipo usado' })
    }

    const checkUpdated = await checkUpdateNewPC(params)
    if (checkUpdated) {
      return res
        .status(400)
        .send({ message: 'Parámetros no válidos para actualizar' })
    }

    const checkNewPC = await findNewPC(params.serialNumber)
    const checkUsedPC = await findUsedPC(params.serialNumber)
    if (
      (checkUsedPC && params.serialNumber !== usedPC.serialNumber) ||
      checkNewPC
    ) {
      return res.status(400).send({
        message: 'El número de serial ya se encuentra registrado',
      })
    }

    const checkUbication = await CellarUbication.findOne({
      _id: params.ubication,
      deleted: false,
    })
    if (!checkUbication && params.ubication !== usedPC.ubication.toString()) {
      return res.status(400).send({
        message: 'La ubicación seleccionada no existe',
      })
    }

    if (
      checkUbication.occupied &&
      params.ubication !== usedPC.ubication.toString()
    ) {
      return res.status(400).send({
        message: 'La ubicación ingresada se encuentra ocupada',
      })
    }

    if (checkUbication.deleted) {
      return res.status(400).send({
        message: 'La ubicación ingresada se encuentra eliminada',
      })
    }

    const updateUsedPC = await UsedPC.findOneAndUpdate(
      { _id: usedPCId },
      params,
      {
        new: true,
      }
    )
      .lean()
      .populate('ubication')
    if (!updateUsedPC) {
      return res
        .status(400)
        .send({ message: 'No se ha podido actualizar el equipo nuevo' })
    }

    const updateUbication = await CellarUbication.findOneAndUpdate(
      { _id: usedPC.ubication },
      { occupied: false },
      { new: true }
    )

    const updateNewUbication = await CellarUbication.findOneAndUpdate(
      { _id: params.ubication },
      { occupied: true },
      { new: true }
    )

    return res.send({
      message: 'Equipo usado actualizado correctamente',
      updateUsedPC,
      updateUbication,
      updateNewUbication,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Error actualizando el equipo usado' })
  }
}

exports.deleteUsedPC = async (req, res) => {
  try {
    const newPCId = req.params.id

    const findNewPC = await UsedPC.findOne({ _id: newPCId })
    if (!findNewPC) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado el equipo usado' })
    }

    const findCellarUbication = await CellarUbication.findOne({
      _id: findNewPC.ubication,
    })
    if (!findCellarUbication) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado la ubicación' })
    }

    const deleteNewPC = await UsedPC.findOneAndUpdate(
      { _id: newPCId },
      { deleted: true, state: 'Eliminado' },
      { new: true }
    )
    if (!deleteNewPC) {
      return res
        .status(400)
        .send({ message: 'No se ha podido eliminar el equipo usado' })
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

    await UsedPCRegister.findOneAndUpdate(
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
