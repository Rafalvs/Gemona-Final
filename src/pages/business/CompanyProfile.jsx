import { useState, useEffect } from 'react';
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { estabelecimentosAPI, servicosAPI, imagensAPI, subcategoriasAPI, pedidosAPI, clientesAPI } from '../../services/apiService';
import '../../styles/CompanyProfile.css';

export default function BusinessProfile(){
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [estabelecimento, setEstabelecimento] = useState(null);
    const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingService, setEditingService] = useState(null);
    const [editFormData, setEditFormData] = useState({ nome: '', preco: '', descricao: '', subcategoria_id: '' });
    const [imagemUrl, setImagemUrl] = useState(null);
    const [subcategorias, setSubcategorias] = useState([]);
    const [editImagemPreview, setEditImagemPreview] = useState(null);
    const [editImagemBase64, setEditImagemBase64] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [contratacoes, setContratacoes] = useState([]);
    const [loadingContratacoes, setLoadingContratacoes] = useState(false);
    
    const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadEstabelecimento();
            loadSubcategorias();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (estabelecimento) {
            loadContratacoes();
        }
    }, [estabelecimento]);

    const loadSubcategorias = async () => {
        try {
            const resultado = await subcategoriasAPI.getAll();
            if (resultado.success) {
                setSubcategorias(resultado.data);
            }
        } catch (error) {
        }
    };

    const loadContratacoes = async () => {
        try {
            setLoadingContratacoes(true);
            const estabId = estabelecimento.estabelecimentoId || estabelecimento.id;
            
            // Buscar pedidos do estabelecimento
            const resultadoPedidos = await pedidosAPI.getByEstabelecimento(estabId);
            
            if (resultadoPedidos.success && resultadoPedidos.data) {
                // Filtrar apenas pedidos ativos
                const pedidosAtivos = resultadoPedidos.data.filter(pedido => pedido.ativo !== false);
                
                // Buscar detalhes de cada contratação
                const contratacoesDet = await Promise.all(
                    pedidosAtivos.map(async (pedido) => {
                        try {
                            // Buscar serviço
                            const servicoRes = await servicosAPI.getById(pedido.servicoId);
                            // Buscar cliente
                            const clienteRes = await clientesAPI.getById(pedido.clienteId);
                            
                            return {
                                pedidoId: pedido.pedidoId,
                                servico: servicoRes.success ? servicoRes.data : null,
                                cliente: clienteRes.success ? clienteRes.data : null,
                                dataAgendamento: pedido.dataAgendamento,
                                status: pedido.status,
                                observacoes: pedido.observacoes
                            };
                        } catch (err) {
                            return null;
                        }
                    })
                );
                
                // Filtrar contratações válidas
                setContratacoes(contratacoesDet.filter(c => c !== null && c.servico && c.cliente));
            }
        } catch (error) {
        } finally {
            setLoadingContratacoes(false);
        }
    };

    const loadEstabelecimento = async () => {
        try {
            setLoading(true);
            
            // Buscar estabelecimento do usuário logado
            const resultadoEstabelecimentos = await estabelecimentosAPI.getByProfissional(user.id);
            
            if (resultadoEstabelecimentos.success && resultadoEstabelecimentos.data.length > 0) {
                const estabelecimentoData = resultadoEstabelecimentos.data[0]; // Primeiro estabelecimento
                setEstabelecimento(estabelecimentoData);
                
                // Montar URL da imagem se existir
                if (estabelecimentoData.imagemEstabelecimentoUrl) {
                    const urlImagem = imagensAPI.getImageUrl(estabelecimentoData.imagemEstabelecimentoUrl);
                    setImagemUrl(urlImagem);
                }

                // Buscar serviços do estabelecimento
                const estabId = estabelecimentoData.estabelecimentoId || estabelecimentoData.id;
                const resultadoServicos = await servicosAPI.getByEstabelecimento(estabId);
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

    // Funções para editar e remover serviços
    const handleEditService = (servico) => {
        const servicoId = servico.servicoId || servico.id;
        
        setEditingService(servicoId);
        setEditFormData({
            nome: servico.nome,
            descricao: servico.descricao,
            preco: servico.preco,
            subcategoria_id: servico.subCategoriaId || ''
        });
        // Se o serviço tem imagem, mostrar preview
        if (servico.imagemServicoUrl) {
            setEditImagemPreview(imagensAPI.getImageUrl(servico.imagemServicoUrl));
        } else {
            setEditImagemPreview(null);
        }
        setEditImagemBase64(null);
        setRemoveImage(false);
    };

    const handleSaveService = async () => {
        try {
            // Buscar o serviço atual para pegar o estabelecimentoId
            const servicoAtual = servicos.find(s => (s.servicoId || s.id) === editingService);
            
            const dadosAtualizacao = {
                nome: editFormData.nome.trim(),
                descricao: editFormData.descricao.trim(),
                subCategoriaId: parseInt(editFormData.subcategoria_id),
                preco: parseFloat(editFormData.preco),
                estabelecimentoId: servicoAtual?.estabelecimentoId || estabelecimento.estabelecimentoId
            };

            // Se uma nova imagem foi selecionada, incluir
            if (editImagemBase64) {
                dadosAtualizacao.imagemServico = editImagemBase64;
            }
            // Se não há imagem nova e não marcou para remover, não incluir o campo imagemServico
            // (o backend mantém a imagem atual)

            const resultado = await servicosAPI.update(editingService, dadosAtualizacao);
            if (resultado.success) {
                // Atualizar a lista de serviços
                const estabId = estabelecimento.estabelecimentoId || estabelecimento.id;
                const resultadoServicos = await servicosAPI.getByEstabelecimento(estabId);
                if (resultadoServicos.success) {
                    setServicos(resultadoServicos.data);
                }
                setEditingService(null);
                setEditFormData({
                    nome: '',
                    descricao: '',
                    preco: '',
                    subcategoria_id: ''
                });
                setEditImagemPreview(null);
                setEditImagemBase64(null);
                setRemoveImage(false);
                alert('Serviço atualizado com sucesso!');
            } else {
                alert('Erro ao atualizar serviço: ' + resultado.error);
            }
        } catch (error) {
            alert('Erro ao salvar serviço');
        }
    };

    // Função para deletar serviço
    const handleDeleteService = async (servicoId) => {
        if (window.confirm('Tem certeza que deseja remover este serviço?')) {
            try {
                const resultado = await servicosAPI.delete(servicoId);
                
                // API retorna sucesso ou sem erro = deleção bem-sucedida
                if (resultado.success !== false) {
                    // Atualizar a lista de serviços usando estabelecimentoId correto
                    const estabId = estabelecimento.estabelecimentoId || estabelecimento.id;
                    const resultadoServicos = await servicosAPI.getByEstabelecimento(estabId);
                    if (resultadoServicos.success) {
                        setServicos(resultadoServicos.data);
                    }
                    alert('Serviço removido com sucesso!');
                } else {
                    alert('Erro ao remover serviço: ' + (resultado.error || 'Erro desconhecido'));
                }
            } catch (error) {
                alert('Erro ao remover serviço: ' + error.message);
            }
        }
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem');
            return;
        }

        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB');
            return;
        }

        // Criar preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditImagemPreview(reader.result);
            const base64String = reader.result.split(',')[1];
            setEditImagemBase64({
                fileName: file.name,
                contentType: file.type,
                base64Data: base64String
            });
            setRemoveImage(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveEditImage = () => {
        setEditImagemPreview(null);
        setEditImagemBase64(null);
        setRemoveImage(true);
        const inputFile = document.getElementById('editImagemInput');
        if (inputFile) inputFile.value = '';
    };

    const formatarReal = (valor) => {
        return parseFloat(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const handleCancelarContratacao = async (pedidoId) => {
        if (window.confirm('Tem certeza que deseja cancelar esta contratação?')) {
            try {
                // Profissionais usam updateStatus para cancelar (status = CANCELADO)
                const resultado = await pedidosAPI.updateStatus(pedidoId, 'CANCELADO');
                
                if (resultado.success !== false) {
                    alert('Contratação cancelada com sucesso!');
                    // Recarregar as contratações
                    loadContratacoes();
                } else {
                    alert('Erro ao cancelar contratação: ' + (resultado.error || 'Erro desconhecido'));
                }
            } catch (error) {
                alert('Erro ao cancelar contratação: ' + error.message);
            }
        }
    };

    // Aguardar verificação de autenticação
    if (authLoading) {
        return (
            <Layout>
                <main>
                    <div className="loading-container">
                        <p>⏳ Carregando...</p>
                    </div>
                </main>
            </Layout>
        );
    }

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

    return(
        <Layout>
            <main>
                <div className="company-profile-container">
                    <h1 className="company-profile-title">
                        🏢 Perfil da Empresa
                    </h1>

                    {loading && (
                        <div className="loading-container">
                            <p>⏳ Carregando dados da empresa...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-container">
                            <p>❌ {error}</p>
                            <Link to="/newCompany">
                                <button className="error-button">
                                    🏢 Cadastrar Estabelecimento
                                </button>
                            </Link>
                        </div>
                    )}

                    {!loading && !error && estabelecimento && (
                        <div>
                            {/* Imagem do Estabelecimento */}
                            {imagemUrl && (
                                <div className="company-image-container">
                                    <img 
                                        src={imagemUrl} 
                                        alt={estabelecimento.nome}
                                        className="company-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Botões de Ação */}
                            <div className="action-buttons">
                                <Link to="/editCompany">
                                    <button className="btn-edit-business">
                                        ✏️ Editar Empresa
                                    </button>
                                </Link>                                            
                                                        
                                <Link to="/profile">
                                    <button className="btn-personal-profile">
                                        👤 Perfil Pessoal
                                    </button>
                                </Link>
                            </div>

                            {/* Grid de Informações */}
                            <div className="info-sections-grid">
                                {/* Informações da Empresa */}
                                <div className="info-section">
                                    <h2 className="section-title">
                                        📋 Dados da Empresa
                                    </h2>
                                    <p><strong>Nome:</strong> {estabelecimento.nome}</p>
                                    <p><strong>CNPJ:</strong> {estabelecimento.cnpj}</p>
                                    {estabelecimento.email && (
                                        <p><strong>Email:</strong> {estabelecimento.email}</p>
                                    )}
                                    {estabelecimento.telefone && (
                                        <p><strong>Telefone:</strong> {estabelecimento.telefone}</p>
                                    )}
                                    {estabelecimento.descricao && (
                                        <p><strong>Descrição:</strong> {estabelecimento.descricao}</p>
                                    )}
                                </div>

                                {/* Informações do Endereço */}
                                {estabelecimento?.endereco && (
                                    <div className="info-section">
                                        <h2 className="section-title">
                                            📍 Endereço
                                        </h2>
                                        <p><strong>CEP:</strong> {estabelecimento.endereco.cep}</p>
                                        <p><strong>Rua:</strong> {estabelecimento.endereco.rua}, <strong>Nº:</strong> {estabelecimento.endereco.numero}</p>
                                        {estabelecimento.endereco.complemento && (
                                            <p><strong>Complemento:</strong> {estabelecimento.endereco.complemento}</p>
                                        )}
                                        <p><strong>Bairro:</strong> {estabelecimento.endereco.bairro}</p>
                                        <p><strong>Cidade:</strong> {estabelecimento.endereco.cidade} - <strong>Estado:</strong> {estabelecimento.endereco.estado}</p>
                                    </div>
                                )}

                                {/* Horários de Funcionamento */}
                                {estabelecimento && estabelecimento.horarios && estabelecimento.horarios.length > 0 && (
                                    <div className="info-section">
                                        <h2 className="section-title">
                                            🕐 Horários de Funcionamento
                                        </h2>
                                        <div className="horarios-list">
                                            {diasSemana.map((dia, index) => {
                                                const diaSemanaNumero = index + 1;
                                                const horario = estabelecimento.horarios.find(h => h.diaSemana === diaSemanaNumero);
                                                
                                                return (
                                                    <div key={diaSemanaNumero} className="horario-item">
                                                        <span className="horario-dia">{dia}:</span>
                                                        <span className="horario-horas">
                                                            {horario && !horario.fechado
                                                                ? `${horario.horaAbertura.substring(0, 5)} às ${horario.horaFechamento.substring(0, 5)}`
                                                                : <span className="fechado">Fechado</span>
                                                            }
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Informações do Responsável */}
                                <div className="info-section">
                                    <h2 className="section-title">
                                        👤 Responsável
                                    </h2>
                                    <p><strong>Nome:</strong> {user.nome}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Tipo:</strong> Profissional</p>
                                </div>
                            </div>

                            <div className="action-buttons">
                             <Link to="/newService">
                                    <button className="btn-add-service">
                                        ➕ Adicionar Serviço
                                    </button>
                                </Link>
                            </div>

                            {/* Seção de Serviços Contratados */}
                            <div className="info-section">
                                <h2 className="section-title">
                                    📋 Serviços Contratados por Clientes
                                </h2>
                                {loadingContratacoes ? (
                                    <p className="loading-message">⏳ Carregando contratações...</p>
                                ) : contratacoes.length === 0 ? (
                                    <p className="no-services-message">
                                        Nenhum serviço foi contratado ainda.
                                    </p>
                                ) : (
                                    <div className="contratacoes-list">
                                        {contratacoes.map((contratacao) => (
                                            <div key={contratacao.pedidoId} className="contratacao-card">
                                                <div className="contratacao-header">
                                                    <h3 className="contratacao-servico">
                                                        {contratacao.servico.nome}
                                                    </h3>
                                                    <span className={`contratacao-status status-${String(contratacao.status || 'pendente').toLowerCase()}`}>
                                                        {contratacao.status || 'PENDENTE'}
                                                    </span>
                                                </div>
                                                <div className="contratacao-info">
                                                    <p>
                                                        <strong>👤 Cliente:</strong> {contratacao.cliente.nome}
                                                    </p>
                                                    <p>
                                                        <strong>📧 Email:</strong> {contratacao.cliente.email}
                                                    </p>
                                                    {contratacao.cliente.telefone && (
                                                        <p>
                                                            <strong>📞 Telefone:</strong> {contratacao.cliente.telefone}
                                                        </p>
                                                    )}
                                                    <p>
                                                        <strong>📅 Data Agendamento:</strong>{' '}
                                                        {new Date(contratacao.dataAgendamento).toLocaleString('pt-BR')}
                                                    </p>
                                                    <p>
                                                        <strong>💰 Valor:</strong> {formatarReal(contratacao.servico.preco)}
                                                    </p>
                                                    {contratacao.observacoes && (
                                                        <p>
                                                            <strong>📝 Observações:</strong> {contratacao.observacoes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="contratacao-actions">
                                                    <button
                                                        onClick={() => handleCancelarContratacao(contratacao.pedidoId)}
                                                        className="btn-cancelar-contratacao"
                                                    >
                                                        ❌ Cancelar Contratação
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Seção de Serviços */}
                            <div className="info-section">
                                <h2 className="section-title">
                                    🛎️ Serviços da Empresa
                                </h2>
                                {servicos.length === 0 ? (
                                    <p className="no-services-message">
                                        Nenhum serviço cadastrado. Adicione seu primeiro serviço para aparecer na página de serviços!
                                    </p>
                                ) : (
                                    <div className="services-grid">
                                        {servicos.map((servico) => {
                                            const servicoId = servico.servicoId || servico.id;
                                            return (
                                            <div key={servicoId} className="service-card">
                                                {editingService === servicoId ? (
                                                    // Modo de edição
                                                    <div className="service-edit-form">
                                                        <div>
                                                            <label className="form-label">
                                                                Nome do Serviço:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.nome}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    nome: e.target.value
                                                                })}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="form-label">
                                                                Descrição:
                                                            </label>
                                                            <textarea
                                                                value={editFormData.descricao}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    descricao: e.target.value
                                                                })}
                                                                rows={3}
                                                                className="form-textarea"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                Subcategoria:
                                                            </label>
                                                            <select
                                                                value={editFormData.subcategoria_id}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    subcategoria_id: e.target.value
                                                                })}
                                                                className="form-input"
                                                            >
                                                                <option value="">Selecione uma subcategoria...</option>
                                                                {subcategorias.map(sub => (
                                                                    <option key={sub.subCategoriaId} value={sub.subCategoriaId}>
                                                                        {sub.nome}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">
                                                                Imagem do Serviço:
                                                            </label>
                                                            {editImagemPreview && (
                                                                <div style={{ marginBottom: '10px' }}>
                                                                    <img 
                                                                        src={editImagemPreview}
                                                                        alt="Preview"
                                                                        style={{
                                                                            maxWidth: '200px',
                                                                            width: '100%',
                                                                            height: 'auto',
                                                                            borderRadius: '8px',
                                                                            border: '2px solid #f48f42'
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleRemoveEditImage}
                                                                        style={{
                                                                            display: 'block',
                                                                            marginTop: '5px',
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
                                                            )}
                                                            <input
                                                                type="file"
                                                                id="editImagemInput"
                                                                accept="image/*"
                                                                onChange={handleEditImageChange}
                                                                style={{ fontSize: '14px' }}
                                                            />
                                                            <small style={{ color: '#999', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                                                                JPG, PNG, GIF. Máx: 5MB
                                                            </small>
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">
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
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="button-group">
                                                            <button
                                                                onClick={handleSaveService}
                                                                className="btn-save"
                                                            >
                                                                ✅ Salvar
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingService(null);
                                                                    setEditImagemPreview(null);
                                                                    setEditImagemBase64(null);
                                                                    setRemoveImage(false);
                                                                }}
                                                                className="btn-cancel"
                                                            >
                                                                ❌ Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Modo de visualização
                                                    <div>
                                                        {/* Imagem do Serviço */}
                                                        {servico.imagemServicoUrl && (
                                                            <div className="service-image-container">
                                                                <img 
                                                                    src={imagensAPI.getImageUrl(servico.imagemServicoUrl)} 
                                                                    alt={servico.nome}
                                                                    className="service-image"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="service-header">
                                                            <h3 className="service-name">
                                                                {servico.nome}
                                                            </h3>
                                                            <div className="service-actions">
                                                                <button
                                                                    onClick={() => handleEditService(servico)}
                                                                    className="btn-edit"
                                                                >
                                                                    ✏️ Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteService(servicoId)}
                                                                    className="btn-delete"
                                                                >
                                                                    🗑️ Remover
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="service-description">
                                                            {servico.descricao}
                                                        </p>
                                                        <p className="service-price">
                                                            {formatarReal(servico.preco)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                        })}
                                    </div>
                                )}
                            </div>                            
                        </div>
                    )}

                    {!loading && !error && !estabelecimento && (
                        <div className="no-establishment-container">
                            <h2>🏢 Nenhum estabelecimento cadastrado</h2>
                            <p>Você ainda não cadastrou um estabelecimento para sua empresa.</p>
                            <Link to="/newCompany">
                                <button className="btn-create-establishment">
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