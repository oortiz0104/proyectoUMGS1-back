'use strict'

const UsedPCRegister = require('../models/usedPCRegister.model')

exports.getUsedPCRegister = async (req, res) => {
  try {
    const usedPCRegisterId = req.params.id

    const usedPCRegister = await UsedPCRegister.findOne({
      _id: usedPCRegisterId,
    })
      .populate('user')
      .populate({
        path: 'pc',
        populate: {
          path: 'ubication',
        },
      })

    if (!usedPCRegister) {
      return res
        .status(404)
        .send({ message: 'No se encontro el registro del equipo usado' })
    }

    return res.send({
      message: 'Registro del equipo usado encontrado',
      usedPCRegister,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Error obteniendo el registro del equipo usado' })
  }
}

exports.getUsedPCsRegister = async (req, res) => {
  try {
    const usedPCsRegister = await UsedPCRegister.find()
      .populate('user')
      .populate({
        path: 'pc',
        populate: {
          path: 'ubication',
        },
      })
    return res.send({
      message: 'Registro de equipos usados encontrados',
      usedPCsRegister,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .send({ message: 'Error obteniendo los registros de equipos usados' })
  }
}
