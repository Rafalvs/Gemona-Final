// API Service - CRUD Operations com JSON Server
// Base URL da API (JSON Server rodando na porta 3001)
const API_BASE_URL = 'http://localhost:3001';

// Configuração padrão para requisições
const defaultHeaders = {
    'Content-Type': 'application/json',
};

// Função auxiliar para fazer requisições
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`; // URL com endpoint usando parametro
    const config = {
        headers: defaultHeaders,
        ...options,
    };

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('API Request Error:', error);
        return { success: false, error: error.message };
    }
};

// ===================== CATEGORIAS CRUD =====================

export const categoriasAPI = {
    getAll: () => apiRequest('/categorias'),
    getById: (id) => apiRequest(`/categorias/${id}`),
    create: (categoryData) => apiRequest('/categorias', {
        method: 'POST',
        body: JSON.stringify(categoryData)
    }),
    update: (id, categoryData) => apiRequest(`/categorias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
    }),
    patch: (id, partialData) => apiRequest(`/categorias/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/categorias/${id}`, { method: 'DELETE' })
};

// ===================== USUÁRIOS CRUD =====================

export const usuariosAPI = {
    getAll: () => apiRequest('/usuarios'),
    getById: (id) => apiRequest(`/usuarios/${id}`),
    create: (userData) => apiRequest('/usuarios', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    update: (id, userData) => apiRequest(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    }),
    patch: (id, partialData) => apiRequest(`/usuarios/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/usuarios/${id}`, { method: 'DELETE' }),
    getByEmail: async (email) => {
        const result = await apiRequest(`/usuarios?email=${email}`);
        return result.success ? { ...result, data: result.data[0] || null } : result;
    }
};

// ===================== PROFISSIONAIS CRUD =====================

export const profissionaisAPI = {
    getAll: () => apiRequest('/profissionais'),
    getById: (id) => apiRequest(`/profissionais/${id}`),
    create: (profissionalData) => apiRequest('/profissionais', {
        method: 'POST',
        body: JSON.stringify({
            ...profissionalData,
            ativo: true
        })
    }),
    update: (id, profissionalData) => apiRequest(`/profissionais/${id}`, {
        method: 'PUT',
        body: JSON.stringify(profissionalData)
    }),
    patch: (id, partialData) => apiRequest(`/profissionais/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/profissionais/${id}`, { method: 'DELETE' }),
    getByEmail: async (email) => {
        const result = await apiRequest(`/profissionais?email=${email}`);
        return result.success ? { ...result, data: result.data[0] || null } : result;
    }
};

// ===================== ESTABELECIMENTOS CRUD =====================

export const estabelecimentosAPI = {
    getAll: () => apiRequest('/estabelecimentos'),
    getById: (id) => apiRequest(`/estabelecimentos/${id}`),
    create: (estabelecimentoData) => apiRequest('/estabelecimentos', {
        method: 'POST',
        body: JSON.stringify(estabelecimentoData)
    }),
    update: (id, estabelecimentoData) => apiRequest(`/estabelecimentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(estabelecimentoData)
    }),
    patch: (id, partialData) => apiRequest(`/estabelecimentos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/estabelecimentos/${id}`, { method: 'DELETE' }),
    getByProfissional: (profissionalId) => apiRequest(`/estabelecimentos?profissional_id=${profissionalId}`)
};

// ===================== CLIENTES CRUD =====================

export const clientesAPI = {
    getAll: () => apiRequest('/clientes'),
    getById: (id) => apiRequest(`/clientes/${id}`),
    create: (clienteData) => apiRequest('/clientes', {
        method: 'POST',
        body: JSON.stringify({
            ...clienteData,
            ativo: true
        })
    }),
    update: (id, clienteData) => apiRequest(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clienteData)
    }),
    patch: (id, partialData) => apiRequest(`/clientes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/clientes/${id}`, { method: 'DELETE' }),
    getByEmail: async (email) => {
        const result = await apiRequest(`/clientes?email=${email}`);
        return result.success ? { ...result, data: result.data[0] || null } : result;
    }
};

// ===================== SERVIÇOS CRUD =====================

export const servicosAPI = {
    getAll: () => apiRequest('/servicos'),
    getById: (id) => apiRequest(`/servicos/${id}`),
    create: (servicoData) => apiRequest('/servicos', {
        method: 'POST',
        body: JSON.stringify(servicoData)
    }),
    update: (id, servicoData) => apiRequest(`/servicos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(servicoData)
    }),
    patch: (id, partialData) => apiRequest(`/servicos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/servicos/${id}`, { method: 'DELETE' }),
    getByEstabelecimento: (estabelecimentoId) => apiRequest(`/servicos?estabelecimento_id=${estabelecimentoId}`),
    getBySubCategoria: (subCategoriaId) => apiRequest(`/servicos?sub_categoria_id=${subCategoriaId}`)
};

// ===================== SERVIÇOS MAIS PROCURADOS CRUD =====================

export const servicosMaisProcuradosAPI = {
    getAll: () => apiRequest('/servicos_mais_procurados'),
    getById: (id) => apiRequest(`/servicos_mais_procurados/${id}`),
    create: (servicoData) => apiRequest('/servicos_mais_procurados', {
        method: 'POST',
        body: JSON.stringify(servicoData)
    }),
    update: (id, servicoData) => apiRequest(`/servicos_mais_procurados/${id}`, {
        method: 'PUT',
        body: JSON.stringify(servicoData)
    }),
    patch: (id, partialData) => apiRequest(`/servicos_mais_procurados/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/servicos_mais_procurados/${id}`, { method: 'DELETE' }),
    search: (query) => apiRequest(`/servicos_mais_procurados?q=${encodeURIComponent(query)}`)
};

// ===================== PEDIDOS CRUD =====================

export const pedidosAPI = {
    getAll: () => apiRequest('/pedidos'),
    getById: (id) => apiRequest(`/pedidos/${id}`),
    create: (pedidoData) => apiRequest('/pedidos', {
        method: 'POST',
        body: JSON.stringify({
            ...pedidoData,
            status: pedidoData.status || 'PENDENTE'
        })
    }),
    update: (id, pedidoData) => apiRequest(`/pedidos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(pedidoData)
    }),
    patch: (id, partialData) => apiRequest(`/pedidos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/pedidos/${id}`, { method: 'DELETE' }),
    getByCliente: (clienteId) => apiRequest(`/pedidos?cliente_id=${clienteId}`),
    getByStatus: (status) => apiRequest(`/pedidos?status=${status}`)
};

// ===================== ENDEREÇOS CRUD =====================

export const enderecosAPI = {
    getAll: () => apiRequest('/enderecos'),
    getById: (id) => apiRequest(`/enderecos/${id}`),
    create: (enderecoData) => apiRequest('/enderecos', {
        method: 'POST',
        body: JSON.stringify({
            ...enderecoData,
            ativo: 1
        })
    }),
    update: (id, enderecoData) => apiRequest(`/enderecos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(enderecoData)
    }),
    patch: (id, partialData) => apiRequest(`/enderecos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/enderecos/${id}`, { method: 'DELETE' }),
    getByCep: (cep) => apiRequest(`/enderecos?cep=${cep}`)
};

// ===================== AVALIAÇÕES CRUD =====================

export const avaliacoesAPI = {
    getAll: () => apiRequest('/avaliacoes'),
    getById: (id) => apiRequest(`/avaliacoes/${id}`),
    create: (avaliacaoData) => apiRequest('/avaliacoes', {
        method: 'POST',
        body: JSON.stringify(avaliacaoData)
    }),
    update: (id, avaliacaoData) => apiRequest(`/avaliacoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(avaliacaoData)
    }),
    patch: (id, partialData) => apiRequest(`/avaliacoes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/avaliacoes/${id}`, { method: 'DELETE' }),
    getByPedido: (pedidoId) => apiRequest(`/avaliacoes?pedido_id=${pedidoId}`),
    getByCliente: (clienteId) => apiRequest(`/avaliacoes?cliente_id=${clienteId}`)
};

// ===================== CONTRATOS CRUD =====================

export const contratosAPI = {
    getAll: () => apiRequest('/contratos'),
    getById: (id) => apiRequest(`/contratos/${id}`),
    create: (contratoData) => apiRequest('/contratos', {
        method: 'POST',
        body: JSON.stringify({
            ...contratoData,
            data_contrato: new Date().toISOString(),
            status: 'ativo'
        })
    }),
    update: (id, contratoData) => apiRequest(`/contratos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contratoData)
    }),
    patch: (id, partialData) => apiRequest(`/contratos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData)
    }),
    delete: (id) => apiRequest(`/contratos/${id}`, { method: 'DELETE' }),
    getByUsuario: (usuarioId) => apiRequest(`/contratos?usuario_id=${usuarioId}`),
    getByServico: (servicoId) => apiRequest(`/contratos?servico_id=${servicoId}`),
    checkExistingContract: async (usuarioId, servicoId) => {
        const result = await apiRequest(`/contratos?usuario_id=${usuarioId}&servico_id=${servicoId}`);
        return result.success ? { ...result, exists: result.data.length > 0 } : result;
    }
};

// ===================== FUNÇÕES AUXILIARES =====================

// Verificar conexão com a API
export const checkAPIConnection = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias?_limit=1`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Busca geral em múltiplas tabelas
export const searchAll = async (query) => {
    const endpoints = [
        '/categorias',
        '/usuarios', 
        '/profissionais',
        '/estabelecimentos',
        '/clientes',
        '/servicos',
        '/servicos_mais_procurados'
    ];
    
    const promises = endpoints.map(endpoint => 
        apiRequest(`${endpoint}?q=${encodeURIComponent(query)}`)
    );
    
    const results = await Promise.all(promises);
    
    return {
        categorias: results[0].success ? results[0].data : [],
        usuarios: results[1].success ? results[1].data : [],
        profissionais: results[2].success ? results[2].data : [],
        estabelecimentos: results[3].success ? results[3].data : [],
        clientes: results[4].success ? results[4].data : [],
        servicos: results[5].success ? results[5].data : [],
        servicosMaisProcurados: results[6].success ? results[6].data : [],
        contratos: results[7] ? (results[7].success ? results[7].data : []) : []
    };
};

export default {
    categoriasAPI,
    usuariosAPI,
    profissionaisAPI,
    estabelecimentosAPI,
    clientesAPI,
    servicosAPI,
    servicosMaisProcuradosAPI,
    pedidosAPI,
    enderecosAPI,
    avaliacoesAPI,
    contratosAPI,
    checkAPIConnection,
    searchAll
};