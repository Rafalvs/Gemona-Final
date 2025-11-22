import { useState, useEffect } from 'react';
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { estabelecimentosAPI, enderecosAPI } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { validarFormularioEstabelecimento, apenasNumeros } from '../../utils/validators';
import { useForm } from '../../hooks/useForm';

export default function EditCompany() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [estabelecimentoId, setEstabelecimentoId] = useState(null);
    const [enderecoId, setEnderecoId] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // Estado inicial do formulário
    const initialState = {
        nome: '',
        cnpj: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        complemento: ''
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
    } = useForm(initialState, validarFormularioEstabelecimento);

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
                setEstabelecimentoId(estabelecimento.id);
                setEnderecoId(estabelecimento.endereco_id);
                
                // Buscar dados do endereço
                let enderecoData = {};
                if (estabelecimento.endereco_id) {
                    const resultadoEndereco = await enderecosAPI.getById(estabelecimento.endereco_id);
                    if (resultadoEndereco.success) {
                        enderecoData = resultadoEndereco.data;
                    }
                }
                
                // Preencher formulário com dados existentes
                setFormData({
                    nome: estabelecimento.nome || '',
                    cnpj: estabelecimento.cnpj || '',
                    rua: enderecoData.rua || '',
                    numero: enderecoData.numero || '',
                    bairro: enderecoData.bairro || '',
                    cidade: enderecoData.cidade || '',
                    estado: enderecoData.estado || '',
                    cep: enderecoData.cep || '',
                    complemento: enderecoData.complemento || ''
                });
            } else {
                setFormMessage('❌ Nenhum estabelecimento encontrado para editar');
                setTimeout(() => navigate('/createBusiness'), 2000);
            }
        } catch (error) {
            setFormMessage(`❌ Erro ao carregar dados: ${error.message}`);
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setFormMessage('❌ Por favor, corrija os erros no formulário');
            return;
        }

        if (!estabelecimentoId || !enderecoId) {
            setFormMessage('❌ Erro: dados do estabelecimento não encontrados');
            return;
        }

        setFormLoading(true);
        setFormMessage('');

        try {
            // 1. Atualizar endereço
            const dadosEndereco = {
                rua: formData.rua.trim(),
                numero: formData.numero.trim(),
                bairro: formData.bairro.trim(),
                cidade: formData.cidade.trim(),
                estado: formData.estado.trim().toUpperCase(),
                cep: apenasNumeros(formData.cep),
                complemento: formData.complemento.trim(),
                ativo: 1
            };

            const resultadoEndereco = await enderecosAPI.update(enderecoId, dadosEndereco);

            if (!resultadoEndereco.success) {
                setFormMessage(`❌ Erro ao atualizar endereço: ${resultadoEndereco.error}`);
                setFormLoading(false);
                return;
            }

            // 2. Atualizar estabelecimento
            const dadosEstabelecimento = {
                nome: formData.nome.trim(),
                cnpj: apenasNumeros(formData.cnpj),
                profissional_id: user.id,
                endereco_id: enderecoId
            };

            const resultadoEstabelecimento = await estabelecimentosAPI.update(estabelecimentoId, dadosEstabelecimento);

            if (resultadoEstabelecimento.success) {
                setFormMessage('✅ Dados da empresa atualizados com sucesso!');
                
                // Redirecionar para o perfil da empresa após 2 segundos
                setTimeout(() => {
                    navigate('/businessProfile');
                }, 2000);
            } else {
                setFormMessage(`❌ Erro ao atualizar estabelecimento: ${resultadoEstabelecimento.error}`);
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

    if (user?.tipo_usuario !== 'pj') {
        return (
            <Layout>
                <main>
                    <h1>Acesso restrito a Pessoas Jurídicas</h1>
                    <p>Esta página é exclusiva para usuários empresariais.</p>
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
                    <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
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
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
                        ✏️ Editar Dados da Empresa
                    </h2>

                    {/* Mensagem de feedback */}
                    {message && (
                        <div style={{
                            padding: '10px',
                            marginBottom: '20px',
                            borderRadius: '4px',
                            textAlign: 'center',
                            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                            color: message.includes('✅') ? '#155724' : '#721c24',
                            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Seção: Dados do Estabelecimento */}
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>📋 Dados do Estabelecimento</h3>
                    
                    <div className="form-group">
                        <label htmlFor="nomeInput">Nome do Estabelecimento *</label>
                        <input 
                            name="nomeInput" 
                            id="nomeInput" 
                            type="text" 
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            style={{
                                borderColor: errors.nome ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="Ex: Salão Beleza Pura"
                        />
                        {errors.nome && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
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
                            style={{
                                borderColor: errors.cnpj ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="00.000.000/0000-00"
                        />
                        {errors.cnpj && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.cnpj}
                            </span>
                        )}
                    </div>

                    {/* Seção: Endereço */}
                    <h3 style={{ color: '#fff', marginBottom: '15px', marginTop: '30px' }}>📍 Endereço</h3>
                    
                    <div className="form-group">
                        <label htmlFor="ruaInput">Rua *</label>
                        <input 
                            name="ruaInput" 
                            id="ruaInput" 
                            type="text" 
                            value={formData.rua}
                            onChange={(e) => handleInputChange('rua', e.target.value)}
                            style={{
                                borderColor: errors.rua ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="Ex: Av. Paulista"
                        />
                        {errors.rua && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.rua}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: '2' }}>
                            <label htmlFor="numeroInput">Número *</label>
                            <input 
                                name="numeroInput" 
                                id="numeroInput" 
                                type="text" 
                                value={formData.numero}
                                onChange={(e) => handleInputChange('numero', e.target.value)}
                                style={{
                                    borderColor: errors.numero ? '#dc3545' : '#ddd'
                                }}
                                disabled={loading}
                                placeholder="1000"
                            />
                            {errors.numero && (
                                <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                    {errors.numero}
                                </span>
                            )}
                        </div>

                        <div className="form-group" style={{ flex: '3' }}>
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
                            style={{
                                borderColor: errors.bairro ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="Ex: Bela Vista"
                        />
                        {errors.bairro && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.bairro}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: '3' }}>
                            <label htmlFor="cidadeInput">Cidade *</label>
                            <input 
                                name="cidadeInput" 
                                id="cidadeInput" 
                                type="text" 
                                value={formData.cidade}
                                onChange={(e) => handleInputChange('cidade', e.target.value)}
                                style={{
                                    borderColor: errors.cidade ? '#dc3545' : '#ddd'
                                }}
                                disabled={loading}
                                placeholder="São Paulo"
                            />
                            {errors.cidade && (
                                <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                    {errors.cidade}
                                </span>
                            )}
                        </div>

                        <div className="form-group" style={{ flex: '1' }}>
                            <label htmlFor="estadoInput">Estado *</label>
                            <input 
                                name="estadoInput" 
                                id="estadoInput" 
                                type="text" 
                                value={formData.estado}
                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                style={{
                                    borderColor: errors.estado ? '#dc3545' : '#ddd'
                                }}
                                disabled={loading}
                                placeholder="SP"
                                maxLength="2"
                            />
                            {errors.estado && (
                                <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                    {errors.estado}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="cepInput">CEP *</label>
                        <input 
                            name="cepInput" 
                            id="cepInput" 
                            type="text" 
                            value={formData.cep}
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                            style={{
                                borderColor: errors.cep ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="01310-100"
                        />
                        {errors.cep && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.cep}
                            </span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#ccc' : '#17a2b8',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            marginTop: '20px'
                        }}
                    >
                        {loading ? '⏳ Salvando...' : '✏️ Salvar Alterações'}
                    </button>
                    
                    <Link to="/businessProfile">
                        <button 
                            type="button" 
                            disabled={loading}
                            style={{
                                backgroundColor: '#6c757d'
                            }}
                        >
                            ⬅️ Cancelar
                        </button>
                    </Link>
                </form>
            </main>
        </Layout>
    );
}