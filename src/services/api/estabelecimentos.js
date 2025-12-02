import { apiRequest } from './config.js';

// ===================== ESTABELECIMENTOS CRUD =====================

export const estabelecimentosAPI = {
    getAll: () => apiRequest('/Estabelecimento'),
    getById: (id) => apiRequest(`/Estabelecimento/${id}`),
    create: (estabelecimentoData) => apiRequest('/Estabelecimento', {
        method: 'POST',
        body: JSON.stringify(estabelecimentoData)
    }),
    update: (id, estabelecimentoData) => apiRequest(`/Estabelecimento/${id}`, {
        method: 'PUT',
        body: JSON.stringify(estabelecimentoData)
    }),
    patch: (id, partialData) => apiRequest(`/Estabelecimento/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/Estabelecimento/${id}`, { method: 'DELETE' }),
    getByProfissional: (profissionalId) => apiRequest(`/Estabelecimento/profissional/${profissionalId}`),
    getEstabelecimentosProximos: (latitude, longitude, distanciaKm) => {
        return apiRequest(`/Estabelecimento/proximos?latitude=${latitude}&longitude=${longitude}&raioKm=${distanciaKm}`);
    }
};
