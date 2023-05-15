'use strict'

const { validateData } = require('../utils/validate');

const User = require('../models/user.model')
const Hotel = require('../models/hotel.model')
const Reservation = require('../models/reservation.model');
const Room = require('../models/room.model')
const Bill = require('../models/bill.model');

exports.testBill = (req, res) => {
    return res.send({ message: 'Función de prueba desde el controlador de factura' });
}

//* Funciones administrador del hotel ---------------------------------------------------------------------------------------
exports.checkInReservation = async (req, res) => {
    try {
        const hotelId = req.params.idHotel
        const reservationId = req.params.idReservation
        const userId = req.user.sub

        const checkUserHotel = await Hotel.findOne({ _id: hotelId }).lean()
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(400).send({ message: 'No puedes ver las reservaciones de este hotel' });
        } else {
            const checkReservationHotel = await Reservation.findOne({ _id: reservationId, hotel: hotelId }).populate('hotel').populate('room').populate('services.service').lean();
            if (checkReservationHotel == null || checkReservationHotel.hotel._id != hotelId) {
                return res.status(400).send({ message: 'No puedes ver esta reservación' });
            } else {
                if (checkReservationHotel.state == 'Cancelada') {
                    await Room.findOneAndUpdate({ _id: checkReservationHotel.room._id }, { available: true, dateAvailable: 'Disponible', $unset: { currentUser: 1 } }, { new: true }).lean();
                    await Reservation.findOneAndUpdate({ _id: reservationId }, { state: 'Cancelada y facturada' }, { new: true }).lean()
                    
                    let data = {
                        user: checkReservationHotel.user,
                        hotel: checkReservationHotel.hotel._id,
                        total: checkReservationHotel.totalPrice,
                        reservation: reservationId
                    }
                    const bill = new Bill(data);
                    await bill.save();
                    
                    await User.findOneAndUpdate({ _id: checkReservationHotel.user }, { $unset: { currentReservation: 1 }, $push: { bills: bill._id } }, { new: true }).lean();

                    return res.send({ message: 'Reservación cancelada facturada' });
                }

                if (checkReservationHotel.state == 'Facturada') {
                    return res.status(400).send({ message: 'Esta reservación ya fue facturada' });
                }

                if (checkReservationHotel.state == 'Cancelada y facturada') {
                    return res.status(400).send({ message: 'Esta reservación ya fue cancelada y facturada' });
                }

                await Room.findOneAndUpdate({ _id: checkReservationHotel.room._id }, { available: true, dateAvailable: 'Disponible', $unset: { currentUser: 1 } }, { new: true }).lean();
                await Reservation.findOneAndUpdate({ _id: reservationId }, { state: 'Facturada' }, { new: true }).lean()

                let data = {
                    user: checkReservationHotel.user,
                    hotel: checkReservationHotel.hotel._id,
                    total: checkReservationHotel.totalPrice,
                    reservation: reservationId
                }
                const bill = new Bill(data);
                await bill.save();

                await User.findOneAndUpdate({ _id: checkReservationHotel.user }, { $unset: { currentReservation: 1 }, $push: { bills: bill._id } }, { new: true }).lean();

                return res.send({ message: 'Reservación facturada' });
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error realizando la facturación' })
    }
}

exports.getBills = async (req, res) => {
    try {
        const userId = req.user.sub
        const hotelId = req.params.idHotel

        const checkUserHotel = await Hotel.findOne({ _id: hotelId })
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(400).send({ message: 'No puedes ver las facturas de este hotel' });
        } else {
            const bills = await Bill.find({ hotel: hotelId })
                .populate('user')
                .populate({ path: 'reservation', populate: { path: 'room' } })
                .lean()

            for (let i = 0; i < bills.length; i++) {
                delete bills[i].user.reservations
                delete bills[i].user.password
                delete bills[i].user.history
                delete bills[i].user.bills
                delete bills[i].user.currentReservation
                delete bills[i].user.role

                bills[i].reservation.startDate = new Date(bills[i].reservation.startDate).toISOString().split("T")[0];
                bills[i].reservation.endDate = new Date(bills[i].reservation.endDate).toISOString().split("T")[0];
            }

            return res.send({ message: 'Facturas encontradas', bills });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo las facturas' })
    }
}

exports.getBill = async (req, res) => {
    try {
        const userId = req.user.sub
        const hotelId = req.params.idHotel
        const billId = req.params.idBill

        const checkUserHotel = await Hotel.findOne({ _id: hotelId })
        if (checkUserHotel == null || checkUserHotel.adminHotel != userId) {
            return res.status(400).send({ message: 'No puedes ver las facturas de este hotel' });
        } else {
            const bill = await Bill.findOne({ _id: billId, hotel: hotelId })
                .populate('user')
                .populate({ path: 'reservation', populate: { path: 'room' } })
                .lean()
            delete bill.reservation.services
            delete bill.user.reservations
            delete bill.user.password
            delete bill.user.history
            delete bill.user.bills
            delete bill.user.currentReservation
            delete bill.user.role

            bill.reservation.startDate = new Date(bill.reservation.startDate).toISOString().split("T")[0];
            bill.reservation.endDate = new Date(bill.reservation.endDate).toISOString().split("T")[0];

            const reservation = await Reservation.findOne({ _id: bill.reservation }).populate('services.service')

            return res.send({ message: 'Facturas encontradas', bill, services: reservation.services });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo la factura' })
    }
}

//* Funciones usuario registrado ---------------------------------------------------------------------------------------

exports.myBills = async (req, res) => {
    try {
        const userId = req.user.sub

        const bills = await Bill.find({ user: userId })
            .populate('hotel')
            .populate({ path: 'reservation', populate: { path: 'room' } })
            .lean()
        if (!bills) {
            return res.status(404).send({ message: 'No se pudieron encontrar tus facturas' })
        } else {
            for (let i = 0; i < bills.length; i++) {
                bills[i].reservation.startDate = new Date(bills[i].reservation.startDate).toISOString().split("T")[0];
                bills[i].reservation.endDate = new Date(bills[i].reservation.endDate).toISOString().split("T")[0];
            }

            return res.send({ message: 'Facturas encontradas', bills });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo las facturas' })
    }
}

exports.myBill = async (req, res) => {
    try {
        const userId = req.user.sub
        const billId = req.params.idBill

        const checkBillUser = await Bill.findOne({ user: userId, _id: billId }).lean()
        console.log(checkBillUser);
        if (checkBillUser == null) {
            return res.status(400).send({ message: 'No se encontro la factura en tu cuenta' });
        } else {
            const bill = await Bill.findOne({ user: userId, _id: billId })
                .populate('hotel')
                .populate({ path: 'reservation', populate: { path: 'room' } })
                .lean()
            delete bill.reservation.services

            const reservation = await Reservation.findOne({ _id: checkBillUser.reservation }).populate('services.service')

            bill.reservation.endDate = new Date(bill.reservation.endDate).toISOString().split("T")[0];
            bill.reservation.startDate = new Date(bill.reservation.startDate).toISOString().split("T")[0];

            return res.send({ message: 'Facturas encontradas', bill, services: reservation.services });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Error obteniendo la factura' })
    }
}