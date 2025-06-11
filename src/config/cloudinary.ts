const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: "dfncltqnd",
  api_key: "492531373787142",
  api_secret: "5yw6fXj4DoH2dQKaSQN3BiUmoWE",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'homie/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'fill' },  // Main image size
      { quality: 'auto', fetch_format: 'auto' },    // Auto optimize quality and format
      { flags: 'progressive' }                      // Progressive loading
    ],
    format: 'webp',  // Convert all images to WebP for better compression
  } as any,
});

export const upload = multer({ storage: storage });

export default cloudinary; 