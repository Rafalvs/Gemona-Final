// API Service - Central Export
// Exporta todas as APIs de forma modular

export { categoriasAPI } from './categorias.js';
export { subcategoriasAPI } from './subcategorias.js';
export { clientesAPI} from './clientes.js';
export { profissionaisAPI } from './profissionais.js';
export { estabelecimentosAPI } from './estabelecimentos.js';
export { servicosAPI } from './servicos.js';
export { pedidosAPI } from './pedidos.js';
export { enderecosAPI } from './enderecos.js';
export { avaliacoesAPI } from './avaliacoes.js';
export { authAPI } from './auth.js';
export { imagensAPI } from './imagens.js';
export { checkAPIConnection, searchAll } from './utils.js';

// Export default para compatibilidade
export default {
    categoriasAPI: async () => (await import('./categorias.js')).categoriasAPI,
    subcategoriasAPI: async () => (await import('./subcategorias.js')).subcategoriasAPI,
    profissionaisAPI: async () => (await import('./profissionais.js')).profissionaisAPI,
    estabelecimentosAPI: async () => (await import('./estabelecimentos.js')).estabelecimentosAPI,
    clientesAPI: async () => (await import('./clientes.js')).clientesAPI,
    servicosAPI: async () => (await import('./servicos.js')).servicosAPI,
    pedidosAPI: async () => (await import('./pedidos.js')).pedidosAPI,
    enderecosAPI: async () => (await import('./enderecos.js')).enderecosAPI,
    avaliacoesAPI: async () => (await import('./avaliacoes.js')).avaliacoesAPI,
    imagensAPI: async () => (await import('./imagens.js')).imagensAPI,
    authAPI: async () => (await import('./auth.js')).authAPI,
    checkAPIConnection: async () => (await import('./utils.js')).checkAPIConnection,
    searchAll: async () => (await import('./utils.js')).searchAll
};
