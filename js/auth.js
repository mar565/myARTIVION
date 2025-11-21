/**
 * MyARTIVION Authentication Module (Demo Mode)
 *
 * This is a frontend-only authentication simulation for demo purposes.
 * In production, this would be replaced with real Azure AD / Entra ID
 * and Magic Link backend implementations.
 */

const Auth = {
    // Storage keys
    STORAGE_KEY: 'myartivion_auth',
    USER_KEY: 'myartivion_user',

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const authData = localStorage.getItem(this.STORAGE_KEY);
        if (!authData) return false;

        try {
            const data = JSON.parse(authData);
            // Check if token is expired (demo: 24 hours)
            const expiresAt = new Date(data.expiresAt);
            const now = new Date();

            if (now > expiresAt) {
                this.logout();
                return false;
            }

            return data.authenticated === true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    },

    /**
     * Get current user data
     * @returns {Object|null}
     */
    getUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    /**
     * Login user (simulation)
     * @param {Object} userData - User data object
     * @param {string} userData.email - User email
     * @param {string} userData.method - Authentication method ('microsoft' or 'magic-link')
     * @param {string} userData.name - User display name
     */
    login(userData) {
        // Create auth session
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

        const authData = {
            authenticated: true,
            expiresAt: expiresAt.toISOString(),
            loginMethod: userData.method,
            loginTime: new Date().toISOString()
        };

        // Create user profile
        const userProfile = {
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            method: userData.method,
            // Demo: Generate fake user data
            avatar: this.generateAvatar(userData.name || userData.email),
            department: 'Demo Department',
            employeeId: 'DEMO' + Math.floor(Math.random() * 10000),
            joinDate: '2024-01-15'
        };

        // Store in localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
        localStorage.setItem(this.USER_KEY, JSON.stringify(userProfile));

        console.log('✅ User logged in:', userProfile);
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.USER_KEY);
        console.log('✅ User logged out');
    },

    /**
     * Require authentication (redirect to login if not authenticated)
     * Call this on protected pages
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            console.log('❌ Not authenticated, redirecting to login...');
            window.location.href = '/login.html';
        }
    },

    /**
     * Generate avatar initials from name
     * @param {string} name
     * @returns {string}
     */
    generateAvatar(name) {
        if (!name) return '?';
        const parts = name.split(/[\s@._-]/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * Get authentication method used
     * @returns {string|null} 'microsoft' or 'magic-link'
     */
    getAuthMethod() {
        const authData = localStorage.getItem(this.STORAGE_KEY);
        if (!authData) return null;

        try {
            const data = JSON.parse(authData);
            return data.loginMethod || null;
        } catch (error) {
            return null;
        }
    },

    /**
     * Get session expiry time
     * @returns {Date|null}
     */
    getSessionExpiry() {
        const authData = localStorage.getItem(this.STORAGE_KEY);
        if (!authData) return null;

        try {
            const data = JSON.parse(authData);
            return new Date(data.expiresAt);
        } catch (error) {
            return null;
        }
    },

    /**
     * Extend session (refresh token simulation)
     */
    extendSession() {
        if (!this.isAuthenticated()) return;

        const authData = localStorage.getItem(this.STORAGE_KEY);
        if (!authData) return;

        try {
            const data = JSON.parse(authData);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            data.expiresAt = expiresAt.toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

            console.log('✅ Session extended');
        } catch (error) {
            console.error('Error extending session:', error);
        }
    },

    /**
     * Get user display name
     * @returns {string}
     */
    getUserDisplayName() {
        const user = this.getUser();
        return user ? user.name : 'Guest';
    },

    /**
     * Get user email
     * @returns {string}
     */
    getUserEmail() {
        const user = this.getUser();
        return user ? user.email : '';
    },

    /**
     * Initialize auth UI components
     * Call this on protected pages to show user info and logout button
     */
    initAuthUI() {
        if (!this.isAuthenticated()) return;

        const user = this.getUser();
        if (!user) return;

        // Add user profile to header if element exists
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            const userSection = document.createElement('div');
            userSection.className = 'user-section';
            userSection.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">${this.generateAvatar(user.name)}</div>
                    <div class="user-details">
                        <div class="user-name">${user.name}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                    <button class="btn-logout" id="btnLogout" title="Abmelden">
                        <span>🚪</span>
                    </button>
                </div>
            `;
            headerContent.appendChild(userSection);

            // Add logout handler
            const btnLogout = document.getElementById('btnLogout');
            if (btnLogout) {
                btnLogout.addEventListener('click', () => {
                    if (confirm('Möchtest du dich wirklich abmelden?')) {
                        this.logout();
                        window.location.href = '/login.html';
                    }
                });
            }
        }

        // Auto-extend session on user activity
        this.setupSessionExtension();
    },

    /**
     * Setup automatic session extension on user activity
     */
    setupSessionExtension() {
        const extendThreshold = 30 * 60 * 1000; // 30 minutes
        let lastActivity = Date.now();

        const activityHandler = () => {
            const now = Date.now();
            if (now - lastActivity > extendThreshold) {
                this.extendSession();
                lastActivity = now;
            }
        };

        // Listen for user activity
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, activityHandler, { passive: true });
        });
    },

    /**
     * Get auth status for debugging
     * @returns {Object}
     */
    getAuthStatus() {
        return {
            authenticated: this.isAuthenticated(),
            user: this.getUser(),
            method: this.getAuthMethod(),
            sessionExpiry: this.getSessionExpiry()
        };
    }
};

// Auto-initialize on protected pages
if (typeof window !== 'undefined') {
    window.Auth = Auth;

    // Debug helper
    window.debugAuth = () => {
        console.log('🔐 Auth Status:', Auth.getAuthStatus());
    };
}

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
