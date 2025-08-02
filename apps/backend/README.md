# CivicTract Backend

Express.js backend API for the CivicTract civic issue reporting application.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Issue Management**: CRUD operations for civic issues with location-based filtering
- **User Management**: User profiles, registration, and admin controls
- **File Upload**: Image upload with processing and optimization
- **Admin Dashboard**: Comprehensive admin interface with statistics and controls
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, CORS, helmet, input validation
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer with Sharp for image processing
- **Validation**: Express-validator and Joi
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your-prisma-postgresql-connection-string"
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Issues
- `GET /api/issues` - Get all issues (with filtering)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/my-issues` - Get user's issues
- `GET /api/users` - Get all users (Admin only)

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/issues` - Get all issues with admin controls
- `PUT /api/admin/issues/:id/status` - Update issue status
- `DELETE /api/admin/issues/:id` - Delete issue (Admin only)
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/toggle-status` - Toggle user status

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `DELETE /api/upload/:filename` - Delete uploaded file

## Database Schema

The application uses the following main entities:

- **User**: User accounts with roles and profiles
- **Issue**: Civic issues with location, category, and status
- **Comment**: Comments on issues
- **Vote**: User votes on issues
- **IssueUpdate**: Status updates and progress tracking
- **Admin**: Admin accounts for system management

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive validation using express-validator and Joi
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers
- **File Upload Security**: File type and size validation

## Error Handling

The application includes comprehensive error handling:

- **Validation Errors**: Detailed validation error messages
- **Authentication Errors**: Proper 401/403 responses
- **Database Errors**: Prisma error handling
- **File Upload Errors**: Multer error handling
- **General Errors**: 500 error responses with optional stack traces in development

## Development

### Project Structure
```
src/
├── config/
│   └── database.js      # Database configuration
├── middleware/
│   ├── auth.js          # Authentication middleware
│   ├── errorHandler.js  # Error handling middleware
│   └── notFound.js      # 404 middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── issues.js        # Issue management routes
│   ├── users.js         # User management routes
│   ├── admin.js         # Admin routes
│   └── upload.js        # File upload routes
├── utils/
│   └── validation.js    # Validation schemas
└── server.js            # Main server file
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `MAX_FILE_SIZE` | Maximum file upload size | 10485760 (10MB) |
| `UPLOAD_PATH` | File upload directory | ./uploads |

## Deployment

1. Set up a PostgreSQL database
2. Configure environment variables
3. Run database migrations: `npm run db:push`
4. Start the server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC 