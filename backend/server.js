const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
// Port 5000 is reserved by AirTunes on macOS, using 5001 instead
const PORT = process.env.PORT_OVERRIDE || 5001;

// Middleware
// request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    next();
});

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: true, // Allow any origin in allowedOrigins (reflects request origin)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));


// Handle preflight requests implicitly by cors middleware
// app.options('*', cors()); will be handled by app.use(cors(...))


app.use(express.json());
app.use(cookieParser());



// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Algonauts API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/student', require('./routes/student'));



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Force Restart for routes update (Dashboard UI Refinement)
