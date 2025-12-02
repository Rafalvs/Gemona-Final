import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from "../components/layout/Layout"
import { categoriasAPI, subcategoriasAPI } from '../services/apiService'
import Logo from '../components/ui/Logo'
import Peixe from '../assets/peixe.png';
import { Card, CardHeader, CardBody, Divider, Chip, Button, Image } from '@heroui/react'
import HorizontalCarousel from '../components/ui/HorizontalCarousel'

// Componente para seção de subcategorias (substituindo serviços mais procurados)
function ServicesSection({ subcategorias, loadingSubcategorias }) {
    const navigate = useNavigate();

    const handleSubcategoriaClick = (subcategoriaId) => {
        navigate(`/services?subcategoriaId=${subcategoriaId}`);
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-1">
                    <h2 className="text-xl sm:text-2xl font-bold">🔥 Em destaque!</h2>
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                {loadingSubcategorias ? (
                    <div className="flex gap-4 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <Card key={i} className="animate-pulse min-w-[200px] h-40">
                                <CardBody className="p-5">
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <HorizontalCarousel 
                        itemsPerView={1}
                        itemWidth={320}
                        gap={20}
                        controlsColor="secondary"
                    >
                        {subcategorias.map((subcategoria) => (
                            <Card 
                                key={subcategoria.subCategoriaId} 
                                isPressable
                                onPress={() => handleSubcategoriaClick(subcategoria.subCategoriaId)}
                                className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm border border-gray-200/50 min-h-[120px] sm:h-40 rounded-lg"
                            >
                                <CardBody className="p-3 sm:p-5 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                            <span className="text-xl sm:text-2xl">🛎️</span>
                                            <h3 className="font-semibold text-xs sm:text-sm text-gray-800">{subcategoria.nome}</h3>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                                            {subcategoria.categoriaNome}
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </HorizontalCarousel>
                )}
            </CardBody>
        </Card>
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

    const handleCategoryClick = (categoriaId) => {
        navigate(`/services?categoriaId=${categoriaId}`);
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
                            <img src={Peixe} alt="Logo" className="loading-logo" />
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
                <div className="space-y-4 pr-4 pl-4 sm:pr-8 sm:pl-8 md:pr-12 md:pl-12 lg:pr-20 lg:pl-20">
                    {/* Hero Section */}
                    <div className="flex justify-center">
                        <Card className="sophisticated-card shadow-2xl rounded-lg">
                            <CardBody className="p-4 sm:p-6 md:p-8 text-center">
                                {/* Logo Section */}
                                <div className="flex justify-center mb-4 md:mb-6">
                                    <Logo size="xl" showText={false} border={true} />
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-[#ffecd1]">
                                    Bem-vindo ao Gêmona
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl opacity-90 text-[#ffecd1]">
                                    Está buscando um serviço? Entenda como nossa plataforma funciona:
                                </p>
                                <p className="text-sm sm:text-base md:text-lg mt-3 md:mt-4 opacity-80 text-[#ffecd1]">
                                    Faça uma busca ou clique em uma das categorias abaixo,
                                    <span className="hidden sm:inline"><br /></span>
                                    <span className="sm:hidden"> </span>
                                    selecione o serviço desejado e entre em contato diretamente com o prestador.
                                </p>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Categorias Section */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl sm:text-2xl font-bold mt-4 sm:mt-6">📂 Categorias de Serviços</h2>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            {loadingCategorias ? (
                                <div className="flex gap-4 overflow-hidden">
                                    {[...Array(5)].map((_, i) => (
                                        <Card key={i} className="animate-pulse min-w-[240px] h-48">
                                            <CardBody className="p-6">
                                                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <HorizontalCarousel 
                                    itemsPerView={1}
                                    itemWidth={350}
                                    gap={20}
                                    controlsColor="primary"
                                >
                                    {/* Card para ver todos os serviços */}
                                    <Card 
                                        isPressable
                                        onPress={() => navigate('/services')}
                                        className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-gray-200/50 min-h-[180px] sm:h-60 rounded-lg"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        }}
                                    >
                                        <CardBody className="p-4 sm:p-6 md:p-8 flex flex-col justify-between h-full">
                                            <div>
                                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                                    <span className="text-2xl sm:text-3xl">🔍</span>
                                                    <h3 className="font-bold text-base sm:text-lg text-white">Todos os Serviços</h3>
                                                </div>
                                                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                                                    Visualize todos os serviços disponíveis na plataforma
                                                </p>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {categorias.map((categoria) => (
                                        <Card 
                                            key={categoria.categoriaId || categoria.id} 
                                            isPressable
                                            onPress={() => handleCategoryClick(categoria.categoriaId || categoria.id)}
                                            className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-gray-200/50 min-h-[180px] sm:h-60 rounded-lg"
                                        >
                                            <CardBody className="p-4 sm:p-6 md:p-8 flex flex-col justify-between h-full">
                                                <div>
                                                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                                        <span className="text-2xl sm:text-3xl">📋</span>
                                                        <h3 className="font-bold text-base sm:text-lg text-gray-800">{categoria.nome}</h3>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                        {categoria.descricao}
                                                    </p>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </HorizontalCarousel>
                            )}
                        </CardBody>
                    </Card>

                    {/* Serviços Section */}
                    <ServicesSection 
                        subcategorias={subcategorias} 
                        loadingSubcategorias={loadingSubcategorias} 
                    />
                </div>
            </main>
        </Layout>
    )
}