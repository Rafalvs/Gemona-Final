/**
 * Utilitários para validação de formulários
 */

/**
 * Valida formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - True se válido
 */
export const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida CPF (11 dígitos)
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - True se válido
 */
export const validarCPF = (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
};

/**
 * Valida CNPJ (14 dígitos)
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - True se válido
 */
export const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return cnpjLimpo.length === 14;
};

/**
 * Valida CEP (8 dígitos)
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} - True se válido
 */
export const validarCEP = (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
};

/**
 * Valida telefone (10 ou 11 dígitos)
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} - True se válido
 */
export const validarTelefone = (telefone) => {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
};

/**
 * Valida senha (mínimo 6 caracteres)
 * @param {string} senha - Senha a ser validada
 * @returns {boolean} - True se válida
 */
export const validarSenha = (senha) => {
    return senha && senha.length >= 6;
};

/**
 * Remove caracteres não numéricos
 * @param {string} value - Valor a ser limpo
 * @returns {string} - Valor apenas com números
 */
export const apenasNumeros = (value) => {
    return value.replace(/\D/g, '');
};

/**
 * Formata telefone para exibição
 * @param {string} telefone - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
export const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    const limpo = apenasNumeros(telefone);
    
    if (limpo.length === 10) {
        // Formato: (11) 1234-5678
        return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 6)}-${limpo.substring(6)}`;
    } else if (limpo.length === 11) {
        // Formato: (11) 91234-5678
        return `(${limpo.substring(0, 2)}) ${limpo.substring(2, 7)}-${limpo.substring(7)}`;
    }
    
    return telefone; // Retorna como está se não conseguir formatar
};

/**
 * Valida se campo está preenchido (não vazio)
 * @param {string} value - Valor a ser validado
 * @returns {boolean} - True se preenchido
 */
export const campoObrigatorio = (value) => {
    return value && value.trim().length > 0;
};

/**
 * Valida formulário de registro
 * @param {object} formData - Dados do formulário
 * @returns {object} - Objeto com erros encontrados
 */
export const validarFormularioRegistro = (formData) => {
    const erros = {};

    if (!campoObrigatorio(formData.nome)) {
        erros.nome = 'Nome é obrigatório';
    }

    if (!campoObrigatorio(formData.email)) {
        erros.email = 'Email é obrigatório';
    } else if (!validarEmail(formData.email)) {
        erros.email = 'Email inválido';
    }

    if (!campoObrigatorio(formData.senha)) {
        erros.senha = 'Senha é obrigatória';
    } else if (!validarSenha(formData.senha)) {
        erros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!campoObrigatorio(formData.cpf)) {
        erros.cpf = 'CPF é obrigatório';
    } else if (!validarCPF(formData.cpf)) {
        erros.cpf = 'CPF inválido';
    }

    if (!campoObrigatorio(formData.cep)) {
        erros.cep = 'CEP é obrigatório';
    } else if (!validarCEP(formData.cep)) {
        erros.cep = 'CEP inválido';
    }

    if (!campoObrigatorio(formData.telefone)) {
        erros.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(formData.telefone)) {
        erros.telefone = 'Telefone inválido (10 ou 11 dígitos)';
    }

    if (!formData.tipoUsuario) {
        erros.tipoUsuario = 'Selecione o tipo de usuário';
    }

    return erros;
};

/**
 * Valida formulário de login
 * @param {object} formData - Dados do formulário
 * @returns {object} - Objeto com erros encontrados
 */
export const validarFormularioLogin = (formData) => {
    const erros = {};

    if (!campoObrigatorio(formData.email)) {
        erros.email = 'Email é obrigatório';
    } else if (!validarEmail(formData.email)) {
        erros.email = 'Email inválido';
    }

    if (!campoObrigatorio(formData.senha)) {
        erros.senha = 'Senha é obrigatória';
    }

    return erros;
};

/**
 * Valida formulário de estabelecimento
 * @param {object} formData - Dados do formulário
 * @returns {object} - Objeto com erros encontrados
 */
export const validarFormularioEstabelecimento = (formData) => {
    const erros = {};

    if (!campoObrigatorio(formData.nome)) {
        erros.nome = 'Nome do estabelecimento é obrigatório';
    }

    if (!campoObrigatorio(formData.cnpj)) {
        erros.cnpj = 'CNPJ é obrigatório';
    } else if (!validarCNPJ(formData.cnpj)) {
        erros.cnpj = 'CNPJ inválido (deve ter 14 dígitos)';
    }

    if (!campoObrigatorio(formData.rua)) {
        erros.rua = 'Rua é obrigatória';
    }

    if (!campoObrigatorio(formData.numero)) {
        erros.numero = 'Número é obrigatório';
    }

    if (!campoObrigatorio(formData.bairro)) {
        erros.bairro = 'Bairro é obrigatório';
    }

    if (!campoObrigatorio(formData.cidade)) {
        erros.cidade = 'Cidade é obrigatória';
    }

    if (!campoObrigatorio(formData.estado)) {
        erros.estado = 'Estado é obrigatório';
    }

    if (!campoObrigatorio(formData.cep)) {
        erros.cep = 'CEP é obrigatório';
    } else if (!validarCEP(formData.cep)) {
        erros.cep = 'CEP inválido (deve ter 8 dígitos)';
    }

    return erros;
};