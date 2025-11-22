import Layout from "../../components/layout/Layout"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { contratosAPI, servicosAPI, estabelecimentosAPI, usuariosAPI } from '../../services/apiService'

export default function Profile(){
    const { user, isAuthenticated } = useAuth();
    const [agenda, setAgenda] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAgenda = async () => {
            if (!isAuthenticated || !user) {
                setLoading(false);
                return;
            }

            try {
                // Buscar contratos do usuário
                const contratosResult = await contratosAPI.getByUsuario(user.id);
                if (!contratosResult.success) {
                    setAgenda([]);
                    setLoading(false);
                    return;
                }

                // Enriquecer contratos com dados do serviço e estabelecimento
                const servicosResult = await servicosAPI.getAll();
                const estabelecimentosResult = await estabelecimentosAPI.getAll();
                const usuariosResult = await usuariosAPI.getAll();

                const agendaEnriquecida = contratosResult.data.map(contrato => {
                    const servico = servicosResult.success ? 
                        servicosResult.data.find(s => s.id === contrato.servico_id) : null;
                    
                    const estabelecimento = estabelecimentosResult.success && servico ? 
                        estabelecimentosResult.data.find(e => e.id === servico.estabelecimento_id) : null;
                    
                    const prestador = usuariosResult.success && estabelecimento ? 
                        usuariosResult.data.find(u => u.id === estabelecimento.profissional_id) : null;

                    return {
                        ...contrato,
                        servico,
                        estabelecimento,
                        prestador
                    };
                });

                setAgenda(agendaEnriquecida);
            } catch (error) {
                console.error('Erro ao carregar agenda:', error);
                setAgenda([]);
            } finally {
                setLoading(false);
            }
        };

        loadAgenda();
    }, [isAuthenticated, user]);

    const handleCancelarContrato = async (contratoId) => {
        if (window.confirm('Tem certeza que deseja cancelar este serviço contratado?')) {
            try {
                const result = await contratosAPI.delete(contratoId);
                if (result.success) {
                    setAgenda(prev => prev.filter(item => item.id !== contratoId));
                    alert('Serviço cancelado com sucesso!');
                } else {
                    alert('Erro ao cancelar serviço: ' + result.error);
                }
            } catch (error) {
                alert('Erro ao cancelar serviço: ' + error.message);
            }
        }
    };

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
                <div className="user-profile-container">
                    <h1 className="user-profile-title">Perfil do Usuário</h1>
                    
                    {/* Seção de Informações Pessoais */}
                    <div className="profile-section">
                        <h2 className="profile-section-title">👤 Informações Pessoais</h2>
                        <div className="profile-info-container">
                            {user?.profilePic ? (
                                <img id="profilePic" src={user.profilePic} alt="Foto de Perfil" />
                            ) : (
                                <div className="user-profile-pic">
                                    <span>👤</span>
                                </div>
                            )}
                            <p className="user-name">
                                {user?.nome}
                            </p>
                            <p className="user-email">
                                📧 {user?.email}
                            </p>
                            <p className="user-type">
                                Tipo: {user?.tipo_usuario === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </p>
                        </div>
                    </div>

                    {/* Seção de Agenda */}
                    <div className="agenda-section">
                        <h2 className="agenda-title">📅 Minha Agenda de Serviços</h2>
                        
                        {loading ? (
                            <p className="agenda-loading">
                                ⏳ Carregando agenda...
                            </p>
                        ) : agenda.length === 0 ? (
                            <div className="agenda-empty-container">
                                <p className="agenda-empty-title">
                                    📝 Você ainda não contratou nenhum serviço
                                </p>
                                <p className="agenda-empty-subtitle">
                                    Explore nossos serviços na página inicial e contrate o que precisar!
                                </p>
                            </div>
                        ) : (
                            <div className="agenda-services-grid">
                                {agenda.map((item) => (
                                    <div key={item.id} className="agenda-service-card">
                                        <div className="agenda-service-header">
                                            <div className="agenda-service-info">
                                                <h3 className="agenda-service-title">
                                                    🛎️ {item.servico?.nome || 'Serviço não encontrado'}
                                                </h3>
                                                {item.servico && (
                                                    <p>
                                                        💰 R$ {item.servico.preco}
                                                    </p>
                                                )}
                                                {item.estabelecimento && (
                                                    <p className="service-location">
                                                        🏢 {item.estabelecimento.nome}
                                                    </p>
                                                )}
                                                {item.prestador && (
                                                    <p className="service-location">
                                                        👨‍💼 Prestador: {item.prestador.nome}
                                                    </p>
                                                )}
                                                <p className="agenda-contract-date">
                                                    📅 Contratado em: {new Date(item.data_contrato).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleCancelarContrato(item.id)}
                                                className="btn-cancel"
                                            >
                                                ❌ Cancelar
                                            </button>
                                        </div>
                                        
                                        {item.servico?.descricao && (
                                            <p className="service-description-italic">
                                                "{item.servico.descricao}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </Layout>
    )
}