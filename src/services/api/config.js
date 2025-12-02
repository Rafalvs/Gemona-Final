// API Configuration
// Base URL da API (Usando o proxy configurado no Vite)
export const API_BASE_URL = '/api';

// Configuração padrão para requisições
export const defaultHeaders = {
    'Content-Type': 'application/json',
};

// Função auxiliar para fazer requisições
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Recuperar token do localStorage
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            ...defaultHeaders,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            // Tentar ler o erro da API se possível
            try {
                const errorData = await response.json();
                
                // Extrair mensagens de erro do FluentValidation
                if (errorData.errors) {
                    const errorMessages = Object.entries(errorData.errors)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('; ');
                    throw new Error(errorMessages || `HTTP error! status: ${response.status}`);
                }
                
                throw new Error(errorData.message || errorData.title || errorData.error || `HTTP error! status: ${response.status}`);
            } catch (e) {
                // Se o erro já foi lançado pelo bloco acima, re-lançar
                if (e.message && !e.message.includes('JSON')) {
                    throw e;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        
        // Verificar se há conteúdo na resposta (DELETE geralmente retorna 204 No Content)
        const contentLength = response.headers.get('content-length');
        if (contentLength === '0' || response.status === 204) {
            return { success: true, data: null };
        }
        
        // Tentar fazer parse do JSON
        const text = await response.text();
        if (!text) {
            return { success: true, data: null };
        }
        
        const responseData = JSON.parse(text);
        
        // Se a API já retorna o formato { success: true, data: ... }
        if (responseData.success !== undefined) {
            return responseData;
        }

        return { success: true, data: responseData };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
