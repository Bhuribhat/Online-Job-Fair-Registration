const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth')
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } = require('../controllers/companies');

// Include other resource routers
const bookingRouter = require('./bookings');

// Re-route into other resource routers
router.use("/:hospitalId/bookings/", bookingRouter);

router.route('/')
    .get(getCompanies)
    .post(protect, authorize('admin'), createCompany);

router.route('/:id')
    .get(getCompany)
    .put(protect, authorize('admin'), updateCompany)
    .delete(protect, authorize('admin'), deleteCompany);

module.exports = router;