import { apiRequest } from './config.js';

// ===================== CLIENTES CRUD =====================

export const clientesAPI = {
    getById: (id) => apiRequest(`/Cliente/${id}`),
    getByID: (id) => apiRequest(`/Cliente/${id}`),
    create: (clienteData) => apiRequest('/Cliente', {
        method: 'POST',
        body: JSON.stringify({
            ...clienteData,
            ativo: true
        })
    }),
    update: (id, clienteData) => apiRequest(`/Cliente/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clienteData)
    }),
    delete: (id) => apiRequest(`/Cliente/${id}`, { method: 'DELETE' })
};