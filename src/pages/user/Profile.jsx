import Layout from "../../components/layout/Layout"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { clientesAPI, profissionaisAPI, imagensAPI, estabelecimentosAPI, enderecosAPI, pedidosAPI, servicosAPI } from '../../services/apiService'
import { Card, CardHeader, CardBody, Button, Chip, Divider, Avatar, Input, Spinner } from '@heroui/react'
import { User, Mail, Phone, FileText, Cake, MapPin, Home, Building2, Calendar, Clock, Eye, X, Edit, Save, Trash2, DollarSign, Bell, Store, Search } from 'lucide-react'
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
                    <div className="loading-message flex flex-col items-center justify-center gap-3">
                        <Spinner size="lg" />
                        <p className="loading-text">Carregando...</p>
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
                    <Card className="mb-6 shadow-xl">
                        <CardHeader className="pb-3">
                            <h1 className="text-3xl font-bold text-[#05315e] flex items-center gap-2">
                                <User size={32} />
                                Perfil do Usuário
                            </h1>
                        </CardHeader>
                    </Card>
                    
                    {/* Seção de Informações Pessoais */}
                    <Card className="personal-info-section shadow-xl">
                        <CardBody>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <Chip color="primary" variant="flat" size="lg" className="text-lg font-bold" startContent={<User size={20} />}>
                                    Informações Pessoais
                                </Chip>
                            </div>
                            {!isEditing && (
                                <Button
                                    onClick={handleEditClick}
                                    color="primary"
                                    variant="solid"
                                    size="md"
                                    className="bg-black text-[#ffecd1] border border-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
                                    startContent={<Edit size={18} />}
                                >
                                    Editar Perfil
                                </Button>
                            )}
                        </div>
                        <div className="profile-container">
                            {/* Foto de Perfil */}
                            <div className="flex justify-center mb-6">
                                <Avatar
                                    src={fotoPerfilUrl}
                                    alt="Foto de perfil"
                                    className="w-32 h-32 text-large"
                                    isBordered
                                    color="primary"
                                    showFallback
                                    fallback={<User size={48} />}
                                />
                            </div>
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
                                                        className="btn-remove-image flex items-center justify-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        Remover Nova Foto
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
                                            <h3 className="address-form-title flex items-center gap-2">
                                                <MapPin size={20} />
                                                Endereço
                                            </h3>
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
                                                        className="btn-search-cep flex items-center justify-center"
                                                        title="Buscar endereço pelo CEP"
                                                    >
                                                        {buscandoCep ? <Spinner size="sm" /> : <Search size={18} />}
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
                                            className="btn-save flex items-center justify-center gap-2"
                                        >
                                            {saving ? (
                                                <>
                                                    <Spinner size="sm" color="white" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} />
                                                    Salvar
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="btn-cancel-edit flex items-center justify-center gap-2"
                                        >
                                            <X size={18} />
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-[#05315e] mb-2">
                                            {userData?.nome || user?.nome}
                                        </h2>
                                    </div>
                                    <Divider />
                                    <div className="flex flex-col gap-1">
                                        <Chip color="secondary" variant="flat" startContent={<Mail size={18} />} className="text-base px-4 py-2">
                                            {userData?.email || user?.email}
                                        </Chip>
                                        {userData?.telefone && (
                                            <Chip color="success" variant="flat" startContent={<Phone size={18} />} className="text-base px-7 py-2">
                                                {userData.telefone}
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            )}
                            {!isEditing && (
                                <>
                                    <Divider className="my-4" />
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {userData?.cpf && (
                                            <Chip color="default" variant="bordered" startContent={<FileText size={16} />} className="text-sm">
                                                CPF: {userData.cpf}
                                            </Chip>
                                        )}
                                        {userData?.dataNascimento && (
                                            <Chip color="warning" variant="flat" startContent={<Cake size={16} />} className="text-sm">
                                                {new Date(userData.dataNascimento).toLocaleDateString('pt-BR')}
                                            </Chip>
                                        )}
                                        <Chip 
                                            color={user?.tipo_usuario === 'cliente' ? 'primary' : 'success'} 
                                            variant="solid" 
                                            startContent={<User size={16} />}
                                            className="text-sm font-bold"
                                        >
                                            {user?.tipo_usuario === 'cliente' ? 'Cliente' : 'Profissional'}
                                        </Chip>
                                    </div>
                                    {user?.tipo_usuario === 'cliente' && userData?.endereco?.cep && (
                                        <Card className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                                            <CardHeader>
                                                <h3 className="text-lg font-bold text-[#05315e] flex items-center gap-2">
                                                    <MapPin size={20} />
                                                    Endereço
                                                </h3>
                                            </CardHeader>
                                            <Divider />
                                            <CardBody>
                                                <div className="space-y-2 text-sm">
                                                    <p>
                                                        <strong className="text-[#05315e]">CEP:</strong> {userData.endereco.cep}
                                                    </p>
                                                    {userData.endereco.rua && (
                                                        <p>
                                                            <strong className="text-[#05315e]">Rua:</strong> {userData.endereco.rua}{userData.endereco.numero ? `, ${userData.endereco.numero}` : ''}
                                                        </p>
                                                    )}
                                                    {userData.endereco.complemento && (
                                                        <p>
                                                            <strong className="text-[#05315e]">Complemento:</strong> {userData.endereco.complemento}
                                                        </p>
                                                    )}
                                                    {userData.endereco.cidade && userData.endereco.estado && (
                                                        <p>
                                                            <strong className="text-[#05315e]">Cidade/UF:</strong> {userData.endereco.cidade} - {userData.endereco.estado}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    )}
                                    {user?.tipo_usuario === 'profissional' && (
                                        <div className="flex justify-center mt-6">
                                            {loadingEstabelecimento ? (
                                                <Button
                                                    disabled
                                                    color="bg-black"
                                                    variant="flat"
                                                    isLoading
                                                >
                                                    Verificando...
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => {
                                                        if (temEstabelecimento) {
                                                            window.location.href = '/companyProfile';
                                                        } else {
                                                            window.location.href = '/newCompany';
                                                        }
                                                    }}
                                                    color={temEstabelecimento ? 'primary' : 'success'}
                                                    variant="solid"
                                                    size="lg"
                                                    className="bg-black text-[#ffecd1] border border-[#ffecd1] font-bold px-6 py-3 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
                                                    startContent={temEstabelecimento ? <Store size={20} /> : <Building2 size={20} />}
                                                >
                                                    {temEstabelecimento ? 'Ver Perfil da Empresa' : 'Criar Empresa'}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </CardBody>
                    </Card>

                    {/* Seção de Agenda - Apenas para Clientes */}
                    {user?.tipo_usuario === 'cliente' && (
                        <Card className="mt-6 shadow-xl">
                            <CardHeader className="pb-3">
                                <Chip color="success" variant="flat" size="lg" className="text-xl font-bold" startContent={<Calendar size={24} />}>
                                    Minha Agenda de Serviços
                                </Chip>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <Spinner size="lg" color="primary" label="Carregando agenda..." />
                                </div>
                            ) : agenda.length === 0 ? (
                                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
                                    <CardBody className="text-center py-8">
                                        <div className="mb-4">
                                            <FileText size={64} className="mx-auto text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-[#05315e] mb-2">
                                            Você ainda não contratou nenhum serviço
                                        </h3>
                                        <p className="text-gray-600">
                                            Explore nossos serviços na página inicial e contrate o que precisar!
                                        </p>
                                    </CardBody>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agenda.map((item) => (
                                        <Card 
                                            key={item.id} 
                                            className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200"
                                        >
                                            <CardBody className="p-5">
                                                {/* Header com imagem e título */}
                                                <div className="flex gap-4 mb-4">
                                                    {item.servico?.imagemServicoUrl ? (
                                                        <img 
                                                            src={imagensAPI.getImageUrl(item.servico.imagemServicoUrl)} 
                                                            alt={item.servico.nome}
                                                            className="w-20 h-20 object-cover rounded-lg shadow-md"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-md">
                                                            <Bell size={36} className="text-blue-600" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-[#05315f] mb-1">
                                                            {item.servico?.nome || 'Serviço não encontrado'}
                                                        </h3>
                                                        {item.estabelecimento && (
                                                            <Chip 
                                                                size="sm" 
                                                                variant="flat" 
                                                                color="secondary"
                                                                startContent={<Store size={16} />}
                                                            >
                                                                {item.estabelecimento.nome}
                                                            </Chip>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Descrição */}
                                                {item.servico?.descricao && (
                                                    <p className="text-sm text-gray-600 mb-3 italic">
                                                        "{item.servico.descricao}"
                                                    </p>
                                                )}

                                                <Divider className="my-3" />

                                                {/* Informações */}
                                                <div className="space-y-2 mb-4">
                                                    {item.servico && (
                                                        <div className="flex items-center justify-between">
                                                            <Chip 
                                                                size="md" 
                                                                variant="flat" 
                                                                color="success"
                                                                startContent={<DollarSign size={18} />}
                                                                className="font-bold"
                                                            >
                                                                R$ {Number(item.servico.preco).toFixed(2).replace('.', ',')}
                                                            </Chip>
                                                            <Chip 
                                                                size="sm" 
                                                                variant="flat" 
                                                                color="primary"
                                                                startContent={<Calendar size={16} />}
                                                            >
                                                                {new Date(item.data_contrato).toLocaleDateString('pt-BR')}
                                                            </Chip>
                                                        </div>
                                                    )}
                                                    
                                                    {item.observacoes && (
                                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                            <p className="text-sm text-gray-700 flex gap-2">
                                                                <FileText size={16} className="text-yellow-700 flex-shrink-0 mt-0.5" />
                                                                <span><strong className="text-yellow-700">Observações:</strong> {item.observacoes}</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Botões de ação */}
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        onClick={() => handleVerDetalhes(item)}
                                                        color="primary"
                                                        variant="solid"
                                                        size="md"
                                                        className="bg-[#05315f] text-white font-semibold hover:bg-[#041f3f] transition-all duration-300 shadow-md hover:shadow-lg"
                                                        startContent={<Eye size={18} />}
                                                    >
                                                        Ver Detalhes
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleCancelarContrato(item.id)}
                                                        color="danger"
                                                        variant="bordered"
                                                        size="md"
                                                        className="font-semibold hover:bg-red-50 transition-all duration-300"
                                                        startContent={<Trash2 size={18} />}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                            </CardBody>
                        </Card>
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
                                <h3 className="flex items-center gap-2">
                                    <Bell size={20} />
                                    Informações do Serviço
                                </h3>
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
                                        <h3 className="flex items-center gap-2">
                                            <Store size={20} />
                                            Estabelecimento
                                        </h3>
                                        <p><strong>Nome:</strong> {selectedService.estabelecimento.nome}</p>
                                        {selectedService.estabelecimento.descricao && (
                                            <p><strong>Descrição:</strong> {selectedService.estabelecimento.descricao}</p>
                                        )}
                                    </div>

                                    {/* Endereço */}
                                    {selectedService.estabelecimento.endereco && (
                                        <div className="service-detail-section">
                                            <h3 className="flex items-center gap-2">
                                                <MapPin size={20} />
                                                Localização
                                            </h3>
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
                                        <h3 className="flex items-center gap-2">
                                            <Phone size={20} />
                                            Contato
                                        </h3>
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
                                            <h3 className="flex items-center gap-2">
                                                <Clock size={20} />
                                                Horário de Funcionamento
                                            </h3>
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