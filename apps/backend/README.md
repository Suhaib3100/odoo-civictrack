# CivicTract Backend API

A comprehensive Express.js backend for the CivicTract civic issue reporting application with full authentication, user management, issue tracking, and admin functionality.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (USER, MODERATOR, ADMIN)
- **Password reset** functionality
- **Account management** (profile updates, password changes)
- **Secure password hashing** with bcrypt
- **Rate limiting** for auth endpoints

### User Management
- **User registration** and login
- **Profile management** with avatar support
- **User statistics** and activity tracking
- **Account deletion** with cascade cleanup
- **User search** and filtering (admin/moderator)

### Issue Management
- **CRUD operations** for civic issues
- **Location-based filtering** with coordinates
- **Category and status management**
- **Image upload** and processing
- **Voting system** (upvote/downvote)
- **Commenting system** with public/private options
- **Issue updates** and status tracking

### Admin Dashboard
- **Comprehensive analytics** and statistics
- **User management** with role assignment
- **Issue moderation** and status updates
- **System monitoring** and reporting
- **Bulk operations** and filtering

### File Upload System
- **Image processing** with Sharp
- **Multiple file upload** support
- **Avatar generation** with automatic resizing
- **File validation** and security
- **Storage management** with cleanup

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd apps/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/civictract_db"
   
   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   
   # Server Configuration
   PORT=5000
   NODE_ENV="development"
   
   # Frontend URL for CORS
   FRONTEND_URL="http://localhost:3000"
   
   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH="./uploads"
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL and includes the following models:

- **User**: Authentication, profiles, roles
- **Issue**: Civic issues with location, status, categories
- **Comment**: User comments on issues
- **Vote**: User votes on issues
- **IssueUpdate**: Status updates and progress tracking
- **Admin**: Separate admin accounts

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/refresh` | Refresh access token | Public |
| POST | `/logout` | User logout | Private |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password` | Reset password with token | Public |

### Users (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| GET | `/issues` | Get user's issues | Private |
| GET | `/comments` | Get user's comments | Private |
| GET | `/votes` | Get user's votes | Private |
| GET | `/stats` | Get user statistics | Private |
| GET | `/search` | Search users | Admin/Moderator |
| GET | `/:id` | Get user by ID | Admin/Moderator |
| DELETE | `/account` | Delete user account | Private |

### Issues (`/api/issues`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all issues with filters | Public |
| GET | `/:id` | Get single issue | Public |
| POST | `/` | Create new issue | Private |
| PUT | `/:id` | Update issue | Private (Owner/Admin) |
| DELETE | `/:id` | Delete issue | Private (Owner/Admin) |
| POST | `/:id/vote` | Vote on issue | Private |
| DELETE | `/:id/vote` | Remove vote | Private |
| POST | `/:id/comments` | Add comment | Private |
| PUT | `/:issueId/comments/:commentId` | Update comment | Private (Owner/Admin) |
| DELETE | `/:issueId/comments/:commentId` | Delete comment | Private (Owner/Admin) |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Admin dashboard stats | Admin |
| GET | `/users` | Get all users | Admin |
| PUT | `/users/:id/role` | Update user role | Admin |
| PUT | `/users/:id/toggle-status` | Toggle user status | Admin |
| GET | `/issues` | Get all issues | Admin |
| PUT | `/issues/:id/status` | Update issue status | Admin |
| DELETE | `/issues/:id` | Delete issue | Admin |
| GET | `/analytics` | Get analytics data | Admin |

### Upload (`/api/upload`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/image` | Upload single image | Private |
| POST | `/images` | Upload multiple images | Private |
| POST | `/avatar` | Upload avatar image | Private |
| GET | `/` | List uploaded files | Private |
| GET | `/:filename` | Get file info | Private |
| DELETE | `/:filename` | Delete file | Private |

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Login/Register** returns access and refresh tokens
2. **Access tokens** expire in 7 days (configurable)
3. **Refresh tokens** expire in 30 days
4. **Protected routes** require `Authorization: Bearer <token>` header

### Token Structure
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

## 🛡️ Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT token validation** with expiration
- **Rate limiting** on auth endpoints
- **Input validation** with express-validator
- **CORS protection** with configurable origins
- **Helmet.js** for security headers
- **File upload validation** and processing
- **SQL injection protection** via Prisma

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    // Validation errors (if applicable)
  ]
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for JWT signing | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | "7d" |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | "development" |
| `FRONTEND_URL` | Frontend URL for CORS | "http://localhost:3000" |
| `MAX_FILE_SIZE` | Max file upload size | 10485760 (10MB) |
| `UPLOAD_PATH` | Upload directory path | "./uploads" |

### Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes
- **General endpoints**: 100 requests per 15 minutes
- **File uploads**: 10 requests per 15 minutes

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure production database URL
   - Set appropriate CORS origins

2. **Database**
   - Run migrations: `npm run db:migrate`
   - Ensure database backups

3. **File Storage**
   - Configure cloud storage (AWS S3, etc.)
   - Set up CDN for static files

4. **Security**
   - Enable HTTPS
   - Configure firewall rules
   - Set up monitoring and logging

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run db:generate
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm start            # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the database schema

---

**CivicTract Backend** - Empowering communities through civic engagement 