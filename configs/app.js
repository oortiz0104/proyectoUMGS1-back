'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

const userRoutes = require('../src/routes/user.routes');
const hotelRoutes = require('../src/routes/hotel.routes');
const serviceRoutes = require('../src/routes/service.routes');
const roomRoutes = require('../src/routes/room.routes');
const eventRoutes = require('../src/routes/event.routes');
const reservationRoutes = require('../src/routes/reservation.routes'); 
const billRoutes = require('../src/routes/bill.routes');

app.use(helmet()); //Seguridad de Express
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); //Aceptar solicitudes

//Configuración de rutas
app.use('/user', userRoutes);
app.use('/hotel', hotelRoutes);
app.use('/service', serviceRoutes);
app.use('/room', roomRoutes);
app.use('/event', eventRoutes);
app.use('/reservation', reservationRoutes); 
app.use('/bill', billRoutes);

module.exports = app;