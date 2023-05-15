'use strict'

const express = require('express');
const api = express.Router();
const midAuth = require('../services/auth');
const eventController = require('../controllers/event.controller');

//* Administrador
api.get('/testEvent', [midAuth.ensureAuth, midAuth.isAdmin], eventController.testEvent);

//* Usuarios registrados
api.get('/getEvents_Clients/:idHotel', midAuth.ensureAuth, eventController.getEvents_Clients);

//* Administrador del hotel
api.post('/addEvent', [midAuth.ensureAuth, midAuth.isHotelAdmin], eventController.addEvent)

api.get('/getEvents/:idHotel', [midAuth.ensureAuth, midAuth.isHotelAdmin], eventController.getEvents)
api.get('/getEvent/:idHotel/:idEvent', [midAuth.ensureAuth, midAuth.isHotelAdmin], eventController.getEvent)

api.put('/updateEvent/:idHotel/:idEvent', [midAuth.ensureAuth, midAuth.isHotelAdmin], eventController.updateEvent)

api.delete('/deleteEvent/:idHotel/:idEvent', [midAuth.ensureAuth, midAuth.isHotelAdmin], eventController.deleteEvent);

module.exports = api;