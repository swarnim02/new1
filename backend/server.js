const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Algonauts API is running...');
});

// Import Routes (to be created)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/mentor', require('./routes/mentor'));
// app.use('/api/student', require('./routes/student'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
