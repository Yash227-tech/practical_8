const API_BASE = 'http://localhost:5000/api';
const CURRENT_USER_KEY = 'HotWheels_current_user';
const TOKEN_KEY = 'HotWheels_token';

function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function isLoggedIn() {
    return getCurrentUser() !== null && getToken() !== null;
}

async function signup(name, email, password) {
    if (!name || name.trim().length < 2) {
        return { success: false, error: 'Please enter a valid name' };
    }
    if (!email || !isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email' };
    }
    if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.text();
        if (data === 'User Registered') {
            return { success: true };
        } else {
            return { success: false, error: data };
        }
    } catch (err) {
        return { success: false, error: 'Server error. Make sure backend is running.' };
    }
}

async function login(email, password) {
    if (!email || !isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email' };
    }
    if (!password) {
        return { success: false, error: 'Please enter your password' };
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(() => null);

        if (data && data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            const user = { email, name: email.split('@')[0] };
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return { success: true, user };
        } else {
            const text = await res.text().catch(() => '');
            return { success: false, error: text || 'Invalid email or password', notFound: true };
        }
    } catch (err) {
        return { success: false, error: 'Server error. Make sure backend is running.' };
    }
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function requireAuth(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

function getRedirectAfterLogin() {
    const redirect = sessionStorage.getItem('redirectAfterLogin');
    sessionStorage.removeItem('redirectAfterLogin');
    return redirect || 'index.html';
}

window.getCurrentUser = getCurrentUser;
window.getToken = getToken;
window.isLoggedIn = isLoggedIn;
window.signup = signup;
window.login = login;
window.logout = logout;
window.isValidEmail = isValidEmail;
window.requireAuth = requireAuth;
window.getRedirectAfterLogin = getRedirectAfterLogin;
