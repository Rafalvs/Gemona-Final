import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from "../components/layout/Layout"
import { categoriasAPI, subcategoriasAPI } from '../services/apiService'
import Logo from '../components/ui/Logo'
import Peixe from '../assets/peixe.png';
import { Card, CardHeader, CardBody, Divider} from '@heroui/react'
import HorizontalCarousel from '../components/ui/HorizontalCarousel'
import { getCategoryIcon } from '../components/ui/Icons'

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
                            <Card key={i} className="animate-pulse min-w-[150px] h-40">
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
                        itemWidth={300}
                        gap={14}
                        controlsColor="secondary"
                    >
                        {subcategorias.map((subcategoria) => {
                            const IconComponent = getCategoryIcon(subcategoria.nome);
                            return (
                                <Card 
                                    key={subcategoria.subCategoriaId} 
                                    isPressable
                                    onPress={() => handleSubcategoriaClick(subcategoria.subCategoriaId)}
                                    className="hover:shadow-2xl transition-all duration-300 hover:scale-95 backdrop-blur-sm border-2 border-[#ffecd1] hover:border-[#f48f42] min-h-[100px] sm:h-30 rounded-xl overflow-hidden"
                                    style={{ 
                                        background: 'linear-gradient(135deg, #ffecd1 0%, #ffffff 100%)'
                                    }}
                                >
                                    <CardBody className="p-3 sm:p-5 flex flex-col justify-between h-full relative">
                                        <div>
                                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                                <div className="bg-[#f48f42]/20 p-1.5 rounded-lg shadow-sm">
                                                    <IconComponent size={20} className="text-[#05315e]" />
                                                </div>
                                                <h3 className="font-bold text-xs sm:text-sm text-[#05315e]">{subcategoria.nome}</h3>
                                            </div>
                                            <Divider className="mb-1" />
                                            <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed font-medium">
                                                {subcategoria.categoriaNome}
                                            </p>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
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
                <main id="home" className="min-h-screen flex items-center justify-center">
                    <div className={`loading-overlay ${isFadingOut ? 'fade-out' : ''}`}>
                        <div className="loading-logo-container">
                            <h1 className='font-bold text-[#ffecd1] drop-shadow-lg text-2xl'>Gêmona</h1>
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
                                <div className="flex gap-2 overflow-hidden">
                                    {[...Array(5)].map((_, i) => (
                                        <Card key={i} className="category-card animate-pulse min-w-[200px] h-48">
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
                                    itemWidth={200}
                                    gap={16}
                                    controlsColor="primary"
                                >
                                    {/* Card para ver todos os serviços */}
                                    <Card 
                                        isPressable
                                        onPress={() => navigate('/services')}
                                        className="hover:shadow-2xl transition-all duration-300 hover:scale-99 border-2 border-purple-300 min-h-[120px] sm:h-30 rounded-xl overflow-hidden"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #05315f 0%, #4c1880ff 100%)'
                                        }}
                                    >
                                        <CardBody className="p-3 sm:p-4 flex flex-col justify-between h-full relative">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                                        <span className="text-xl sm:text-2xl">🔍</span>
                                                    </div>
                                                    <h3 className="font-bold text-sm sm:text-base text-white drop-shadow-lg">Todos os Serviços</h3>
                                                </div>
                                                <Divider className="mb-1.5 bg-white/30" />
                                                <p className="text-[10px] sm:text-xs text-white/90 leading-snug font-medium">
                                                    Visualize todos os serviços disponíveis na plataforma
                                                </p>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {categorias.map((categoria) => {
                                        const IconComponent = getCategoryIcon(categoria.nome);
                                        return (
                                            <Card 
                                                key={categoria.categoriaId || categoria.id} 
                                                isPressable
                                                onPress={() => handleCategoryClick(categoria.categoriaId || categoria.id)}
                                                className="hover:shadow-2xl transition-all duration-300 hover:scale-95 backdrop-blur-sm border-2 border-[#05315f] hover:border-[#ffecd1] min-h-[120px] sm:h-30 rounded-xl overflow-hidden"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, #001f3f 0%, #05315f 100%)'
                                                }}
                                            >
                                                <CardBody className="p-3 sm:p-4 flex flex-col justify-between h-full relative">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                                                <IconComponent size={24} className="text-white" />
                                                            </div>
                                                            <h3 className="font-bold text-sm sm:text-base text-white drop-shadow-lg">{categoria.nome}</h3>
                                                        </div>
                                                        <Divider className="mb-1.5 bg-white/30" />
                                                        <p className="text-[10px] sm:text-xs text-white/90 leading-snug font-medium">
                                                            {categoria.descricao}
                                                        </p>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        );
                                    })}
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