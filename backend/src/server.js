require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const setupSwagger = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Setup Swagger UI
setupSwagger(app);

// Basic generic route
app.get('/', (req, res) => {
    res.send('Parent-Teacher Communication Portal API is running!');
});

// Import Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/users.routes'));
app.use('/api/students', require('./modules/students/students.routes'));
app.use('/api/courses', require('./modules/courses/courses.routes'));
app.use('/api/grades', require('./modules/grades/grades.routes'));
app.use('/api/attendance', require('./modules/attendance/attendance.routes'));
app.use('/api/discipline', require('./modules/discipline/discipline.routes'));
app.use('/api/messages', require('./modules/messages/messages.routes'));

// Global Error Handler
app.use(require('./middleware/errorHandler'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
