const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

// @desc   Get all hospitals
// @route  GET /api/v1/hospitals
// @access Public
exports.getHospitals = async (req, res, next) => {
    let query;
    let queryStr;
    
    // Copy req.query
    const reqQuery = {...req.query};
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log('[+]getHospitals request query:', reqQuery);  // { province: { lt: 'ง' } }
    
    /* 
    Create query string using Regular Expression
        - This regex searches for the words 'gt', 'gte', 'lt', 'lte', or 'in' as whole words
        - \b ensures it's a whole word boundary (not part of another word)
        - (gt|gte|lt|lte|in) matches any of the terms 'gt', 'gte', 'lt', 'lte', or 'in'
        - The replace function adds a '$' before the matched term (e.g., 'gt' becomes '$gt') 
    */
    queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);
    console.log('[+]getHospitals query string:', queryStr);   // {"province":{"$lt":"ง"}}
    
    // Finding resource
    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort Fields default is createdAt
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await Hospital.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // Execute query
        const hospitals = await query;

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({
            success: true, 
            count: hospitals.length,
            pagination,
            data: hospitals
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
};

// @desc   Get sigle hospital
// @route  GET /api/v1/hospitals/:id
// @access Public
exports.getHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            res.status(400).json({success: false});
        }
        res.status(200).json({
            success: true, 
            data: hospital
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
};

// @desc   Create new hospital
// @route  POST /api/v1/hospitals
// @access Private
exports.createHospital = async (req, res, next) => {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({
        success: true, 
        data: hospital
    });
};

// @desc   Update hospital
// @route  PUT /api/v1/hospitals/:id
// @access Private
exports.updateHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!hospital) {
            res.status(400).json({success: false});
        }
        res.status(200).json({
            success: true, 
            data: hospital
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
};

// @desc   Delete hospital
// @route  DELETE /api/v1/hospitals/:id
// @access Private
exports.deleteHospital = async (req, res, next) => {
    try {
        // const hospital = await Hospital.findByIdAndDelete(req.params.id);
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            res.status(400).json({
                success: false, 
                message: `Hospital not found with id of ${req.params.id}`
            });
        }

        // Cascade delete (delete all appointments associated with the deleted hospital)
        await Appointment.deleteMany({ hospital: req.params.id });
        await Hospital.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true, 
            data: {}
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
};