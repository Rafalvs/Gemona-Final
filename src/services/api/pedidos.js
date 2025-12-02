import { apiRequest } from './config.js';

// ===================== PEDIDOS CRUD =====================

export const pedidosAPI = {
    getAll: () => apiRequest('/Pedido'),
    getById: (id) => apiRequest(`/Pedido/${id}`),
    create: (pedidoData) => apiRequest('/Pedido', {
        method: 'POST',
        body: JSON.stringify({
            ...pedidoData,
            status: pedidoData.status || 'PENDENTE'
        })
    }),
    update: (id, pedidoData) => apiRequest(`/Pedido/${id}`, {
        method: 'PUT',
        body: JSON.stringify(pedidoData)
    }),
    patch: (id, partialData) => apiRequest(`/Pedido/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/Pedido/${id}`, { method: 'DELETE' }),
    updateStatus: (id, status) => apiRequest(`/Pedido/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    }),
    getByCliente: (clienteId) => apiRequest(`/Pedido/cliente/${clienteId}`),
    getByEstabelecimento: (estabelecimentoId) => apiRequest(`/Pedido/estabelecimento/${estabelecimentoId}`),
    getByStatus: (status) => apiRequest(`/Pedido?status=${status}`)
};
