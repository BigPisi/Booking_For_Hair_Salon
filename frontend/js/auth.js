function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    errorDiv.textContent = '';
    
    try {
        const response = await loginAPI(username, password);
        setAuthToken(response.token);
        setCurrentUser({
            id: response.userId,
            username: response.username,
            role: response.role
        });
        updateUIAfterAuth();
        showSection('home');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    } catch (error) {
        errorDiv.textContent = error.message || 'Неуспешен вход';
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    errorDiv.textContent = '';
    
    try {
        const response = await registerAPI(username, email, password);
        setAuthToken(response.token);
        setCurrentUser({
            id: response.userId,
            username: response.username,
            role: response.role
        });
        updateUIAfterAuth();
        showSection('home');
        document.getElementById('regUsername').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
    } catch (error) {
        errorDiv.textContent = error.message || 'Неуспешна регистрация';
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    updateUIAfterAuth();
    showSection('home');
}

function updateUIAfterAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const bookingsLink = document.getElementById('bookingsLink');
    const adminLink = document.getElementById('adminLink');
    const analyticsLink = document.getElementById('analyticsLink');
    const userInfo = document.getElementById('userInfo');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        bookingsLink.style.display = 'inline-block';
        userInfo.textContent = `Добре дошли, ${currentUser.username}`;
        userInfo.style.display = 'inline-block';
        
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'inline-block';
            analyticsLink.style.display = 'inline-block';
        } else {
            adminLink.style.display = 'none';
            analyticsLink.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        bookingsLink.style.display = 'none';
        adminLink.style.display = 'none';
        analyticsLink.style.display = 'none';
        userInfo.style.display = 'none';
    }
}

// Initialize on page load
if (currentUser) {
    updateUIAfterAuth();
}
