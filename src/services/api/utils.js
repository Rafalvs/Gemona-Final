import { API_BASE_URL, apiRequest } from './config.js';

// ===================== FUNÇÕES AUXILIARES =====================

// Verificar conexão com a API
export const checkAPIConnection = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/Categoria?_limit=1`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Busca geral em múltiplas tabelas
export const searchAll = async (query) => {
    const endpoints = [
        '/Categoria',
        '/Cliente', 
        '/Profissional',
        '/Estabelecimento',
        '/Servico'
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
