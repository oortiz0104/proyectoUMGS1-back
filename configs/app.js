'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const app = express()

const userRoutes = require('../src/routes/user.routes')
const cellarRoutes = require('../src/routes/cellar.routes')
const newPCRoutes = require('../src/routes/newPC.routes')
const newPCRegisterRoutes = require('../src/routes/newPCRegister.routes')
const usedPCRoutes = require('../src/routes/usedPC.routes')

app.use(helmet()) //Seguridad de Express
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors()) //Aceptar solicitudes

//Configuración de rutas
app.use('/user', userRoutes)
app.use('/cellar', cellarRoutes)
app.use('/newPC', newPCRoutes)
app.use('/newPCRegister', newPCRegisterRoutes)
app.use('/usedPC', usedPCRoutes)

module.exports = app
