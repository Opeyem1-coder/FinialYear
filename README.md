# 🎓 Parent-Teacher Communication Portal (PTCP)

A comprehensive web-based application designed to bridge the communication gap between university administrators, lecturers, students, and parents. The system manages complex relational data including student enrollments, attendance, behavioral records, and academic grades with automated CGPA calculations.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Key Modules](#key-modules)
- [User Roles](#user-roles)
- [Authentication](#authentication)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Parent-Teacher Communication Portal (PTCP) is a full-stack web application that provides a unified platform for educational institutions to streamline communication and data management across five distinct user roles: **Administrators, Registry Staff, Lecturers, Students, and Parents**.

The system features strict **Role-Based Access Control (RBAC)** to securely route users to their isolated dashboards and prevent cross-role data leakage. It provides real-time insights, direct secure messaging between parents and lecturers, and holistic institutional observability for administrators.

---

## Features

### 👥 Multi-Role User Management
- **Admin Dashboard**: Full system oversight, institutional settings
- **Registry Module**: User registration and onboarding (students, lecturers, parents)
- **Lecturer Portal**: Grade submission, attendance tracking, discipline logging
- **Student Dashboard**: View grades, attendance, discipline records, course enrollment
- **Parent Portal**: Monitor child's academic performance, receive discipline notifications, message lecturers

### 📊 Academic Management
- **Grade Tracking**: Submit, update, and review student grades
- **Attendance System**: Daily attendance marking with aggregate statistics
- **CGPA Calculation**: Automated cumulative GPA calculations based on grades
- **Course Management**: Course creation, enrollment, and lecturer assignment

### 💬 Communication
- **Direct Messaging**: Secure bidirectional messaging between parents and lecturers
- **Notifications**: Real-time alerts for important events (discipline incidents, grade submissions)
- **Message History**: Searchable conversation archives

### 📋 Discipline Management
- **Incident Logging**: Lecturers can log behavioral incidents
- **Discipline History**: Parents and students can view discipline records
- **Incident Tracking**: Timeline view of all incidents

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication with configurable expiry
- **Password Encryption**: bcrypt-based password hashing
- **CORS Protection**: Configured cross-origin resource sharing
- **Helmet.js**: HTTP security headers for defense against common vulnerabilities

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 16.1.6](https://nextjs.org/) - React framework with built-in server rendering
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Component Library**: [Radix UI](https://www.radix-ui.com/) - High-quality, accessible components
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Utilities**: clsx, class-variance-authority, next-themes

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js 5.2.1](https://expressjs.com/) - Lightweight HTTP server
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: [JWT](https://jwt.io/) with jsonwebtoken library
- **Security**: 
  - bcrypt for password hashing
  - Helmet.js for HTTP headers
  - CORS for cross-origin requests
  - Morgan for HTTP request logging
- **API Documentation**: Swagger UI with swagger-jsdoc
- **Validation**: [Zod](https://zod.dev/) for schema validation

### Database
- **Cloud Service**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Collections**: User, Student, Course, Grade, Attendance, Discipline, Message

---

## Project Structure

```
codebase/
├── backend/                    # Node.js/Express REST API
│   ├── src/
│   │   ├── server.js          # Express app initialization
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── swagger.js      # API documentation
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification
│   │   │   └── errorHandler.js      # Global error handling
│   │   └── modules/
│   │       ├── attendance/     # Attendance management
│   │       ├── auth/           # Authentication & login
│   │       ├── courses/        # Course management
│   │       ├── discipline/     # Discipline tracking
│   │       ├── grades/         # Grade submission & tracking
│   │       ├── messages/       # Parent-teacher messaging
│   │       ├── students/       # Student data management
│   │       └── users/          # User management (Admin/Registry)
│   ├── package.json
│   ├── seed_registry.js        # Database seeding script
│   └── .env                    # Environment configuration
│
├── frontend/                   # Next.js React application
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Auth dispatch router
│   │   ├── auth/               # Authentication pages
│   │   ├── admin/              # Admin dashboard & modules
│   │   ├── registry/           # Registry staff portal
│   │   ├── teacher/            # Lecturer portal
│   │   ├── student/            # Student dashboard
│   │   └── parent/             # Parent portal
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── forms/              # Form wrappers
│   │   ├── layouts/            # Layout components (sidebar, nav)
│   │   └── theme-provider.tsx  # Theme configuration
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── api.ts              # API client utilities
│   │   └── utils.ts            # Utility functions
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── tailwind.config.ts      # Tailwind configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── next.config.mjs         # Next.js configuration
│
├── docs/                       # Project documentation
│   ├── chapter_4_implementation.md
│   └── graphical_walkthrough.md
│
└── Setup.md                    # Local setup guide
```

---

## Prerequisites

Before you begin, ensure you have:

### Required
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
  - Verify: `node --version`
- **MongoDB Atlas Account** (free tier) - [Create Account](https://www.mongodb.com/cloud/atlas/register)
- **Git** (for cloning the repository)

### Recommended
- **VSCode** or your preferred code editor
- **Postman** or **Insomnia** for API testing
- **MongoDB Compass** for database inspection

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd codebase
```

### 2. Set Up MongoDB Atlas

Follow the comprehensive setup guide in [Setup.md](Setup.md):

1. Create a free MongoDB Atlas account
2. Create a deployment (cluster)
3. Create a database user with username and password
4. Allow network access (0.0.0.0/0)
5. Get your connection string in the format:
   ```
   mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority
   ```

### 3. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env  # if available, or create manually

# Edit .env with your MongoDB connection string
# Example .env file:
# MONGODB_URI=mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/school-portal?retryWrites=true&w=majority
# JWT_SECRET=your-secret-key-here
# PORT=5000
```

**Important Environment Variables**:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 5000)

### 4. Set Up Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local (if required for API endpoint configuration)
# Example:
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Getting Started

### 1. Start MongoDB Cluster
Ensure your MongoDB Atlas cluster is running and accessible.

### 2. Seed the Database (Optional)

Populate the database with default users for testing:

```bash
cd backend
node seed_registry.js
```

This will create default accounts for testing:
- Admin user
- Registry staff
- Sample lecturers
- Test students
- Test parents

### 3. Start the Backend Server

```bash
cd backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Expected output:
```
Server running on http://localhost:5000
Connected to MongoDB
Swagger docs available at http://localhost:5000/api-docs
```

### 4. Start the Frontend Application

In a new terminal:

```bash
cd frontend

# Development mode
npm run dev

# Production build
npm run build
npm start
```

Expected output:
```
> next dev
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
```

### 5. Access the Application

Open your browser and navigate to:
- **Application**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React + TypeScript)                      │
│  - Page routing with RBAC checks                            │
│  - Role-based sidebar rendering                             │
│  - Real-time form validation                                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js REST API (Backend)                  │
├─────────────────────────────────────────────────────────────┤
│  - Authentication middleware (JWT)                          │
│  - Authorization middleware (RBAC)                          │
│  - 8 Primary Modules (Auth, Users, Courses, Grades, etc.)  │
│  - Error handling & validation                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           MongoDB Atlas (Cloud Database)                    │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                               │
│  - users (admin, registry, teacher, student, parent)       │
│  - students (linked to parents)                            │
│  - courses, grades, attendance, discipline, messages       │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

1. User submits credentials on the login page
2. Backend validates credentials against user database
3. If valid, JWT token is generated with user role
4. Token is stored in browser sessionStorage
5. Subsequent requests include token in `Authorization: Bearer <token>` header
6. Middleware verifies token and extracts user role
7. RBAC middleware checks if user has permission for the requested resource
8. Request is processed or rejected (403 Forbidden)

---

## Key Modules

### 1. Authentication Module (`/backend/src/modules/auth/`)
- User login and logout
- JWT token generation
- Session management
- Password reset functionality

### 2. User Management Module (`/backend/src/modules/users/`)
- Create, read, update, delete user accounts
- Role assignment
- User status management

### 3. Registry Module (`/backend/src/modules/students/`)
- Student registration and enrollment
- Parent account creation
- Lecturer onboarding
- Bulk user registration

### 4. Course Management (`/backend/src/modules/courses/`)
- Course creation and configuration
- Student enrollment
- Lecturer assignment
- Course scheduling

### 5. Grades Module (`/backend/src/modules/grades/`)
- Grade submission by lecturers
- CGPA calculations
- Grade history tracking
- Transcript generation

### 6. Attendance Module (`/backend/src/modules/attendance/`)
- Daily attendance marking
- Attendance statistics
- Absence tracking
- Summary reports

### 7. Discipline Module (`/backend/src/modules/discipline/`)
- Incident logging
- Severity classification
- Discipline history
- Parent notifications

### 8. Messaging Module (`/backend/src/modules/messages/`)
- Parent-lecturer messaging
- Message persistence
- Conversation history
- Real-time notifications

---

## User Roles

| Role | Access | Capabilities |
|------|--------|--------------|
| **Admin** | `/admin/dashboard` | System-wide settings, user management, institutional oversight |
| **Registry** | `/registry/dashboard` | User onboarding, bulk registration, account management |
| **Lecturer** | `/teacher/dashboard` | Grade submission, attendance marking, discipline logging |
| **Student** | `/student/dashboard` | View own grades, attendance, discipline, course enrollment |
| **Parent** | `/parent/dashboard` | Monitor child's academics, view discipline, message lecturers |

### RBAC Implementation

The system uses middleware-based RBAC:

```typescript
// Backend middleware checks user role before processing request
app.post('/api/grades', verifyToken, authorizeRoles(['teacher', 'admin']), submitGrade);

// Frontend router checks token before rendering protected pages
if (!token || userRole !== 'teacher') {
  redirect('/auth/login');
}
```

---

## Authentication

### JWT (JSON Web Tokens)

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiry**: Configured in backend (typically 24 hours)
- **Storage**: Browser sessionStorage
- **Format**: `Authorization: Bearer <token>`

### Password Security

- Passwords are hashed using **bcrypt** with salt rounds of 10
- Passwords are never stored in plain text
- Password reset requires email verification

---

## Database

### Mongoose Collections

#### User
```typescript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  first_name: String,
  last_name: String,
  role: enum ['admin', 'registry', 'teacher', 'student', 'parent'],
  created_at: Date,
  updated_at: Date
}
```

#### Student
```typescript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  parent_ids: [ObjectId], // refs: User
  enrollment_date: Date,
  major: String,
  level: String,
  courses: [ObjectId], // refs: Course
  created_at: Date
}
```

#### Grade
```typescript
{
  _id: ObjectId,
  student_id: ObjectId (ref: Student),
  course_id: ObjectId (ref: Course),
  lecturer_id: ObjectId (ref: User),
  score: Number,
  grade: String,
  semester: String,
  submitted_date: Date
}
```

#### Attendance
```typescript
{
  _id: ObjectId,
  student_id: ObjectId (ref: Student),
  course_id: ObjectId (ref: Course),
  date: Date,
  status: enum ['present', 'absent', 'late'],
  recorded_by: ObjectId (ref: User)
}
```

#### Discipline
```typescript
{
  _id: ObjectId,
  student_id: ObjectId (ref: Student),
  incident_type: String,
  description: String,
  logged_by: ObjectId (ref: User),
  logged_date: Date,
  severity: enum ['low', 'medium', 'high']
}
```

#### Message
```typescript
{
  _id: ObjectId,
  sender_id: ObjectId (ref: User),
  recipient_id: ObjectId (ref: User),
  subject: String,
  body: String,
  sent_date: Date,
  read: Boolean
}
```

---

## API Documentation

### Swagger UI

Full API documentation is available via Swagger UI:

```
http://localhost:5000/api-docs
```

### Core Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

**Users**
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (registry only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

**Students**
- `GET /api/students` - List students
- `POST /api/students` - Register new student (registry only)
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student info

**Courses**
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (admin only)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll student

**Grades**
- `GET /api/grades/:studentId` - Get student grades
- `POST /api/grades` - Submit grade (lecturer only)
- `PUT /api/grades/:id` - Update grade

**Attendance**
- `GET /api/attendance/:studentId` - Get student attendance
- `POST /api/attendance` - Mark attendance (lecturer only)

**Discipline**
- `GET /api/discipline/:studentId` - Get discipline records
- `POST /api/discipline` - Log incident (lecturer only)

**Messages**
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

---

## Deployment

### Backend Deployment (Heroku, Render, Railway, etc.)

1. Set environment variables on the hosting platform:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secure secret key
   - `NODE_ENV`: `production`

2. Deploy backend:
   ```bash
   npm run build  # if applicable
   npm start
   ```

### Frontend Deployment (Vercel, Netlify, etc.)

1. For Vercel:
   ```bash
   npm install -g vercel
   vercel
   ```

2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL

3. Vercel will automatically optimize and deploy your Next.js app

---

## Testing

### Unit Testing
- Individual API endpoints tested with mocked database
- Frontend components tested in isolation
- Utility functions validated with multiple input types

### Integration Testing
- Frontend ↔ Backend communication verified
- Database operations validated
- RBAC enforcement tested
- JWT authentication flow validated

### System Testing
- Full user workflows tested end-to-end
- Multi-role scenarios validated
- Error handling verified
- Performance benchmarked

### Acceptance Testing
- User interface evaluated for usability
- All modules tested by intended stakeholders
- Business requirements validated

---

## Troubleshooting

### Backend Issues

**"Connection to MongoDB failed"**
- Verify MongoDB Atlas cluster is running
- Check connection string in `.env` file
- Ensure IP whitelist includes your machine (or use 0.0.0.0/0)

**"Port 5000 already in use"**
- Kill existing process: `lsof -i :5000` then `kill -9 <PID>`
- Or change PORT in `.env`

**"JWT Secret not defined"**
- Ensure `JWT_SECRET` is set in `.env` file
- Restart server after defining

### Frontend Issues

**"Cannot find module" errors**
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `rm -rf .next node_modules && npm install`

**"API requests returning 403"**
- Verify JWT token is valid and not expired
- Check that CORS is properly configured
- Verify user role has permission for the endpoint

**"Styling not applied"**
- Run `npm run build` to rebuild Tailwind CSS
- Check that `tailwind.config.ts` is properly configured

### General Issues

**"Cannot connect to localhost:3000"**
- Ensure frontend is running: `npm run dev` in `/frontend` directory
- Check that port 3000 is not blocked by firewall

**"CORS errors in browser console"**
- Backend needs to specify frontend origin in CORS config
- Verify CORS middleware is properly configured

---

## Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m "Add new feature"`
3. Push to branch: `git push origin feature/new-feature`
4. Submit a pull request

---

## License

This project is licensed under the ISC License.

---

## Support

For issues, questions, or feedback:
- Check the [Setup.md](Setup.md) for detailed setup instructions
- Review the [docs/chapter_4_implementation.md](docs/chapter_4_implementation.md) for technical details
- Check API documentation at `http://localhost:5000/api-docs`

---

## Project Status

✅ **Fully Functional** - All core features implemented and tested  
✅ **Production Ready** - Comprehensive security and error handling  
✅ **Well Documented** - Setup guides and technical documentation included

---

**Last Updated**: March 2026
