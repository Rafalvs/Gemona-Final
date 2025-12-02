import { apiRequest } from './config.js';

export const subcategoriasAPI = {
    getAll: () => apiRequest('/SubCategoria'),
    getById: (id) => apiRequest(`/SubCategoria/${id}`),
    getServicos: (id) => apiRequest(`/SubCategoria/${id}/servicos`),
    getByCategoria: (categoriaId) => apiRequest(`/SubCategoria/categoria/${categoriaId}`)
};