const Booking = require('../models/Booking');
const Company = require('../models/Company');
const User = require('../models/User');

// @desc   Get all hospitals
// @route  GET /api/v1/hospitals
// @access Public
exports.getCompanies = async (req, res, next) => {
    let query;
    let queryStr;
    
    // Copy req.query
    const reqQuery = {...req.query};
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log('[+]getCompanies request query:', reqQuery);  // { province: { lt: 'ง' } }
    
    /* 
    Create query string using Regular Expression
        - This regex searches for the words 'gt', 'gte', 'lt', 'lte', or 'in' as whole words
        - \b ensures it's a whole word boundary (not part of another word)
        - (gt|gte|lt|lte|in) matches any of the terms 'gt', 'gte', 'lt', 'lte', or 'in'
        - The replace function adds a '$' before the matched term (e.g., 'gt' becomes '$gt') 
    */
    queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);
    console.log('[+]getCompanies query string:', queryStr);   // {"province":{"$lt":"ง"}}
    
    // Finding resource
    query = Company.find(JSON.parse(queryStr)).populate('bookings');   

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
        const total = await Company.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // Execute query
        const companies = await query;

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
            count: companies.length,
            pagination,
            data: companies
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
};

// @desc   Get sigle hospital
// @route  GET /api/v1/hospitals/:id
// @access Public
exports.getCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            res.status(400).json({success: false});
        }
        res.status(200).json({
            success: true, 
            data: company
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
};

// @desc   Create new hospital
// @route  POST /api/v1/hospitals
// @access Private
exports.createCompany = async (req, res, next) => {
    try {
        // Find the user by ID
        // console.log(req.body)
        const user = await User.findById(req.body.user);
        // console.log(user)
        // If user not found or role is not 'company'
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'You need user account for company management'
            });
        }
        if (user.role !== 'company'){
            return res.status(403).json({
                success: false,
                message: 'To create a company, you need to add a user account with role "company"'
            });
        }
        const company = await Company.create(req.body);
        res.status(201).json({
            success: true, 
            data: company
        });
    }
    catch (err) {
        next(err);
    }
};

// @desc   Update hospital
// @route  PUT /api/v1/hospitals/:id
// @access Private
exports.updateCompany = async (req, res, next) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!company) {
            res.status(400).json({success: false});
        }
        res.status(200).json({
            success: true, 
            data: company
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
};

// @desc   Delete hospital
// @route  DELETE /api/v1/hospitals/:id
// @access Private
exports.deleteCompany = async (req, res, next) => {
    try {
        // const hospital = await Hospital.findByIdAndDelete(req.params.id);
        const company = await Company.findById(req.params.id);
        if (!company) {
            res.status(400).json({
                success: false, 
                message: `Company not found with id of ${req.params.id}`
            });
        }

        // Cascade delete (delete all appointments associated with the deleted hospital)
        await Booking.deleteMany({ company: req.params.id });
        await Company.deleteOne({ _id: req.params.id });

        res.status(200).json({
            success: true, 
            data: {}
        });
    } catch (err) {
        res.status(400).json({success: false});
    }
};