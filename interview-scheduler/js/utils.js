// Utility functions for the Interview Scheduler application

const utils = {
    // Date formatting
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Time formatting
    formatTime(time) {
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    },

    // Show loading state on button
    showLoading(button) {
        button.classList.add('loading');
        const spinner = button.querySelector('.spinner');
        if (spinner) spinner.classList.remove('hidden');
        button.disabled = true;
    },

    // Hide loading state on button
    hideLoading(button) {
        button.classList.remove('loading');
        const spinner = button.querySelector('.spinner');
        if (spinner) spinner.classList.add('hidden');
        button.disabled = false;
    },

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    },

    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    // Create a toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-500 ${
            type === 'error' ? 'bg-red-900' : 'bg-green-900'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    // Initialize page protection
    initPageProtection(allowedRoles = []) {
        if (!api.isAuthenticated()) {
            window.location.href = '/login-new.html';
            return false;
        }

        const userRole = api.getRole();
        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            this.showToast('Access denied. Insufficient permissions.', 'error');
            window.location.href = '/login-new.html';
            return false;
        }

        return true;
    },

    // Initialize logout button
    initLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                api.logout();
            });
        }
    },

    // Create a loading spinner element
    createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin';
        return spinner;
    },

    // Show loading state for a container
    showContainerLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            const spinner = this.createSpinner();
            container.appendChild(spinner);
        }
    },

    // Create star rating component
    createStarRating(containerId, initialRating = 0, onChange = () => {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'flex space-x-1';

        let currentRating = initialRating;

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'cursor-pointer text-2xl';
            star.textContent = '★';
            star.style.color = i <= currentRating ? '#facc15' : '#444';

            star.addEventListener('click', () => {
                currentRating = i;
                updateStars();
                onChange(currentRating);
            });

            star.addEventListener('mouseover', () => {
                updateStars(i);
            });

            star.addEventListener('mouseout', () => {
                updateStars(currentRating);
            });

            container.appendChild(star);
        }

        function updateStars(hoverRating = null) {
            const rating = hoverRating || currentRating;
            container.querySelectorAll('span').forEach((star, index) => {
                star.style.color = index < rating ? '#facc15' : '#444';
            });
        }

        return {
            getRating: () => currentRating,
            setRating: (rating) => {
                currentRating = rating;
                updateStars();
            }
        };
    },

    // Validate email format
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Validate password strength
    validatePassword(password) {
        return password.length >= 8;
    },

    // Format error message
    formatErrorMessage(error) {
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        return 'An unexpected error occurred';
    }
};
