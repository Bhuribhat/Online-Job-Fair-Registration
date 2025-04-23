const Booking = require('../models/Booking');
const Company = require('../models/Company');

//@desc     Get all bookings
//@route    Get /api/v1/bookings
//@access   Public
exports.getBookings = async (req, res, next) => {
    let query;

    // General users can see only their bookings!
    if (req.user.role !== 'admin') {
        query = Booking.find({user: req.user.id}).populate({
            path: 'company',
            select: 'name province tel'
        });
    }

    // If you are an admin, you can see all bookings
    else {
        if (req.params.companyId) {
            console.log('[+]getBookings CompanyId:', req.params.companyId);
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
        const bookings = await query;
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Appointment"});
    }
};

//@desc     Get single booking
//@route    Get /api/v1/bookings/:id
//@access   Public
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

//@desc     Add booking
//@route    POST /api/v1/companies/:companyId&date/bookings
//@access   Private
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

        // If the user is not an admin, they can only create 3 bookings
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

//@desc     Update booking
//@route    Put /api/v1/bookings/:id
//@access   Private
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

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }

        // Make sure user is the appointment owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this appointment`});
        }
        await booking.deleteOne();
        res.status(200).json({
            success: true, 
            data: {}
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({success: false, message: "Cannot delete booking"});
    }
};