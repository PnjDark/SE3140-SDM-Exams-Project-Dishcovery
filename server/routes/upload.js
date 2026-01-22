const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken } = require('./auth');
const path = require('path');

// POST - Upload image
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Generate accessible URL for the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
});

// GET - Retrieve uploaded image (serves static files)
// This is typically handled by serving static files in the main app
// router.get('/:filename', (req, res) => {
//   const filename = req.params.filename;
//   const filepath = path.join(__dirname, '../uploads', filename);
//   res.sendFile(filepath);
// });

module.exports = router;
