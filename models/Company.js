const mongoose = require('mongoose');

// json
const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    website: {
        type: String,
        required: [true, 'Please add a website']
    },
    tel: {
        type: String,
        required: [true, 'Please add a tel']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please add a reference user account']
    },
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Cascade delete Bookings when a Company is deleted
CompanySchema.pre('remove', async function (next) {
    console.log(`Bookings being removed from Company ${this._id}`)
    await this.model('Booking').deleteMany({ company: this._id })
    next()
})

// Reverse populate with virtuals
CompanySchema.virtual('bookings', {
    ref: 'Booking', 
    localField: '_id',
    foreignField: 'Company',
    justOne: false
});

module.exports = mongoose.model('Company', CompanySchema);