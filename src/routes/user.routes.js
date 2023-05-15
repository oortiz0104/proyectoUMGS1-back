'use strict'

const express = require('express');
const api = express.Router();
const userController = require('../controllers/user.controller');
const midAuth = require('../services/auth');

const connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({ uploadDir: './uploads/users' });

//* Admnistrador
api.get('/test', [midAuth.ensureAuth, midAuth.isAdmin], userController.test);

api.post('/register_OnlyAdmin', [midAuth.ensureAuth, midAuth.isAdmin], userController.register_OnlyAdmin);

api.get('/getUsers', [midAuth.ensureAuth, midAuth.isAdmin], userController.getUsers);
api.get('/getUsersHotelAdmin', [midAuth.ensureAuth, midAuth.isAdmin], userController.getUsersHotelAdmin);
api.get('/getUser/:id', [midAuth.ensureAuth, midAuth.isAdmin], userController.getUser);

api.post('/searchUser', [midAuth.ensureAuth, midAuth.isAdmin], userController.searchUser);

api.put('/update_OnlyAdmin/:id', [midAuth.ensureAuth, midAuth.isAdmin], userController.update_OnlyAdmin);
api.delete('/delete_OnlyAdmin/:id', [midAuth.ensureAuth, midAuth.isAdmin], userController.delete_OnlyAdmin);

//* Usuarios no registrados
api.post('/login', userController.login);

api.post('/register', userController.register);

//* Usuarios registrados
api.post('/uploadImage', [midAuth.ensureAuth, upload], userController.uploadImage);

api.get('/getImage/:fileName', upload, userController.getImageUser);
api.get('/myProfile', midAuth.ensureAuth, userController.myProfile);

api.put('/update', midAuth.ensureAuth, userController.update);

api.delete('/delete', midAuth.ensureAuth, userController.delete);

module.exports = api;