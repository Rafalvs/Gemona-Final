import { useState, useEffect } from 'react';
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { estabelecimentosAPI, enderecosAPI, imagensAPI } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import '../../styles/EditCompany.css';

export default function EditCompany() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [estabelecimentoId, setEstabelecimentoId] = useState(null);
    const [enderecoId, setEnderecoId] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // Estados adicionais
    const [imagemPreview, setImagemPreview] = useState(null);
    const [imagemBase64, setImagemBase64] = useState(null);
    const [imagemAtual, setImagemAtual] = useState(null);

    // Estado inicial do formulário
    const initialState = {
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        descricao: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        complemento: '',
        latitude: 0,
        longitude: 0
    };

    // Usar o hook personalizado
    const {
        formData,
        errors,
        loading,
        message,
        handleInputChange,
        validateForm,
        setFormMessage,
        setFormLoading,
        setFormData
    } = useForm(initialState);

    // Carregar dados existentes
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadExistingData();
        }
    }, [isAuthenticated, user]);

    const loadExistingData = async () => {
        try {
            setLoadingData(true);
            
            // Buscar estabelecimento do usuário
            const resultadoEstabelecimentos = await estabelecimentosAPI.getByProfissional(user.id);
            
            if (resultadoEstabelecimentos.success && resultadoEstabelecimentos.data.length > 0) {
                const estabelecimento = resultadoEstabelecimentos.data[0];
                setEstabelecimentoId(estabelecimento.estabelecimentoId);
                
                // Carregar imagem atual
                if (estabelecimento.imagemEstabelecimentoUrl) {
                    const urlImagem = imagensAPI.getImageUrl(estabelecimento.imagemEstabelecimentoUrl);
                    setImagemAtual(urlImagem);
                }
                
                // Preencher formulário com dados existentes (endereço já vem junto)
                setFormData({
                    nome: estabelecimento.nome || '',
                    cnpj: estabelecimento.cnpj || '',
                    telefone: estabelecimento.telefone || '',
                    email: estabelecimento.email || '',
                    descricao: estabelecimento.descricao || '',
                    rua: estabelecimento.endereco?.rua || '',
                    numero: estabelecimento.endereco?.numero || '',
                    bairro: estabelecimento.endereco?.bairro || '',
                    cidade: estabelecimento.endereco?.cidade || '',
                    estado: estabelecimento.endereco?.estado || '',
                    cep: estabelecimento.endereco?.cep || '',
                    complemento: estabelecimento.endereco?.complemento || '',
                    latitude: estabelecimento.endereco?.latitude || 0,
                    longitude: estabelecimento.endereco?.longitude || 0
                });
            } else {
                setFormMessage('❌ Nenhum estabelecimento encontrado para editar');
                setTimeout(() => navigate('/newCompany'), 2000);
            }
        } catch (error) {
            setFormMessage(`❌ Erro ao carregar dados: ${error.message}`);
        } finally {
            setLoadingData(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            setFormMessage('❌ Por favor, selecione apenas arquivos de imagem');
            setTimeout(() => setFormMessage(''), 3000);
            return;
        }

        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setFormMessage('❌ A imagem deve ter no máximo 5MB');
            setTimeout(() => setFormMessage(''), 3000);
            return;
        }

        // Criar preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagemPreview(reader.result);
            // Extrair apenas a parte Base64 (remover o prefixo data:image/...)
            const base64String = reader.result.split(',')[1];
            setImagemBase64({
                fileName: file.name,
                contentType: file.type,
                base64Data: base64String
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagemPreview(null);
        setImagemBase64(null);
        const inputFile = document.getElementById('imagemInput');
        if (inputFile) inputFile.value = '';
    };

    const handleCepBlur = async () => {
        const cepLimpo = formData.cep.replace(/\D/g, '');
        
        if (cepLimpo.length !== 8) {
            return;
        }

        try {
            setFormMessage('🔍 Buscando endereço...');
            const resultado = await enderecosAPI.getByCep(cepLimpo);
            
            if (resultado.success && resultado.data) {
                setFormData(prev => ({
                    ...prev,
                    rua: resultado.data.rua || '',
                    bairro: resultado.data.bairro || '',
                    cidade: resultado.data.cidade || '',
                    estado: resultado.data.estado || '',
                    latitude: resultado.data.latitude || 0,
                    longitude: resultado.data.longitude || 0
                }));
                setFormMessage('✅ Endereço encontrado!');
                setTimeout(() => setFormMessage(''), 2000);
            } else {
                setFormMessage('❌ CEP não encontrado');
                setTimeout(() => setFormMessage(''), 3000);
            }
        } catch (error) {
            setFormMessage('❌ Erro ao buscar CEP');
            setTimeout(() => setFormMessage(''), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setFormMessage('❌ Por favor, corrija os erros no formulário');
            return;
        }

        if (!estabelecimentoId) {
            setFormMessage('❌ Erro: dados do estabelecimento não encontrados');
            return;
        }

        setFormLoading(true);
        setFormMessage('');

        try {
            // Atualizar estabelecimento (endereço junto)
            const dadosAtualizacao = {
                nome: formData.nome.trim(),
                cnpj: formData.cnpj.replace(/\D/g, ''),
                telefone: formData.telefone.trim(),
                email: formData.email.trim(),
                descricao: formData.descricao.trim(),
                rua: formData.rua.trim(),
                numero: formData.numero.trim(),
                bairro: formData.bairro.trim(),
                cidade: formData.cidade.trim(),
                estado: formData.estado.trim().toUpperCase(),
                cep: formData.cep.replace(/\D/g, ''),
                complemento: formData.complemento.trim(),
                latitude: formData.latitude,
                longitude: formData.longitude,
                imagemEstabelecimento: imagemBase64 || null
            };

            const resultado = await estabelecimentosAPI.update(estabelecimentoId, dadosAtualizacao);

            if (resultado.success) {
                setFormMessage('✅ Dados da empresa atualizados com sucesso!');
                
                // Redirecionar para o perfil da empresa após 2 segundos
                setTimeout(() => {
                    navigate('/companyProfile');
                }, 2000);
            } else {
                setFormMessage(`❌ Erro ao atualizar estabelecimento: ${resultado.error || resultado.message}`);
            }
        } catch (error) {
            setFormMessage(`❌ Erro: ${error.message}`);
        } finally {
            setFormLoading(false);
        }
    };

    // Verificar se usuário está autenticado e é PJ
    if (!isAuthenticated) {
        return (
            <Layout>
                <main>
                    <h1>Você precisa estar logado para editar a empresa</h1>
                    <Link to="/login">
                        <button>🔑 Fazer Login</button>
                    </Link>
                </main>
            </Layout>
        );
    }

    if (user?.tipo_usuario !== 'profissional') {
        return (
            <Layout>
                <main>
                    <h1>Acesso restrito a Profissionais</h1>
                    <p>Esta página é exclusiva para usuários profissionais.</p>
                    <Link to="/profile">
                        <button>👤 Ir para Perfil Pessoal</button>
                    </Link>
                </main>
            </Layout>
        );
    }

    if (loadingData) {
        return (
            <Layout>
                <main>
                    <div className="edit-company-container">
                        <p>⏳ Carregando dados para edição...</p>
                    </div>
                </main>
            </Layout>
        );
    }

    return (
        <Layout>
            <main>
                <form className="form-center" onSubmit={handleSubmit}>
                    <h2 className="edit-company-title">
                        ✏️ Editar Dados da Empresa
                    </h2>

                    {/* Mensagem de feedback */}
                    {message && (
                        <div className={`feedback-message ${message.includes('✅') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Seção: Dados do Estabelecimento */}
                    <h3 className="section-title">📋 Dados do Estabelecimento</h3>
                    
                    <div className="form-group">
                        <label htmlFor="nomeInput">Nome do Estabelecimento *</label>
                        <input 
                            name="nomeInput" 
                            id="nomeInput" 
                            type="text" 
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={errors.nome ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="Ex: Salão Beleza Pura"
                        />
                        {errors.nome && (
                            <span className="error-text">
                                {errors.nome}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cnpjInput">CNPJ *</label>
                        <input 
                            name="cnpjInput" 
                            id="cnpjInput" 
                            type="text" 
                            value={formData.cnpj}
                            onChange={(e) => handleInputChange('cnpj', e.target.value)}
                            className={errors.cnpj ? 'input-error' : ''}
                            disabled={true}
                            placeholder="00.000.000/0000-00"
                        />
                        {errors.cnpj && (
                            <span className="error-text">
                                {errors.cnpj}
                            </span>
                        )}
                        <small style={{ color: '#999', fontSize: '12px' }}>O CNPJ não pode ser alterado</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefoneInput">Telefone</label>
                        <input 
                            name="telefoneInput" 
                            id="telefoneInput" 
                            type="text" 
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            disabled={loading}
                            placeholder="(11) 98765-4321"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="emailInput">Email</label>
                        <input 
                            name="emailInput" 
                            id="emailInput" 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={loading}
                            placeholder="contato@empresa.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descricaoInput">Descrição</label>
                        <textarea 
                            name="descricaoInput" 
                            id="descricaoInput" 
                            value={formData.descricao}
                            onChange={(e) => handleInputChange('descricao', e.target.value)}
                            disabled={loading}
                            placeholder="Descreva sua empresa..."
                            rows="4"
                        />
                    </div>

                    {/* Seção: Imagem */}
                    <h3 className="section-title">🖼️ Imagem da Empresa</h3>
                    
                    <div className="form-group">
                        <label htmlFor="imagemInput">Imagem do Estabelecimento</label>
                        
                        {/* Imagem Atual */}
                        {imagemAtual && !imagemPreview && (
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Imagem atual:</p>
                                <img 
                                    src={imagemAtual} 
                                    alt="Imagem atual"
                                    style={{
                                        maxWidth: '300px',
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: '8px',
                                        border: '2px solid #f48f42'
                                    }}
                                />
                            </div>
                        )}

                        {/* Preview da Nova Imagem */}
                        {imagemPreview && (
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Nova imagem:</p>
                                <img 
                                    src={imagemPreview} 
                                    alt="Preview"
                                    style={{
                                        maxWidth: '300px',
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: '8px',
                                        border: '2px solid #28a745'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    disabled={loading}
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    🗑️ Remover Nova Imagem
                                </button>
                            </div>
                        )}

                        <input 
                            type="file"
                            name="imagemInput"
                            id="imagemInput"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                            style={{ marginBottom: '5px' }}
                        />
                        <small style={{ color: '#999', fontSize: '12px', display: 'block' }}>
                            Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                        </small>
                    </div>

                    {/* Seção: Endereço */}
                    <h3 className="section-title address">📍 Endereço</h3>
                    
                    <div className="form-group">
                        <label htmlFor="cepInput">CEP *</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <input 
                                name="cepInput" 
                                id="cepInput" 
                                type="text" 
                                value={formData.cep}
                                onChange={(e) => handleInputChange('cep', e.target.value)}
                                className={errors.cep ? 'input-error' : ''}
                                disabled={loading}
                                placeholder="01310-100"
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleCepBlur}
                                disabled={loading || formData.cep.replace(/\D/g, '').length !== 8}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f48f42',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    minWidth: '50px',
                                    opacity: (loading || formData.cep.replace(/\D/g, '').length !== 8) ? 0.5 : 1
                                }}
                                title="Buscar endereço pelo CEP"
                            >
                                🔍
                            </button>
                        </div>
                        {errors.cep && (
                            <span className="error-text">
                                {errors.cep}
                            </span>
                        )}
                        <small style={{ color: '#999', fontSize: '12px' }}>Digite o CEP e clique no botão de busca 🔍</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="ruaInput">Rua *</label>
                        <input 
                            name="ruaInput" 
                            id="ruaInput" 
                            type="text" 
                            value={formData.rua}
                            onChange={(e) => handleInputChange('rua', e.target.value)}
                            className={errors.rua ? 'input-error' : ''}
                            disabled={true}
                            placeholder="Aguardando CEP..."
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                        {errors.rua && (
                            <span className="error-text">
                                {errors.rua}
                            </span>
                        )}
                        <small style={{ color: '#999', fontSize: '12px' }}>A rua é preenchida automaticamente pelo CEP</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group form-field">
                            <label htmlFor="numeroInput">Número *</label>
                            <input 
                                name="numeroInput" 
                                id="numeroInput" 
                                type="text" 
                                value={formData.numero}
                                onChange={(e) => handleInputChange('numero', e.target.value)}
                                className={errors.numero ? 'input-error' : ''}
                                disabled={loading}
                                placeholder="1000"
                            />
                            {errors.numero && (
                                <span className="error-text">
                                    {errors.numero}
                                </span>
                            )}
                        </div>

                        <div className="form-group form-field complement">
                            <label htmlFor="complementoInput">Complemento</label>
                            <input 
                                name="complementoInput" 
                                id="complementoInput" 
                                type="text" 
                                value={formData.complemento}
                                onChange={(e) => handleInputChange('complemento', e.target.value)}
                                disabled={loading}
                                placeholder="Sala 101, Andar 5..."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bairroInput">Bairro *</label>
                        <input 
                            name="bairroInput" 
                            id="bairroInput" 
                            type="text" 
                            value={formData.bairro}
                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                            className={errors.bairro ? 'input-error' : ''}
                            disabled={true}
                            placeholder="Aguardando CEP..."
                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                        {errors.bairro && (
                            <span className="error-text">
                                {errors.bairro}
                            </span>
                        )}
                        <small style={{ color: '#999', fontSize: '12px' }}>O bairro é preenchido automaticamente pelo CEP</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group form-field city">
                            <label htmlFor="cidadeInput">Cidade *</label>
                            <input 
                                name="cidadeInput" 
                                id="cidadeInput" 
                                type="text" 
                                value={formData.cidade}
                                onChange={(e) => handleInputChange('cidade', e.target.value)}
                                className={errors.cidade ? 'input-error' : ''}
                                disabled={true}
                                placeholder="Aguardando CEP..."
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                            {errors.cidade && (
                                <span className="error-text">
                                    {errors.cidade}
                                </span>
                            )}
                            <small style={{ color: '#999', fontSize: '12px' }}>Preenchido automaticamente</small>
                        </div>

                        <div className="form-group form-field state">
                            <label htmlFor="estadoInput">Estado *</label>
                            <input 
                                name="estadoInput" 
                                id="estadoInput" 
                                type="text" 
                                value={formData.estado}
                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                className={errors.estado ? 'input-error' : ''}
                                disabled={true}
                                placeholder="UF"
                                maxLength="2"
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                            />
                            {errors.estado && (
                                <span className="error-text">
                                    {errors.estado}
                                </span>
                            )}
                            <small style={{ color: '#999', fontSize: '12px' }}>Preenchido automaticamente</small>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`btn-submit ${loading ? 'loading' : 'normal'}`}
                    >
                        {loading ? '⏳ Salvando...' : '✏️ Salvar Alterações'}
                    </button>
                    
                    <Link to="/companyProfile">
                        <button 
                            type="button" 
                            disabled={loading}
                            className="btn-cancel"
                        >
                            ⬅️ Cancelar
                        </button>
                    </Link>
                </form>
            </main>
        </Layout>
    );
}