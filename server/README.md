# Interview Scheduler Application

A modern web application for scheduling and managing technical interviews.

## Features

- User authentication with role-based access (Recruiter, Panel, Admin)
- Interview panel availability management
- Interview slot booking system
- Real-time calendar view
- Feedback submission for completed interviews
- Email notifications (optional)

## Tech Stack

- Frontend:
  - HTML5
  - Tailwind CSS
  - Vanilla JavaScript
  - Modern ES6+ features
  - Responsive design

- Backend:
  - Node.js
  - Express.js
  - SQLite database
  - JWT authentication
  - RESTful API

## Setup Instructions

1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Run the setup script: `chmod +x setup.sh && ./setup.sh`
4. Update the `.env` file with your configuration
5. Start the development server: `npm run dev`
6. In a separate terminal, serve the frontend files:
   ```bash
   cd interview-scheduler
   python3 -m http.server 8000
   ```
7. Visit http://localhost:8000 in your browser

## Default Credentials

Admin:
- Email: admin@example.com
- Password: adminpass

## API Endpoints

### Authentication
- POST /api/login - Login user
- POST /api/register - Register new user

### Panel Management
- GET /api/panels - Get all panels
- GET /api/availability - Get panel availability
- POST /api/availability - Add availability slot

### Bookings
- GET /api/bookings - Get user's bookings
- POST /api/bookings - Book interview slot

### Feedback
- POST /api/feedback - Submit interview feedback

## Directory Structure

```
.
├── interview-scheduler/     # Frontend files
│   ├── js/                 # JavaScript modules
│   │   ├── api.js         # API utilities
│   │   ├── auth.js        # Authentication utilities
│   │   ├── calendar.js    # Calendar component
│   │   └── utils.js       # Shared utilities
│   ├── login-new.html     # Login page
│   ├── register.html      # Registration page
│   ├── panel-dashboard-new.html    # Panel dashboard
│   └── recruiter-dashboard-new.html # Recruiter dashboard
│
└── server/                # Backend files
    ├── index.js          # Main server file
    ├── package.json      # Dependencies
    ├── setup.sh         # Setup script
    └── README.md        # Documentation
```

## Development

To run the application in development mode:

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Serve the frontend files:
   ```bash
   cd interview-scheduler
   python3 -m http.server 8000
   ```

The application will be available at:
- Frontend: http://localhost:8000
- Backend API: http://localhost:3000

## Production Deployment

1. Update the `.env` file with production settings
2. Build and start the server:
   ```bash
   cd server
   npm start
   ```

3. Configure your web server (e.g., Nginx) to:
   - Serve static files from the `interview-scheduler` directory
   - Proxy API requests to `localhost:3000`

## Security Considerations

1. JWT tokens are used for authentication
2. Passwords are hashed using bcrypt
3. Role-based access control is implemented
4. Input validation and sanitization
5. CORS is configured for API access
6. Environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for any purpose.
