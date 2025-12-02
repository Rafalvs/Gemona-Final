import { apiRequest } from './config.js';

// ===================== CATEGORIAS CRUD =====================

export const categoriasAPI = {
    getAll: () => apiRequest('/Categoria'),
    getById: (id) => apiRequest(`/Categoria/${id}`),
    getSubcategorias: (id) => apiRequest(`/Categoria/${id}/subcategorias`)
};
