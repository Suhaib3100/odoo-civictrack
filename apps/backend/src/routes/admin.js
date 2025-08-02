const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes
router.use(protect);
router.use(requireAdmin);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const totalUsers = await prisma.user.count();
    const totalIssues = await prisma.issue.count();
    const openIssues = await prisma.issue.count({
      where: { status: 'OPEN' }
    });
    const resolvedIssues = await prisma.issue.count({
      where: { status: 'RESOLVED' }
    });

    // Get recent issues
    const recentIssues = await prisma.issue.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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

    // Get issues by category
    const issuesByCategory = await prisma.issue.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    // Get issues by status
    const issuesByStatus = await prisma.issue.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalIssues,
          openIssues,
          resolvedIssues,
          resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100).toFixed(1) : 0
        },
        recentIssues,
        issuesByCategory,
        issuesByStatus
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching dashboard data'
    });
  }
});

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      AND: []
    };

    if (search) {
      where.AND.push({
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (role) {
      where.AND.push({ role });
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
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching users'
    });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
router.put('/users/:id/role', [
  body('role').isIn(['USER', 'MODERATOR', 'ADMIN']).withMessage('Invalid role')
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
    const { role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating user role'
    });
  }
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating user status'
    });
  }
});

// @desc    Get all issues with pagination and filters
// @route   GET /api/admin/issues
// @access  Admin
router.get('/issues', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const category = req.query.category || '';
    const priority = req.query.priority || '';
    const search = req.query.search || '';

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
          { description: { contains: search, mode: 'insensitive' } }
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

// @desc    Update issue status
// @route   PUT /api/admin/issues/:id/status
// @access  Admin
router.put('/issues/:id/status', [
  body('status').isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']).withMessage('Invalid status'),
  body('comment').optional().isString().withMessage('Comment must be a string')
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
    const { status, comment } = req.body;

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
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

    // Update issue status
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: { status },
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

    // Create issue update if comment provided
    if (comment) {
      await prisma.issueUpdate.create({
        data: {
          issueId: id,
          title: `Status updated to ${status}`,
          description: comment,
          status
        }
      });
    }

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating issue status'
    });
  }
});

// @desc    Delete issue
// @route   DELETE /api/admin/issues/:id
// @access  Admin
router.delete('/issues/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
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

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user registration trends
    const userRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get issue creation trends
    const issueCreations = await prisma.issue.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get issues by location (top cities)
    const issuesByLocation = await prisma.issue.groupBy({
      by: ['city'],
      _count: {
        id: true
      },
      where: {
        city: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get average resolution time
    const resolvedIssues = await prisma.issue.findMany({
      where: {
        status: 'RESOLVED',
        updatedAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const avgResolutionTime = resolvedIssues.length > 0
      ? resolvedIssues.reduce((acc, issue) => {
          const resolutionTime = issue.updatedAt - issue.createdAt;
          return acc + resolutionTime;
        }, 0) / resolvedIssues.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    res.json({
      success: true,
      data: {
        userRegistrations,
        issueCreations,
        issuesByLocation,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
        period
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching analytics'
    });
  }
});

module.exports = router; 