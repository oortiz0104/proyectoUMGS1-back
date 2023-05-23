'use strict'

const NewPCRegister = require('../models/newPCRegister.model')

exports.getNewPCRegister = async (req, res) => {
  try {
    const newPCRegisterId = req.params.id

    const newPCRegister = await NewPCRegister.findOne({
      _id: newPCRegisterId,
    })
      .populate('user')
      .populate({
        path: 'pc',
        populate: {
          path: 'ubication',
        },
      })

    if (!newPCRegister) {
      return res
        .status(404)
        .send({ message: 'No se encontro el registro del equipo nuevo' })
    }

    return res.send({
      message: 'Registro del equipo nuevo encontrado',
      newPCRegister,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Error obteniendo el registro del equipo nuevo' })
  }
}

exports.getNewPCsRegister = async (req, res) => {
  try {
    const newPCsRegister = await NewPCRegister.find()
      .populate('user')
      .populate({
        path: 'pc',
        populate: {
          path: 'ubication',
        },
      })
    return res.send({
      message: 'Registro de equipos nuevos encontrados',
      newPCsRegister,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Error obteniendo los registro de equipos nuevos' })
  }
}
