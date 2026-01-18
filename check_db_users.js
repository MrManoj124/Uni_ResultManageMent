const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).select('+password');
        console.log('Found', users.length, 'users:');
        users.forEach(u => {
            console.log(`- Username: ${u.username}, Role: ${u.role}, Password (hashed): ${u.password}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsers();
