// const Appointment = require('../models/Appointment');
// const Hospital = require('../models/Hospital');
const Booking = require('../models/Booking');
const Company = require('../models/Company');
const User = require('../models/User');
// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Public
exports.getBookings = async (req, res, next) => {
    let query;

    // General users can see only their appointments!
    // if (req.user.role !== 'admin' && req.user.role == 'user') {
    // if (req.user.role !== 'admin') {

    //     query = Booking.find({user: req.user.id}).populate({
    //         path: 'company',
    //         select: 'name province tel'
    //     });
    // }
    if (req.user.role == 'user') {
        query = Booking.find({user: req.user.id}).populate({
            path: 'company',
            select: 'name province tel'
        });
    }

    else if (req.user.role == 'company') {
        const company_id = await Company.findOne({ user: req.user.id });
        // console.log("company")
        // console.log(company_id)
        query = Booking.find({company: company_id}).populate({
            path: 'user',
            select: 'name gpa workExperience'
        });
    }

    // else if (req.user.role !== 'admin' && req.user.role == 'company') {

    // }

    // If you are an admin, you can see all appointments
    else {
        if (req.params.companyId) {
            console.log('[+]getCompanies CompanyId:', req.params.companyId);
            query = Booking.find({company: req.params.companyId}).populate({
                path: 'company',
                select: 'name province tel',
            });
        }
        else query = Booking.find().populate({
            path: 'company',
            select: 'name province tel'
        });
    }
    try {
        const companies = await query;
        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Booking"});
    }
};

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Public
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'company',
            select: 'name description tel'
        });
        if (!booking) {
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success: true, 
            data: booking
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot find booking"});
    }
}

// @desc    Add single appointment
// @route   POST /api/v1/hospitals/:hospitalId/appointments/
// @access  Private
exports.addBooking = async (req, res, next) => {
    try {
        // console.log(req.body.company)
        // NOT SURE
        // req.body.company = req.params.companyId;
        // console.log("Print company in request")
        // console.log(req.body.company)
        console.log(req.params)
        const company = await Company.findById(req.body.company);
        if (!company) {
            return res.status(404).json({success: false, message: `No company with the id of ${req.params.companyId}`});
        }

        // Add user Id to req.body (login from protect function)
        req.body.user = req.user.id;

        const apptDate = new Date(req.body.apptDate);
        const startDate = new Date('2022-05-10');
        const endDate = new Date('2022-05-13');

        // Clear time part for accurate date-only comparison
        apptDate.setHours(0, 0, 0, 0);

        if (apptDate < startDate || apptDate > endDate) {
            return res.status(400).json({
                success: false,
                message: `Appointment date must be between May 10th and 13th, 2022`
            });
        }
        // Check for existed appointment
        const existedBookings = await Booking.find({user: req.user.id});

        // If the user is not an admin, they can only create 3 appointments
        if (existedBookings.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 bookings`});
        }
        const booking = await Booking.create(req.body);
        // Check if booking is in required period.
        res.status(200).json({
            success: true, 
            data: booking
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: 'Cannot create booking'});
    }
}

// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }

        // Make sure user is the appointment owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this appointment`});
        }
        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot update Booking"});
    }
}

// @desc    Delete appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }

        if (req.user.role == 'company') {
            const date = req.body.reqDate;
            // console.log(date);
            const company = await Company.findOne({user: req.user.id})
            // console.log(company);
            if (booking.company.toString() != company.id) {
                return res.status(401).json({
                    success: false, 
                    message: `Company User ${company.id} is not authorized to delete this appointment`
                });
            }
            if (!date){
                return res.status(400).json({
                    success: false, 
                    message: `Please add date`
                });
            }
            const requestDate = new Date(date);
            const appointmentDate = new Date(booking.apptDate);

            const diffInMs = appointmentDate - requestDate;
            const diffInHours = diffInMs / (1000 * 60 * 60); 

            if (diffInHours < 24) {
                return res.status(400).json({
                    success: false,
                    message: 'Cancellations must be made at least 24 hours in advance'
                });
            }
            await booking.deleteOne();
            res.status(200).json({
                success: true, 
                data: {}
            });
        }

        // Make sure user is the appointment owner
        else{
            if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this appointment`});
            }
            await booking.deleteOne();
            res.status(200).json({
                success: true, 
                data: {}
            });
        }
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot delete booking"});
    }
};