const API_BASE_URL = 'http://localhost:8080/api';

let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

function setAuthToken(token) {
    authToken = token;
    localStorage.setItem('authToken', token);
}

function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        let data = null;
        if (text) {
            data = contentType.includes('application/json') ? JSON.parse(text) : text;
        }
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
async function loginAPI(username, password) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

async function registerAPI(username, email, password) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
}

// Services API
async function getServicesAPI(categoryId = null, search = null) {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/services${query}`);
}

async function getServiceAPI(id) {
    return apiRequest(`/services/${id}`);
}

async function createServiceAPI(service) {
    return apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify(service)
    });
}

async function updateServiceAPI(id, service) {
    return apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(service)
    });
}

async function deleteServiceAPI(id) {
    return apiRequest(`/services/${id}`, {
        method: 'DELETE'
    });
}

// Categories API
async function getCategoriesAPI() {
    return apiRequest('/categories');
}

async function createCategoryAPI(category) {
    return apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(category)
    });
}

async function updateCategoryAPI(id, category) {
    return apiRequest(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category)
    });
}

async function deleteCategoryAPI(id) {
    return apiRequest(`/categories/${id}`, {
        method: 'DELETE'
    });
}

// Hairdressers API
async function getHairdressersAPI() {
    return apiRequest('/hairdressers');
}

async function getHairdresserAPI(id) {
    return apiRequest(`/hairdressers/${id}`);
}

// Appointments API
async function getAppointmentsAPI() {
    return apiRequest('/appointments');
}

async function getAllAppointmentsAPI() {
    return apiRequest('/appointments/all');
}

async function createAppointmentAPI(appointment) {
    return apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointment)
    });
}

async function cancelAppointmentAPI(id) {
    return apiRequest(`/appointments/${id}/cancel`, {
        method: 'PUT'
    });
}

// Available Slots API
async function getAvailableSlotsAPI(hairdresserId, serviceId, date) {
    const dateStr = date.toISOString().split('T')[0];
    return apiRequest(`/available-slots?hairdresserId=${hairdresserId}&serviceId=${serviceId}&date=${dateStr}`);
}

// Analytics API
async function getAnalyticsAPI() {
    return apiRequest('/analytics');
}
