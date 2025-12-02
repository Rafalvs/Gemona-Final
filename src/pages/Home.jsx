import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from "../components/layout/Layout"
import { categoriasAPI, subcategoriasAPI } from '../services/apiService'
import Logo from '../assets/logo.jpg'

// Componente para seção de subcategorias (substituindo serviços mais procurados)
function ServicesSection({ subcategorias, loadingSubcategorias }) {
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

    const handleSubcategoriaClick = (e, subcategoriaId) => {
        // Previne navegação se foi detectado movimento de mouse (drag/scroll)
        if (isDragging) {
            e.preventDefault();
            return;
        }
        navigate(`/services?subcategoriaId=${subcategoriaId}`);
    };

    const handleMouseUp = () => {
        setMouseDownPos({ x: 0, y: 0 });
        setIsDragging(false);
    };

    return (
        <div>
            <h3 className="home-section-title">
                🔥 Em destaque!
            </h3>
            
            {loadingSubcategorias ? (
                <div className="loading-container">
                    <p>⏳ Carregando subcategorias...</p>
                </div>
            ) : (
                <div className="services-cards-grid">
                    {subcategorias.map((subcategoria) => (
                        <div 
                            key={subcategoria.subCategoriaId} 
                            className="service-card"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onClick={(e) => handleSubcategoriaClick(e, subcategoria.subCategoriaId)}
                        >
                            <div className="service-card-content">
                                <h4 className="service-card-title">
                                    🛎️ {subcategoria.nome}
                                </h4>
                                <p className="service-card-description">
                                    {subcategoria.categoriaNome}
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
    const [subcategorias, setSubcategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [loadingSubcategorias, setLoadingSubcategorias] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
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

    const handleCategoryClick = (e, categoriaId) => {
        // Previne navegação se foi detectado movimento de mouse (drag/scroll)
        if (isDragging) {
            e.preventDefault();
            return;
        }
        navigate(`/services?categoriaId=${categoriaId}`);
    };

    const handleMouseUp = () => {
        setMouseDownPos({ x: 0, y: 0 });
        setIsDragging(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscar categorias e subcategorias em paralelo
                const [categoriasResult, subcategoriasResult] = await Promise.all([
                    categoriasAPI.getAll(),
                    subcategoriasAPI.getAll()
                ]);

                if (categoriasResult.success) {
                    setCategorias(categoriasResult.data);
                }
                
                if (subcategoriasResult.success) {
                    setSubcategorias(subcategoriasResult.data);
                }
                
                setLoadingCategorias(false);
                setLoadingSubcategorias(false);
            } catch (error) {
                setLoadingCategorias(false);
                setLoadingSubcategorias(false);
            } finally {
                // Aguardar no mínimo 1 segundo para mostrar a animação
                setTimeout(() => {
                    // Iniciar fade out
                    setIsFadingOut(true);
                    // Remover loading após a animação de fade out (600ms)
                    setTimeout(() => {
                        setIsInitialLoading(false);
                    }, 100);
                }, 1000);
            }
        };

        fetchData();
    }, []);

    // Renderizar apenas o loading enquanto carrega os dados iniciais
    if (isInitialLoading) {
        return (
            <Layout>
                <main id="home">
                    <div className={`loading-overlay ${isFadingOut ? 'fade-out' : ''}`}>
                        <div className="loading-logo-container">
                            <h1>Gêmona</h1>
                            <img src={Logo} alt="Logo" className="loading-logo" />
                            <div className="loading-spinner"></div>                          
                            <p className="loading-text">Carregando...</p>
                        </div>
                    </div>
                </main>
            </Layout>
        );
    }

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
                                {/* Card para ver todos os serviços */}
                                <div 
                                    className="category-card"
                                    style={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onClick={(e) => {
                                        if (!isDragging) {
                                            e.preventDefault();
                                            navigate('/services');
                                        }
                                    }}
                                >
                                    <div className="category-card-content">
                                        <h4 className="category-card-title">
                                            🔍 Todos os Serviços
                                        </h4>
                                        <p className="category-card-description">
                                            Visualize todos os serviços disponíveis na plataforma
                                        </p>
                                    </div>
                                </div>

                                {categorias.map((categoria) => (
                                    <div 
                                        key={categoria.categoriaId || categoria.id} 
                                        className="category-card"
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onClick={(e) => handleCategoryClick(e, categoria.categoriaId || categoria.id)}
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

                    <ServicesSection 
                        subcategorias={subcategorias} 
                        loadingSubcategorias={loadingSubcategorias} 
                    />
                </div>
            </main>
        </Layout>
    )
}