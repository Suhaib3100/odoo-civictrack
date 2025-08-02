const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { prisma } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER']),
  query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radius').optional().isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      priority,
      lat,
      lng,
      radius = 10
    } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Add location filter if coordinates provided
    if (lat && lng) {
      where.AND = [
        {
          latitude: {
            gte: parseFloat(lat) - radius / 111, // Approximate degrees
            lte: parseFloat(lat) + radius / 111
          }
        },
        {
          longitude: {
            gte: parseFloat(lng) - radius / (111 * Math.cos(parseFloat(lat) * Math.PI / 180)),
            lte: parseFloat(lng) + radius / (111 * Math.cos(parseFloat(lat) * Math.PI / 180))
          }
        }
      ];
    }

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: {
              comments: true,
              votes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.issue.count({ where })
    ]);

    res.json({
      success: true,
      data: issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        updates: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    });

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('category').isIn(['INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zipCode').optional().trim(),
  body('images').optional().isArray(),
  body('tags').optional().isArray(),
  body('isAnonymous').optional().isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      category,
      priority = 'MEDIUM',
      latitude,
      longitude,
      address,
      city,
      state,
      zipCode,
      images = [],
      tags = [],
      isAnonymous = false
    } = req.body;

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category,
        priority,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        city,
        state,
        zipCode,
        images,
        tags,
        isAnonymous,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('category').optional().isIn(['INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    // Check if user can update this issue
    if (issue.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this issue' });
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedIssue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    // Check if user can delete this issue
    if (issue.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this issue' });
    }

    await prisma.issue.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router; 