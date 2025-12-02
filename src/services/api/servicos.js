import { apiRequest } from './config.js';

// ===================== SERVIÇOS CRUD =====================

export const servicosAPI = {
    getAll: () => apiRequest('/Servico'),
    getById: (id) => apiRequest(`/Servico/${id}`),
    create: (servicoData) => apiRequest('/Servico', {
        method: 'POST',
        body: JSON.stringify(servicoData)
    }),
    update: (id, servicoData) => apiRequest(`/Servico/${id}`, {
        method: 'PUT',
        body: JSON.stringify(servicoData)
    }),
    patch: (id, partialData) => apiRequest(`/Servico/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/Servico/${id}`, { method: 'DELETE' }),
    getByEstabelecimento: (estabelecimentoId) => apiRequest(`/Servico/estabelecimento/${estabelecimentoId}`),
    getBySubCategoria: (subCategoriaId) => apiRequest(`/Servico/subcategoria/${subCategoriaId}`)
};