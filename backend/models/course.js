const courseSchema = new mongoose.Schema({
    code:{type:String, required:true, unique:true},
    name:{type:String, required:true },
    credits:{type:Number, required:true},
    semester:{type:String, required:true},
    department:String,
    description:String,
    createdAt:{type:Date, default:Date.now}
});
