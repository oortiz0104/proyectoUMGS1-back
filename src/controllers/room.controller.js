'use strict'

const { validateData, checkUpdateRoom } = require('../utils/validate');

const Room = require('../models/room.model')
const Hotel = require('../models/hotel.model')

exports.test = (req, res) => {
    return res.send({ message: 'Función de prueba desde el controlador de cuartos' });
}

//* Funciones administrador de hotel ---------------------------------------------------------------------------------------

exports.addRoom = async (req, res) => {
    try {
        const params = req.body;
        const userId = req.user.sub;
        const data = {
            hotel: params.hotel,
            name: params.name,
            description: params.description,
            price: params.price,
            available: true,
            dateAvailable: 'Disponible'
        }
        const msg = validateData(data);
        if (!msg) {
            const hotelExist = await Hotel.findOne({ _id: data.hotel });
            if (!hotelExist) {
                return res.status(404).send({ message: 'El hotel no existe' });
            } else {
                if (hotelExist.adminHotel != userId) {
                    return res.status(401).send({ message: 'No eres el administrador de este hotel' });
                } else {
                    const checkRoom = await Room.findOne({ name: data.name, hotel: data.hotel }).lean()
                    if (checkRoom != null) {
                        return res.status(409).send({ message: 'Ya existe una habitación con el mismo nombre' });
                    } else {
                        const room = new Room(data);
                        await room.save()
                        return res.send({ message: 'Habitación creada' });
                    }
                }
            }
        } else {
            return res.status(400).send(msg)
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error creando la habitación' });
    }
}

exports.getRoom = async (req, res) => {
    try {
        const roomId = req.params.idRoom;
        const hotelId = req.params.idHotel
        const userId = req.user.sub

        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(404).send({ message: 'No puedes ver las habitaciones de este hotel' });
        } else {
            const checkRoomHotel = await Room.findOne({ _id: roomId, hotel: hotelId }).populate('hotel').lean();
            if (checkRoomHotel == null || checkRoomHotel.hotel._id != hotelId) {
                return res.status(404).send({ message: 'No puedes ver esta habitación' });
            } else {
                return res.send({ message: 'Habitación encontrada', checkRoomHotel });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo el servicio' });
    }
}

exports.getRooms = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;

        const checkUserHotel = await Hotel.findOne({ _id: hotelId });
        if (!checkUserHotel) {
            return res.status(404).send({ message: 'El hotel no existe' });
        } else {
            if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
                return res.status(401).send({ message: 'No eres el administrador de este hotel' });
            } else {
                const rooms = await Room.find({ hotel: hotelId }).populate('currentUser').lean()

                for (let i = 0; i < rooms.length; i++) {
                    if (rooms[i].hasOwnProperty('currentUser') == true) {
                        delete rooms[i].currentUser.password
                        delete rooms[i].currentUser.reservations
                        delete rooms[i].currentUser.history
                        delete rooms[i].currentUser.bills
                        delete rooms[i].currentUser.currentReservation
                        delete rooms[i].currentUser.role
                    }
                }

                if (!rooms) {
                    return res.status(400).send({ message: 'Habitaciones no encontradas' });
                } else {
                    return res.send({ message: 'Habitaciones encontradas', rooms });
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error obteniendo las habitaciones' });
    }
}

exports.getRoomsAvailable = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const hotelExist = await Hotel.findOne({ _id: hotelId });
        if (!hotelExist) {
            return res.status(404).send({ message: 'El hotel no existe' });
        } else {
            if (hotelExist.adminHotel != userId) {
                return res.status(401).send({ message: 'No eres el administrador de este hotel' });
            } else {
                const rooms = await Room.find({ hotel: hotelId, available: true }).populate('currentUser').lean()

                for (let i = 0; i < rooms.length; i++) {
                    if (rooms[i].hasOwnProperty('currentUser') == true) {
                        delete rooms[i].currentUser.password
                        delete rooms[i].currentUser.reservations
                        delete rooms[i].currentUser.history
                        delete rooms[i].currentUser.bills
                        delete rooms[i].currentUser.currentReservation
                        delete rooms[i].currentUser.role
                    }
                }

                if (!rooms) {
                    return res.status(400).send({ message: 'Habitaciones no encontradas' });
                } else {
                    return res.send({ message: 'Habitaciones encontradas', rooms });
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error obteniendo las habitaciones' });
    }
}

exports.getRoomsNoAvailable = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const userId = req.user.sub;
        const hotelExist = await Hotel.findOne({ _id: hotelId });
        if (!hotelExist) {
            return res.status(404).send({ message: 'El hotel no existe' });
        } else {
            if (hotelExist.adminHotel != userId) {
                return res.status(401).send({ message: 'No eres el administrador de este hotel' });
            } else {
                const rooms = await Room.find({ hotel: hotelId, available: false }).populate('currentUser').lean()

                for (let i = 0; i < rooms.length; i++) {
                    if (rooms[i].hasOwnProperty('currentUser') == true) {
                        delete rooms[i].currentUser.password
                        delete rooms[i].currentUser.reservations
                        delete rooms[i].currentUser.history
                        delete rooms[i].currentUser.bills
                        delete rooms[i].currentUser.currentReservation
                        delete rooms[i].currentUser.role
                    }
                }

                if (!rooms) {
                    return res.status(400).send({ message: 'Habitaciones no encontradas' });
                } else {
                    return res.send({ message: 'Habitaciones encontradas', rooms });
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err, message: 'Error obteniendo las habitaciones' });
    }
}

exports.updateRoom = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const roomId = req.params.idRoom;
        const userId = req.user.sub;
        const params = req.body;

        const checkUpdate = await checkUpdateRoom(params);
        if (checkUpdate == false) {
            return res.status(400).send({ message: 'Parámetros inválidos' });
        } else {
            const hotelExist = await Hotel.findOne({ _id: hotelId });
            if (!hotelExist) {
                return res.status(404).send({ message: 'El hotel no existe' });
            } else {
                if (hotelExist.adminHotel != userId) {
                    return res.status(401).send({ message: 'No puedes actualizar la habitación de este hotel' });
                } else {
                    const checkHotelRoom = await Room.findOne({ _id: roomId, hotel: hotelId }).lean().populate('hotel')
                    if (checkHotelRoom == null || checkHotelRoom.hotel._id != hotelId) {
                        return res.status(404).send({ message: 'No puedes actualizar esta habitación' });
                    } else {
                        const checkRoom = await Room.findOne({ name: params.name, hotel: hotelId }).lean()
                        console.log(checkRoom)
                        if (checkRoom != null && checkHotelRoom.name != params.name) {
                            return res.status(409).send({ message: 'Ya existe una habitación un nombre igual' });
                        } else {
                            const roomUpdated = await Room.findOneAndUpdate({ _id: roomId }, params, { new: true }).lean()
                            if (!roomUpdated) {
                                return res.status(400).send({ message: 'No se ha podido actualizar la habitación' });
                            } else {
                                return res.send({ message: 'Habitación actualizada', roomUpdated })
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando la habitación' });
    }
}

exports.deleteRoom = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const roomId = req.params.idRoom;
        const userId = req.user.sub;

        const hotelExist = await Hotel.findOne({ _id: hotelId });
        if (!hotelExist) {
            return res.status(404).send({ message: 'Hotel no encontrado' });
        } else {
            if (hotelExist.adminHotel != userId) {
                return res.status(401).send({ message: 'No eres el administrador de este hotel' });
            } else {
                const checkHotelRoom = await Room.findOne({ _id: roomId, hotel: hotelId }).populate('hotel').lean()
                if (checkHotelRoom == null || checkHotelRoom.hotel._id != hotelId) {
                    return res.status(400).send({ message: 'No puedes eliminar esta habitación' })
                } else {
                    const roomDeleted = await Room.findByIdAndDelete({ _id: roomId, hotel: hotelId }).lean();
                    if (!roomDeleted) {
                        return res.status(404).send({ message: 'Habitación no encontrada' });
                    } else {
                        return res.send({ message: 'Habitación eliminada', roomDeleted })
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando la habitación' });
    }
}

//* Funciones usuario registrado ---------------------------------------------------------------------------------------

exports.getRooms_Clients = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;

        const checkHotel = await Hotel.findOne({ _id: hotelId })
        if (!checkHotel || checkHotel == null) {
            return res.status(400).send({ message: 'No se pudo encontrar el hotel' });
        } else {
            const rooms = await Room.find({ hotel: hotelId }).lean()
            if (!rooms) {
                return res.status(400).send({ message: 'Habitaciones no encontradas' });
            } else {
                return res.send({ message: 'Habitaciones encontradas:', rooms });
            }
        }
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo las habitaciones' });
    }
}

exports.getRoomsAvailable_Clients = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;

        const checkHotel = await Hotel.findOne({ _id: hotelId })
        if (!checkHotel || checkHotel == null) {
            return res.status(400).send({ message: 'No se pudo encontrar el hotel' });
        } else {
            const rooms = await Room.find({ hotel: hotelId, available: true }).lean()
            if (!rooms) {
                return res.status(400).send({ message: 'Habitaciones no encontradas' });
            } else {
                return res.send({ message: 'Habitaciones encontradas:', rooms });
            }
        }
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo las habitaciones' });
    }
}

exports.getRoomsNoAvailable_Clients = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;

        const checkHotel = await Hotel.findOne({ _id: hotelId })
        if (!checkHotel || checkHotel == null) {
            return res.status(400).send({ message: 'No se pudo encontrar el hotel' });
        } else {
            const rooms = await Room.find({ hotel: hotelId, available: false }).lean()
            if (!rooms) {
                return res.status(400).send({ message: 'Habitaciones no encontradas' });
            } else {
                return res.send({ message: 'Habitaciones encontradas:', rooms });
            }
        }
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo las habitaciones' });
    }
}

exports.getRoom_Clients = async (req, res) => {
    try {
        const hotelId = req.params.idHotel;
        const roomId = req.params.idRoom;

        const checkHotel = await Hotel.findOne({ _id: hotelId })
        if (!checkHotel || checkHotel == null) {
            return res.status(400).send({ message: 'No se pudo encontrar el hotel' });
        } else {
            const room = await Room.findOne({ _id: roomId }).lean()
            if (!room) {
                return res.status(400).send({ message: 'Habitación no encontradas' });
            } else {
                return res.send({ message: 'Habitación encontrada', room });
            }
        }
    } catch (error) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo la habitación' });
    }
}