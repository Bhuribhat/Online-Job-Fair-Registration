const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db')
//branch
// API Security
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require('cors');

// OpenAPI Document using Swagger
// const swaggerJsDoc = require("swagger-jsdoc");
// const swaggerUI = require("swagger-ui-express");

// Routes files
// const hospitals = require('./routes/hospitals');
// const appointments = require('./routes/appointments');
const auth = require('./routes/auth');

const companies = require('./routes/companies');
const bookings = require('./routes/bookings')


// Connect to database
connectDB();

// Load env vars
dotenv.config({path:'./config/config.env'});

const app = express();

// Swagger Definitions
// const swaggerOptions = {
//     swaggerDefinition: {
//         openapi: "3.0.0",
//         info: {
//             title: "Library API",
//             version: "1.0.0",
//             description: "A simple Express VacQ API",
//         },
//         servers: [
//             {
//                 url: "http://localhost:5000/api/v1",
//             },
//         ],
//     },
//     apis: ["./routes/*.js"],
// };
// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Enable CORS
app.use(cors());

// Body parser for json
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent http param pollutions
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
    windowsMs: 10 * 60 * 1000,  // within 10 mins interval
    max: 100,                   // maximum API rate limit is 100
});
app.use(limiter);

// Mount routers
// app.use('/api/v1/hospitals', hospitals);
// app.use('/api/v1/appointments', appointments);
app.use('/api/v1/auth', auth);

app.use('/api/v1/companies', companies)
app.use('/api/v1/bookings', bookings)

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, 'mode on port', PORT));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);

    // Close server & exit process
    server.close(() => process.exit(1));
});