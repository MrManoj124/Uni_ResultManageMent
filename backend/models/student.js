const studentSchema = new Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    program: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    address:String,
    phone:String,
    enrollmentYear: { type: Number, required: true },
    createdAt:{type:Date, default:Date.now}
});