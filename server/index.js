const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const { dbHelper } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_here'; // Change to env var in production

// Configure CORS
app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../interview-scheduler')));

// Serve login.html on root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../interview-scheduler/login.html'));
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await dbHelper.findUserByEmail(decoded.email);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dbHelper.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            role: user.role,
            email: user.email
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register route
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Validate role
        if (!['recruiter', 'panel', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if user exists
        const existingUser = await dbHelper.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user
        const userId = await dbHelper.createUser(email, password, role);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get panels route
app.get('/api/panels', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const panels = await dbHelper.findPanels();
        res.json(panels);
    } catch (error) {
        console.error('Get panels error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Availability routes
app.post('/api/availability', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'panel') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { date, startTime, endTime } = req.body;
        const availabilityId = await dbHelper.addAvailability(
            req.user.id,
            date,
            startTime,
            endTime
        );
        res.status(201).json({ id: availabilityId });
    } catch (error) {
        console.error('Add availability error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/availability', authenticateToken, async (req, res) => {
    try {
        const panelId = req.query.panelId || req.user.id;
        
        if (req.user.role !== 'recruiter' && req.user.id !== panelId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const availability = await dbHelper.getAvailability(panelId);
        res.json(availability);
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Booking routes
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { panelId, candidateName, date, time } = req.body;
        const bookingId = await dbHelper.createBooking(
            panelId,
            req.user.id,
            candidateName,
            date,
            time
        );
        res.status(201).json({ id: bookingId });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update booking status
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;

        // Verify booking exists and user has permission
        const booking = await dbHelper.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (req.user.role !== 'recruiter' || booking.recruiter_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await dbHelper.updateBookingStatus(bookingId, status);
        res.json({ message: 'Booking updated successfully' });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await dbHelper.getBookings(req.user.id, req.user.role);
        res.json(bookings);
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Feedback route
app.post('/api/feedback', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'panel') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { bookingId, rating, comments } = req.body;
        const feedbackId = await dbHelper.submitFeedback(bookingId, rating, comments);
        res.status(201).json({ id: feedbackId });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
