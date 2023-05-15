'use strict'

const { validateData, findHotel, checkDeleteHotel, checkUpdateHotel, checkUpdateHotel_OnlyAdmin, findUser, findUserHotel, validateExtension } = require('../utils/validate');

const User = require('../models/user.model')
const Hotel = require('../models/hotel.model');
const fs = require('fs');
const path = require('path');

exports.testHotel = (req, res) => {
    return res.send({ message: 'Mensaje desde el controlador de hoteles' });
}

//* Funciones de administrador ---------------------------------------------------------------------------------------

exports.addHotel_OnlyAdmin = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            adminHotel: params.adminHotel,
            name: params.name,
            address: params.address,
            phone: params.phone,
            timesRequest: 0,
        }
        const msg = validateData(data);
        if (!msg) {
            const checkHotel = await findHotel(data.name);
            if (checkHotel) {
                return res.status(400).send({ message: 'Ya existe un hotel con el mismo nombre' });
            } else {
                const checkUserHotel = await findUserHotel(data.adminHotel)
                if (checkUserHotel == null || checkUserHotel.role != 'HOTELADMIN') {
                    return res.status(400).send({ message: 'No se le puede asignar el hotel a este usuario' });
                } else {
                    const hotel = new Hotel(data);
                    await hotel.save();
                    return res.send({ message: 'Hotel creado' });
                }
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error guardando el hotel' });
    }
}

exports.getHotels_OnlyAdmin = async (req, res) => {
    try {
        const hotels = await Hotel.find().populate('adminHotel')
        if (!hotels) {
            return res.status(400).send({ message: 'Hoteles no encontrados' });
        } else {
            return res.send({ messsage: 'Hoteles encontrados:', hotels });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo estos hoteles' });
    }
}

exports.getHotels_OrderByPopularity_OnlyAdmin = async (req, res) => {
    try {
        const hotels = await Hotel.find().sort({ timesRequest: -1 }).populate('adminHotel')
        if (!hotels) {
            return res.status(400).send({ message: 'Hoteles no encontrados' });
        } else {
            return res.send({ messsage: 'Hoteles encontrados:', hotels });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo estos hoteles' });
    }
}

exports.getHotel_OnlyAdmin = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotel = await Hotel.findOne({ _id: hotelId }).lean();
        if (!hotel) {
            return res.status(400).send({ message: 'Hotel no encontrado' });
        } else {
            return res.send({ message: 'Hotel encontrado:', hotel });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo el hotel' });
    }
}

exports.updateHotel_OnlyAdmin = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const params = req.body;

        const checkUpdated = await checkUpdateHotel_OnlyAdmin(params);
        if (!checkUpdated) {
            return res.status(400).send({ message: 'Parámetros inválidos' })
        } else {
            const checkHotel = await findHotel(params.name);
            const checkUserHotel = await Hotel.findOne({ _id: hotelId })
            if (checkHotel && checkUserHotel.name != params.name) {
                return res.status(400).send({ message: 'Ya existe un hotel con el mismo nombre' });
            } else {
                const checkUserHotel = await findUserHotel(params.adminHotel)
                if (checkUserHotel == null || checkUserHotel.role != 'HOTELADMIN') {
                    return res.status(400).send({ message: 'No se le puede asignar el hotel a este usuario' });
                } else {
                    const updateHotel = await Hotel.findOneAndUpdate({ _id: hotelId }, params, { new: true }).lean();
                    if (!updateHotel) {
                        return res.status(400).send({ message: 'No se ha podido actualizar el hotel' })
                    } else {
                        return res.send({ message: 'Hotel actualizado:', updateHotel })
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el hotel' });
    }
}

exports.deleteHotel_OnlyAdmin = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const deleteHotel = await checkDeleteHotel(hotelId);
        if (!deleteHotel) {
            return res.status(400).send({ message: 'No se ha encontrado el hotel o ya fue eliminado' });
        } else {
            await Hotel.findOneAndDelete({ _id: hotelId });
            return res.send({ message: 'Hotel eliminado', deleteHotel });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando el hotel' });
    }
}

//* Funciones de usuario no registrado ---------------------------------------------------------------------------------------

exports.getHotels_NoClients = async (req, res) => {
    try {
        const hotels = await Hotel.find()
        if (!hotels) {
            return res.status(400).send({ message: 'Hoteles no encontrados' });
        } else {
            return res.send({ messsage: 'Hoteles encontrados', hotels });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo estos hoteles' });
    }
}

//* Funciones de usuario registrado ---------------------------------------------------------------------------------------

exports.getHotels_Clients = async (req, res) => {
    try {
        const hotels = await Hotel.find().lean()
        if (!hotels) {
            return res.status(400).send({ message: 'Hoteles no encontrados' });
        } else {
            return res.send({ messsage: 'Hoteles encontrados', hotels });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo estos hoteles' });
    }
}

exports.getHotelsHistory = async (req, res) => {
    try {
        const historyHotels = await User.findOne({ _id: req.user.sub }).populate('history').lean()
        if (!historyHotels) {
            return res.status(400).send({ message: 'Hoteles no encontrados' });
        } else {
            return res.send({ messsage: 'Hoteles encontrados', hotels: historyHotels.history });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo estos hoteles' });
    }
}

exports.getHotel_Clients = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const hotel = await Hotel.findOne({ _id: hotelId }).lean();
        if (!hotel) {
            return res.status(400).send({ message: 'Hotel no encontrado' });
        } else {
            return res.send({ message: 'Hotel encontrado', hotel });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo el hotel' });
    }
}

//* Funciones administrador de hotel ---------------------------------------------------------------------------------------

exports.addHotel = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            adminHotel: req.user.sub,
            name: params.name,
            address: params.address,
            phone: params.phone,
            timesRequest: 0,
        }
        const msg = validateData(data);
        if (!msg) {
            const checkHotel = await findHotel(data.name);
            if (checkHotel) {
                return res.status(400).send({ message: 'Ya existe un hotel con el mismo nombre' });
            } else {
                const hotel = new Hotel(data);
                await hotel.save();
                return res.send({ message: 'Hotel creado' });
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error guardando el hotel' });
    }
}

exports.getHotels = async (req, res) => {
    try {
        const userId = req.user.sub
        const hotels = await Hotel.find({ adminHotel: userId })

        if (!hotels) {
            return res.status(400).send({ message: 'Hoteles no encontrados' });
        } else {
            return res.send({ messsage: 'Hoteles encontrados', hotels });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo estos hoteles' });
    }
}

exports.getHotels_OrderByPopularity = async (req, res) => {
    try {
        const userId = req.user.sub
        const hotels = await Hotel.find({ adminHotel: userId }).sort({ timesRequest: -1 })

        if (!hotels) {
            return res.status(400).send({ message: 'Hoteles no encontrados' });
        } else {
            return res.send({ messsage: 'Hoteles encontrados', hotels });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo estos hoteles' });
    }
}

exports.getHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const userId = req.user.sub;

        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel.adminHotel != userId) {
            return res.status(400).send({ message: 'No puedes ver este hotel' })
        } else {
            const hotel = await Hotel.findOne({ _id: hotelId }).lean();
            if (!hotel) {
                return res.status(400).send({ message: 'Hotel no encontrado' });
            } else {
                return res.send({ message: 'Hotel encontrado', hotel });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo el hotel' });
    }
}

exports.updateHotel = async (req, res) => {
    try {
        const params = req.body;
        const hotelId = req.params.id;
        const userId = req.user.sub

        const checkUserHotel = await Hotel.findOne({ _id: hotelId })
        if (checkUserHotel.adminHotel != userId) {
            return res.status(400).send({ message: 'No puedes actualizar este hotel' })
        } else {
            const checkUpdated = await checkUpdateHotel(params);
            if (!checkUpdated) {
                return res.status(400).send({ message: 'Parámetros inválidos' })
            } else {
                const checkHotel = await findHotel(params.name);
                if (checkHotel && checkUserHotel.name != params.name) {
                    return res.status(400).send({ message: 'Ya existe un hotel con el mismo nombre' });
                } else {
                    const updateHotel = await Hotel.findOneAndUpdate({ _id: hotelId }, params, { new: true }).lean();
                    if (!updateHotel) {
                        return res.status(400).send({ message: 'No se ha podido actualizar el hotel' })
                    } else {
                        return res.send({ message: 'Hotel actualizado', updateHotel })
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el hotel' });
    }
}

exports.deleteHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const userId = req.user.sub

        const checkUserHotel = await Hotel.findOne({ _id: hotelId });
        if (checkUserHotel.adminHotel != userId) {
            return res.status(400).send({ message: 'No puedes eliminar este hotel' });
        } else {
            const deleteHotel = await checkDeleteHotel(hotelId);
            if (!deleteHotel) {
                return res.status(400).send({ message: 'No se ha encontrado el hotel o ya fue eliminado' });
            } else {
                await Hotel.findOneAndDelete({ _id: hotelId });
                return res.send({ message: 'Hotel eliminado', deleteHotel });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando el hotel' });
    }
}

exports.uploadImageHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const userId = req.user.sub;

        const checkUserHotel = await Hotel.findOne({ _id: hotelId })
        if (checkUserHotel.adminHotel != userId) {
            return res.status(400).send({ message: 'No puedes subir una imagen a este hotel' })
        } else {
            const alreadyImage = await Hotel.findOne({ _id: hotelId });
            let pathFile = './uploads/hotels/';

            if (alreadyImage.image) {
                fs.unlinkSync(pathFile + alreadyImage.image);
            }

            if (!req.files.image || !req.files.image.type) {
                return res.status(400).send({ message: 'No se ha enviado una imagen' });
            } else {
                //ruta en la que llega la imagen
                const filePath = req.files.image.path; // \uploads\users\file_name.ext

                //separar en jerarquía la ruta de la imágen (linux o MAC: ('\'))
                const fileSplit = filePath.split('/');// fileSplit = ['uploads', 'users', 'file_name.ext']
                const fileName = fileSplit[2];// fileName = file_name.ext

                const extension = fileName.split('.'); // extension = ['file_name', 'ext']
                const fileExt = extension[1]; // fileExt = ext;

                const validExt = await validateExtension(fileExt, filePath);

                if (validExt === false) {
                    return res.status(400).send({ message: 'Extensión inválida' });
                } else {
                    const updateHotel = await Hotel.findOneAndUpdate({ _id: hotelId }, { image: fileName }, { new: true });
                    if (!updateHotel) {
                        return res.status(404).send({ message: 'Hotel no encontrado' });
                    } else {
                        return res.status(200).send({ message: 'Imagen añadida', updateHotel });
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error subiendo imagen' });
    }
}

exports.getImageHotel = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const pathFile = './uploads/hotels/' + fileName;

        const image = fs.existsSync(pathFile);
        if (!image) {
            return res.status(404).send({ message: 'Imagen no encontrada' });
        } else {
            return res.sendFile(path.resolve(pathFile));
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo la imagen' });
    }
}