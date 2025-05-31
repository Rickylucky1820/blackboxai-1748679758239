const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Create/connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'interview_scheduler.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Availability table
        db.run(`
            CREATE TABLE IF NOT EXISTS availability (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                panel_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                status TEXT DEFAULT 'available',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (panel_id) REFERENCES users(id)
            )
        `);

        // Bookings table
        db.run(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                panel_id INTEGER NOT NULL,
                recruiter_id INTEGER NOT NULL,
                candidate_name TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                status TEXT DEFAULT 'scheduled',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (panel_id) REFERENCES users(id),
                FOREIGN KEY (recruiter_id) REFERENCES users(id)
            )
        `);

        // Feedback table
        db.run(`
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                booking_id INTEGER NOT NULL,
                rating INTEGER NOT NULL,
                comments TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id)
            )
        `);

        // Create default admin user if not exists
        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpass';
        
        db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, row) => {
            if (err) {
                console.error('Error checking admin user:', err);
                return;
            }
            
            if (!row) {
                bcrypt.hash(adminPassword, 10, (err, hash) => {
                    if (err) {
                        console.error('Error hashing password:', err);
                        return;
                    }
                    
                    db.run(
                        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                        [adminEmail, hash, 'admin'],
                        (err) => {
                            if (err) {
                                console.error('Error creating admin user:', err);
                            } else {
                                console.log('Default admin user created');
                            }
                        }
                    );
                });
            }
        });
    });
}

// Helper functions for database operations
const dbHelper = {
    // User operations
    async findUserByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    async createUser(email, password, role) {
        const hash = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                [email, hash, role],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    },

    // Availability operations
    async addAvailability(panelId, date, startTime, endTime) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO availability (panel_id, date, start_time, end_time) VALUES (?, ?, ?, ?)',
                [panelId, date, startTime, endTime],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    },

    async getAvailability(panelId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM availability WHERE panel_id = ? AND status = "available" ORDER BY date, start_time',
                [panelId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Booking operations
    async createBooking(panelId, recruiterId, candidateName, date, time) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO bookings (panel_id, recruiter_id, candidate_name, date, time) VALUES (?, ?, ?, ?, ?)',
                [panelId, recruiterId, candidateName, date, time],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    },

    async findPanels() {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT id, email, role FROM users WHERE role = "panel"',
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    async getBookings(userId, role) {
        const query = role === 'panel' 
            ? 'SELECT * FROM bookings WHERE panel_id = ? ORDER BY date, time'
            : 'SELECT * FROM bookings WHERE recruiter_id = ? ORDER BY date, time';
        
        return new Promise((resolve, reject) => {
            db.all(query, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Feedback operations
    async submitFeedback(bookingId, rating, comments) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO feedback (booking_id, rating, comments) VALUES (?, ?, ?)',
                [bookingId, rating, comments],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
};

module.exports = { db, dbHelper };
