// ==========================================
// config/cloudinary.js - File Upload Config
// ==========================================
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOptions = {
  folder: 'resultpro',
  allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'csv'],
  max_file_size: 5000000, // 5MB
  resource_type: 'auto'
};

module.exports = {
  cloudinary,
  uploadOptions
};