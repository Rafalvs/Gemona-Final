import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardBody, Divider, Chip, Button, Image } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import Layout from "../components/layout/Layout"
import Logo from "../components/ui/Logo"
import { CategoryIcon, ServiceIcon } from "../components/ui/IconHelpers"
import HorizontalCarousel from "../components/ui/HorizontalCarousel"

export default function Home() {
  const [categorias, setCategorias] = useState([])
  const [servicosMaisProcurados, setServicosMaisProcurados] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, servicosRes] = await Promise.all([
          fetch('http://localhost:3000/categorias'),
          fetch('http://localhost:3000/servicos_mais_procurados')
        ])
        
        const categoriasData = await categoriasRes.json()
        const servicosData = await servicosRes.json()
        
        setCategorias(categoriasData)
        setServicosMaisProcurados(servicosData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCategoriaClick = (categoria) => {
    navigate(`/services?categoria=${categoria.categoria_id}`)
  }

  const handleServicoClick = (servico) => {
    navigate(`/services?busca=${servico.nome}`)
  }

  return (
    <Layout>
      <div className="space-y-4 pr-20 pl-20">
        {/* Hero Section */}
        <div className="flex justify-center">
        <Card className="sophisticated-card shadow-2xl rounded-lg">
          <CardBody className="p-8 text-center">
            {/* Logo Section */}
            <div className="flex justify-center mb-6">
              <Logo size="xl" showText={false} border={true} />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-[#ffecd1]">
              Bem-vindo ao Gêmona
            </h1>
            <p className="text-xl opacity-90 text-[#ffecd1]">
              Está buscando um serviço? Entenda como nossa plataforma funciona:
            </p>
            <p className="text-lg mt-4 opacity-80 text-[#ffecd1]">
              Faça uma busca ou clique em uma das categorias abaixo, <br></br>
              selecione o serviço desejado e entre em contato diretamente com o prestador.
            </p>
          </CardBody>
        </Card>
        </div>

        {/* Categorias Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold mt-6">Categorias</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            {loading ? ( // esqueleto de loading
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
                itemWidth={250}
                gap={6}
                controlsColor="primary"
              >
                {categorias.map((categoria) => (
                  <Card 
                    key={categoria.categoria_id} 
                    isPressable
                    onPress={() => handleCategoriaClick(categoria)}
                    className="hover:shadow-lg transition-all duration-300 hover:scale-105 card-shadow bg-white/80 backdrop-blur-sm border-gray-200/50 h-60 rounded-lg m-2"
                  >
                    <CardBody className="p-8 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <CategoryIcon categoria={categoria} />
                          <h3 className="font-bold text-lg text-gray-800">{categoria.nome}</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{categoria.descricao}</p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </HorizontalCarousel>
            )}
          </CardBody>
        </Card>

        {/* Serviços Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Serviços Mais Procurados</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            {loading ? (
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
                itemWidth={250} 
                gap={6}
                controlsColor="secondary"
              >
                {servicosMaisProcurados.map((servico, index) => (
                  <Card 
                    key={index} 
                    isPressable
                    onPress={() => handleServicoClick(servico)}
                    className="hover:shadow-lg transition-all duration-300 hover:scale-105 card-shadow bg-white/90 backdrop-blur-sm border border-gray-200/50 h-40 rounded-lg m-2"
                  >
                    <CardBody className="p-5 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <ServiceIcon servico={servico} />
                          <h3 className="font-semibold text-sm text-gray-800">{servico.nome}</h3>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{servico.descricao}</p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </HorizontalCarousel>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  )
}