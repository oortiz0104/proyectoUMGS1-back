'use strict'

const express = require('express');
const api = express.Router();
const newPCController = require('../controllers/newPC.controller');
const midAuth = require('../services/auth');

//* Admnistrador y Empleado
api.get('/test', newPCController.test);

api.post('/checkIn', [midAuth.ensureAuth], newPCController.checkIn);
api.post('/checkOut/:id', [midAuth.ensureAuth], newPCController.checkOut);

api.get('/getNewPC/:id', [midAuth.ensureAuth], newPCController.getNewPC);
api.get('/getNewPCs', [midAuth.ensureAuth], newPCController.getNewPCs);

api.post('/searchNewPC', [midAuth.ensureAuth], newPCController.searchNewPC);

api.put('/updateNewPC/:id', [midAuth.ensureAuth], newPCController.updateNewPC);
api.delete('/deleteNewPC/:id', [midAuth.ensureAuth], newPCController.deleteNewPC);

module.exports = api;