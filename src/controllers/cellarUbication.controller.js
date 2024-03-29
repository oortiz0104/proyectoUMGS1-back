'use strict'

const {
  validateData,
  findCellarUbication,
  checkUpdate,
} = require('../utils/validate')
const CellarUbication = require('../models/cellarUbication.model')

exports.test = (req, res) => {
  return res.send({
    message: 'Mensaje de prueba desde el controlador de nuevos equipos',
  })
}

//* Funciones admistrador ---------------------------------------------------------------------------------------

exports.addCellarUbication = async (req, res) => {
  try {
    const params = req.body
    const data = {
      cellarNumber: params.cellarNumber,
      shelve: params.shelve,
      occupied: false,
      deleted: false,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const checkUbication = await findCellarUbication(
      data.cellarNumber,
      data.shelve
    )
    if (checkUbication) {
      return res.status(400).send({
        message: 'La ubicación ingresada ya existe',
      })
    }

    let cellarUbication = new CellarUbication(data)
    await cellarUbication.save()
    return res.send({ message: 'Ubicación registrada', cellarUbication })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error registrando la ubicación' })
  }
}

exports.getCellarUbication = async (req, res) => {
  try {
    const cellarUbicationId = req.params.id

    const cellar = await CellarUbication.findOne({
      _id: cellarUbicationId,
      deleted: false,
    })
    if (!cellar) {
      return res.status(400).send({ message: 'Ubicación no encontrada' })
    }

    return res.send({ message: 'Ubicación encontrada', cellar })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo la ubicación' })
  }
}

exports.getCellarUbications = async (req, res) => {
  try {
    const cellars = await CellarUbication.find({ deleted: false })
    return res.send({ message: 'Ubicaciones encontradas', cellars })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo las ubicaciones' })
  }
}

exports.getNotOccupiedCellarUbications = async (req, res) => {
  try {
    const cellars = await CellarUbication.find({
      occupied: false,
      deleted: false,
    })
    return res.send({ message: 'Ubicaciones encontradas', cellars })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error obteniendo las ubicaciones' })
  }
}

exports.searchCellarUbication = async (req, res) => {
  try {
    const params = req.body
    const data = {
      cellarNumber: params.cellarNumber,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const cellars = await CellarUbication.find({
      cellarNumber: { $regex: params.cellarNumber.toString(), $options: 'i' },
      shelve: { $regex: params.shelve ?? '', $options: 'i' },
      deleted: false,
    })
    return res.send({ message: 'Ubicaciones encontradas', cellars })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo la bodega' })
  }
}

exports.updateCellarUbication = async (req, res) => {
  try {
    const cellarUbicationId = req.params.id
    const params = req.body
    const data = {
      cellarNumber: params.cellarNumber,
      shelve: params.shelve,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const cellar = await CellarUbication.findOne({ _id: cellarUbicationId })
    if (!cellar) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado la ubicación a actualizar' })
    }

    const checkUpdated = await checkUpdate(params)
    if (checkUpdated === false) {
      return res
        .status(400)
        .send({ message: 'Parámetros no válidos para actualizar' })
    }

    const checkUbication = await findCellarUbication(
      data.cellarNumber,
      data.shelve
    )
    if (checkUbication && checkUbication._id != cellarUbicationId) {
      return res.status(400).send({
        message: 'La ubicación ingresada ya se encuentra registrada',
      })
    }

    const updateCellar = await CellarUbication.findOneAndUpdate(
      { _id: cellarUbicationId },
      params,
      { new: true }
    ).lean()

    if (!updateCellar) {
      return res
        .status(400)
        .send({ message: 'No se ha podido actualizar la ubicación' })
    }

    return res.send({
      message: 'Ubicación actualizada correctamente',
      updateCellar,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error actualizando la ubicación' })
  }
}

exports.deleteCellarUbication = async (req, res) => {
  try {
    const cellarUbicationId = req.params.id

    const cellar = await CellarUbication.findOne({ _id: cellarUbicationId })
    if (cellar.deleted) {
      return res
        .status(400)
        .send({ message: 'La ubicación ya se encuentra eliminada' })
    }

    if (cellar.occupied) {
      return res
        .status(400)
        .send({ message: 'La ubicación se encuentra ocupada' })
    }

    const deleteUbication = await CellarUbication.findOneAndUpdate(
      { _id: cellarUbicationId },
      { deleted: true },
      { new: true }
    )
    if (!deleteUbication) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado la ubicación a eliminar' })
    }

    return res.send({ message: 'Ubicación eliminada correctamente' })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error eliminando la ubicación' })
  }
}
