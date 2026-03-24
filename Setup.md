# 🎓 Parent-Teacher Communication Portal — Local Setup Guide

> This guide will walk you through setting up and running the entire application on your computer from scratch. No prior coding experience is required — just follow each step carefully.

---

## 📋 Table of Contents

1. [Prerequisites (What You Need First)](#1-prerequisites)
2. [Download the Project](#2-download-the-project)
3. [Set Up the Backend (Server)](#3-set-up-the-backend)
4. [Set Up the Frontend (Website)](#4-set-up-the-frontend)
5. [Seed a Default Registry User](#5-seed-a-default-registry-user)
6. [Start the Application](#6-start-the-application)
7. [How to Use the Portal](#7-how-to-use-the-portal)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

Before you begin, you need to complete **two** things.

### A. Install Node.js (JavaScript Runtime)

Node.js is the engine that runs the backend server.

1. Go to **[https://nodejs.org](https://nodejs.org)**
2. Click the big green button that says **"LTS"** (Long Term Support)
3. Run the downloaded installer — click **Next** on every screen and accept defaults
4. When finished, verify the installation:
   - Open **Command Prompt** (search for `cmd` in your Start Menu)
   - Type: `node --version` and press Enter
   - You should see a version number like `v20.x.x`. If you do, it's installed correctly! ✅

### B. Set Up MongoDB Atlas (Free Cloud Database)

MongoDB Atlas is a free cloud database that stores all the portal's data. You need to create an account and get a connection string.

#### Step B.1 — Create an Atlas Account
1. Go to **[https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)**
2. Sign up with your email (or use Google sign-in)
3. Choose the **FREE** tier (M0 Sandbox) — it costs nothing

#### Step B.2 — Create a Cluster
1. After signing in, click **"Build a Database"**
2. Select **M0 FREE** tier
3. Choose any cloud provider (AWS is fine) and the region closest to you
4. Click **"Create Deployment"**
5. Wait about 1–3 minutes while the cluster is created

#### Step B.3 — Create a Database User
1. You will be prompted to create a **database user**
2. Enter a **username** (e.g., `portalAdmin`)
3. Enter a **password** (e.g., `MySecurePass123`) — **write this down, you will need it**
4. Click **"Create Database User"**

#### Step B.4 — Allow Network Access
1. You will see a screen titled "Where would you like to connect from?"
2. Click **"Allow Access from Anywhere"** (or add `0.0.0.0/0`)
3. Click **"Finish and Close"**

#### Step B.5 — Get Your Connection String
1. On the cluster page, click the **"Connect"** button
2. Choose **"Drivers"**
3. Copy the connection string — it will look something like:
   ```
   mongodb+srv://portalAdmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Replace `<password>`** in the string with the actual password you created in Step B.3
5. **Add a database name** before the `?` — change the end to:
   ```
   mongodb+srv://portalAdmin:MySecurePass123@cluster0.xxxxx.mongodb.net/school-portal?retryWrites=true&w=majority
   ```
6. **Save this full string** — you will paste it in Step 3.3 below

---

## 2. Download the Project

If someone gave you the project as a ZIP file, extract it to a folder on your computer (e.g., your Desktop).

You should see a folder structure like this:

```
codebase/
├── backend/          ← The server (API)
├── frontend/         ← The website (UI)
└── docs/             ← Documentation files
```

---

## 3. Set Up the Backend

The backend is the server that handles all the data, user accounts, and logic.

### Step 3.1 — Open a Terminal

1. Open **Command Prompt** (search for `cmd` in your Start Menu)
2. Navigate to the backend folder. Type the following and press Enter:

```
cd C:\path\to\codebase\backend
```

> 💡 Replace `C:\path\to\codebase` with the actual path where you saved the project folder.

### Step 3.2 — Install Dependencies

Type the following command and press Enter:

```
npm install
```

This will download all the required packages. Wait until it finishes (may take 1–2 minutes).

### Step 3.3 — Configure the Environment File

The backend needs a configuration file called `.env` to know which database to connect to.

1. Open the file `backend/.env` in any text editor (e.g., Notepad)
2. You will see content like this:

```
PORT=5000
MONGO_URI=
JWT_SECRET=supersecretjwtkey_replace_in_production
JWT_EXPIRE=30d
```

3. **Paste your Atlas connection string** (from Step B.5) after `MONGO_URI=`. For example:

```
MONGO_URI=mongodb+srv://portalAdmin:MySecurePass123@cluster0.xxxxx.mongodb.net/school-portal?retryWrites=true&w=majority
```

4. Save and close the file.

---

## 4. Set Up the Frontend

The frontend is the actual website that users see and interact with.

### Step 4.1 — Open a **New** Terminal

1. Open a **second** Command Prompt window (leave the backend one open)
2. Navigate to the frontend folder:

```
cd C:\path\to\codebase\frontend
```

### Step 4.2 — Install Dependencies

Type:

```
npm install
```

Wait until it finishes (may take 2–4 minutes).

---

## 5. Seed a Default Registry User

Before you can register students, lecturers, and parents, you need a **Registry** account. The project includes a script that creates one for you automatically.

1. Go back to the **backend terminal** (the first Command Prompt)
2. Make sure you are inside the `backend/` folder
3. Type:

```
node seed_registry.js
```

4. You should see:
```
MongoDB connected
Registry user created: registry@pts.com
```

This creates a Registry officer account with:
- **Email:** `registry@pts.com`
- **Password:** `registry`

---

## 6. Start the Application

You need to start **both** the backend and frontend servers simultaneously.

### Step 6.1 — Start the Backend

In the **backend terminal**, type:

```
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: ...
Swagger Docs available at /api-docs
```

### Step 6.2 — Start the Frontend

In the **frontend terminal**, type:

```
npm run dev
```

You should see:
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

### Step 6.3 — Open the Portal

1. Open your web browser (Chrome, Edge, Firefox)
2. Go to: **[http://localhost:3000](http://localhost:3000)**
3. You will see the login page! 🎉

---

## 7. How to Use the Portal

### 🔑 First Login — Registry Officer

1. On the login page, **switch to Live API mode** using the toggle button at the bottom-right corner of the screen. It should say **"🟢 Live API"**.
2. Enter:
   - **Email:** `registry@pts.com`
   - **Password:** `registry`
3. Click **Sign In to Portal**

### 📝 Register Users

Once logged in as Registry, you can create new accounts:

| Action | Navigate to |
|---|---|
| Register a **Student** | `/registry/students` → Click "Register Student" |
| Register a **Lecturer** | `/registry/lecturers` → Click "Register Lecturer" |
| Register a **Parent** | `/registry/parents` → Click "Register Parent" |

> When you register a new user, their login credentials (email and auto-generated password) will be shown to you. Save these!

### 👤 Available User Roles

| Role | Dashboard URL | What They Can Do |
|---|---|---|
| **Admin** | `/admin/dashboard` | View system-wide stats, manage users/courses |
| **Registry** | `/registry/dashboard` | Onboard students, lecturers, and parents |
| **Lecturer** | `/teacher/dashboard` | Manage grades, attendance, discipline, messages |
| **Student** | `/student/dashboard` | View transcript (CGPA), attendance, messages |
| **Parent** | `/parent/dashboard` | Monitor child's grades, attendance, discipline, and message lecturers |

### 🔄 Mock Data vs Live API

The application has a toggle button in the **bottom-right corner** of every page:
- **🟡 Mock Data** — Uses pre-built dummy data (good for previewing the UI without a database)
- **🟢 Live API** — Uses real data from your MongoDB Atlas database (production mode)

---

## 8. Troubleshooting

### "npm is not recognized as a command"
→ Node.js is not installed. Re-do Step 1A.

### "ECONNREFUSED" or "MongoDB connection failed"
→ Your Atlas connection string in `backend/.env` is incorrect. Double-check:
  - The password is correct (no `<password>` placeholder remaining)
  - The database name `school-portal` is included in the URI
  - Your internet connection is active

### "Port 5000 already in use"
→ Another program is using that port. Either close it, or change the `PORT` value in `backend/.env` to something else (e.g., `5001`).

### "Port 3000 already in use"
→ Another program is running on port 3000. Close other terminals or restart your computer.

### Login says "Login failed"
→ Make sure you:
1. Switched the toggle to **"🟢 Live API"** mode
2. Used the correct email and password
3. The backend server is running in the other terminal

### The page looks broken/empty
→ Make sure **both** the backend (port 5000) and frontend (port 3000) terminals are running without errors.

---

## 🏗 Project Architecture (For Reference)

```
codebase/
├── Setup.md                    ← THIS FILE — local setup guide
├── backend/
│   ├── .env                    ← Database and JWT configuration
│   ├── seed_registry.js        ← Script to create the first Registry user
│   ├── package.json            ← Backend dependencies
│   └── src/
│       ├── server.js           ← Main entry point
│       ├── config/
│       │   ├── db.js           ← MongoDB connection
│       │   └── swagger.js      ← API documentation setup
│       ├── middleware/
│       │   ├── authMiddleware.js ← JWT verification & role-based access
│       │   └── errorHandler.js  ← Global error handler
│       └── modules/
│           ├── auth/           ← Login & token generation
│           ├── users/          ← User account CRUD
│           ├── students/       ← Student profile management
│           ├── courses/        ← Course configuration
│           ├── grades/         ← Grade management & CGPA
│           ├── attendance/     ← Attendance tracking
│           ├── discipline/     ← Behavioral incident logging
│           └── messages/       ← Parent-Teacher messaging
│
├── frontend/
│   ├── package.json            ← Frontend dependencies
│   ├── lib/api.ts              ← API client (handles auth tokens & mock toggle)
│   └── app/
│       ├── page.tsx            ← Root router (redirects based on role)
│       ├── auth/login/         ← Login page
│       ├── admin/              ← Admin dashboard & tools
│       ├── registry/           ← Registry onboarding forms
│       ├── teacher/            ← Lecturer grade/attendance/messages
│       ├── student/            ← Student transcript/attendance/messages
│       └── parent/             ← Parent monitoring & messaging
│
└── docs/                       ← Project documentation
```

---

## 📡 API Documentation

Once the backend is running, you can explore all available API endpoints at:

**[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

This opens an interactive Swagger UI where you can test every endpoint.

---

> **Need help?** If you encounter any issue not covered here, please contact the development team.
