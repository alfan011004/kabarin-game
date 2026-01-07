// Authentication System using Local Storage
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('gaming_users')) || [];
        this.init();
    }

    init() {
        // Check if user is logged in
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        }
    }

    // Register new user
    register(username, email, password) {
        // Validation
        if (username.length < 3 || username.length > 20) {
            throw new Error('Username harus 3-20 karakter');
        }

        if (password.length < 6) {
            throw new Error('Password minimal 6 karakter');
        }

        if (this.users.find(user => user.username === username)) {
            throw new Error('Username sudah digunakan');
        }

        if (this.users.find(user => user.email === email)) {
            throw new Error('Email sudah terdaftar');
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password, // In real app, this should be hashed
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('gaming_users', JSON.stringify(this.users));

        return newUser;
    }

    // Login user
    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            throw new Error('Username atau password salah');
        }

        this.currentUser = user;
        localStorage.setItem('current_user', JSON.stringify(user));
        this.updateUI();

        return user;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        this.updateUI();
    }

    // Update UI based on login status
    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const authButtons = document.getElementById('authButtons');
        const displayUserName = document.getElementById('displayUserName');

        if (this.currentUser) {
            userInfo.style.display = 'flex';
            authButtons.style.display = 'none';
            displayUserName.textContent = this.currentUser.username;
        } else {
            userInfo.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Modal Management
class ModalManager {
    constructor() {
        this.modals = {};
        this.init();
    }

    init() {
        // Initialize all modals
        document.querySelectorAll('.modal').forEach(modal => {
            const modalId = modal.id;
            this.modals[modalId] = modal;

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal');
                this.closeModal(modalId);
            });
        });
    }

    openModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Clear forms
            const form = this.modals[modalId].querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }

    closeAllModals() {
        Object.keys(this.modals).forEach(modalId => {
            this.closeModal(modalId);
        });
    }
}

const modalManager = new ModalManager();

// Event Listeners for Auth
document.addEventListener('DOMContentLoaded', function() {
    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
        modalManager.openModal('loginModal');
    });

    // Register button
    document.getElementById('registerBtn').addEventListener('click', () => {
        modalManager.openModal('registerModal');
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        auth.logout();
        modalManager.closeAllModals();
    });

    // Switch between login and register
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        modalManager.closeModal('loginModal');
        modalManager.openModal('registerModal');
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        modalManager.closeModal('registerModal');
        modalManager.openModal('loginModal');
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            auth.login(username, password);
            modalManager.closeModal('loginModal');
            showMessage('Login berhasil!', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            showMessage('Password dan konfirmasi password tidak cocok', 'error');
            return;
        }

        try {
            auth.register(username, email, password);
            modalManager.closeModal('registerModal');
            showMessage('Pendaftaran berhasil! Silakan login.', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
});

// Simple message display
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas fa-${getMessageIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="message-close">&times;</button>
    `;

    // Add styles
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getMessageColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;

    // Close button
    const closeBtn = messageEl.querySelector('.message-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    closeBtn.addEventListener('click', () => {
        messageEl.remove();
    });

    document.body.appendChild(messageEl);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

function getMessageIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getMessageColor(type) {
    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    return colors[type] || '#3498db';
}

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);