const { default: mongoose } = require("mongoose");

const userShema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], required: true , unique:true},
    name: { type: String, required: true },
    studentId : { type: String, sparse: true, unique: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', userShema);