import { apiRequest, API_BASE_URL } from './config.js';

export const imagensAPI = {
    /**
     * Retorna a URL completa para exibir a imagem no frontend
     * @param {string} blobName - Nome do blob retornado pela API (ex: "a1b2c3d4-5678-90ab-cdef-123456789abc_foto.jpg")
     * @returns {string|null} URL completa da imagem ou null se blobName vazio
     * @example
     * const url = imagensAPI.getImageUrl(profissional.imagemPerfilUrl);
     * // Retorna: "/api/image/a1b2c3d4-5678-90ab-cdef-123456789abc_foto.jpg"
     * // Uso: <img src={url} alt="Foto de perfil" />
     */
    getImageUrl: (blobName) => {
        if (!blobName) return null;
        return `${API_BASE_URL}/image/${encodeURIComponent(blobName)}`;
    },
    
    /**
     * Busca os metadados da imagem (retorna o stream da imagem)
     * GET /api/image/{blobName}
     * @param {string} blobName - Nome do blob
     * @returns {Promise} Promise com os dados da imagem
     */
    getById: (blobName) => apiRequest(`/image/${blobName}`),
    
    /**
     * Deleta uma imagem do Azure Blob Storage
     * DELETE /api/image/{blobName}
     * Requer autenticação (Admin ou Profissional)
     * @param {string} blobName - Nome do blob a ser deletado
     * @returns {Promise} Promise com resultado da deleção
     */
    delete: (blobName) => apiRequest(`/image/${blobName}`, { 
        method: 'DELETE' 
    })
};
