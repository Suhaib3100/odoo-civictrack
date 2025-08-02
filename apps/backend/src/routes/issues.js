const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all issues with filters and pagination
// @route   GET /api/issues
// @access  Public (with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const category = req.query.category || '';
    const priority = req.query.priority || '';
    const search = req.query.search || '';
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10; // km

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      AND: []
    };

    if (status) {
      where.AND.push({ status });
    }

    if (category) {
      where.AND.push({ category });
    }

    if (priority) {
      where.AND.push({ priority });
    }

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      });
    }

    // Location-based filtering
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      // Simple bounding box filter (for production, use proper geospatial queries)
      const latRange = radius / 111; // Approximate km to degrees
      const lngRange = radius / (111 * Math.cos(lat * Math.PI / 180));
      
      where.AND.push({
        AND: [
          { latitude: { gte: lat - latRange, lte: lat + latRange } },
          { longitude: { gte: lng - lngRange, lte: lng + lngRange } }
        ]
      });
    }

    // Remove empty AND array
    if (where.AND.length === 0) {
      delete where.AND;
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.issue.count({ where });

    res.json({
      success: true,
      data: {
        issues,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching issues'
    });
  }
});

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
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
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Check if current user has voted
    let userVote = null;
    if (req.user) {
      userVote = await prisma.vote.findUnique({
        where: {
          userId_issueId: {
            userId: req.user.id,
            issueId: id
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        ...issue,
        userVote: userVote ? userVote.type : null
      }
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching issue'
    });
  }
});

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
router.post('/', protect, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER']).withMessage('Invalid category'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zipCode').optional().trim(),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
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
        latitude,
        longitude,
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
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating issue'
    });
  }
});

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private (Owner or Admin)
router.put('/:id', protect, [
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').optional().isIn(['INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER']).withMessage('Invalid category'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Check if user can update (owner or admin)
    if (issue.user.id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this issue'
      });
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: req.body,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating issue'
    });
  }
});

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Check if user can delete (owner or admin)
    if (issue.user.id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this issue'
      });
    }

    await prisma.issue.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting issue'
    });
  }
});

// @desc    Vote on issue
// @route   POST /api/issues/:id/vote
// @access  Private
router.post('/:id/vote', protect, [
  body('type').isIn(['UP', 'DOWN']).withMessage('Vote type must be UP or DOWN')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const { id } = req.params;
    const { type } = req.body;

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_issueId: {
          userId: req.user.id,
          issueId: id
        }
      }
    });

    if (existingVote) {
      // Update existing vote
      const updatedVote = await prisma.vote.update({
        where: {
          userId_issueId: {
            userId: req.user.id,
            issueId: id
          }
        },
        data: { type }
      });

      res.json({
        success: true,
        message: 'Vote updated successfully',
        data: updatedVote
      });
    } else {
      // Create new vote
      const newVote = await prisma.vote.create({
        data: {
          type,
          userId: req.user.id,
          issueId: id
        }
      });

      res.status(201).json({
        success: true,
        message: 'Vote created successfully',
        data: newVote
      });
    }
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing vote'
    });
  }
});

// @desc    Remove vote from issue
// @route   DELETE /api/issues/:id/vote
// @access  Private
router.delete('/:id/vote', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const vote = await prisma.vote.findUnique({
      where: {
        userId_issueId: {
          userId: req.user.id,
          issueId: id
        }
      }
    });

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: 'Vote not found'
      });
    }

    await prisma.vote.delete({
      where: {
        userId_issueId: {
          userId: req.user.id,
          issueId: id
        }
      }
    });

    res.json({
      success: true,
      message: 'Vote removed successfully'
    });
  } catch (error) {
    console.error('Remove vote error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while removing vote'
    });
  }
});

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
router.post('/:id/comments', protect, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const { id } = req.params;
    const { content, isPublic = true } = req.body;

    // Check if issue exists
    const issue = await prisma.issue.findUnique({
      where: { id }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        isPublic,
        userId: req.user.id,
        issueId: id
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding comment'
    });
  }
});

// @desc    Update comment
// @route   PUT /api/issues/:issueId/comments/:commentId
// @access  Private (Owner or Admin)
router.put('/:issueId/comments/:commentId', protect, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if user can update (owner or admin)
    if (comment.user.id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment'
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating comment'
    });
  }
});

// @desc    Delete comment
// @route   DELETE /api/issues/:issueId/comments/:commentId
// @access  Private (Owner or Admin)
router.delete('/:issueId/comments/:commentId', protect, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if user can delete (owner or admin)
    if (comment.user.id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting comment'
    });
  }
});

module.exports = router; 