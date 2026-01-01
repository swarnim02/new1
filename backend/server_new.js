const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('Algonauts API is running...');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/student', require('./routes/student'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});