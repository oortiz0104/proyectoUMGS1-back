'use strict';

const { validateData, validateExtension, findUser, checkPassword, checkUpdate, checkUpdate_OnlyAdmin, encrypt } = require('../utils/validate');
const User = require('../models/user.model');

const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');

exports.test = (req, res) => {
    return res.send({ message: 'Mensaje de prueba desde el controlador de usuarios' });
};

//* Funciones admistrador ---------------------------------------------------------------------------------------

exports.register_OnlyAdmin = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            role: params.role
        };

        const msg = validateData(data);
        if (!msg) {
            const checkUser = await findUser(data.username);
            if (!checkUser) {
                if (params.role != 'ADMIN' && params.role != 'CLIENT' && params.role != 'HOTELADMIN') {
                    return res.staus(400).send({ message: 'El rol no es válido' })
                } else {
                    data.surname = params.surname;
                    data.password = await encrypt(params.password);
                    data.phone = params.phone;

                    let user = new User(data);
                    await user.save();
                    return res.send({ message: 'Usuario guardado exitosamente', user });
                }
            } else {
                return res.status(201).send({ message: 'Nombre de usuario ya esta en uso, utiliza uno diferente' });
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error al registrarse' });
    }
};

exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.staus(400).send({ message: 'El usuario ingresado no se ha podido encontrar' })
        } else {
            return res.send({ message: 'Usuario encontrado:', user });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo el usuario' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.send({ message: 'Usuarios encontrados:', users })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo los usuarios' });
    }
};

exports.getUsersHotelAdmin = async (req, res) => {
    try {
        const users = await User.find({ role: 'HOTELADMIN' });
        return res.send({ message: 'Usuarios encontrados:', users })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo los usuarios' });
    }
};

exports.searchUser = async (req, res) => {
    try {
        const params = req.body;
        const data = {
            username: params.username
        };

        const msg = validateData(data);
        if (!msg) {
            const user = await User.find({ username: { $regex: params.username, $options: 'i' } })
            return res.send(user)
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error buscando el usuario' });
    }
};

exports.update_OnlyAdmin = async (req, res) => {
    try {
        const userId = req.params.id;
        const params = req.body;

        const user = await User.findOne({ _id: userId })
        if (user) {
            const checkUpdated = await checkUpdate_OnlyAdmin(params);
            if (checkUpdated === false) {
                return res.status(400).send({ message: 'Parámetros no válidos para actualizar' })
            } else {
                const checkRole = await User.findOne({ _id: userId })
                if (checkRole.role === 'ADMIN') {
                    return res.status(403).send({ message: 'No puede editar usuarios de rol ADMIN' });
                } else {
                    const checkUser = await findUser(params.username);
                    if (checkUser && user.username != params.username) {
                        return res.status(201).send({ message: 'Este nombre de usuario ya esta en uso' })
                    } else {
                        if (params.role != 'ADMIN' && params.role != 'CLIENT' && params.role != 'HOTELADMIN') {
                            return res.status(201).send({ message: 'El rol ingresado no es valido' })
                        } else {
                            const updateUser = await User.findOneAndUpdate({ _id: userId }, params, { new: true }).lean();
                            if (!updateUser) {
                                return res.status(400).send({ message: 'No se ha podido actualizar el usuario' })
                            } else {
                                return res.send({ message: 'Usuario actualizado', updateUser })
                            }
                        }
                    }
                }
            }
        } else {
            return res.status(404).send({ message: 'Este usuario no existe' })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el usuario' });
    }
};

exports.delete_OnlyAdmin = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.send({ message: 'Usuario no encontrado' })
        } else {
            if (user.role === 'ADMIN' || user.role === 'HOTELADMIN') {
                return res.status(403).send({ message: 'No puede eliminar usuarios de rol ADMIN ni HOTELADMIN' });
            } else {
                const deleteUser = await User.findOneAndDelete({ _id: userId });
                if (!deleteUser) {
                    return res.status(500).send({ message: 'Usuario no encontrado o ya ha sido eliminado' })
                } else {
                    return res.send({ message: 'Cuenta eliminada' })
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando el usuario' });
    }
};

//* Funciones usuario no registrado ---------------------------------------------------------------------------------------

exports.login = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            username: params.username,
            password: params.password,
        };

        let msg = validateData(data);
        if (!msg) {
            let checkUser = await findUser(params.username);
            let checkPass = await checkPassword(params.password, checkUser.password);
            delete checkUser.password;
            delete checkUser.bills;
            delete checkUser.history;
            delete checkUser.reservations;

            if (checkUser && checkPass) {
                const token = await jwt.createToken(checkUser);
                return res.send({ message: 'Sesión iniciada', token, checkUser });
            } else {
                return res.status(403).send({ message: 'Usuario y/o contraseña incorrectas' });
            }
        } else {
            return res.status(404).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Usuario y/o contraseña incorrectas' });
    }
};

exports.register = async (req, res) => {
    try {
        const params = req.body;
        let data = {
            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            role: 'CLIENT'
        };
        let msg = validateData(data);

        if (!msg) {
            let checkUser = await findUser(data.username);
            if (!checkUser) {
                data.surname = params.surname;
                data.password = await encrypt(params.password);
                data.phone = params.phone;

                let user = new User(data);
                await user.save();
                return res.send({ message: 'Usuario guardado exitosamente' });
            } else {
                return res.status(409).send({ message: 'Nombre de usuario ya en uso, utiliza uno diferente' });
            }
        } else {
            return res.status(400).send(msg);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error al registrarse' });
    }
};

//* Funciones usuario registrado ---------------------------------------------------------------------------------------

exports.myProfile = async (req, res) => {
    try {
        const userId = req.user.sub;
        const user = await User.findOne({ _id: userId }).lean();
        delete user.password;
        delete user.__v
        if (!user) {
            return res.status(403).send({ message: 'El usuario no se ha podido encontrar' })
        } else {
            return res.send({ message: 'Este es tu usuario:', user });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error obteniendo el usuario' });
    }
};

exports.update = async (req, res) => {
    try {
        const userId = req.user.sub;
        const params = req.body;

        const user = await User.findOne({ _id: userId })
        if (user) {
            const checkUpdated = await checkUpdate(params);
            if (checkUpdated === false) {
                return res.status(400).send({ message: 'Parámetros no válidos para actualizar' })
            } else {
                const checkRole = await User.findOne({ _id: userId })
                if (checkRole.role === 'ADMIN') {
                    return res.status(403).send({ message: 'No puedes editar tu usuario si tienes el rol ADMIN' });
                } else {
                    const checkUser = await findUser(params.username);
                    if (checkUser && user.username != params.username) {
                        return res.status(201).send({ message: 'Este nombre de usuario ya esta en uso' })
                    } else {
                        const updateUser = await User.findOneAndUpdate({ _id: userId }, params, { new: true }).lean();
                        if (!updateUser) {
                            return res.status(403).send({ message: 'No se ha podido actualizar el usuario' })
                        } else {
                            return res.send({ message: 'Usuario actualizado', updateUser })
                        }
                    }
                }
            }
        } else {
            return res.send({ message: 'Este usuario no existe' })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error actualizando el usuario' });
    }
};

exports.delete = async (req, res) => {
    try {
        const userId = req.user.sub;

        const checkRole = await User.findOne({ _id: userId })
        if (checkRole.role === 'ADMIN' && checkRole.role === 'HOTELADMIN') {
            return res.status(403).send({ message: 'No puede eliminar usuarios de rol ADMIN ni HOTELADMIN' });
        } else {
            const deleteUser = await User.findOneAndDelete({ _id: userId });
            if (!deleteUser) {
                return res.status(500).send({ message: 'Usuario no encontrado' })
            } else {
                return res.send({ message: 'Cuenta eliminada' })
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error eliminando el usuario' });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        const alreadyImage = await User.findOne({ _id: req.user.sub });
        let pathFile = './uploads/users/';

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
                const updateUser = await User.findOneAndUpdate({ _id: req.user.sub }, { image: fileName }, { new: true });
                if (!updateUser) {
                    return res.status(404).send({ message: 'Usuario no encontrado' });
                } else {
                    delete updateUser.password;
                    return res.status(200).send({ message: 'Imagen añadida', updateUser });
                }
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error subiendo imagen' });
    }
}

exports.getImageUser = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const pathFile = './uploads/users/' + fileName;

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