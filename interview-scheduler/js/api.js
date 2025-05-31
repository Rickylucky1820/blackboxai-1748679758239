const API_BASE_URL = 'http://localhost:3000/api';

// API Utilities
const api = {
    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Get stored token
    getToken() {
        return localStorage.getItem('token');
    },

    // Get stored user role
    getRole() {
        return localStorage.getItem('role');
    },

    // Headers with authentication
    headers() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // Handle API errors
    handleError(error) {
        console.error('API Error:', error);
        if (error.response) {
            // Server responded with error
            return error.response.json().then(data => {
                throw new Error(data.error || 'Server error');
            });
        }
        throw new Error('Network error - please check your connection');
    },

    // Login
    async login(email, password, role) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');
            console.log('Login successful:', data);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Register
    async register(email, password, role) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },

    // Get current user info
    async getCurrentUser() {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: this.headers()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to get user info');
        return data;
    },

    // Get all panels
    async getPanels() {
        const response = await fetch(`${API_BASE_URL}/panels`, {
            headers: this.headers()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch panels');
        return data;
    },

    // Get availability for a panel
    async getAvailability() {
        const response = await fetch(`${API_BASE_URL}/availability`, {
            headers: this.headers()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch availability');
        return data;
    },

    // Add availability slot
    async addAvailability(date, startTime, endTime) {
        const response = await fetch(`${API_BASE_URL}/availability`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({ date, start_time: startTime, end_time: endTime })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to add availability');
        return data;
    },

    // Book interview slot
    async bookSlot(panelId, candidateName, date, time) {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({ panel_id: panelId, candidate_name: candidateName, date, time })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to book slot');
        return data;
    },

    // Get bookings
    async getBookings() {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            headers: this.headers()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
        return data;
    },

    // Submit feedback
    async submitFeedback(bookingId, rating, comments) {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({ booking_id: bookingId, rating, comments })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to submit feedback');
        return data;
    },

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login.html';
    }
};

// Auth check on page load
if (!api.isAuthenticated() && window.location.pathname !== '/login.html') {
    window.location.href = '/login.html';
}
