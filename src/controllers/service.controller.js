'use strict'

const { validateData, checkUpdateService } = require('../utils/validate');

const Service = require('../models/service.model');
const Hotel = require('../models/hotel.model')
const Reservation = require('../models/reservation.model')


exports.testServices = (req, res) => {
    return res.send({ message: 'Función de prueba desde el controlador de servicios' });
}

//* Funciones administrador de hotel ---------------------------------------------------------------------------------------
exports.addService = async (req, res) => {
    try {
        const params = req.body;
        const userId = req.user.sub
        const data = {
            hotel: params.hotel,
            name: params.name,
            description: params.description,
            price: params.price
        }
        const msg = validateData(data);
        if (!msg) {
            const hotelExist = await Hotel.findOne({ _id: data.hotel });
            if (!hotelExist) {
                return res.status(404).send({ message: 'Hotel no encontrado' });
            } else {
                if (hotelExist.adminHotel != userId) {
                    return res.status(404).send({ message: 'No eres el administrador de este hotel' });
                } else {
                    const checkService = await Service.findOne({ name: data.name, hotel: data.hotel }).lean()
                    if (checkService != null) {
                        return res.status(400).send({ message: 'Ya existe un servicio con un nombre igual' });
                    } else {
                        const service = new Service(data);
                        await service.save();
                        return res.send({ message: 'Servicio creado satisfactoriamente' })
                    }
                }
            }
        } else {
            return res.status(400).send(msg)
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error creando el servicio' });
    }
}

exports.getService = async (req, res) => {
    try {
        const serviceId = req.params.idService;
        const hotelId = req.params.idHotel
        const userId = req.user.sub

        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(404).send({ message: 'No puedes ver los servicios de este hotel' });
        } else {
            const checkServiceHotel = await Service.findOne({ _id: serviceId, hotel: hotelId }).populate('hotel').lean();
            if (checkServiceHotel == null || checkServiceHotel.hotel._id != hotelId) {
                return res.status(404).send({ message: 'No puedes ver este servicio' });
            } else {
                return res.send({ message: 'Servicio encontrado', checkServiceHotel });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo el servicio' });
    }
}

exports.getServices = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;

        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(404).send({ message: 'No puedes ver los servicios de este hotel' });
        } else {
            const services = await Service.find({ hotel: hotelId }).lean().populate('hotel');
            if (!services) {
                return res.staus(400).send({ message: 'Servicios no encontrados' });
            } else {
                return res.send({ messsage: 'Servicios encontrados', services });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo los servicios' });
    }
}

exports.updateService = async (req, res) => {
    try {
        const hotelId = req.params.idHotel
        const serviceId = req.params.idService;
        const userId = req.user.sub;
        const params = req.body;

        const checkUpdate = await checkUpdateService(params);
        if (checkUpdate === false) {
            return res.status(400).send({ message: 'Parámetros inválidos' });
        } else {
            const hotelExist = await Hotel.findOne({ _id: hotelId });
            if (!hotelExist) {
                return res.status(400).send({ message: 'Hotel no encontrado' });
            } else {
                if (hotelExist.adminHotel != userId) {
                    return res.status(404).send({ message: 'No puedes actualizar el servicio al hotel' });
                } else {
                    const checkHotelService = await Service.findOne({ _id: serviceId, hotel: hotelId }).populate('hotel').lean()
                    if (checkHotelService == null || checkHotelService.hotel._id != hotelId) {
                        return res.status(400).send({ message: 'No puedes actualizar este servicio' })
                    } else {
                        const checkService = await Service.findOne({ name: params.name, hotel: hotelId }).lean()
                        if (checkService != null && checkHotelService.name != params.name) {
                            return res.status(400).send({ message: 'Ya existe un servicio con un nombre igual' });
                        } else {
                            const serviceUpdated = await Service.findOneAndUpdate({ _id: serviceId }, params, { new: true }).lean();
                            if (!serviceUpdated) {
                                return res.staus(400).send({ message: 'No se ha podido actualizar el servicio' });
                            } else {
                                return res.send({ message: 'Servicio actualizado', serviceUpdated });
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el servicio' });
    }
}

exports.deleteService = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const serviceId = req.params.idService;
        const userId = req.user.sub;

        const hotelExist = await Hotel.findOne({ _id: hotelId });
        if (!hotelExist) {
            return res.status(400).send({ message: 'Hotel no encontrado' });
        } else {
            if (hotelExist.adminHotel != userId) {
                return res.status(404).send({ message: 'No puedes eliminar el servicio al hotel' });
            } else {
                const checkHotelService = await Service.findOne({ _id: serviceId, hotel: hotelId }).populate('hotel').lean()
                if (checkHotelService == null || checkHotelService.hotel._id != hotelId) {
                    return res.status(400).send({ message: 'No puedes eliminar este servicio' })
                } else {
                    const serviceDeleted = await Service.findOneAndDelete({ _id: serviceId, hotel: hotelId }).populate('hotel').lean();
                    if (!serviceDeleted) {
                        return res.status(404).send({ message: 'Servicio no encontrado o ya eliminado' });
                    } else {
                        return res.send({ message: 'Servicio eliminado ', serviceDeleted });
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error eliminando el servicio' });
    }
}

//* Funciones usuario registrado ---------------------------------------------------------------------------------------

exports.getServices_Clients = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const services = await Service.find({ hotel: hotelId }).lean();
        if (!services) {
            return res.staus(400).send({ message: 'Servicios no encontrados' });
        } else {
            return res.send({ messsage: 'Servicios encontrados', services });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo los servicios' });
    }
}