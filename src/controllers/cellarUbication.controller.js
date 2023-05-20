'use strict'

import { validateData, findCellarUbication, checkUpdate } from '../utils/validate'
import CellarUbication, { findOne, find } from '../models/cellarUbication.model'

import jwt from '../services/jwt'

export function test(req, res) {
  return res.send({
    message: 'Mensaje de prueba desde el controlador de nuevos equipos',
  })
}

//* Funciones admistrador ---------------------------------------------------------------------------------------

export async function addCellarUbication(req, res) {
  try {
    const params = req.body
    const data = {
      cellarNumber: params.cellarNumber,
      shelve: params.shelve,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const checkCellar = await findCellarUbication(data.cellarNumber)
    if (checkCellar) {
      return res.status(400).send({
        message: 'El número de bodega ingresado ya se encuentra registrado',
      })
    }

    if (params.role != 'ADMIN') {
      return res.staus(402).send({ message: 'El rol no es válido' })
    }

    let cellarUbication = new CellarUbication(data)
    await cellarUbication.save()
    return res
      .status(201)
      .send({ message: 'Bodega registrada', cellarUbication })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error registrando la bodega' })
  }
}

export async function getCellarUbication(req, res) {
  try {
    const cellarUbicationId = req.params.id

    const cellar = await findOne({ _id: cellarUbicationId })
    if (!cellar) {
      return res.status(400).send({ message: 'Bodega no encontrada' })
    }

    return res.send({ message: 'Bodega encontrada', cellar })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo la bodega' })
  }
}

export async function getCellarsUbication(req, res) {
  try {
    const cellars = await find()
    return res.send({ message: 'Bodegas encontradas', cellars })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo las bodegas' })
  }
}

export async function searchCellarUbication(req, res) {
  try {
    const params = req.body
    const data = {
      cellarNumber: params.cellarNumber,
    }

    const msg = validateData(data)

    if (msg) {
      return res.status(400).send(msg)
    }

    const user = await find({
      cellarNumber: { $regex: params.cellarNumber, $options: 'i' },
    })
    return res.send(user)
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error obteniendo la bodega' })
  }
}

export async function updateCellarUbication(req, res) {
  try {
    const cellarUbicationId = req.params.id
    const params = req.body

    const cellar = await findOne({ _id: cellarUbicationId })

    if (!cellar) {
      return res
        .status(400)
        .send({ message: 'No se ha encontrado la bodega a actualizar' })
    }

    const checkUpdated = await checkUpdate(params)
    if (checkUpdated === false) {
      return res
        .status(400)
        .send({ message: 'Parámetros no válidos para actualizar' })
    }

    const checkCellarNumber = await findCellarUbication(params.cellarNumber)
    if (checkCellarNumber && cellar.cellarNumber != params.cellarNumber) {
      return res.status(201).send({
        message: 'El número de bodega ingresado ya se encuentra registrado',
      })
    }

    const updateCellar = await User.findOneAndUpdate(
      { _id: cellarUbicationId },
      params,
      { new: true }
    ).lean()

    if (!updateCellar) {
      return res
        .status(400)
        .send({ message: 'No se ha podido actualizar la bodega' })
    }

    return res.send({
      message: 'Bodega actualizada',
      updateCellar,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: 'Error actualizando la bodega' })
  }
}

export async function deleteCellarUbication(req, res) {
  try {
    const cellarUbicationId = req.params.id

    const user = await User.findOne({ _id: cellarUbicationId })
    if (!user) {
      return res.send({ message: 'Usuario no encontrado' })
    }

    const deleteUser = await User.findOneAndDelete({ _id: cellarUbicationId })
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
