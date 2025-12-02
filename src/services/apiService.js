// API Service - CRUD Operations
// Este arquivo mantém compatibilidade com o código existente
// Re-exporta todos os módulos da pasta api/

// Re-exportar todos os módulos da API
export {
    categoriasAPI,
    subcategoriasAPI,
    clientesAPI,
    profissionaisAPI,
    estabelecimentosAPI,
    servicosAPI,
    pedidosAPI,
    enderecosAPI,
    avaliacoesAPI,
    imagensAPI,
    authAPI,
    checkAPIConnection,
    searchAll
} from './api/index.js';

// Export default para compatibilidade com imports antigos
import apiModule from './api/index.js';
export default apiModule;