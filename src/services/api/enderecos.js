import { apiRequest } from './config.js';

// ===================== ENDEREÇOS CRUD =====================

export const enderecosAPI = {
    getByCep: (cep) => apiRequest('/Endereco/buscar-por-cep', {
        method: 'POST',
        body: JSON.stringify({ cep })
    })
};