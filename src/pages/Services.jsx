import Layout from "../components/layout/Layout";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { servicosAPI, avaliacoesAPI, imagensAPI, estabelecimentosAPI, subcategoriasAPI, categoriasAPI, pedidosAPI } from '../services/apiService';
import RatingForm from '../components/RatingForm';
import { useAuth } from '../contexts/AuthContext';
import { Button, Spinner } from '@heroui/react';

export default function Services(){
    const [searchParams] = useSearchParams();
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [contractedServices, setContractedServices] = useState([]); // Serviços já contratados
    const [isContracting, setIsContracting] = useState(false);
    const [sortOrder, setSortOrder] = useState(''); // 'asc' ou 'desc' para preço
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false); // Filtro de disponível agora
    const [distanceRange, setDistanceRange] = useState(20); // Distância em km (0-20)
    const [userLocation, setUserLocation] = useState(null); // {latitude, longitude}
    const [enableDistanceFilter, setEnableDistanceFilter] = useState(false); // Habilitar filtro de distância
    const [distanceFilterApplied, setDistanceFilterApplied] = useState(false); // Controla se a busca foi aplicada
    const [distanceFilterTrigger, setDistanceFilterTrigger] = useState(0); // Trigger para forçar nova busca
    const [isLoading, setIsLoading] = useState(true); // Estado de loading
    const [showAllServices, setShowAllServices] = useState(false); // Mostrar todos os serviços sem filtro
    
    const { user, isAuthenticated } = useAuth();

    // funcao para remover acentos
    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    // Carregar contratos do usuário logado
    const loadUserContracts = async () => {
        if (isAuthenticated && user && user.tipo_usuario === 'cliente') {
            try {
                const resultado = await pedidosAPI.getByCliente(user.id);
                if (resultado.success && resultado.data) {
                    // Filtrar apenas pedidos ativos (não deletados)
                    const pedidosAtivos = resultado.data.filter(pedido => pedido.ativo !== false);
                    // Extrair IDs dos serviços já contratados
                    const servicosContratados = pedidosAtivos.map(pedido => pedido.servicoId);
                    setContractedServices(servicosContratados);
                } else {
                    setContractedServices([]);
                }
            } catch (error) {
                setContractedServices([]);
            }
        }
    };

    useEffect(() => {
        loadUserContracts();
        
        // Carregar localização do cliente se estiver logado
        const loadUserLocation = async () => {
            if (isAuthenticated && user && user.tipo_usuario === 'cliente') {
                console.log('👤 Dados do usuário:', user);
                
                // Se já tem latitude/longitude no user (veio do login)
                if (user.latitude && user.longitude) {
                    const location = {
                        latitude: parseFloat(user.latitude),
                        longitude: parseFloat(user.longitude)
                    };
                    setUserLocation(location);
                    console.log('🗺️ Localização do usuário carregada do contexto:', location);
                    console.log('🗺️ Tipo de dados:', typeof location.latitude, typeof location.longitude);
                } else {
                    // Buscar latitude/longitude da API (caso o usuário já estava logado antes da atualização)
                    try {
                        const { clientesAPI } = await import('../services/apiService');
                        const clienteResult = await clientesAPI.getById(user.id);
                        
                        if (clienteResult.success && clienteResult.data && clienteResult.data.endereco) {
                            const latitude = clienteResult.data.endereco.latitude || clienteResult.data.endereco.Latitude;
                            const longitude = clienteResult.data.endereco.longitude || clienteResult.data.endereco.Longitude;
                            
                            if (latitude && longitude) {
                                const location = { 
                                    latitude: parseFloat(latitude), 
                                    longitude: parseFloat(longitude) 
                                };
                                setUserLocation(location);
                                console.log('🗺️ Localização carregada da API:', location);
                                console.log('🗺️ Tipo de dados:', typeof location.latitude, typeof location.longitude);
                            } else {
                                console.warn('⚠️ Endereço sem latitude/longitude');
                                setUserLocation(null);
                            }
                        } else {
                            console.warn('⚠️ Cliente sem endereço cadastrado');
                            setUserLocation(null);
                        }
                    } catch (error) {
                        console.error('⚠️ Erro ao carregar localização:', error);
                        setUserLocation(null);
                    }
                }
            } else {
                setUserLocation(null);
            }
        };
        
        loadUserLocation();
    }, [isAuthenticated, user]);

    // Carregar serviços via API
    useEffect(() => {
        const busca = searchParams.get('busca') || '';
        const categoriaId = searchParams.get('categoriaId');
        const subcategoriaId = searchParams.get('subcategoriaId');
        setSearchTerm(busca);

        const loadData = async () => {
            setIsLoading(true);
            try {
                // Buscar serviços da API
                const servicosRes = await servicosAPI.getAll();
                
                if (!servicosRes.success || !servicosRes.data) {
                    setFilteredServices([]);
                    return;
                }

                // Mapear serviços com endereço (avaliações serão implementadas futuramente)
                const servicosPromises = servicosRes.data.map(async (service) => {
                    // A API já retorna os dados com nomes corretos (ServicoResponse)
                    const servicoId = service.servicoId || service.id;

                    // Buscar dados do estabelecimento (nome e endereço)
                    let estabelecimentoNome = 'Estabelecimento não informado';
                    let endereco = null;
                    if (service.estabelecimentoId) {
                        try {
                            const estabRes = await estabelecimentosAPI.getById(service.estabelecimentoId);
                            if (estabRes.success && estabRes.data) {
                                estabelecimentoNome = estabRes.data.nome || estabelecimentoNome;
                                endereco = estabRes.data.endereco || null;
                            }
                        } catch (error) {
                        }
                    }

                    // Buscar dados da subcategoria e categoria
                    let subCategoriaNome = 'Subcategoria não informada';
                    let categoriaNome = 'Categoria não informada';
                    if (service.subCategoriaId) {
                        try {
                            const subCatRes = await subcategoriasAPI.getById(service.subCategoriaId);
                            if (subCatRes.success && subCatRes.data) {
                                subCategoriaNome = subCatRes.data.nome || subCategoriaNome;
                                
                                // Buscar categoria da subcategoria
                                if (subCatRes.data.categoriaId) {
                                    const catRes = await categoriasAPI.getById(subCatRes.data.categoriaId);
                                    if (catRes.success && catRes.data) {
                                        categoriaNome = catRes.data.nome || categoriaNome;
                                    }
                                }
                            }
                        } catch (error) {
                            // Ignorar erro ao carregar subcategoria
                        }
                    }

                    return {
                        id: servicoId,
                        nome: service.nome,
                        descricao: service.descricao,
                        preco: service.preco,
                        imagemServicoUrl: service.imagemServicoUrl,
                        estabelecimento: {
                            id: service.estabelecimentoId,
                            nome: estabelecimentoNome,
                            endereco: endereco
                        },
                        categoria: {
                            nome: categoriaNome
                        },
                        subCategoria: {
                            nome: subCategoriaNome
                        },
                        mediaAvaliacao: 0, // Placeholder - será implementado futuramente
                        totalAvaliacoes: 0 // Placeholder - será implementado futuramente
                    };
                });

                const servicos = await Promise.all(servicosPromises);

                let filtered = servicos;

                // Filtrar por categoria se houver
                if (categoriaId) {
                    const catIdNum = Number(categoriaId);
                    filtered = filtered.filter(service => {
                        // Precisamos buscar a categoria da subcategoria para comparar
                        return servicosRes.data.find(s => 
                            (s.servicoId || s.id) === service.id && 
                            s.subCategoriaId
                        );
                    });
                    
                    // Filtrar pela categoria através da subcategoria
                    const servicosComCategoria = [];
                    for (const service of filtered) {
                        const serviceOriginal = servicosRes.data.find(s => (s.servicoId || s.id) === service.id);
                        if (serviceOriginal && serviceOriginal.subCategoriaId) {
                            try {
                                const subCatRes = await subcategoriasAPI.getById(serviceOriginal.subCategoriaId);
                                if (subCatRes.success && subCatRes.data && subCatRes.data.categoriaId === catIdNum) {
                                    servicosComCategoria.push(service);
                                }
                            } catch (error) {
                                // Ignorar erro ao filtrar
                            }
                        }
                    }
                    filtered = servicosComCategoria;
                }

                // Filtrar por subcategoria se houver
                if (subcategoriaId) {
                    const subCatIdNum = Number(subcategoriaId);
                    filtered = filtered.filter(service => {
                        const serviceOriginal = servicosRes.data.find(s => (s.servicoId || s.id) === service.id);
                        return serviceOriginal && serviceOriginal.subCategoriaId === subCatIdNum;
                    });
                }

                // Filtrar por busca se houver
                if (busca.trim()) {
                    const normalizedSearchTerm = removeAccents(busca.toLowerCase());
                    filtered = filtered.filter(service => {
                        const normalizedServiceName = removeAccents((service.nome || '').toLowerCase());
                        const normalizedCategoryName = removeAccents((service.categoria?.nome || '').toLowerCase());
                        const normalizedSubCategoryName = removeAccents((service.subCategoria?.nome || '').toLowerCase());
                        
                        return normalizedServiceName.includes(normalizedSearchTerm) ||
                               normalizedCategoryName.includes(normalizedSearchTerm) ||
                               normalizedSubCategoryName.includes(normalizedSearchTerm);
                    });
                }

                // Aplicar filtro de distância se usuário estiver logado, tiver localização e filtro estiver habilitado
                // Mas não aplicar se "Exibir todos" estiver ativo
                if (userLocation && enableDistanceFilter && distanceFilterApplied && !showAllServices) {
                    console.log('🔍 Aplicando filtro de distância:', {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        distancia: distanceRange,
                        servicosAntesFiltro: filtered.length
                    });
                    
                    console.log('📡 URL da requisição:', `/Estabelecimento/proximos?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&raioKm=${distanceRange}`);
                    
                    try {
                        const estabelecimentosProximosRes = await estabelecimentosAPI.getEstabelecimentosProximos(
                            userLocation.latitude,
                            userLocation.longitude,
                            distanceRange
                        );
                        
                        console.log('📍 Resposta da API de estabelecimentos próximos:', estabelecimentosProximosRes);
                        console.log('📍 Success:', estabelecimentosProximosRes.success);
                        console.log('📍 Quantidade retornada:', estabelecimentosProximosRes.data?.length);
                        console.log('📍 Dados completos retornados:', JSON.stringify(estabelecimentosProximosRes.data, null, 2));
                        
                        if (estabelecimentosProximosRes.success && estabelecimentosProximosRes.data) {
                            // A API retorna estabelecimentoId, não id
                            const estabelecimentosProximosIds = estabelecimentosProximosRes.data.map(e => e.estabelecimentoId);
                            console.log('🏢 IDs de estabelecimentos próximos:', estabelecimentosProximosIds);
                            
                            // Log dos estabelecimentos dos serviços filtrados
                            console.log('🏢 IDs de estabelecimentos nos serviços disponíveis:', 
                                filtered.map(s => ({ 
                                    servicoId: s.id, 
                                    servicoNome: s.nome,
                                    estabelecimentoId: s.estabelecimento?.id,
                                    estabelecimentoNome: s.estabelecimento?.nome
                                }))
                            );
                            
                            const servicosAntes = filtered.length;
                            
                            // Verificar se estabelecimento ID 1 está na lista retornada pela API
                            const estab1NaLista = estabelecimentosProximosIds.includes(1);
                            console.log(`🔍 Estabelecimento ID 1 retornado pela API? ${estab1NaLista ? 'SIM ✅' : 'NÃO ❌'}`);
                            
                            filtered = filtered.filter(service => {
                                const estabelecimentoId = service.estabelecimento?.id;
                                const includes = estabelecimentosProximosIds.includes(estabelecimentoId);
                                console.log(`${includes ? '✅' : '❌'} Serviço "${service.nome}" (Estabelecimento ID: ${estabelecimentoId}) ${includes ? 'INCLUÍDO' : 'EXCLUÍDO'}`);
                                return includes;
                            });
                            console.log(`✅ Filtro aplicado: ${servicosAntes} → ${filtered.length} serviços`);
                            console.log('📋 Serviços após filtro:', filtered.map(s => ({ nome: s.nome, estabelecimentoId: s.estabelecimento?.id })));
                            
                            if (filtered.length === 0) {
                                console.warn('⚠️ NENHUM serviço encontrado após filtro.');
                                console.warn('📍 Estabelecimentos próximos encontrados:', estabelecimentosProximosIds);
                                
                                // Encontrar estabelecimentos que não têm serviços
                                const estabelecimentosComServicos = [...new Set(servicos.map(s => s.estabelecimento?.id))];
                                const estabelecimentosSemServicos = estabelecimentosProximosIds.filter(
                                    id => !estabelecimentosComServicos.includes(id)
                                );
                                
                                if (estabelecimentosSemServicos.length > 0) {
                                    console.warn('🏢 Estabelecimentos próximos SEM serviços cadastrados:', estabelecimentosSemServicos);
                                    console.warn('💡 Cadastre serviços para estes estabelecimentos para que apareçam na busca!');
                                }
                                
                                console.warn('🏢 Estabelecimentos que TÊM serviços:', estabelecimentosComServicos);
                                console.warn('📏 Distância configurada:', distanceRange, 'km');
                            }
                        } else {
                            console.warn('⚠️ API não retornou estabelecimentos próximos válidos');
                        }
                    } catch (error) {
                        console.error('❌ Erro ao buscar estabelecimentos próximos:', error);
                    }
                }

                // Aplicar filtro de "disponível agora" se ativo
                // Mas não aplicar se "Exibir todos" estiver ativo
                if (showOnlyAvailable && !showAllServices) {
                    // Buscar horários dos estabelecimentos
                    const servicosComHorarios = [];
                    for (const service of filtered) {
                        if (service.estabelecimento?.id) {
                            try {
                                const estabRes = await estabelecimentosAPI.getById(service.estabelecimento.id);
                                if (estabRes.success && estabRes.data) {
                                    const estabelecimentoCompleto = estabRes.data;
                                    if (isEstabelecimentoAberto(estabelecimentoCompleto)) {
                                        servicosComHorarios.push(service);
                                    }
                                }
                            } catch (error) {
                                // Ignorar erro
                            }
                        }
                    }
                    filtered = servicosComHorarios;
                }

                // Aplicar ordenação por preço se houver (mesmo com "Exibir todos" ativo)
                if (sortOrder === 'asc') {
                    filtered = filtered.sort((a, b) => a.preco - b.preco);
                } else if (sortOrder === 'desc') {
                    filtered = filtered.sort((a, b) => b.preco - a.preco);
                }

                setFilteredServices(filtered);
            } catch (error) {
                setFilteredServices([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [searchParams, sortOrder, showOnlyAvailable, distanceFilterApplied, distanceFilterTrigger, userLocation, showAllServices]);

    // funcao para mostrar detalhes do servico
    const getServiceDetails = async (service) => {
        try {
            // Buscar detalhes do serviço
            const resultadoServico = await servicosAPI.getById(service.id);
            
            if (!resultadoServico.success || !resultadoServico.data) {
                return service;
            }

            const detalhes = resultadoServico.data;
            
            // Buscar dados completos do estabelecimento separadamente
            let estabelecimentoCompleto = null;
            const estabelecimentoId = detalhes.estabelecimentoId || service.estabelecimento?.id;
            
            if (estabelecimentoId) {
                const resultadoEstab = await estabelecimentosAPI.getById(estabelecimentoId);
                
                if (resultadoEstab.success && resultadoEstab.data) {
                    estabelecimentoCompleto = resultadoEstab.data;
                }
            }
            
            // Buscar dados completos da subcategoria separadamente
            let subcategoriaCompleta = null;
            let categoriaNome = detalhes.categoriaNome;
            const subCategoriaId = detalhes.subCategoriaId;
            
            if (subCategoriaId) {
                const resultadoSubCat = await subcategoriasAPI.getById(subCategoriaId);
                
                if (resultadoSubCat.success && resultadoSubCat.data) {
                    subcategoriaCompleta = resultadoSubCat.data;
                    
                    // Buscar categoria pelo ID da subcategoria
                    const categoriaId = subcategoriaCompleta.categoriaId;
                    if (categoriaId) {
                        const resultadoCategoria = await categoriasAPI.getById(categoriaId);
                        
                        if (resultadoCategoria.success && resultadoCategoria.data) {
                            categoriaNome = resultadoCategoria.data.nome;
                        } else {
                            categoriaNome = subcategoriaCompleta.categoriaNome;
                        }
                    } else {
                        categoriaNome = subcategoriaCompleta.categoriaNome;
                    }
                }
            }
            
            // Mapear para estrutura esperada pelo modal
            return {
                id: detalhes.servicoId || detalhes.id,
                nome: detalhes.nome,
                descricao: detalhes.descricao,
                preco: detalhes.preco,
                imagemServicoUrl: detalhes.imagemServicoUrl,
                categoria: {
                    nome: categoriaNome
                },
                subCategoria: subcategoriaCompleta ? {
                    nome: subcategoriaCompleta.nome
                } : {
                    nome: detalhes.subCategoriaNome
                },
                estabelecimento: estabelecimentoCompleto ? {
                    nome: estabelecimentoCompleto.nome,
                    descricao: estabelecimentoCompleto.descricao,
                    telefone: estabelecimentoCompleto.telefone,
                    email: estabelecimentoCompleto.email,
                    cnpj: estabelecimentoCompleto.cnpj,
                    imagemEstabelecimentoUrl: estabelecimentoCompleto.imagemEstabelecimentoUrl,
                    endereco: estabelecimentoCompleto.endereco,
                    horarios: estabelecimentoCompleto.horarios
                } : null,
                mediaAvaliacao: service.mediaAvaliacao,
                totalAvaliacoes: service.totalAvaliacoes
            };
        } catch (error) {
        }
        return service;
    };

    // funcao para abrir popup com detalhes
    const handleVerDetalhes = async (service) => {
        const serviceWithDetails = await getServiceDetails(service);
        setSelectedService(serviceWithDetails);
        setShowModal(true);
    };

    // funcao para fechar o popup
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedService(null);
    };

    const handleAvaliacoesAtualizadas = (novasAvaliacoes) => {
        // Função placeholder - lógica de avaliações será implementada futuramente
        console.log('Avaliações atualizadas (funcionalidade em desenvolvimento):', novasAvaliacoes);
    };

    // Função para contratar serviço
    const handleContratarServico = async (serviceId) => {
        if (!isAuthenticated || !user) {
            alert('Você precisa estar logado para contratar um serviço!');
            return;
        }

        if (user.tipo_usuario !== 'cliente') {
            alert('Apenas clientes podem contratar serviços!');
            return;
        }

        // Verificar novamente se o serviço já foi contratado (consulta atualizada)
        setIsContracting(true);
        
        try {
            const pedidosAtuais = await pedidosAPI.getByCliente(user.id);
            if (pedidosAtuais.success && pedidosAtuais.data) {
                // Filtrar apenas pedidos ativos
                const pedidosAtivos = pedidosAtuais.data.filter(pedido => pedido.ativo !== false);
                const jaContratado = pedidosAtivos.some(pedido => pedido.servicoId === serviceId);
                if (jaContratado) {
                    alert('Você já contratou este serviço!');
                    setIsContracting(false);
                    return;
                }
            }

            // Criar pedido
            const pedidoData = {
                clienteId: user.id,
                servicoId: serviceId,
                dataAgendamento: new Date().toISOString(),
                observacoes: 'Pedido criado pelo sistema'
            };

            const resultado = await pedidosAPI.create(pedidoData);
            
            if (resultado.success) {
                alert('Serviço contratado com sucesso! Você pode visualizar na sua agenda no perfil.');
                // Recarregar lista de contratos
                await loadUserContracts();
                setShowModal(false);
            } else {
                alert('Erro ao contratar serviço: ' + (resultado.error || 'Erro desconhecido'));
            }
        } catch (error) {
            alert('Erro ao contratar serviço: ' + error.message);
        } finally {
            setIsContracting(false);
        }
    };

    // Função para verificar se serviço já foi contratado
    const isServiceContracted = (serviceId) => {
        return contractedServices.includes(serviceId);
    };

    // funcao para formatar dias da semana
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

    // Função para formatar hora exibindo apenas HH:MM
    const formatHora = (hora) => {
        if (!hora || typeof hora !== 'string') return '';
    };

    // Função para lidar com filtros de preço
    const handlePriceSort = (order) => {
        if (sortOrder === order) {
            // Se já está selecionado, desmarcar
            setSortOrder('');
        } else {
            // Selecionar o novo filtro
            setSortOrder(order);
        }
    };

    // Função para alterar o valor da distância (não aplica filtro automaticamente)
    const handleDistanceChange = (newDistance) => {
        console.log('📏 Distância alterada:', newDistance, 'km');
        setDistanceRange(newDistance);
    };

    // Função para aplicar o filtro de distância
    const handleApplyDistanceFilter = () => {
        console.log('🔍 Aplicando filtro de distância:', distanceRange, 'km');
        setDistanceFilterApplied(true);
        setDistanceFilterTrigger(prev => prev + 1); // Incrementa para forçar nova busca
    };

    // Função para habilitar/desabilitar filtro de distância
    const handleEnableDistanceFilter = (checked) => {
        console.log('🔘 Filtro de distância:', checked ? 'HABILITADO' : 'DESABILITADO');
        setEnableDistanceFilter(checked);
        if (checked) {
            if (!userLocation) {
                alert('⚠️ Você precisa ter latitude e longitude cadastradas para usar o filtro de distância!');
                console.warn('⚠️ Usuário não possui localização cadastrada');
            } else {
                console.log('✅ Filtro de distância ativo com localização:', userLocation);
                setDistanceFilterApplied(true);
            }
        } else {
            console.log('❌ Filtro de distância desativado - mostrando todos os serviços');
            setDistanceFilterApplied(false);
        }
    };

    // Função para verificar se estabelecimento está aberto agora
    const isEstabelecimentoAberto = (estabelecimento) => {
        if (!estabelecimento || !estabelecimento.horarios || estabelecimento.horarios.length === 0) {
            return false; // Se não tem horários, considera fechado
        }

        const agora = new Date();
        const diaSemanaAtual = agora.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        const horaAtual = agora.getHours();
        const minutoAtual = agora.getMinutes();
        const minutosTotalAtual = horaAtual * 60 + minutoAtual;

        // Converter dia da semana do JS (0-6, domingo=0) para formato do banco (1-7, segunda=1, domingo=7)
        let diaConvertido = diaSemanaAtual === 0 ? 7 : diaSemanaAtual;

        // Buscar horário do dia atual
        const horarioHoje = estabelecimento.horarios.find(h => h.diaSemana === diaConvertido);

        if (!horarioHoje || horarioHoje.fechado) {
            return false; // Fechado hoje
        }

        // Converter horários de abertura e fechamento para minutos
        const [horaAbertura, minutoAbertura] = horarioHoje.horaAbertura.split(':').map(Number);
        const [horaFechamento, minutoFechamento] = horarioHoje.horaFechamento.split(':').map(Number);
        
        const minutosTotalAbertura = horaAbertura * 60 + minutoAbertura;
        const minutosTotalFechamento = horaFechamento * 60 + minutoFechamento;

        // Verificar se está dentro do horário de funcionamento
        return minutosTotalAtual >= minutosTotalAbertura && minutosTotalAtual <= minutosTotalFechamento;
    };

    return(
        <Layout>

            <main className="services-layout">
                <div className="filters">
                    <h3>Filtros</h3>
                    <div className="filter-section">
                        <Button
                            onClick={() => setShowAllServices(!showAllServices)}
                            color={showAllServices ? 'success' : 'default'}
                            variant="solid"
                            size="sm"
                            className={showAllServices 
                                ? 'bg-[#05315f] text-white font-bold mb-4' 
                                : 'bg-gray-200 text-gray-700 font-bold mb-4 hover:bg-gray-300'
                            }
                        >
                            {showAllServices ? '✓ Exibindo Todos' : 'Exibir Todos'}
                        </Button> <br/>
                        {showAllServices && (
                            <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '12px', fontStyle: 'italic' }}>
                                Filtros de distância e disponibilidade desativados
                            </p>
                        )}
                        {isAuthenticated && user ? (
                            <>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={enableDistanceFilter}
                                        onChange={(e) => handleEnableDistanceFilter(e.target.checked)}
                                        disabled={!userLocation}
                                    />
                                    Filtrar por distância
                                    {!userLocation && (
                                        <span style={{ fontSize: '0.85em', color: '#dc3545', marginLeft: '8px' }}>
                                            (localização não cadastrada)
                                        </span>
                                    )}
                                </label> <br/>
                                {enableDistanceFilter && userLocation && (
                                    <div style={{ marginLeft: '20px' }}>
                                        <label>
                                            Distância: {distanceRange} km
                                            <input 
                                                type="range" 
                                                min="1" 
                                                max="20" 
                                                value={distanceRange}
                                                onChange={(e) => handleDistanceChange(Number(e.target.value))}
                                                style={{ width: '100%', marginTop: '8px' }}
                                            />
                                        </label>
                                        <button 
                                            onClick={handleApplyDistanceFilter}
                                            style={{
                                                marginTop: '10px',
                                                padding: '6px 12px',
                                                backgroundColor: '#05315f',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9em'
                                            }}
                                        >
                                            Aplicar Filtro
                                        </button>
                                    </div>
                                )}
                                <br/>
                            </>
                        ) : (
                            <p style={{ fontSize: '0.9em', color: '#666', fontStyle: 'italic', marginBottom: '10px' }}>
                                Faça login para usar o filtro de distância
                            </p>
                        )}
                        <label>
                            <input 
                                type="checkbox" 
                                checked={showOnlyAvailable}
                                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                            />
                            Disponível agora
                        </label> <br/>
                        <label>
                            <input type="checkbox" />
                            Melhor avaliado
                        </label> <br/>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={sortOrder === 'asc'}
                                onChange={() => handlePriceSort('asc')}
                            />
                            Preço: Menor para o maior
                        </label> <br/>
                        <label>
                            <input 
                                type="checkbox" 
                                checked={sortOrder === 'desc'}
                                onChange={() => handlePriceSort('desc')}
                            />
                            Preço: Maior para o menor
                        </label> <br/>
                    </div>
                </div>

                <div className="services-content">
                    {searchTerm && (
                        <h3>Resultados para: "{searchTerm}"</h3>
                    )}
                    
                    {isLoading ? (
                        <div className="loading-container" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            minHeight: '400px',
                            gap: '16px'
                        }}>
                            <Spinner size="lg" color="primary" />
                            <p style={{ color: '#05315f', fontSize: '1.1em', fontWeight: 'bold' }}>
                                Carregando serviços...
                            </p>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div className="no-results">
                            {searchTerm ? (
                                <div>
                                    <h3>Nenhum serviço encontrado para "{searchTerm}"</h3>
                                    <p>Tente buscar por outro termo</p>
                                </div>
                            ) : enableDistanceFilter && distanceFilterApplied ? (
                                <div>
                                    <h3>📍 Nenhum serviço encontrado no raio de {distanceRange}km</h3>
                                    <p>Embora existam estabelecimentos próximos, eles ainda não têm serviços cadastrados.</p>
                                    <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
                                        💡 Dica: Aumente a distância ou desmarque o filtro de distância para ver mais opções.
                                    </p>
                                </div>
                            ) : showOnlyAvailable ? (
                                <div>
                                    <h3>🕒 Nenhum estabelecimento aberto no momento</h3>
                                    <p>Tente novamente mais tarde ou desmarque o filtro "Disponível agora".</p>
                                </div>
                            ) : searchParams.get('categoriaId') || searchParams.get('subcategoriaId') ? (
                                <div>
                                    <h3>⚠️ Nenhum serviço cadastrado</h3>
                                    <p>Não há serviços disponíveis nesta categoria no momento.</p>
                                </div>
                            ) : (
                                <p>Nenhum serviço disponível no momento.</p>
                            )}
                        </div>
                    ) : (
                        <div className="services-grid">
                            {filteredServices.map((service, index) => {
                                return (
                                    <div key={service.id || index} className="service-box">
                                        <div className="service-content-wrapper">
                                            {service.categoria && (
                                                <span className="service-category-badge">
                                                    {service.categoria.nome}
                                                </span>
                                            )}
                                            <h4>{service.nome}</h4>                                            
                                            
                                            <div className="service-price">
                                                R$ {Number(service.preco).toFixed(2).replace('.', ',')}
                                            </div>
                                            
                                            {service.estabelecimento && (
                                                <div className="service-establishment">
                                                    🏢 {service.estabelecimento.nome}
                                                </div>
                                            )}
                                            
                                            {service.estabelecimento?.endereco && (
                                                <div style={{ color: '#666', fontSize: '0.85em', marginTop: '4px' }}>
                                                    📍 {service.estabelecimento.endereco.rua}, {service.estabelecimento.endereco.numero} - {service.estabelecimento.endereco.bairro}
                                                    <br />
                                                    {service.estabelecimento.endereco.cidade}/{service.estabelecimento.endereco.estado} - CEP: {service.estabelecimento.endereco.cep}
                                                </div>
                                            )}
                                            
                                            {service.subCategoria && (
                                                <div style={{ color: '#666', fontSize: '0.85em', marginTop: '4px' }}>
                                                    📂 {service.subCategoria.nome}
                                                </div>
                                            )}
                                        </div>

                                        <div className="service-actions">
                                            <Button 
                                                onClick={() => handleVerDetalhes(service)}
                                                color="primary"
                                                variant="solid"
                                                size="md"
                                                className="bg-black text-[#ffecd1] border border-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
                                            >
                                                Detalhes
                                            </Button>
                                            <Button 
                                                onClick={() => handleContratarServico(service.id)}
                                                disabled={isServiceContracted(service.id) || isContracting}
                                                color={isServiceContracted(service.id) ? 'default' : 'success'}
                                                variant="solid"
                                                size="md"
                                                className={isServiceContracted(service.id) ? '' : 'bg-black text-[#ffecd1] border border-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg'}
                                            >
                                                {isServiceContracted(service.id) ? 'Contratado' : 'Contratar'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Detalhes do Serviço */}
            {showModal && selectedService && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedService.nome}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            {/* Imagem do Serviço */}
                            {selectedService.imagemServicoUrl && (
                                <div className="service-detail-section" style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <img 
                                        src={imagensAPI.getImageUrl(selectedService.imagemServicoUrl)} 
                                        alt={selectedService.nome}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '300px',
                                            borderRadius: '8px',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Informações do Serviço */}
                            <div className="service-detail-section">
                                <h3>🛎️ Informações do Serviço</h3>
                                <p><strong>Nome:</strong> {selectedService.nome}</p>
                                {selectedService.descricao && (
                                    <p><strong>Descrição:</strong> {selectedService.descricao}</p>
                                )}
                                <p><strong>Preço:</strong> R$ {Number(selectedService.preco).toFixed(2).replace('.', ',')}</p>
                                
                                {/* Categoria e Subcategoria */}
                                {selectedService.categoria && (
                                    <p><strong>Categoria:</strong> {selectedService.categoria.nome}</p>
                                )}
                                {selectedService.subCategoria && (
                                    <p><strong>Subcategoria:</strong> {selectedService.subCategoria.nome}</p>
                                )}
                            </div>

                            {/* Informações do Estabelecimento */}
                            {selectedService.estabelecimento && (
                                <>
                                    {/* Imagem do Estabelecimento */}
                                    {selectedService.estabelecimento.imagemEstabelecimentoUrl && (
                                        <div className="service-detail-section" style={{ textAlign: 'center', marginBottom: '20px' }}>
                                            <img 
                                                src={imagensAPI.getImageUrl(selectedService.estabelecimento.imagemEstabelecimentoUrl)} 
                                                alt={selectedService.estabelecimento.nome}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '300px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover'
                                                }}
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

                            {/* Avaliações */}
                            <div className="service-detail-section">
                                <RatingForm servico={selectedService} onAvaliacoesAtualizadas={handleAvaliacoesAtualizadas} />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="btn-contratar" 
                                onClick={() => handleContratarServico(selectedService.id)}
                                disabled={isServiceContracted(selectedService.id) || isContracting}
                                style={{
                                    backgroundColor: isServiceContracted(selectedService.id) ? '#6c757d' : '#05315f',
                                    opacity: isServiceContracted(selectedService.id) ? 0.6 : 1,
                                    cursor: isServiceContracted(selectedService.id) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isContracting ? 'Contratando...' : 
                                 isServiceContracted(selectedService.id) ? 'Já Contratado' : 'Contratar Serviço'}
                            </button>
                            <button className="btn-secondary" onClick={handleCloseModal}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}