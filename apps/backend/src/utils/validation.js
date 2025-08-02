const Joi = require('joi');

// User validation schemas
const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};

// Issue validation schemas
const issueValidation = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).required(),
    category: Joi.string().valid('INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER').required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    isAnonymous: Joi.boolean().optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().min(10).optional(),
    category: Joi.string().valid('INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED').optional(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    category: Joi.string().valid('INFRASTRUCTURE', 'SAFETY', 'ENVIRONMENT', 'TRANSPORTATION', 'UTILITIES', 'PUBLIC_SERVICES', 'OTHER').optional(),
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED').optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().min(0).optional(),
  }),
};

// Comment validation schemas
const commentValidation = {
  create: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
    isPublic: Joi.boolean().optional(),
  }),
};

// Vote validation schemas
const voteValidation = {
  create: Joi.object({
    type: Joi.string().valid('UP', 'DOWN').required(),
  }),
};

// Admin validation schemas
const adminValidation = {
  updateIssueStatus: Joi.object({
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED').required(),
    updateTitle: Joi.string().optional(),
    updateDescription: Joi.string().optional(),
  }),

  updateUserRole: Joi.object({
    role: Joi.string().valid('USER', 'MODERATOR', 'ADMIN').required(),
  }),
};

module.exports = {
  userValidation,
  issueValidation,
  commentValidation,
  voteValidation,
  adminValidation,
}; 