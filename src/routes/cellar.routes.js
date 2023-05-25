'use strict'

const express = require('express');
const api = express.Router();
const cellarUbicationController = require('../controllers/cellarUbication.controller');
const midAuth = require('../services/auth');

//* Admnistrador y Empleado
api.get('/test', cellarUbicationController.test);

api.post('/add', [midAuth.ensureAuth, midAuth.isAdmin], cellarUbicationController.addCellarUbication);

api.get('/getCellarUbication/:id', [midAuth.ensureAuth, midAuth.isAdmin], cellarUbicationController.getCellarUbication);
api.get('/getCellarUbications', [midAuth.ensureAuth, midAuth.isAdmin], cellarUbicationController.getCellarUbications);
api.get('/getNotOccupiedCellarUbications', [midAuth.ensureAuth], cellarUbicationController.getNotOccupiedCellarUbications);

api.post('/searchCellarUbication', [midAuth.ensureAuth, midAuth.isAdmin], cellarUbicationController.searchCellarUbication);

api.put('/updateCellarUbication/:id', [midAuth.ensureAuth, midAuth.isAdmin], cellarUbicationController.updateCellarUbication);
api.delete('/deleteCellarUbication/:id', [midAuth.ensureAuth, midAuth.isAdmin], cellarUbicationController.deleteCellarUbication);

module.exports = api;