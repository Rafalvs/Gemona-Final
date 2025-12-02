import Layout from "../../components/layout/Layout"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { clientesAPI, profissionaisAPI, imagensAPI, estabelecimentosAPI, enderecosAPI, pedidosAPI, servicosAPI } from '../../services/apiService'
import '../../styles/Profile.css'

export default function Profile(){
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        nome: '',
        telefone: '',
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        cidade: '',
        estado: ''
    });
    const [saving, setSaving] = useState(false);
    const [temEstabelecimento, setTemEstabelecimento] = useState(false);
    const [loadingEstabelecimento, setLoadingEstabelecimento] = useState(false);
    const [novaImagemPreview, setNovaImagemPreview] = useState(null);
    const [novaImagemBase64, setNovaImagemBase64] = useState(null);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadUserData();
        }
    }, [isAuthenticated, user]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            
            // Verificar se é Cliente ou Profissional
            if (user.tipo_usuario === 'cliente') {
                // Buscar dados do cliente
                const resultadoCliente = await clientesAPI.getById(user.id);
                if (resultadoCliente.success) {
                    setUserData(resultadoCliente.data);
                    setEditFormData({
                        nome: resultadoCliente.data.nome || '',
                        telefone: resultadoCliente.data.telefone || '',
                        cep: resultadoCliente.data.endereco?.cep || '',
                        rua: resultadoCliente.data.endereco?.rua || '',
                        numero: resultadoCliente.data.endereco?.numero || '',
                        complemento: resultadoCliente.data.endereco?.complemento || '',
                        cidade: resultadoCliente.data.endereco?.cidade || '',
                        estado: resultadoCliente.data.endereco?.estado || ''
                    });
                    
                    // Montar URL da foto de perfil
                    if (resultadoCliente.data.imagemPerfilUrl) {
                        const urlFoto = imagensAPI.getImageUrl(resultadoCliente.data.imagemPerfilUrl);
                        setFotoPerfilUrl(urlFoto);
                    }
                }
            } else if (user.tipo_usuario === 'profissional') {
                // Buscar dados do profissional
                const resultadoProfissional = await profissionaisAPI.getById(user.id);
                if (resultadoProfissional.success) {
                    setUserData(resultadoProfissional.data);
                    setEditFormData({
                        nome: resultadoProfissional.data.nome || '',
                        telefone: resultadoProfissional.data.telefone || ''
                    });
                    
                    // Montar URL da foto de perfil
                    if (resultadoProfissional.data.imagemPerfilUrl) {
                        const urlFoto = imagensAPI.getImageUrl(resultadoProfissional.data.imagemPerfilUrl);
                        setFotoPerfilUrl(urlFoto);
                    }
                    
                    // Verificar se profissional tem estabelecimento
                    await verificarEstabelecimento(user.id);
                }
            }

            // Carregar pedidos do cliente
            if (user.tipo_usuario === 'cliente') {
                await carregarPedidosCliente(user.id);
            } else {
                setAgenda([]);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const carregarPedidosCliente = async (clienteId) => {
        try {
            const resultadoPedidos = await pedidosAPI.getByCliente(clienteId);
            
            if (resultadoPedidos.success && resultadoPedidos.data) {
                // Filtrar apenas pedidos ativos (não deletados)
                const pedidosAtivos = resultadoPedidos.data.filter(pedido => pedido.ativo !== false);
                
                // Carregar dados dos serviços para cada pedido
                const pedidosComDetalhes = await Promise.all(
                    pedidosAtivos.map(async (pedido) => {
                        try {
                            const servicoRes = await servicosAPI.getById(pedido.servicoId);
                            
                            if (servicoRes.success && servicoRes.data) {
                                // Buscar estabelecimento se houver
                                let estabelecimento = null;
                                if (servicoRes.data.estabelecimentoId) {
                                    const estabRes = await estabelecimentosAPI.getById(servicoRes.data.estabelecimentoId);
                                    if (estabRes.success && estabRes.data) {
                                        estabelecimento = estabRes.data;
                                    }
                                }
                                
                                return {
                                    id: pedido.pedidoId || pedido.id,
                                    pedidoId: pedido.pedidoId || pedido.id,
                                    servico: servicoRes.data,
                                    estabelecimento: estabelecimento,
                                    data_contrato: pedido.dataAgendamento || pedido.dataCriacao,
                                    observacoes: pedido.observacoes
                                };
                            }
                        } catch (error) {
                        }
                        return null;
                    })
                );
                
                // Filtrar pedidos nulos e atualizar estado
                const pedidosValidos = pedidosComDetalhes.filter(p => p !== null);
                setAgenda(pedidosValidos);
            } else {
                setAgenda([]);
            }
        } catch (error) {
            setAgenda([]);
        }
    };

    const verificarEstabelecimento = async (profissionalId) => {
        try {
            setLoadingEstabelecimento(true);
            const resultado = await estabelecimentosAPI.getByProfissional(profissionalId);
            
            if (resultado.success && resultado.data && resultado.data.length > 0) {
                setTemEstabelecimento(true);
            } else {
                setTemEstabelecimento(false);
            }
        } catch (error) {
            setTemEstabelecimento(false);
        } finally {
            setLoadingEstabelecimento(false);
        }
    };

    const handleCancelarContrato = async (contratoId) => {
        if (!window.confirm('Tem certeza que deseja cancelar este serviço contratado?')) {
            return;
        }
        
        try {
            const resultado = await pedidosAPI.delete(contratoId);
            
            if (resultado.success) {
                alert('Serviço cancelado com sucesso!');
                // Recarregar pedidos do servidor para garantir sincronização
                await carregarPedidosCliente(user.id);
            } else {
                alert('Erro ao cancelar serviço: ' + (resultado.error || 'Erro desconhecido'));
            }
        } catch (error) {
            alert('Erro ao cancelar serviço. Tente novamente.');
        }
    };

    const handleVerDetalhes = (pedidoItem) => {
        setSelectedService(pedidoItem);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedService(null);
    };

    const formatDiaSemana = (dia) => {
        const dias = {
            1: 'Segunda-feira',
            2: 'Terça-feira', 
            3: 'Quarta-feira',
            4: 'Quinta-feira',
            5: 'Sexta-feira',
            6: 'Sábado',
            7: 'Domingo'
        };
        return dias[dia] || '';
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNovaImagemPreview(null);
        setNovaImagemBase64(null);
        // Resetar para os valores originais
        if (userData) {
            setEditFormData({
                nome: userData.nome || '',
                telefone: userData.telefone || '',
                cep: userData.endereco?.cep || '',
                rua: userData.endereco?.rua || '',
                numero: userData.endereco?.numero || '',
                complemento: userData.endereco?.complemento || '',
                cidade: userData.endereco?.cidade || '',
                estado: userData.endereco?.estado || ''
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
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

        // Criar preview e converter para base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setNovaImagemPreview(reader.result);
            const base64String = reader.result.split(',')[1];
            setNovaImagemBase64({
                fileName: file.name,
                contentType: file.type,
                base64Data: base64String
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setNovaImagemPreview(null);
        setNovaImagemBase64(null);
        const inputFile = document.getElementById('imageInput');
        if (inputFile) inputFile.value = '';
    };

    const buscarCep = async () => {
        const cepLimpo = editFormData.cep.replace(/\D/g, '');
        
        if (cepLimpo.length !== 8) {
            alert('❌ CEP deve ter 8 dígitos');
            return;
        }

        setBuscandoCep(true);

        try {
            const resultado = await enderecosAPI.getByCep(cepLimpo);
            
            if (resultado.success && resultado.data) {
                const endereco = resultado.data;
                setEditFormData(prev => ({
                    ...prev,
                    rua: endereco.rua || '',
                    cidade: endereco.cidade || '',
                    estado: endereco.estado || ''
                }));
                alert('✅ CEP encontrado!');
            } else {
                alert('❌ CEP não encontrado');
            }
        } catch (error) {
            alert('❌ Erro ao buscar CEP: ' + error.message);
        } finally {
            setBuscandoCep(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);

            // Validação básica
            if (!editFormData.nome.trim()) {
                alert('❌ O nome não pode estar vazio!');
                return;
            }

            if (!editFormData.telefone.trim()) {
                alert('❌ O telefone não pode estar vazio!');
                return;
            }

            let resultado;
            
            // Criar objeto apenas com os campos que queremos atualizar
            const dadosAtualizacao = {
                nome: editFormData.nome.trim(),
                email: userData.email, // Manter email atual
                telefone: editFormData.telefone.trim()
            };

            // Adicionar campos específicos de cada tipo de usuário
            if (user.tipo_usuario === 'cliente') {
                
                // Validar campos obrigatórios de endereço
                if (!editFormData.cep.trim() || !editFormData.rua.trim() || !editFormData.cidade.trim() || !editFormData.estado.trim()) {
                    alert('❌ Por favor, preencha todos os campos obrigatórios de endereço (CEP, Rua, Cidade, Estado).');
                    setSaving(false);
                    return;
                }
                
                // Adicionar campos obrigatórios do cliente
                dadosAtualizacao.cpf = userData.cpf;
                dadosAtualizacao.dataNascimento = userData.dataNascimento;
                dadosAtualizacao.senha = userData.senha;
                
                // Dados de endereço (pegar do formulário de edição)
                dadosAtualizacao.rua = editFormData.rua.trim();
                dadosAtualizacao.numero = editFormData.numero.trim();
                dadosAtualizacao.bairro = userData.endereco?.bairro || '';
                dadosAtualizacao.complemento = editFormData.complemento.trim();
                dadosAtualizacao.cidade = editFormData.cidade.trim();
                dadosAtualizacao.estado = editFormData.estado.trim();
                dadosAtualizacao.cep = editFormData.cep.replace(/\D/g, '');
                dadosAtualizacao.latitude = userData.endereco?.latitude || 0;
                dadosAtualizacao.longitude = userData.endereco?.longitude || 0;
                
                // Adicionar nova imagem se foi selecionada
                if (novaImagemBase64) {
                    dadosAtualizacao.imagemPerfil = novaImagemBase64;
                }
                
                resultado = await clientesAPI.update(user.id, dadosAtualizacao);
            } else if (user.tipo_usuario === 'profissional') {
                // Adicionar campos obrigatórios do profissional
                dadosAtualizacao.cpf = userData.cpf;
                dadosAtualizacao.dataNascimento = userData.dataNascimento;
                dadosAtualizacao.senha = userData.senha;
                
                // Adicionar nova imagem se foi selecionada
                if (novaImagemBase64) {
                    dadosAtualizacao.imagemPerfil = novaImagemBase64;
                }
                
                resultado = await profissionaisAPI.update(user.id, dadosAtualizacao);
            }

            if (resultado.success) {
                alert('✅ Perfil atualizado com sucesso!');
                setIsEditing(false);
                setNovaImagemPreview(null);
                setNovaImagemBase64(null);
                // Recarregar dados atualizados
                await loadUserData();
            } else {
                alert('❌ Erro ao atualizar perfil: ' + (resultado.error || resultado.message || 'Erro desconhecido'));
            }
        } catch (error) {
            alert('❌ Erro ao salvar perfil. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    // Aguardar verificação de autenticação
    if (authLoading) {
        return (
            <Layout>
                <main>
                    <div className="loading-message">
                        <p className="loading-text">⏳ Carregando...</p>
                    </div>
                </main>
            </Layout>
        );
    }

    if (!isAuthenticated) {
        return (
            <Layout>
                <main>
                    <h1>Você precisa estar logado para ver seu perfil</h1>
                </main>
            </Layout>
        );
    }

    return(
        <Layout>
            <main>
                <div className="profile-page-container">
                    <h1 className="profile-page-title">Perfil do Usuário</h1>
                    
                    {/* Seção de Informações Pessoais */}
                    <div className="personal-info-section">
                        <div className="section-header">
                            <h2 className="section-title">👤 Informações Pessoais</h2>
                            {!isEditing && (
                                <button
                                    onClick={handleEditClick}
                                    className="btn-edit-profile"
                                >
                                    ✏️ Editar Perfil
                                </button>
                            )}
                        </div>
                        <div className="profile-container">
                            {/* Foto de Perfil */}
                            {fotoPerfilUrl ? (
                                <img 
                                    src={fotoPerfilUrl} 
                                    alt="Foto de perfil" 
                                    className="profile-picture"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="default-profile-pic">
                                    <span>👤</span>
                                </div>
                            )}
                            {isEditing ? (
                                <div className="edit-form-container">
                                    <div className="form-field">
                                        <label>
                                            Foto de Perfil:
                                        </label>
                                        {(novaImagemPreview || fotoPerfilUrl) && (
                                            <div className="image-preview-container">
                                                <img 
                                                    src={novaImagemPreview || fotoPerfilUrl}
                                                    alt="Preview"
                                                    className="image-preview"
                                                />
                                                {novaImagemPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="btn-remove-image"
                                                    >
                                                        🗑️ Remover Nova Foto
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id="imageInput"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <small className="image-upload-help">
                                            JPG, PNG, GIF. Máx: 5MB
                                        </small>
                                    </div>
                                    <div className="form-field">
                                        <label>
                                            Nome:
                                        </label>
                                        <input
                                            type="text"
                                            name="nome"
                                            value={editFormData.nome}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>
                                            Telefone:
                                        </label>
                                        <input
                                            type="tel"
                                            name="telefone"
                                            value={editFormData.telefone}
                                            onChange={handleInputChange}
                                            placeholder="(11) 91234-5678"
                                        />
                                    </div>
                                    {user?.tipo_usuario === 'cliente' && (
                                        <>
                                            <h3 className="address-form-title">📍 Endereço</h3>
                                            <div className="form-field">
                                                <label>
                                                    CEP:
                                                </label>
                                                <div className="cep-input-container">
                                                    <input
                                                        type="text"
                                                        name="cep"
                                                        value={editFormData.cep}
                                                        onChange={handleInputChange}
                                                        placeholder="00000-000"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={buscarCep}
                                                        disabled={saving || buscandoCep || !editFormData.cep}
                                                        className="btn-search-cep"
                                                        title="Buscar endereço pelo CEP"
                                                    >
                                                        {buscandoCep ? '⏳' : '🔍'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="form-field">
                                                <label>
                                                    Rua:
                                                </label>
                                                <input
                                                    type="text"
                                                    name="rua"
                                                    value={editFormData.rua}
                                                    onChange={handleInputChange}
                                                    readOnly
                                                    className="input-readonly"
                                                    placeholder="Aguardando CEP..."
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>
                                                    Número:
                                                </label>
                                                <input
                                                    type="text"
                                                    name="numero"
                                                    value={editFormData.numero}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>
                                                    Complemento:
                                                </label>
                                                <input
                                                    type="text"
                                                    name="complemento"
                                                    value={editFormData.complemento}
                                                    onChange={handleInputChange}
                                                    placeholder="Opcional"
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>
                                                    Cidade:
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cidade"
                                                    value={editFormData.cidade}
                                                    onChange={handleInputChange}
                                                    readOnly
                                                    className="input-readonly"
                                                    placeholder="Aguardando CEP..."
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>
                                                    Estado (UF):
                                                </label>
                                                <input
                                                    type="text"
                                                    name="estado"
                                                    value={editFormData.estado}
                                                    onChange={handleInputChange}
                                                    maxLength="2"
                                                    placeholder="UF"
                                                    readOnly
                                                    className="input-readonly"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="edit-buttons">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="btn-save"
                                        >
                                            {saving ? '⏳ Salvando...' : '💾 Salvar'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="btn-cancel-edit"
                                        >
                                            ❌ Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="profile-name">
                                        {userData?.nome || user?.nome}
                                    </p>
                                    <p className="profile-email">
                                        📧 {userData?.email || user?.email}
                                    </p>
                                    {userData?.telefone && (
                                        <p className="profile-phone">
                                            📱 {userData.telefone}
                                        </p>
                                    )}
                                </>
                            )}
                            {!isEditing && (
                                <>
                                    {userData?.cpf && (
                                        <p className="profile-cpf">
                                            📄 CPF: {userData.cpf}
                                        </p>
                                    )}
                                    {userData?.dataNascimento && (
                                        <p className="profile-birth-date">
                                            🎂 Data de Nascimento: {new Date(userData.dataNascimento).toLocaleDateString('pt-BR')}
                                        </p>
                                    )}
                                    <p className="profile-user-type">
                                       👨‍🚀 Tipo: {user?.tipo_usuario === 'cliente' ? 'Cliente' : 'Profissional'}
                                    </p>
                                    {user?.tipo_usuario === 'cliente' && userData?.endereco?.cep && (
                                        <div className="address-section">
                                            <h3>📍 Endereço</h3>
                                            <p>
                                                <strong>CEP:</strong> {userData.endereco.cep}
                                            </p>
                                            {userData.endereco.rua && (
                                                <p>
                                                    <strong>Rua:</strong> {userData.endereco.rua}{userData.endereco.numero ? `, ${userData.endereco.numero}` : ''}
                                                </p>
                                            )}
                                            {userData.endereco.complemento && (
                                                <p>
                                                    <strong>Complemento:</strong> {userData.endereco.complemento}
                                                </p>
                                            )}
                                            {userData.endereco.cidade && userData.endereco.estado && (
                                                <p>
                                                    <strong>Cidade/UF:</strong> {userData.endereco.cidade} - {userData.endereco.estado}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {user?.tipo_usuario === 'profissional' && (
                                        <div className="establishment-buttons">
                                            {loadingEstabelecimento ? (
                                                <button
                                                    disabled
                                                    className="btn-checking"
                                                >
                                                    ⏳ Verificando...
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        if (temEstabelecimento) {
                                                            window.location.href = '/companyProfile';
                                                        } else {
                                                            window.location.href = '/newCompany';
                                                        }
                                                    }}
                                                    className={temEstabelecimento ? 'btn-view-company' : 'btn-create-company'}
                                                >
                                                    {temEstabelecimento ? '🏢 Ver Perfil da Empresa' : '➕ Criar Empresa'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Seção de Agenda - Apenas para Clientes */}
                    {user?.tipo_usuario === 'cliente' && (
                        <div className="agenda-section">
                            <h2 className="agenda-title">📅 Minha Agenda de Serviços</h2>
                            
                            {loading ? (
                                <p className="agenda-loading">
                                    ⏳ Carregando agenda...
                                </p>
                            ) : agenda.length === 0 ? (
                                <div className="agenda-empty">
                                    <p className="agenda-empty-title">
                                        📝 Você ainda não contratou nenhum serviço
                                    </p>
                                    <p className="agenda-empty-subtitle">
                                        Explore nossos serviços na página inicial e contrate o que precisar!
                                    </p>
                                </div>
                            ) : (
                                <div className="agenda-grid">
                                    {agenda.map((item) => (
                                        <div key={item.id} className="agenda-card">
                                            <div className="agenda-card-header">
                                                <div>
                                                    <h3 className="service-title">
                                                        🛎️ {item.servico?.nome || 'Serviço não encontrado'}
                                                    </h3>
                                                    {item.servico && (
                                                        <p className="service-price">
                                                            💰 R$ {Number(item.servico.preco).toFixed(2).replace('.', ',')}
                                                        </p>
                                                    )}
                                                    {item.estabelecimento && (
                                                        <p className="service-establishment">
                                                            🏢 {item.estabelecimento.nome}
                                                        </p>
                                                    )}
                                                    <p className="service-contract-date">
                                                        📅 Contratado em: {new Date(item.data_contrato).toLocaleDateString('pt-BR')}
                                                    </p>
                                                    {item.observacoes && (
                                                        <p className="service-notes">
                                                            📝 {item.observacoes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => handleVerDetalhes(item)}
                                                        className="btn-view-details"
                                                    >
                                                        👁️ Ver Detalhes
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelarContrato(item.id)}
                                                        className="btn-cancel-service"
                                                    >
                                                        ❌ Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {item.servico?.descricao && (
                                                <p className="service-description">
                                                    "{item.servico.descricao}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Detalhes do Serviço Contratado */}
            {showModal && selectedService && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedService.servico?.nome}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            {/* Imagem do Serviço */}
                            {selectedService.servico?.imagemServicoUrl && (
                                <div className="service-detail-section">
                                    <img 
                                        src={imagensAPI.getImageUrl(selectedService.servico.imagemServicoUrl)} 
                                        alt={selectedService.servico.nome}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Informações do Serviço */}
                            <div className="service-detail-section">
                                <h3>🛎️ Informações do Serviço</h3>
                                <p><strong>Nome:</strong> {selectedService.servico?.nome}</p>
                                {selectedService.servico?.descricao && (
                                    <p><strong>Descrição:</strong> {selectedService.servico.descricao}</p>
                                )}
                                <p><strong>Preço:</strong> R$ {Number(selectedService.servico?.preco).toFixed(2).replace('.', ',')}</p>                            
                                <p><strong>Data de Contratação:</strong> {new Date(selectedService.data_contrato).toLocaleDateString('pt-BR')}</p>
                                {selectedService.observacoes && (
                                    <p><strong>Observações:</strong> {selectedService.observacoes}</p>
                                )}
                            </div>

                            {/* Informações do Estabelecimento */}
                            {selectedService.estabelecimento && (
                                <>
                                    {/* Imagem do Estabelecimento */}
                                    {selectedService.estabelecimento.imagemEstabelecimentoUrl && (
                                        <div className="service-detail-section">
                                            <img 
                                                src={imagensAPI.getImageUrl(selectedService.estabelecimento.imagemEstabelecimentoUrl)} 
                                                alt={selectedService.estabelecimento.nome}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="service-detail-section">
                                        <h3>🏢 Estabelecimento</h3>
                                        <p><strong>Nome:</strong> {selectedService.estabelecimento.nome}</p>
                                        {selectedService.estabelecimento.descricao && (
                                            <p><strong>Descrição:</strong> {selectedService.estabelecimento.descricao}</p>
                                        )}
                                    </div>

                                    {/* Endereço */}
                                    {selectedService.estabelecimento.endereco && (
                                        <div className="service-detail-section">
                                            <h3>📍 Localização</h3>
                                            <div className="location-info">
                                                <p><strong>CEP:</strong> {selectedService.estabelecimento.endereco.cep}</p>
                                                <p><strong>Endereço:</strong> {selectedService.estabelecimento.endereco.rua}, {selectedService.estabelecimento.endereco.numero}</p>
                                                <p><strong>Cidade:</strong> {selectedService.estabelecimento.endereco.cidade}/{selectedService.estabelecimento.endereco.estado}</p>
                                                {selectedService.estabelecimento.endereco.complemento && (
                                                    <p><strong>Complemento:</strong> {selectedService.estabelecimento.endereco.complemento}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contato */}
                                    <div className="service-detail-section">
                                        <h3>📞 Contato</h3>
                                        {selectedService.estabelecimento.telefone && (
                                            <p><strong>Telefone:</strong> {selectedService.estabelecimento.telefone}</p>
                                        )}
                                        {selectedService.estabelecimento.email && (
                                            <p><strong>Email:</strong> {selectedService.estabelecimento.email}</p>
                                        )}
                                    </div>

                                    {/* Horários de Funcionamento */}
                                    {selectedService.estabelecimento.horarios && selectedService.estabelecimento.horarios.length > 0 && (
                                        <div className="service-detail-section">
                                            <h3>🕒 Horário de Funcionamento</h3>
                                            <div className="horarios-info">
                                                {selectedService.estabelecimento.horarios.map((horario, index) => (
                                                    <p key={index}>
                                                        <strong>{formatDiaSemana(horario.diaSemana)}:</strong> 
                                                        {horario.fechado ? ' Fechado' : ` ${horario.horaAbertura?.substring(0, 5)} às ${horario.horaFechamento?.substring(0, 5)}`}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="btn-secondary" 
                                onClick={handleCloseModal}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}