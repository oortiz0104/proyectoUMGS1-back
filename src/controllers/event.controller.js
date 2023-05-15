'use strict'

const { validateData, checkUpdateEvent } = require('../utils/validate');

const Event = require('../models/event.model');
const Hotel = require('../models/hotel.model')

exports.testEvent = (req, res) => {
    return res.send({ message: 'Función de prueba desde el controlador de Evento' });
}

//* Funciones administrador de hotel -------------------------------------------------------------------

exports.addEvent = async (req, res) => {
    try {
        const params = req.body;
        const userId = req.user.sub
        const data = {
            hotel: params.hotel,
            name: params.name,
            description: params.description,
            category: params.category,
            dateEvent: params.dateEvent
        }
        const msg = validateData(data);
        if (!msg) {
            const hotelExist = await Hotel.findOne({ _id: data.hotel });
            if (!hotelExist) {
                return res.status(404).send({ message: 'Hotel no encontrado' })
            } else {
                if (hotelExist.adminHotel != userId) {
                    return res.status(404).send({ message: 'No puedes agregar un evento a un hotel' });
                } else {
                    const checkEvent = await Event.findOne({ name: data.name, hotel: data.hotel }).lean()
                    if (checkEvent != null) {
                        return res.status(400).send({ message: 'Ya existe un evento con el mismo nombre' });
                    } else {
                        let today = new Date().toISOString().split("T")[0]
                        today = new Date(today)
                        let date = new Date(data.dateEvent)

                        if (date == 'Invalid Date') {
                            return res.status(400).send({ message: 'La fecha no es válida' })
                        } else {
                            let difference = date.getTime() - today.getTime();
                            if (difference < 0) {
                                return res.status(400).send({ message: 'Ingresa una fecha superior' })
                            } else {
                                const event = new Event(data);
                                await event.save();
                                return res.send({ message: 'Evento creado satisfactoriamente' })
                            }
                        }
                    }
                }
            }
        } else {
            return res.status(400).send(msg)
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error creando el evento' });
    }
}

exports.getEvent = async (req, res) => {
    try {
        const eventId = req.params.idEvent;
        const hotelId = req.params.idHotel;
        const userId = req.user.sub

        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean();
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(404).send({ message: 'No puedes ver los eventos de este hotel' });
        } else {
            const checkEventHotel = await Event.findOne({ _id: eventId, hotel: hotelId }).populate('hotel').lean();
            if (checkEventHotel == null || checkEventHotel.hotel._id != hotelId) {
                return res.status(404), send({ message: 'No puedes ver este evento' })
            } else {
                checkEventHotel.dateEvent = new Date(checkEventHotel.dateEvent).toISOString().split("T")[0];
                return res.send({ message: 'Evento encontrado', checkEventHotel })
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo evento' })
    }
}

exports.getEvents = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;

        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(404).send({ message: 'No puedes ver los eventos de este Hotel' })
        } else {
            const events = await Event.find({ hotel: hotelId }).lean().populate('hotel');
            if (!events) {
                return res.status(400).send({ message: 'Eventos no encontrados' });
            } else {
                for (let i = 0; i < events.length; i++) {
                    events[i].dateEvent = new Date(events[i].dateEvent).toISOString().split("T")[0];
                }
                return res.send({ message: 'Eventos encontrados', events })
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo los eventos' });
    }
}

exports.updateEvent = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const eventId = req.params.idEvent;
        const userId = req.user.sub;
        const params = req.body

        const checkUpdate = await checkUpdateEvent(params);
        if (checkUpdate === false) {
            return res.status(400).send({ message: 'Parámetros invalidos' });
        } else {
            const hotelExist = await Hotel.findOne({ _id: hotelId });
            if (!hotelExist) {
                return res.status(400).send({ message: 'Hotel no encontrado' });
            } else {
                if (hotelExist.adminHotel != userId) {
                    return res.status(404).send({ message: 'No puedes actualizar el evento al hotel' })
                } else {
                    const checkHotelEvent = await Event.findOne({ _id: eventId, hotel: hotelId }).populate('hotel').lean()
                    if (checkHotelEvent == null || checkHotelEvent.hotel._id != hotelId) {
                        return res.status(400).send({ message: 'No puedes actualizar este evento' })
                    } else {
                        const checkEvent = await Event.findOne({ name: params.name, hotel: hotelId }).lean()
                        if (checkEvent != null && checkHotelEvent.name != params.name) {
                            return res.status(400).send({ message: 'Ya existe un evento con el mimso nombre' });
                        } else {
                            let today = new Date().toISOString().split("T")[0]
                            today = new Date(today)
                            let date = new Date(params.dateEvent)

                            if (date == 'Invalid Date') {
                                return res.status(400).send({ message: 'La fecha no es válida' })
                            } else {
                                let difference = date.getTime() - today.getTime();
                                if (difference < 0) {
                                    return res.status(400).send({ message: 'Ingresa una fecha superior' })
                                } else {
                                    const eventUpdated = await Event.findOneAndUpdate({ _id: eventId }, params, { new: true }).lean();
                                    if (!eventUpdated) {
                                        return res.status(400).send({ message: 'No se ha podido actualizar este evento' });
                                    } else {
                                        return res.send({ message: 'Evento actualizado satisfactoriamente', eventUpdated })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el evento' })
    }
}

exports.deleteEvent = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const eventId = req.params.idEvent;
        const userId = req.user.sub;

        const hotelExist = await Hotel.findOne({ _id: hotelId });
        if (!hotelExist) {
            return res.status(400).send({ message: 'Hotel no encontrado' });
        } else {
            if (hotelExist.adminHotel != userId) {
                return res.status(404).send({ message: 'No puedes eliminar el evento del hotel' });
            } else {
                const checkHotelEvent = await Event.findOne({ _id: eventId, hotel: hotelId }).populate('hotel').lean()
                if (checkHotelEvent == null || checkHotelEvent.hotel._id != hotelId) {
                    return res.status(400).send({ message: 'No puedes eliminar este evento' })
                } else {
                    const eventDeleted = await Event.findOneAndDelete({ _id: eventId, hotel: hotelId }).populate('hotel').lean();
                    if (!eventDeleted) {
                        return res.status(404).send({ message: 'Evento no encontrado o ya eliminado' });
                    } else {
                        return res.send({ message: 'Evento eliminado: ', eventDeleted })
                    }
                }
            }
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error eliminando el evento' });
    }
}

//* Funciones usuario registrado --------------------------------------------------

exports.getEvents_Clients = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const events = await Event.find({ hotel: hotelId }).lean();
        if (!events) {
            return res.status(400).send({ message: 'Eventos no encontrados' });
        } else {
            for (let i = 0; i < events.length; i++) {
                events[i].dateEvent = new Date(events[i].dateEvent).toISOString().split("T")[0];
            }
            return res.send({ message: 'Eventos encontrados', events })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo los eventos' })
    }
}