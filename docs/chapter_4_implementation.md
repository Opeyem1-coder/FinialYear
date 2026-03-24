# CHAPTER 4: IMPLEMENTATION AND RESULTS

## 4.0 Introduction
This chapter offers an in-depth description of the implementation phase of the web-based Parent-Teacher Communication Portal (PTCP), including the tools, technologies, and methodologies used during the entire software development life cycle. The chapter provides an extensive validation of all modules of the portal based on the original requirements by employing a multi-phase testing strategy. Further, it offers an extensive test suite including test cases for all modules of the system, along with an honest report of results, defects, and remedies used during the software development life cycle. The chapter offers a graphical walkthrough of all the pages of the portal to give an exact visual representation of the final product. The chapter further includes an explanation of the problems faced during the software development life cycle and the solutions used during the implementation phase.

The Parent-Teacher Communication Portal is a comprehensive web-based application designed to bridge the communication gap between university administrators, lecturers, students, and parents. It leverages a modern Next.js frontend and a robust Node.js/Express REST API. The system manages complex relational data in MongoDB, tracking student enrollments, attendance, behavioral records, and academic grades (including automated CGPA calculations). The system features strict Role-Based Access Control (RBAC) to securely route five distinct user roles (Admin, Registry, Lecturer, Student, Parent) to dedicated dashboards. The platform provides real-time insights, direct secure messaging between parents and lecturers, and holistic institutional observability for administrators.

## 4.1 System Testing
The main idea behind conducting system testing is to validate that all the functional and non-functional requirements specified in the System Requirements Specification (SRS) are fully and accurately implemented in the final product. The significance of conducting system testing is to ensure that the system is optimized to run, devoid of major defects, and offers a seamless user experience to all end users—whether they are parents monitoring their children, lecturers managing complex classes, or administrators overseeing the entire institution.

The test strategy used for conducting system testing of the project followed a bottom-up approach, which is progressive in nature and consists of four phases. Each phase of the test strategy is built upon the results obtained from the previous phase.

### 4.1.1 Unit Testing
Unit testing is the first phase of quality assurance, in which all the modules, functions, and components of the portal are isolated from the external environment. The main idea behind conducting unit testing is to validate that a specific unit of code, such as a particular API endpoint handler, a method of a database model, or a React component, generates the correct output for a specific input.

**Scope of Unit Testing:**
1. **Backend API Endpoints:** Each Express.js API route across the 8 primary modules (e.g., `/api/auth/login`, `/api/users`, `/api/courses`, `/api/grades`, `/api/attendance`, `/api/discipline`, `/api/messages`, `/api/students`) was tested individually to confirm it correctly handled valid requests, returned appropriate HTTP status codes (200, 201, 400, 401, 403, 404), and produced well-formed JSON responses. Edge cases such as missing required fields, expired JWT tokens, and invalid reference IDs (e.g., passing a non-existent `studentId` to a grade submission) were specifically targeted.
2. **Database Model Schema Validation:** Each Mongoose schema (User, Student, Course, Grade, Attendance, Discipline, Message) was invoked with controlled test data to verify that indexing operated correctly, strict references (`ref: 'User'`) threw validation errors on bad data, password hashing via `bcryptjs` produced irreversible hashes before saving, and nested data arrays (like multiple semesters of grades) updated correctly.
3. **Frontend Components:** Individual React/Next.js components across the various layouts (e.g., SidebarNav, PillButton, Data Tables, Modal Forms, Real-time Charts) were rendered in isolation to confirm they accepted the correct props, rendered the expected DOM structure using Tailwind CSS classes, and responded appropriately to user interactions such as form submissions and table searches.
4. **Utility Functions and Middleware:** Helper functions such as the `verifyToken` global middleware, the `authorizeRoles` enforcement decorator, password strength validators, and custom CGPA calculation utilities were tested for mathematical and logical correctness with controlled inputs.

**Tools Used:** Browser Developer Console, Morgan HTTP request logger, Node.js traceback analysis, Next.js terminal logs, and React strict mode warnings.

### 4.1.2 Integration Testing
Integration testing followed the successful completion of unit testing and focused on verifying the correct interaction between two or more interconnected components. The objective was to ensure that data flowed correctly across module boundaries, that API contracts between the frontend Next.js server and backend Node.js server were honored, and that the overall system architecture functioned as designed when components were assembled together.

**Key Integration Points Tested:**
1. **Frontend to Backend API Communication:** Every data-fetching operation was tested to confirm that the React frontend could successfully send requests to the Node backend and correctly parse the JSON responses. This included testing CORS header configurations across all endpoints, ensuring cookies and Authorization headers were successfully passed.
2. **Backend API to Database Layer:** The integration between Express controllers and the MongoDB Atlas database via Mongoose was verified. This included confirming that CRUD operations executed against the correct collections and that standard relationships (e.g., populating a Student's `parent_id` to retrieve parent contact info) completed efficiently without excessive query roundtrips.
3. **Parent-Student Linking Flow:** The critical integration between the Parent accounts and Student entities was tested end-to-end. The system was verified to correctly authorize a parent to view only the attendance, grades, and disciplinary records belonging to strings mapped within their specific `childIds` array, returning a 403 Forbidden for any other student ID.
4. **Authentication and RBAC Flow:** The complete login lifecycle was tested: credential submission, JWT token generation with a secure expiry, token storage in `sessionStorage`, role-based routing from the central `/page.tsx` dispatcher, and dynamic rendering of module-specific sidebar links based on the active role (`admin`, `registry`, `teacher`, `student`, `parent`).

### 4.1.3 System Testing
System testing evaluated the fully integrated application as a complete, end-to-end product in an environment closely mimicking production conditions. The application was deployed with the Node/Express server and the Next.js static output securely communicating with a live MongoDB Atlas cloud database.

**System Test Criteria:**
1. **Functional Completeness:** Every feature specified in the requirements—user registration via the Registry module, course management via Admin, grade and attendance tracking by Lecturers, direct parent-teacher messaging, and student self-service portals—was tested in a realistic, concurrent-use workflow scenario.
2. **Data Integrity & Consistency:** Database constraints were verified to prevent accidental deletions (e.g., preventing the deletion of a Course that currently has enrolled Students) and to ensure that cascading updates (like modifying a student's grade triggering an automatic recalculation of their cumulative GPA) functioned perfectly.
3. **Error Handling:** The system's behavior under error conditions—such as invalid routing attempts, network timeouts, or submitting forms with duplicate email addresses—was evaluated to ensure it produced user-friendly UI toast alerts rather than crashing the application.
4. **Performance:** Page load distances and API response times were assessed. Since the Next.js frontend was pre-compiled using `npm run build`, static hydration times were minimal, ensuring swift navigation across heavy data tables.

### 4.1.4 Acceptance Testing
Acceptance testing was the final phase, conducted with end-users representing the distinct roles in the educational workflow (Administrators, Registry Staff, Lecturers, Students, and Parents). The goal was to confirm that the delivered system met the original requirements and was suitable for adoption in a real academic environment.

**Acceptance Criteria Evaluated:**
1. Ease of navigation and intuitiveness of the user interface, particularly the segmented Sidebar layouts.
2. Absolute accuracy of the Role-Based Access Control (ensuring cross-role data leakage is impossible).
3. Clarity of the student's Academic History and CGPA breakdown.
4. Reliability of the bidirectional Messaging center between parents and teachers.
5. Efficiency of the Registry's rapid-entry forms for inserting hundreds of new users.
6. Mobile responsiveness of tables and charts across smartphones and tablets.

---

## 4.2 Testing Procedures and Outcomes

### 4.2.1 Authentication and Routing System
**Table 4.2.1.1: Authentication Workflows**
*Objective: Verify users log in correctly and are strictly routed to their isolated dashboards based on their assigned role.*

| Test ID | Scenario | Steps | Test Data | Expected Result | Status |
|---|---|---|---|---|---|
| AUTH-01 | Admin Login | 1. Navigate to `/auth/login`. 2. Enter admin credentials. 3. Submit. | `admin@university.edu` | JWT generated. Redirected exclusively to `/admin/dashboard`. Admin sidebar loads. | Pass |
| AUTH-02 | Registry Login | 1. Navigate to `/auth/login`. 2. Enter registry credentials. | `registry@university.edu` | Redirected to `/registry/dashboard`. Access granted to registration forms. | Pass |
| AUTH-03 | Lecturer Login | 1. Enter teacher credentials. | `teacher@university.edu` | Redirected to `/teacher/dashboard`. Grading and Attendance tools visible. | Pass |
| AUTH-04 | Parent Login | 1. Enter parent credentials. | `parent@university.edu` | Redirected to `/parent/dashboard`. Child-specific analytics visible. | Pass |
| AUTH-05 | Invalid Password | 1. Enter valid email, wrong password. | Pass: `wrongpass` | UI banner "Login failed. Please try again" displayed. No token issued. | Pass |
| AUTH-06 | RBAC Breach Attempt | 1. Log in as Student. 2. Manually change URL to `/admin/dashboard`. | N/A | Server rejects data fetch. Next.js router intervenes. | Pass |

### 4.2.2 Registry Module (User Management)
**Table 4.2.2.1: Registry Operations**
*Objective: Verify the ability of the Registry office to onboard new university constituents.*

| Test ID | Scenario | Steps | Test Data | Expected Result | Status |
|---|---|---|---|---|---|
| REG-01 | Register Student | 1. Go to `/registry/students`. 2. Click "Register Student". 3. Fill form. | `John Doe`, `CS Major`, `100 Level` | Student saved to DB. Data table updates in real-time. Password generated. | Pass |
| REG-02 | Register Lecturer | 1. Go to `/registry/lecturers`. 2. Fill department details. | `Dr. Smith`, `Mathematics` | Lecturer account created. Added to active teaching staff lists. | Pass |
| REG-03 | Register Parent | 1. Go to `/registry/parents`. 2. Add contact details. | `Robert Taylor` | Parent account created. Available for linking to students. | Pass |
| REG-04 | Search Filtering | 1. Type "Doe" in the search bar. | Query: `Doe` | Table instantly filters out non-matching records accurately. | Pass |

### 4.2.3 Lecturer Module (Academics & Operations)
**Table 4.2.3.1: Academic Record Management**
*Objective: Verify that lecturers can process grades, track attendance, and log behavioral incidents.*

| Test ID | Scenario | Steps | Test Data | Expected Result | Status |
|---|---|---|---|---|---|
| LEC-01 | View Assigned Courses | 1. Login as Teacher. 2. View Dashboard. | N/A | Displays only courses assigned to this specific teacher ID. | Pass |
| LEC-02 | Submit Student Grade | 1. Go to `/teacher/grades`. 2. Select Course. 3. Enter A, B, C for student. | Student: `STU001`, Grade: `A` | Grade securely saved to database. Student's cumulative record updates. | Pass |
| LEC-03 | Mark Daily Attendance | 1. Go to `/teacher/attendance`. 2. Select Date. 3. Toggle Present/Absent. | Status: `Present` | Attendance logged. Aggregate statistics for course dynamically recalculate. | Pass |
| LEC-04 | Discipline Logging | 1. Go to `/teacher/discipline`. 2. Log incident. | Incident: `Late` | Action recorded. Notification triggered for linked Parent. | Pass |

### 4.2.4 Parent Module (Monitoring & Communication)
**Table 4.2.4.1: Parent Oversight**
*Objective: Verify parents can view their child's academic performance securely and communicate with staff.*

| Test ID | Scenario | Steps | Test Data | Expected Result | Status |
|---|---|---|---|---|---|
| PAR-01 | View Linked Child | 1. Login as Parent. View Dashboard. | N/A | Only students explicitly linked to `parent_id` are displayed. | Pass |
| PAR-02 | Academic Breakdown | 1. Click on "Academics". 2. Select semester. | Semester: `Fall 2023` | Grades render cleanly. Shows credit hours and calculated GPAs. | Pass |
| PAR-03 | Discipline History | 1. Click "Discipline". | N/A | Timeline of incidents (or "No incidents") displays accurately. | Pass |
| PAR-04 | Send Direct Message | 1. Go to `/parent/messages`. 2. Select teacher. 3. Send text. | Text: `Hello` | Message saves to DB. Appears in Lecturer's inbox instantly. | Pass |

### 4.2.5 Student Module (Self-Service)
**Table 4.2.5.1: Student Analytics**
*Objective: Verify students can track their own progress autonomously.*

| Test ID | Scenario | Steps | Test Data | Expected Result | Status |
|---|---|---|---|---|---|
| STU-01 | View Personal Dashboard | 1. Login as Student. View Dashboard. | N/A | Live widgets showing Current CGPA, Attendance Rate, and unread messages. | Pass |
| STU-02 | Historical Grades (CGPA) | 1. Go to `/student/grades`. | N/A | Expandable 100-400 level history displays semester-by-semester GPA calculation. | Pass |
| STU-03 | Read Messages | 1. Go to `/student/messages`. | N/A | Inbox renders. Replies can be sent strictly to assigned lecturers. | Pass |


