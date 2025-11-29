const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resultpro',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log(' ✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));
