import { apiRequest } from './config.js';

// ===================== AUTH CRUD =====================

export const authAPI = {
    login: (credentials) => apiRequest('/Auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    validate: (token) => apiRequest('/Auth/validate', {
        method: 'POST',
        body: JSON.stringify({ token })
    }),
    refresh: (refreshToken) => apiRequest('/Auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
    })
};
