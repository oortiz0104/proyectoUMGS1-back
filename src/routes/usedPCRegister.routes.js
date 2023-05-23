'use strict'

const express = require('express')
const api = express.Router()
const usedPCRegisterController = require('../controllers/usedPCRegister.controller')
const midAuth = require('../services/auth')

//* Admnistrador y Empleado
api.get('/getUsedPCRegister/:id', [midAuth.ensureAuth], usedPCRegisterController.getUsedPCRegister)
api.get('/getUsedPCsRegister', [midAuth.ensureAuth], usedPCRegisterController.getUsedPCsRegister)

module.exports = api
