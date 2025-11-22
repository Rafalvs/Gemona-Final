import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from "../components/layout/Layout"

// Componente para seção de serviços mais procurados
function ServicesSection() {
    const [servicos, setServicos] = useState([]);
    const [loadingServicos, setLoadingServicos] = useState(true);
    const navigate = useNavigate();
    
    // Estados para controlar o comportamento de clique vs scroll
    const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        setMouseDownPos({ x: e.clientX, y: e.clientY });
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (mouseDownPos.x !== 0 || mouseDownPos.y !== 0) {
            const deltaX = Math.abs(e.clientX - mouseDownPos.x);
            const deltaY = Math.abs(e.clientY - mouseDownPos.y);
            
            // Se o mouse se moveu mais de 5px, considera como drag/scroll
            if (deltaX > 5 || deltaY > 5) {
                setIsDragging(true);
            }
        }
    };

    const handleServiceClick = (e) => {
        // Previne navegação se foi detectado movimento de mouse (drag/scroll)
        if (isDragging) {
            e.preventDefault();
            return;
        }
        navigate('/services');
    };

    const handleMouseUp = () => {
        setMouseDownPos({ x: 0, y: 0 });
        setIsDragging(false);
    };

    useEffect(() => {
        const fetchServicos = async () => {
            try {
                const response = await fetch("http://localhost:3001/servicos_mais_procurados");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setServicos(result);
            } catch (error) {
                console.error('Erro ao buscar serviços:', error);
            } finally {
                setLoadingServicos(false);
            }
        };

        fetchServicos();
    }, []);

    return (
        <div>
            <h3 className="home-section-title">
                🔥 Serviços Mais Procurados
            </h3>
            
            {loadingServicos ? (
                <div className="loading-container">
                    <p>⏳ Carregando serviços...</p>
                </div>
            ) : (
                <div className="services-cards-grid">
                    {servicos.map((servico, index) => (
                        <div 
                            key={servico.id || index} 
                            className="service-card"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onClick={handleServiceClick}
                        >
                            <div className="service-card-content">
                                <h4 className="service-card-title">
                                    🛎️ {servico.nome}
                                </h4>
                                <p className="service-card-description">
                                    {servico.descricao}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Home(){
    const [categorias, setCategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const navigate = useNavigate();
    
    // Estados para controlar o comportamento de clique vs scroll
    const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const epServicos = "http://localhost:3001/servicos_mais_procurados"; // endpoint serviços mais procurados

    const handleMouseDown = (e) => {
        setMouseDownPos({ x: e.clientX, y: e.clientY });
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (mouseDownPos.x !== 0 || mouseDownPos.y !== 0) {
            const deltaX = Math.abs(e.clientX - mouseDownPos.x);
            const deltaY = Math.abs(e.clientY - mouseDownPos.y);
            
            // Se o mouse se moveu mais de 5px, considera como drag/scroll
            if (deltaX > 5 || deltaY > 5) {
                setIsDragging(true);
            }
        }
    };

    const handleCategoryClick = (e) => {
        // Previne navegação se foi detectado movimento de mouse (drag/scroll)
        if (isDragging) {
            e.preventDefault();
            return;
        }
        navigate('/services');
    };

    const handleMouseUp = () => {
        setMouseDownPos({ x: 0, y: 0 });
        setIsDragging(false);
    };

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await fetch("http://localhost:3001/categorias");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setCategorias(result);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
            } finally {
                setLoadingCategorias(false);
            }
        };

        fetchCategorias();
    }, []);

    return(
        <Layout>
            <main id="home">
                <div className="home-container">
                    <div className="home-intro">
                        <h3 className="home-intro-title">
                            Está buscando um serviço? Entenda como nossa plataforma funciona:
                        </h3>
                        <p className="home-intro-text">
                            Faça uma busca ou clique em uma das categorias abaixo, selecione o serviço desejado e entre em contato diretamente com o prestador.
                        </p>
                    </div>

                    <div className="home-section">
                        <h3 className="home-section-title">
                            📂 Categorias de Serviços
                        </h3>
                        
                        {loadingCategorias ? (
                            <div className="loading-container">
                                <p>⏳ Carregando categorias...</p>
                            </div>
                        ) : (
                            <div className="cards-grid">
                                {categorias.map((categoria) => (
                                    <div 
                                        key={categoria.id} 
                                        className="category-card"
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onClick={handleCategoryClick}
                                    >
                                        <div className="category-card-content">
                                            <h4 className="category-card-title">
                                                📋 {categoria.nome}
                                            </h4>
                                            <p className="category-card-description">
                                                {categoria.descricao}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <ServicesSection />
                </div>
            </main>
        </Layout>
    )
}