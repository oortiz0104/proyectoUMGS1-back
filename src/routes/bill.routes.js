'use strict'

const express = require('express');
const api = express.Router();
const midAuth = require('../services/auth');
const billController = require('../controllers/bill.controller');

//* Administrador 
api.get('/testBill', [midAuth.ensureAuth, midAuth.isAdmin], billController.testBill);

//* Usuarios registrados 
api.get('/myBills', [midAuth.ensureAuth, midAuth.isClient], billController.myBills);
api.get('/myBill/:idBill', [midAuth.ensureAuth, midAuth.isClient], billController.myBill);

//* Administrador del hotel 
api.get('/checkInReservation/:idHotel/:idReservation', [midAuth.ensureAuth, midAuth.isHotelAdmin], billController.checkInReservation)

api.get('/getBills/:idHotel', [midAuth.ensureAuth, midAuth.isHotelAdmin], billController.getBills);
api.get('/getBill/:idHotel/:idBill', [midAuth.ensureAuth, midAuth.isHotelAdmin], billController.getBill);


module.exports = api;