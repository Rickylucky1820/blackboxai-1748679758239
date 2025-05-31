// Authentication utilities
const auth = {
    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 5000);
        }
    },

    // Handle successful login
    handleLoginSuccess(data) {
        switch (data.role) {
            case 'panel':
                window.location.href = '/panel-dashboard.html';
                break;
            case 'recruiter':
                window.location.href = '/recruiter-dashboard.html';
                break;
            case 'admin':
                window.location.href = '/admin.html';
                break;
            default:
                console.error('Unknown role:', data.role);
                break;
        }
    },

    // Initialize login form
    initLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.email.value.trim();
            const password = form.password.value;
            const role = form.querySelector('input[name="role"]:checked')?.value;

            if (!email || !password || !role) {
                utils.showToast('Please fill in all fields', 'error');
                return;
            }

            const button = form.querySelector('button[type="submit"]');
            utils.showLoading(button);

            try {
                const response = await api.login(email, password, role);
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('role', response.role);
                    this.handleLoginSuccess(response);
                }
            } catch (error) {
                utils.showToast(utils.formatErrorMessage(error), 'error');
            } finally {
                utils.hideLoading(button);
            }
        });
    },

    // Initialize registration form
    initRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.email.value.trim();
            const password = form.password.value;
            const confirmPassword = form.confirmPassword.value;
            const role = form.querySelector('input[name="role"]:checked')?.value;

            if (!email || !password || !confirmPassword || !role) {
                utils.showToast('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                utils.showToast('Passwords do not match', 'error');
                return;
            }

            if (!utils.validateEmail(email)) {
                utils.showToast('Please enter a valid email address', 'error');
                return;
            }

            if (!utils.validatePassword(password)) {
                utils.showToast('Password must be at least 8 characters long', 'error');
                return;
            }

            const button = form.querySelector('button[type="submit"]');
            utils.showLoading(button);

            try {
                await api.register(email, password, role);
                utils.showToast('Registration successful! Please login.');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } catch (error) {
                utils.showToast(utils.formatErrorMessage(error), 'error');
            } finally {
                utils.hideLoading(button);
            }
        });
    }
};
