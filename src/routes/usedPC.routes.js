'use strict'

const express = require('express');
const api = express.Router();
const usedPCController = require('../controllers/usedPC.controller');
const midAuth = require('../services/auth');

//* Admnistrador y Empleado
api.get('/test', usedPCController.test);

api.post('/checkIn', [midAuth.ensureAuth], usedPCController.checkIn);
api.post('/checkOut/:id', [midAuth.ensureAuth], usedPCController.checkOut);

api.get('/getUsedPC/:id', [midAuth.ensureAuth], usedPCController.getUsedPC);
api.get('/getUsedPCs', [midAuth.ensureAuth], usedPCController.getUsedPCs);

api.post('/searchUsedPC', [midAuth.ensureAuth], usedPCController.searchUsedPC);

api.put('/updateUsedPC/:id', [midAuth.ensureAuth], usedPCController.updateUsedPC);
api.delete('/deleteUsedPC/:id', [midAuth.ensureAuth], usedPCController.deleteUsedPC);

module.exports = api;