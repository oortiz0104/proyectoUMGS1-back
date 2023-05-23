'use strict'

const express = require('express')
const api = express.Router()
const newPCRegisterController = require('../controllers/newPCRegister.controller')
const midAuth = require('../services/auth')

//* Admnistrador y Empleado
api.get('/getNewPCRegister/:id', [midAuth.ensureAuth], newPCRegisterController.getNewPCRegister)
api.get('/getNewPCsRegister', [midAuth.ensureAuth], newPCRegisterController.getNewPCsRegister)

module.exports = api
