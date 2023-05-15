'use strict'

const express = require('express');
const api = express.Router();
const midAuth = require('../services/auth');
const reservationController = require('../controllers/reservation.controller');

//* Administrador 
api.get('/testReservation', [midAuth.ensureAuth, midAuth.isAdmin], reservationController.testReservation);

//* Usuarios registrados 
api.post('/reserveRoom/:idHotel/:idRoom', [midAuth.ensureAuth, midAuth.isClient], reservationController.reserveRoom);

api.get('/myReserve', [midAuth.ensureAuth, midAuth.isClient], reservationController.myReserve)

api.post('/addServiceMyReserve/:idService', [midAuth.ensureAuth, midAuth.isClient], reservationController.addServiceMyReserve)

//* Administrador del hotel
api.get('/getReservations/:idHotel', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.getReservations);
api.get('/getReservationsInProgress/:idHotel', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.getReservationsInProgress);
api.get('/getReservationsBilled/:idHotel', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.getReservationsBilled);
api.get('/getReservationsCancelled/:idHotel', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.getReservationsCancelled);
api.get('/getReservationsCancelledAndBilled/:idHotel', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.getReservationsCancelledAndBilled);

api.get('/getReservation/:idHotel/:idReservation', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.getReservation);
api.get('/getServicesReservation/:idHotel/:idReservation', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.getServicesReservation);

api.delete('/deleteServiceReservation/:idHotel/:idReservation/:idService', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.deleteServiceReservation);
api.delete('/cancelReservation/:idHotel/:idReservation', [midAuth.ensureAuth, midAuth.isHotelAdmin], reservationController.cancelReservation);

module.exports = api;