// Result Schema
const resultSchema = new mongoose.Schema({
  studentId: { type: String, required: true, ref: 'Student' },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },
  marks: { type: Number, required: true, min: 0, max: 100 },
  grade: { type: String, required: true },
  gradePoints: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'published'], default: 'pending' },
  academicYear: String,
  examDate: Date,
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});