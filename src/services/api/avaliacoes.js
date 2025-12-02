import { apiRequest } from './config.js';

// ===================== AVALIAÇÕES CRUD =====================

export const avaliacoesAPI = {
    getAll: () => apiRequest('/Avaliacao'),
    getById: (id) => apiRequest(`/Avaliacao/${id}`),
    create: (avaliacaoData) => apiRequest('/Avaliacao', {
        method: 'POST',
        body: JSON.stringify(avaliacaoData)
    }),
    update: (id, avaliacaoData) => apiRequest(`/Avaliacao/${id}`, {
        method: 'PUT',
        body: JSON.stringify(avaliacaoData)
    }),
    delete: (id) => apiRequest(`/Avaliacao/${id}`, { method: 'DELETE' }),
    getByCliente: (clienteId) => apiRequest(`/Avaliacao/cliente/${clienteId}`),
    getByEstabelecimento: (estabelecimentoId) => apiRequest(`/Avaliacao/estabelecimento/${estabelecimentoId}`),
    getByNota: (nota) => apiRequest(`/Avaliacao/nota/${nota}`),
    getMediaEstabelecimento: (estabelecimentoId) => apiRequest(`/Avaliacao/estabelecimento/${estabelecimentoId}/media`),
    filtrar: (filtros) => apiRequest('/Avaliacao/filtrar', {
        method: 'POST',
        body: JSON.stringify(filtros)
    }),
    // Método auxiliar para buscar avaliações por serviço
    // Como a API não tem endpoint direto, busca todas e filtra localmente
    getByServico: async (servicoId) => {
        try {
            const result = await apiRequest('/Avaliacao');
            if (result.success && result.data) {
                // Filtrar avaliações do serviço específico
                const filtradas = result.data.filter(a => 
                    (a.servicoId || a.servico_id) === servicoId
                );
                return { success: true, data: filtradas };
            }
            return { success: false, data: [], error: result.error };
        } catch (error) {
            return { success: false, data: [], error: error.message };
        }
    },
    getByServicoAndCliente: async (servicoId, clienteId) => {
        try {
            const result = await apiRequest('/Avaliacao');
            if (result.success && result.data) {
                // Filtrar avaliações do serviço e cliente específicos
                const filtradas = result.data.filter(a => 
                    (a.servicoId || a.servico_id) === servicoId &&
                    (a.clienteId || a.cliente_id) === clienteId
                );
                return { success: true, data: filtradas, exists: filtradas.length > 0 };
            }
            return { success: false, data: [], exists: false, error: result.error };
        } catch (error) {
            return { success: false, data: [], exists: false, error: error.message };
        }
    },
    getByPedido: (pedidoId) => apiRequest(`/Avaliacao/pedido/${pedidoId}`),
};
