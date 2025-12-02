import { apiRequest } from './config.js';

// ===================== PROFISSIONAIS CRUD =====================

export const profissionaisAPI = {
    getAll: () => apiRequest('/Profissional'),
    getById: (id) => apiRequest(`/Profissional/${id}`),
    create: (profissionalData) => apiRequest('/Profissional', {
        method: 'POST',
        body: JSON.stringify({
            ...profissionalData,
            ativo: true
        })
    }),
    update: (id, profissionalData) => apiRequest(`/Profissional/${id}`, {
        method: 'PUT',
        body: JSON.stringify(profissionalData)
    }),
    patch: (id, partialData) => apiRequest(`/Profissional/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/Profissional/${id}`, { method: 'DELETE' }),
    getByEmail: async (email) => {
        const result = await apiRequest(`/Profissional?email=${email}`);
        return result.success ? { ...result, data: result.data[0] || null } : result;
    }
};