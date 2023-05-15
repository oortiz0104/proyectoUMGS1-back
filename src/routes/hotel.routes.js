'use strict'

const express = require('express');
const api = express.Router();
const midAuth = require('../services/auth');
const hotelController = require('../controllers/hotel.controller');

const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({ uploadDir: './uploads/hotels' });

//* Administrador
api.get('/testHotel', [midAuth.ensureAuth, midAuth.isAdmin], hotelController.testHotel);

api.post('/addHotel_OnlyAdmin', [midAuth.ensureAuth, midAuth.isAdmin], hotelController.addHotel_OnlyAdmin);

api.get('/getHotels_OnlyAdmin', [midAuth.ensureAuth, midAuth.isAdmin], hotelController.getHotels_OnlyAdmin);
api.get('/getHotels_OrderByPopularity_OnlyAdmin', [midAuth.ensureAuth, midAuth.isAdmin], hotelController.getHotels_OrderByPopularity_OnlyAdmin);
api.get('/getHotel_OnlyAdmin/:id', [midAuth.ensureAuth, midAuth.isAdmin], hotelController.getHotel_OnlyAdmin);

api.put('/updateHotel_OnlyAdmin/:id', [midAuth.ensureAuth, midAuth.isAdmin], hotelController.updateHotel_OnlyAdmin);

api.delete('/deleteHotel_OnlyAdmin/:id', [midAuth.ensureAuth, midAuth.isAdmin], hotelController.deleteHotel_OnlyAdmin);

//* Usuarios no registrados
api.get('/getHotels_NoClients', hotelController.getHotels_NoClients);

//* Usuarios registrados
api.get('/getHotels_Clients', midAuth.ensureAuth, hotelController.getHotels_Clients);
api.get('/getHotelsHistory', midAuth.ensureAuth, hotelController.getHotelsHistory);
api.get('/getHotel_Clients/:id', midAuth.ensureAuth, hotelController.getHotel_Clients);

//* Administrador del hotel
api.post('/addHotel', [midAuth.ensureAuth, midAuth.isHotelAdmin], hotelController.addHotel);

api.get('/getHotels', [midAuth.ensureAuth, midAuth.isHotelAdmin], hotelController.getHotels);
api.get('/getHotels_OrderByPopularity', [midAuth.ensureAuth, midAuth.isHotelAdmin], hotelController.getHotels_OrderByPopularity);
api.get('/getHotel/:id', [midAuth.ensureAuth, midAuth.isHotelAdmin], hotelController.getHotel);

api.put('/updateHotel/:id', [midAuth.ensureAuth, midAuth.isHotelAdmin], hotelController.updateHotel);
api.delete('/deleteHotel/:id', [midAuth.ensureAuth, midAuth.isHotelAdmin], hotelController.deleteHotel);

api.post('/uploadImageHotel/:id', [midAuth.ensureAuth, midAuth.isHotelAdmin, upload], hotelController.uploadImageHotel);

api.get('/getImageHotel/:fileName', upload, hotelController.getImageHotel);

module.exports = api;