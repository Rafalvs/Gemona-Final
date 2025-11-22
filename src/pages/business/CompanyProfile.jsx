import { useState, useEffect } from 'react';
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { estabelecimentosAPI, enderecosAPI, servicosAPI } from '../../services/apiService';

export default function BusinessProfile(){
    const { user, isAuthenticated } = useAuth();
    const [estabelecimento, setEstabelecimento] = useState(null);
    const [endereco, setEndereco] = useState(null);
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingService, setEditingService] = useState(null);
    const [editFormData, setEditFormData] = useState({ nome: '', preco: '', descricao: '' });

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadEstabelecimento();
        }
    }, [isAuthenticated, user]);

    const loadEstabelecimento = async () => {
        try {
            setLoading(true);
            
            // Buscar estabelecimento do usuário logado
            const resultadoEstabelecimentos = await estabelecimentosAPI.getByProfissional(user.id);
            
            if (resultadoEstabelecimentos.success && resultadoEstabelecimentos.data.length > 0) {
                const estabelecimentoData = resultadoEstabelecimentos.data[0]; // Primeiro estabelecimento
                setEstabelecimento(estabelecimentoData);
                
                // Buscar endereço do estabelecimento
                if (estabelecimentoData.endereco_id) {
                    const resultadoEndereco = await enderecosAPI.getById(estabelecimentoData.endereco_id);
                    if (resultadoEndereco.success) {
                        setEndereco(resultadoEndereco.data);
                    }
                }

                // Buscar serviços do estabelecimento
                const resultadoServicos = await servicosAPI.getByEstabelecimento(estabelecimentoData.id);
                if (resultadoServicos.success) {
                    setServicos(resultadoServicos.data);
                }
            } else {
                setError('Nenhum estabelecimento encontrado');
            }
        } catch (error) {
            setError(`Erro ao carregar dados: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditService = (servico) => {
        setEditingService(servico.id);
        setEditFormData({
            nome: servico.nome,
            descricao: servico.descricao,
            preco: servico.preco
        });
    };

    const handleSaveService = async () => {
        try {
            const resultado = await servicosAPI.update(editingService, editFormData);
            if (resultado.success) {
                // Atualizar a lista de serviços
                const resultadoServicos = await servicosAPI.getByEstabelecimento(estabelecimento.id);
                if (resultadoServicos.success) {
                    setServicos(resultadoServicos.data);
                }
                setEditingService(null);
                setEditFormData({
                    nome: '',
                    descricao: '',
                    preco: ''
                });
                alert('Serviço atualizado com sucesso!');
            } else {
                alert('Erro ao atualizar serviço: ' + resultado.error);
            }
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            alert('Erro ao salvar serviço');
        }
    };

    const handleDeleteService = async (servicoId) => {
        if (window.confirm('Tem certeza que deseja remover este serviço?')) {
            try {
                const resultado = await servicosAPI.delete(servicoId);
                if (resultado.success) {
                    // Atualizar a lista de serviços
                    const resultadoServicos = await servicosAPI.getByEstabelecimento(estabelecimento.id);
                    if (resultadoServicos.success) {
                        setServicos(resultadoServicos.data);
                    }
                    alert('Serviço removido com sucesso!');
                } else {
                    alert('Erro ao remover serviço: ' + resultado.error);
                }
            } catch (error) {
                console.error('Erro ao remover serviço:', error);
                alert('Erro ao remover serviço');
            }
        }
    };

    const formatarReal = (valor) => {
        return parseFloat(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    if (!isAuthenticated) {
        return (
            <Layout>
                <main>
                    <h1>Você precisa estar logado para ver o perfil da empresa</h1>
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

    return(
        <Layout>
            <main>
                <div className="company-profile-container">
                    <h1 className="company-profile-title">
                        🏢 Perfil da Empresa
                    </h1>

                    {loading && (
                        <div className="company-not-found-container">
                            <p>⏳ Carregando dados da empresa...</p>
                        </div>
                    )}

                    {error && (
                        <div className="form-error-message company-not-found-container">
                            <p>❌ {error}</p>
                            <Link to="/createBusiness">
                                <button className="edit-establishment-btn">
                                    🏢 Cadastrar Estabelecimento
                                </button>
                            </Link>
                        </div>
                    )}

                    {!loading && !error && estabelecimento && (
                        <div>
                            {/* Informações da Empresa */}
                            <div className="company-section">
                                <h2 className="company-section-title">
                                    📋 Dados da Empresa
                                </h2>
                                <p><strong>Nome:</strong> {estabelecimento.nome}</p>
                                <p><strong>CNPJ:</strong> {estabelecimento.cnpj}</p>
                                
                            </div>

                            {/* Informações do Endereço */}
                            {endereco && (
                                <div className="company-section">
                                    <h2 className="company-section-title">
                                        📍 Endereço
                                    </h2>
                                    <p><strong>Rua:</strong> {endereco.rua}, {endereco.numero}</p>
                                    {endereco.complemento && (
                                        <p><strong>Complemento:</strong> {endereco.complemento}</p>
                                    )}
                                    <p><strong>Bairro:</strong> {endereco.bairro}</p>
                                    <p><strong>Cidade:</strong> {endereco.cidade} - {endereco.estado}</p>
                                    <p><strong>CEP:</strong> {endereco.cep}</p>
                                </div>
                            )}

                            {/* Informações do Responsável */}
                            <div className="company-section">
                                <h2 className="company-section-title">
                                    👤 Responsável
                                </h2>
                                <p><strong>Nome:</strong> {user.nome}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Tipo:</strong> Pessoa Jurídica</p>
                            </div>

                            {/* Seção de Serviços */}
                            <div className="existing-services-section">
                                <h2 className="company-section-title">
                                    🛎️ Serviços da Empresa
                                </h2>
                                {servicos.length === 0 ? (
                                    <p className="services-empty-message">
                                        Nenhum serviço cadastrado. Adicione seu primeiro serviço para aparecer na página de serviços!
                                    </p>
                                ) : (
                                    <div className="company-services-grid">
                                        {servicos.map((servico) => (
                                            <div key={servico.id} className="company-service-card">
                                                {editingService === servico.id ? (
                                                    // Modo de edição
                                                    <div className="service-edit-form">
                                                        <div>
                                                            <label className="service-edit-label">
                                                                Nome do Serviço:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.nome}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    nome: e.target.value
                                                                })}
                                                                className="service-edit-input"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="service-edit-label">
                                                                Descrição:
                                                            </label>
                                                            <textarea
                                                                value={editFormData.descricao}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    descricao: e.target.value
                                                                })}
                                                                rows={3}
                                                                className="service-edit-textarea"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="service-edit-label">
                                                                Preço (R$):
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editFormData.preco}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    preco: e.target.value
                                                                })}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ccc',
                                                                    fontSize: '14px'
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="service-edit-buttons">
                                                            <button
                                                                onClick={handleSaveService}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    backgroundColor: '#28a745',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px'
                                                                }}
                                                            >
                                                                ✅ Salvar
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingService(null)}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    backgroundColor: '#6c757d',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px'
                                                                }}
                                                            >
                                                                ❌ Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Modo de visualização
                                                    <div>
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'flex-start',
                                                            marginBottom: '10px'
                                                        }}>
                                                            <h3 style={{ 
                                                                margin: 0, 
                                                                fontSize: '18px',
                                                                color: '#f48f42'
                                                            }}>
                                                                {servico.nome}
                                                            </h3>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => handleEditService(servico)}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        backgroundColor: '#007bff',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }}
                                                                >
                                                                    ✏️ Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteService(servico.id)}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        backgroundColor: '#dc3545',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }}
                                                                >
                                                                    🗑️ Remover
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p style={{ 
                                                            color: '#ccc', 
                                                            marginBottom: '10px',
                                                            lineHeight: '1.4'
                                                        }}>
                                                            {servico.descricao}
                                                        </p>
                                                        <p style={{ 
                                                            fontSize: '16px', 
                                                            fontWeight: 'bold',
                                                            color: '#28a745',
                                                            margin: 0
                                                        }}>
                                                            {formatarReal(servico.preco)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Botões de Ação */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '15px', 
                                justifyContent: 'center',
                                marginTop: '30px',
                                flexWrap: 'wrap'
                            }}>
                                <Link to="/editBusiness">
                                    <button style={{ backgroundColor: '#17a2b8' }}>
                                        ✏️ Editar Empresa
                                    </button>
                                </Link>
                                
                                <Link to="/createService">
                                    <button style={{ backgroundColor: '#fd7e14' }}>
                                        ➕ Adicionar Serviço
                                    </button>
                                </Link>
                                                        
                                <Link to="/profile">
                                    <button style={{ backgroundColor: '#007bff' }}>
                                        👤 Perfil Pessoal
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {!loading && !error && !estabelecimento && (
                        <div style={{ 
                            textAlign: 'center',
                            padding: '40px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px'
                        }}>
                            <h2>🏢 Nenhum estabelecimento cadastrado</h2>
                            <p>Você ainda não cadastrou um estabelecimento para sua empresa.</p>
                            <Link to="/createBusiness">
                                <button style={{ 
                                    backgroundColor: '#28a745',
                                    fontSize: '18px',
                                    padding: '12px 24px'
                                }}>
                                    ➕ Cadastrar Estabelecimento
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    )
}