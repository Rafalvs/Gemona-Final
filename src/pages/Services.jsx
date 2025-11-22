import Layout from "../components/layout/Layout";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { servicosAPI, estabelecimentosAPI, enderecosAPI, usuariosAPI, contratosAPI } from '../services/apiService';
import { formatarTelefone } from '../utils/validators';
import { useAuth } from '../contexts/AuthContext';

export default function Services(){
    const [searchParams] = useSearchParams();
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [contractedServices, setContractedServices] = useState([]); // Serviços já contratados
    const [isContracting, setIsContracting] = useState(false);
    
    const { user, isAuthenticated } = useAuth();

    // funcao para remover acentos
    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    // Carregar contratos do usuário logado
    useEffect(() => {
        const loadUserContracts = async () => {
            if (isAuthenticated && user) {
                const result = await contratosAPI.getByUsuario(user.id);
                if (result.success) {
                    setContractedServices(result.data.map(c => c.servico_id));
                }
            }
        };

        loadUserContracts();
    }, [isAuthenticated, user]);

    // Carregar serviços via API e checar se usuário PJ possui estabelecimento
    useEffect(() => {
        const busca = searchParams.get('busca') || '';
        setSearchTerm(busca);

        const loadData = async () => {
            // buscar serviços
            const servicosRes = await servicosAPI.getAll();
            if (!servicosRes.success) {
                setFilteredServices([]);
                return;
            }

            // buscar dados auxiliares
            const estabelecimentosRes = await estabelecimentosAPI.getAll();
            const enderecosRes = await enderecosAPI.getAll();
            const usuariosRes = await usuariosAPI.getAll();

            const servicos = servicosRes.data.map(s => ({ ...s }));

            // enriquece cada serviço com estabelecimento, endereco e usuario
            const enriched = servicos.map(service => {
                const est = estabelecimentosRes.success ? estabelecimentosRes.data.find(e => e.id === service.estabelecimento_id) : null;
                const end = enderecosRes.success && est ? enderecosRes.data.find(en => en.id === est.endereco_id) : null;
                const usuario = usuariosRes.success && est ? usuariosRes.data.find(u => u.id === est.profissional_id) : null;
                return { ...service, estabelecimento: est, endereco: end, usuario: usuario };
            });

            if (busca.trim()) {
                const normalizedSearchTerm = removeAccents(busca.toLowerCase());
                const filtered = enriched.filter(service => {
                    const normalizedServiceName = removeAccents((service.nome || '').toLowerCase());
                    const matchesServiceName = normalizedServiceName.includes(normalizedSearchTerm);
                    const subCatName = '';
                    const matchesCategory = false;
                    return matchesServiceName || matchesCategory || subCatName.includes(normalizedSearchTerm);
                });
                setFilteredServices(filtered);
            } else {
                setFilteredServices(enriched);
            }
        };

        loadData();
    }, [searchParams]);

    // funcao para mostrar detalhes do servico (já enriquecido)
    const getServiceDetails = (service) => ({ ...service });

    // funcao para abrir popup com detalhes
    const handleVerDetalhes = (service) => {
        const serviceWithDetails = getServiceDetails(service);
        setSelectedService(serviceWithDetails);
        setShowModal(true);
    };

    // funcao para fechar o popup
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedService(null);
    };

    // Função para contratar serviço
    const handleContratarServico = async (serviceId) => {
        if (!isAuthenticated || !user) {
            alert('Você precisa estar logado para contratar um serviço!');
            return;
        }

        if (contractedServices.includes(serviceId)) {
            alert('Você já contratou este serviço!');
            return;
        }

        setIsContracting(true);
        
        try {
            const contratoData = {
                usuario_id: user.id,
                servico_id: serviceId,
                status: 'ativo'
            };

            const result = await contratosAPI.create(contratoData);
            
            if (result.success) {
                alert('Serviço contratado com sucesso! Você pode visualizar na sua agenda no perfil.');
                setContractedServices(prev => [...prev, serviceId]);
                setShowModal(false);
            } else {
                alert('Erro ao contratar serviço: ' + result.error);
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
        // Extrai as duas primeiras partes (HH:MM) mesmo que venha HH:MM:SS
        const match = hora.match(/^(\d{2}):(\d{2})/);
        return match ? `${match[1]}:${match[2]}` : hora;
    };

    return(
        <Layout>

            <main className="services-layout">
                <div className="filters">
                    <h3>Filtros</h3>
                    <div className="filter-section">
                        <label>
                            <input type="checkbox" />
                            Disponível agora
                        </label>
                        <label>
                            <input type="checkbox" />
                            Melhor avaliado
                        </label>
                        <label>
                            Distância
                            <input type="range" min="0" max="100" />
                        </label>
                    </div>
                </div>
                
                <div className="services-content">
                    {searchTerm && (
                        <h3>Resultados para: "{searchTerm}"</h3>
                    )}
                    
                    {filteredServices.length === 0 ? (
                        <div className="no-results">
                            {searchTerm ? (
                                <div>
                                    <h3>Nenhum serviço encontrado para "{searchTerm}"</h3>
                                    <p>Tente buscar por outro termo</p>
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
                                        <h4>{service.nome}</h4>
                                        <p><strong>R$ {service.preco}</strong></p>
                                        {service.estabelecimento && <p><em>{service.estabelecimento.nome}</em></p>}
                                        <div className="service-actions">
                                            <button onClick={() => handleVerDetalhes(service)}>Ver Detalhes</button>
                                            <button 
                                                onClick={() => handleContratarServico(service.id)}
                                                disabled={isServiceContracted(service.id) || isContracting}
                                                className={`btn-contratar ${
                                                    isServiceContracted(service.id) 
                                                        ? 'service-contract-btn-disabled' 
                                                        : isContracting 
                                                            ? 'service-contract-btn-disabled'
                                                            : 'service-contract-btn-contracted'
                                                }`}
                                            >
                                                {isServiceContracted(service.id) ? 'Já Contratado' : 'Contratar'}
                                            </button>
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
                            <div className="service-detail-section">
                                <h3>Informações do Serviço</h3>
                                <p><strong>Preço:</strong> R$ {selectedService.preco}</p>
                                {selectedService.estabelecimento && (
                                    <p><strong>Estabelecimento:</strong> {selectedService.estabelecimento.nome}</p>
                                )}
                                {selectedService.usuario && (
                                    <p><strong>Profissional:</strong> {selectedService.usuario.nome}</p>
                                )}
                            </div>

                            {selectedService.endereco && (
                                <div className="service-detail-section">
                                    <h3>📍 Localização</h3>
                                    <div className="location-info">
                                        <p><strong>Endereço:</strong></p>
                                        <p>{selectedService.endereco.rua}, {selectedService.endereco.numero}</p>
                                        {selectedService.endereco.complemento && (
                                            <p>{selectedService.endereco.complemento}</p>
                                        )}
                                        <p>{selectedService.endereco.bairro} - {selectedService.endereco.cidade}/{selectedService.endereco.estado}</p>
                                        <p><strong>CEP:</strong> {selectedService.endereco.cep}</p>
                                    </div>
                                </div>
                            )}

                            {selectedService.horarios && selectedService.horarios.length > 0 && (
                                <div className="service-detail-section">
                                    <h3>🕒 Horário de Funcionamento</h3>
                                    <div className="horarios-info">
                                        {selectedService.horarios.map((horario, index) => (
                                            <p key={index}>
                                                <strong>{formatDiaSemana(horario.dia_semana)}:</strong> {formatHora(horario.hora_abertura)} às {formatHora(horario.hora_fechamento)}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="service-detail-section">
                                <h3>📞 Contato</h3>
                                {selectedService.usuario && (
                                    <>
                                        <p><strong>Email:</strong> {selectedService.usuario.email}</p>
                                        {selectedService.usuario.telefone && (
                                            <p><strong>Telefone:</strong> {formatarTelefone(selectedService.usuario.telefone)}</p>
                                        )}
                                    </>
                                )}
                                {selectedService.estabelecimento && (
                                    <p><strong>CNPJ:</strong> {selectedService.estabelecimento.cnpj}</p>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className={`btn-contratar ${
                                    isServiceContracted(selectedService.id) 
                                        ? 'service-contract-btn-disabled' 
                                        : isContracting 
                                            ? 'service-contract-btn-disabled'
                                            : 'service-contract-btn-contracted'
                                }`}
                                onClick={() => handleContratarServico(selectedService.id)}
                                disabled={isServiceContracted(selectedService.id) || isContracting}
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