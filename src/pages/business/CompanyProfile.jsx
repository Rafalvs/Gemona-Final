import { useState, useEffect } from 'react';
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { estabelecimentosAPI, servicosAPI, imagensAPI, subcategoriasAPI, pedidosAPI, clientesAPI } from '../../services/apiService';
import { Button, Card, CardHeader, CardBody, Chip, Divider, Avatar, Spinner, Input, Select, SelectItem } from '@heroui/react';
import '../../styles/CompanyProfile.css';
import '../../styles/HeroUICustom.css';

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
                    <div className="loading-hero-container">
                        <Spinner size="lg" color="primary" label="Carregando..." />
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
                    <Button 
                        as={Link} 
                        to="/login"
                        color="primary"
                        variant="solid"
                        size="md"
                        className="bg-black text-[#ffecd1] border border-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        🔑 Fazer Login
                    </Button>
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
                    <Button 
                        as={Link} 
                        to="/profile"
                        color="primary"
                        variant="solid"
                        size="md"
                        className="bg-black text-[#ffecd1] border border-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        👤 Ir para Perfil Pessoal
                    </Button>
                </main>
            </Layout>
        );
    }

    return(
        <Layout>
            <main>
                <div className="company-profile-container">
                    <Card className="mb-hero-section card-hero-shadow">
                        <CardHeader className="pb-3">
                            <h1 className="text-hero-title">🏢 Perfil da Empresa</h1>
                        </CardHeader>
                    </Card>

                    {loading && (
                        <div className="loading-hero-section">
                            <Spinner size="lg" color="primary" label="Carregando dados da empresa..." />
                        </div>
                    )}

                    {error && (
                        <Card className="card-hero-gradient-red">
                            <CardBody className="text-hero-center">
                                <div className="icon-hero-2xl">❌</div>
                                <p className="text-lg text-red-600 mb-4">{error}</p>
                                <Button
                                    as={Link}
                                    to="/newCompany"
                                    color="primary"
                                    variant="solid"
                                    size="lg"
                                    className="btn-hero-primary btn-hero-lg"
                                >
                                    🏢 Cadastrar Estabelecimento
                                </Button>
                            </CardBody>
                        </Card>
                    )}

                    {!loading && !error && estabelecimento && (
                        <div>
                            {/* Imagem do Estabelecimento */}
                            {imagemUrl && (
                                <Card className="mb-hero-section">
                                    <CardBody className="flex-hero-center p-hero-card">
                                        <img 
                                            src={imagemUrl} 
                                            alt={estabelecimento.nome}
                                            className="img-hero-rounded img-hero-max-height"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </CardBody>
                                </Card>
                            )}

                            {/* Botões de Ação */}
                            <div className="flex-hero-center flex-hero-gap mb-hero-section">
                                <Button
                                    as={Link}
                                    to="/editCompany"
                                    color="primary"
                                    variant="solid"
                                    size="lg"
                                    className="btn-hero-primary btn-hero-lg"
                                >
                                    ✏️ Editar Empresa
                                </Button>
                                <Button
                                    as={Link}
                                    to="/profile"
                                    color="secondary"
                                    variant="solid"
                                    size="lg"
                                    className="btn-hero-primary btn-hero-lg"
                                >
                                    👤 Perfil Pessoal
                                </Button>
                            </div>

                            {/* Grid de Informações */}
                            <div className="grid-hero-responsive mb-hero-section">
                                {/* Informações da Empresa */}
                                <Card className="card-hero-shadow">
                                    <CardHeader>
                                        <Chip color="primary" variant="flat" size="lg" className="chip-hero-primary">
                                            📋 Dados da Empresa
                                        </Chip>
                                    </CardHeader>
                                    <Divider />
                                    <CardBody>
                                        <div className="space-hero-y">
                                            <div>
                                                <p className="text-hero-label">Nome</p>
                                                <p className="text-hero-emphasis">{estabelecimento.nome}</p>
                                            </div>
                                            <Divider />
                                            <div>
                                                <p className="text-hero-label">CNPJ</p>
                                                <p className="text-hero-value">{estabelecimento.cnpj}</p>
                                            </div>
                                            {estabelecimento.email && (
                                                <>
                                                    <Divider />
                                                    <div>
                                                        <p className="text-hero-label">Email</p>
                                                        <Chip color="secondary" variant="flat" startContent={<span>📧</span>}>
                                                            {estabelecimento.email}
                                                        </Chip>
                                                    </div>
                                                </>
                                            )}
                                            {estabelecimento.telefone && (
                                                <>
                                                    <Divider />
                                                    <div>
                                                        <p className="text-hero-label">Telefone</p>
                                                        <Chip color="success" variant="flat" startContent={<span>📱</span>}>
                                                            {estabelecimento.telefone}
                                                        </Chip>
                                                    </div>
                                                </>
                                            )}
                                            {estabelecimento.descricao && (
                                                <>
                                                    <Divider />
                                                    <div>
                                                        <p className="text-hero-label">Descrição</p>
                                                        <p className="text-hero-value">{estabelecimento.descricao}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Informações do Endereço */}
                                {estabelecimento?.endereco && (
                                    <Card className="card-hero-shadow">
                                        <CardHeader>
                                            <Chip color="warning" variant="flat" size="lg" className="chip-hero-primary">
                                                📍 Endereço
                                            </Chip>
                                        </CardHeader>
                                        <Divider />
                                        <CardBody>
                                            <div className="space-hero-y">
                                                <div>
                                                    <p className="text-hero-label">CEP</p>
                                                    <p className="text-hero-value">{estabelecimento.endereco.cep}</p>
                                                </div>
                                                <Divider />
                                                <div>
                                                    <p className="text-hero-label">Endereço</p>
                                                    <p className="text-hero-value">{estabelecimento.endereco.rua}, Nº {estabelecimento.endereco.numero}</p>
                                                </div>
                                                {estabelecimento.endereco.complemento && (
                                                    <>
                                                        <Divider />
                                                        <div>
                                                            <p className="text-hero-label">Complemento</p>
                                                            <p className="text-hero-value">{estabelecimento.endereco.complemento}</p>
                                                        </div>
                                                    </>
                                                )}
                                                <Divider />
                                                <div>
                                                    <p className="text-hero-label">Bairro</p>
                                                    <p className="text-hero-value">{estabelecimento.endereco.bairro}</p>
                                                </div>
                                                <Divider />
                                                <div>
                                                    <p className="text-hero-label">Cidade/Estado</p>
                                                    <Chip color="primary" variant="bordered">
                                                        {estabelecimento.endereco.cidade} - {estabelecimento.endereco.estado}
                                                    </Chip>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}

                                {/* Horários de Funcionamento */}
                                {estabelecimento && estabelecimento.horarios && estabelecimento.horarios.length > 0 && (
                                    <Card className="card-hero-shadow">
                                        <CardHeader>
                                            <Chip color="success" variant="flat" size="lg" className="chip-hero-primary">
                                                🕐 Horários de Funcionamento
                                            </Chip>
                                        </CardHeader>
                                        <Divider />
                                        <CardBody>
                                            <div className="space-hero-y-sm">
                                                {diasSemana.map((dia, index) => {
                                                    const diaSemanaNumero = index + 1;
                                                    const horario = estabelecimento.horarios.find(h => h.diaSemana === diaSemanaNumero);
                                                    
                                                    return (
                                                        <div key={diaSemanaNumero} className="horario-hero-item">
                                                            <span className="horario-hero-dia">{dia}:</span>
                                                            {horario && !horario.fechado ? (
                                                                <Chip color="success" variant="flat" size="sm">
                                                                    {horario.horaAbertura.substring(0, 5)} às {horario.horaFechamento.substring(0, 5)}
                                                                </Chip>
                                                            ) : (
                                                                <Chip color="danger" variant="flat" size="sm">
                                                                    Fechado
                                                                </Chip>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}

                                {/* Informações do Responsável */}
                                <Card className="card-hero-shadow">
                                    <CardHeader>
                                        <Chip color="secondary" variant="flat" size="lg" className="chip-hero-primary">
                                            👤 Responsável
                                        </Chip>
                                    </CardHeader>
                                    <Divider />
                                    <CardBody>
                                        <div className="space-hero-y">
                                            <div>
                                                <p className="text-hero-label">Nome</p>
                                                <p className="text-hero-emphasis">{user.nome}</p>
                                            </div>
                                            <Divider />
                                            <div>
                                                <p className="text-hero-label">Email</p>
                                                <Chip color="secondary" variant="flat" startContent={<span>📧</span>}>
                                                    {user.email}
                                                </Chip>
                                            </div>
                                            <Divider />
                                            <div>
                                                <p className="text-hero-label">Tipo de Conta</p>
                                                <Chip color="success" variant="solid" startContent={<span>👨‍🚀</span>}>
                                                    Profissional
                                                </Chip>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            <div className="flex-hero-center p-hero-section">
                                <Button
                                    as={Link}
                                    to="/newService"
                                    color="success"
                                    variant="solid"
                                    size="lg"
                                    className="btn-hero-primary btn-hero-lg"
                                >
                                    ➕ Adicionar Serviço
                                </Button>
                            </div>

                            {/* Seção de Serviços Contratados */}
                            <Card className="card-hero-shadow mb-hero-section">
                                <CardHeader>
                                    <Chip color="primary" variant="flat" size="lg" className="chip-hero-title">
                                        📋 Serviços Contratados por Clientes
                                    </Chip>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                {loadingContratacoes ? (
                                    <div className="loading-hero-section">
                                        <Spinner size="lg" color="primary" label="Carregando contratações..." />
                                    </div>
                                ) : contratacoes.length === 0 ? (
                                    <Card className="card-hero-gradient-yellow">
                                        <CardBody className="text-hero-center">
                                            <div className="icon-hero-2xl">📝</div>
                                            <p className="text-lg text-gray-600">
                                                Nenhum serviço foi contratado ainda.
                                            </p>
                                        </CardBody>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {contratacoes.map((contratacao) => (
                                            <Card key={contratacao.pedidoId} className="border-hero-hover">
                                                <CardHeader className="flex-hero-between pb-2">
                                                    <h3 className="text-hero-subtitle">
                                                        🛍️ {contratacao.servico.nome}
                                                    </h3>
                                                    <Chip 
                                                        color={contratacao.status === 'CONFIRMADO' ? 'success' : 'warning'} 
                                                        variant="solid"
                                                        size="sm"
                                                    >
                                                        {contratacao.status || 'PENDENTE'}
                                                    </Chip>
                                                </CardHeader>
                                                <Divider />
                                                <CardBody>
                                                    <div className="space-hero-y">
                                                        <div className="flex items-center gap-2">
                                                            <Chip color="primary" variant="flat" startContent={<span>👤</span>}>
                                                                {contratacao.cliente.nome}
                                                            </Chip>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Chip color="secondary" variant="flat" startContent={<span>📧</span>} size="sm">
                                                                {contratacao.cliente.email}
                                                            </Chip>
                                                        </div>
                                                        {contratacao.cliente.telefone && (
                                                            <div className="flex items-center gap-2">
                                                                <Chip color="success" variant="flat" startContent={<span>📞</span>} size="sm">
                                                                    {contratacao.cliente.telefone}
                                                                </Chip>
                                                            </div>
                                                        )}
                                                        <Divider />
                                                        <p className="text-sm">
                                                            <strong className="text-gray-600">📅 Data Agendamento:</strong>{' '}
                                                            <span className="font-semibold">{new Date(contratacao.dataAgendamento).toLocaleString('pt-BR')}</span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <strong className="text-gray-600">💰 Valor:</strong>{' '}
                                                            <span className="font-bold text-green-600 text-lg">{formatarReal(contratacao.servico.preco)}</span>
                                                        </p>
                                                        {contratacao.observacoes && (
                                                            <>
                                                                <Divider />
                                                                <div className="note-hero-container">
                                                                    <p className="text-hero-label">
                                                                        <strong>📝 Observações:</strong>
                                                                    </p>
                                                                    <p className="note-hero-text">{contratacao.observacoes}</p>
                                                                </div>
                                                            </>
                                                        )}
                                                        <Divider />
                                                        <div className="flex justify-end mt-3">
                                                            <Button
                                                                onClick={() => handleCancelarContratacao(contratacao.pedidoId)}
                                                                color="danger"
                                                                variant="flat"
                                                                size="sm"
                                                            >
                                                                ❌ Cancelar Contratação
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                                </CardBody>
                            </Card>

                            {/* Seção de Serviços */}
                            <Card className="card-hero-shadow">
                                <CardHeader>
                                    <Chip color="warning" variant="flat" size="lg" className="chip-hero-title">
                                        🛍️ Serviços da Empresa
                                    </Chip>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                {servicos.length === 0 ? (
                                    <Card className="card-hero-gradient-purple">
                                        <CardBody className="text-hero-center">
                                            <div className="icon-hero-2xl">🛍️</div>
                                            <p className="text-lg text-gray-600">
                                                Nenhum serviço cadastrado. Adicione seu primeiro serviço para aparecer na página de serviços!
                                            </p>
                                        </CardBody>
                                    </Card>
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
                                </CardBody>
                            </Card>                            
                        </div>
                    )}

                    {!loading && !error && !estabelecimento && (
                        <Card className="card-hero-shadow card-hero-gradient-blue">
                            <CardBody className="text-hero-center">
                                <div className="icon-hero-2xl">🏢</div>
                                <h2 className="text-hero-title mb-4">Nenhum estabelecimento cadastrado</h2>
                                <p className="text-lg text-gray-600 mb-6">Você ainda não cadastrou um estabelecimento para sua empresa.</p>
                                <Button
                                    as={Link}
                                    to="/newCompany"
                                    color="primary"
                                    variant="solid"
                                    size="lg"
                                    className="btn-hero-primary btn-hero-xl"
                                >
                                    ➕ Cadastrar Estabelecimento
                                </Button>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </main>
        </Layout>
    )
}