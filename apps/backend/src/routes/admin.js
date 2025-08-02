const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { prisma } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('ADMIN'));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalIssues,
      totalComments,
      issuesByStatus,
      issuesByCategory,
      recentIssues,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.issue.count(),
      prisma.comment.count(),
      prisma.issue.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.issue.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.issue.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalIssues,
          totalComments
        },
        issuesByStatus,
        issuesByCategory,
        recentIssues,
        recentUsers
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Get all issues with admin controls
// @route   GET /api/admin/issues
// @access  Private/Admin
router.get('/issues', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']),
  query('category').optional().isIn(['INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      page = 1,
      limit = 20,
      status,
      category
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

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

// @desc    Update issue status (Admin only)
// @route   PUT /api/admin/issues/:id/status
// @access  Private/Admin
router.put('/issues/:id/status', [
  body('status').isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']),
  body('updateTitle').optional().trim(),
  body('updateDescription').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { status, updateTitle, updateDescription } = req.body;

    // Update issue status
    const updatedIssue = await prisma.issue.update({
      where: { id: req.params.id },
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

    // Create update record if title or description provided
    if (updateTitle || updateDescription) {
      await prisma.issueUpdate.create({
        data: {
          title: updateTitle || `Status updated to ${status}`,
          description: updateDescription || `Issue status has been updated to ${status}`,
          status,
          issueId: req.params.id
        }
      });
    }

    res.json({
      success: true,
      data: updatedIssue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Delete issue (Admin only)
// @route   DELETE /api/admin/issues/:id
// @access  Private/Admin
router.delete('/issues/:id', async (req, res) => {
  try {
    await prisma.issue.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', [
  body('role').isIn(['USER', 'MODERATOR', 'ADMIN']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
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
      data: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
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
      data: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router; 