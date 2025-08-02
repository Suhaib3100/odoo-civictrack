const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        createdAt: true,
        _count: {
          select: {
            issues: true,
            comments: true,
            votes: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zipCode').optional().trim(),
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
    const { firstName, lastName, phone, address, city, state, zipCode } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
});

// @desc    Get user's issues
// @route   GET /api/users/issues
// @access  Private
router.get('/issues', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const category = req.query.category || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
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
    console.error('Get user issues error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user issues'
    });
  }
});

// @desc    Get user's comments
// @route   GET /api/users/comments
// @access  Private
router.get('/comments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        issue: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.comment.count({
      where: {
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user comments'
    });
  }
});

// @desc    Get user's votes
// @route   GET /api/users/votes
// @access  Private
router.get('/votes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const votes = await prisma.vote.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        issue: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.vote.count({
      where: {
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      data: {
        votes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user votes error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user votes'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const [
      totalIssues,
      openIssues,
      resolvedIssues,
      totalComments,
      totalVotes,
      issuesByCategory,
      issuesByStatus
    ] = await Promise.all([
      prisma.issue.count({
        where: { userId: req.user.id }
      }),
      prisma.issue.count({
        where: { 
          userId: req.user.id,
          status: 'OPEN'
        }
      }),
      prisma.issue.count({
        where: { 
          userId: req.user.id,
          status: 'RESOLVED'
        }
      }),
      prisma.comment.count({
        where: { userId: req.user.id }
      }),
      prisma.vote.count({
        where: { userId: req.user.id }
      }),
      prisma.issue.groupBy({
        by: ['category'],
        where: { userId: req.user.id },
        _count: {
          category: true
        }
      }),
      prisma.issue.groupBy({
        by: ['status'],
        where: { userId: req.user.id },
        _count: {
          status: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalIssues,
        openIssues,
        resolvedIssues,
        totalComments,
        totalVotes,
        resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100).toFixed(1) : 0,
        issuesByCategory,
        issuesByStatus
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user statistics'
    });
  }
});

// @desc    Search users (Admin/Moderator only)
// @route   GET /api/users/search
// @access  Private (Admin/Moderator)
router.get('/search', authorize('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const { q: searchQuery, role, isActive, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      AND: []
    };

    if (searchQuery) {
      where.AND.push({
        OR: [
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } }
        ]
      });
    }

    if (role) {
      where.AND.push({ role });
    }

    if (isActive !== undefined) {
      where.AND.push({ isActive: isActive === 'true' });
    }

    // Remove empty AND array
    if (where.AND.length === 0) {
      delete where.AND;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            issues: true,
            comments: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while searching users'
    });
  }
});

// @desc    Get user by ID (Admin/Moderator only)
// @route   GET /api/users/:id
// @access  Private (Admin/Moderator)
router.get('/:id', authorize('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            issues: true,
            comments: true,
            votes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user'
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', async (req, res) => {
  try {
    // Delete user's issues, comments, and votes first (cascade should handle this)
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting account'
    });
  }
});

// @desc    Update user status (Admin only)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
router.patch('/:id/status', authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "active" or "banned"'
      });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        isActive: status === 'active',
        status: status === 'banned' ? 'BANNED' : 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        status: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'banned'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user status error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while updating user status'
    });
  }
});

// @desc    Get all users (Admin only) - Alternative endpoint
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status) {
      where.isActive = status === 'active';
    }
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            issues: true,
            comments: true,
            votes: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching users'
    });
  }
});

module.exports = router;