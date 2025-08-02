const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
const ensureUploadDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

ensureUploadDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per request
  }
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const { width, height, quality } = req.body;
    const inputPath = req.file.path;
    const filename = req.file.filename;
    const outputPath = path.join(uploadDir, `processed-${filename}`);

    // Process image with Sharp
    let sharpInstance = sharp(inputPath);

    // Resize if dimensions provided
    if (width || height) {
      sharpInstance = sharpInstance.resize(
        width ? parseInt(width) : undefined,
        height ? parseInt(height) : undefined,
        {
          fit: 'inside',
          withoutEnlargement: true
        }
      );
    }

    // Set quality for JPEG
    if (quality) {
      sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
    }

    // Process and save the image
    await sharpInstance.toFile(outputPath);

    // Clean up original file
    await fs.unlink(inputPath);

    // Generate public URL
    const publicUrl = `/uploads/processed-${filename}`;

    res.json({
      success: true,
      message: 'Image uploaded and processed successfully',
      data: {
        filename: `processed-${filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: publicUrl
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Server error while processing image'
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided'
      });
    }

    const { width, height, quality } = req.body;
    const processedImages = [];

    for (const file of req.files) {
      try {
        const inputPath = file.path;
        const filename = file.filename;
        const outputPath = path.join(uploadDir, `processed-${filename}`);

        // Process image with Sharp
        let sharpInstance = sharp(inputPath);

        // Resize if dimensions provided
        if (width || height) {
          sharpInstance = sharpInstance.resize(
            width ? parseInt(width) : undefined,
            height ? parseInt(height) : undefined,
            {
              fit: 'inside',
              withoutEnlargement: true
            }
          );
        }

        // Set quality for JPEG
        if (quality) {
          sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
        }

        // Process and save the image
        await sharpInstance.toFile(outputPath);

        // Clean up original file
        await fs.unlink(inputPath);

        // Generate public URL
        const publicUrl = `/uploads/processed-${filename}`;

        processedImages.push({
          filename: `processed-${filename}`,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: publicUrl
        });
      } catch (processError) {
        console.error(`Error processing file ${file.originalname}:`, processError);
        
        // Clean up file if it exists
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
    }

    if (processedImages.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to process any images'
      });
    }

    res.json({
      success: true,
      message: `${processedImages.length} images uploaded and processed successfully`,
      data: {
        images: processedImages,
        totalProcessed: processedImages.length
      }
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    
    // Clean up uploaded files if they exist
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
    }

    res.status(500).json({
      success: false,
      error: 'Server error while processing images'
    });
  }
});

// @desc    Upload avatar image
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No avatar image provided'
      });
    }

    const inputPath = req.file.path;
    const filename = req.file.filename;
    const outputPath = path.join(uploadDir, `avatar-${filename}`);

    // Process avatar with Sharp - create square thumbnail
    await sharp(inputPath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // Clean up original file
    await fs.unlink(inputPath);

    // Generate public URL
    const publicUrl = `/uploads/avatar-${filename}`;

    res.json({
      success: true,
      message: 'Avatar uploaded and processed successfully',
      data: {
        filename: `avatar-${filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: publicUrl
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Server error while processing avatar'
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
router.delete('/:filename', protect, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Delete the file
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting file'
    });
  }
});

// @desc    Get file info
// @route   GET /api/upload/:filename
// @access  Private
router.get('/:filename', protect, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    try {
      const stats = await fs.stat(filePath);
      const publicUrl = `/uploads/${filename}`;

      res.json({
        success: true,
        data: {
          filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: publicUrl
        }
      });
    } catch {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while getting file info'
    });
  }
});

// @desc    List uploaded files
// @route   GET /api/upload
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Read directory
    const files = await fs.readdir(uploadDir);
    
    // Get file stats
    const fileStats = await Promise.all(
      files.map(async (filename) => {
        try {
          const filePath = path.join(uploadDir, filename);
          const stats = await fs.stat(filePath);
          return {
            filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `/uploads/${filename}`
          };
        } catch {
          return null;
        }
      })
    );

    // Filter out null values and apply pagination
    const validFiles = fileStats.filter(file => file !== null);
    const paginatedFiles = validFiles.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: validFiles.length,
          pages: Math.ceil(validFiles.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while listing files'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file field'
      });
    }
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only image files are allowed'
    });
  }

  console.error('Upload error:', error);
  res.status(500).json({
    success: false,
    error: 'Server error during file upload'
  });
});

module.exports = router; 