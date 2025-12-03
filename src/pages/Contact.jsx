import Header from '../components/layout/Header'
import { Card, CardHeader, CardBody, Divider } from '@heroui/react'
import { Fish, Target, Eye } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faWhatsapp, faFacebook, faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

import Logo from '../assets/peixe.png'
import Anemona from '../assets/anemona.png'
import Gemo from '../assets/gemo.jpg'

export default function Contact(){
    return(
        <>
            <Header />
            <main style={{ 
                minHeight: '100vh', 
                padding: '2rem 1rem',
                backgroundImage: `url(${Anemona})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem'
                }}>
                    {/* Header com Logo */}
                    <div style={{ 
                        textAlign: 'center',
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <img 
                            src={Logo} 
                            alt="Gêmona Logo" 
                            style={{ 
                                maxWidth: '150px', 
                                height: 'auto',
                                marginBottom: '1rem',
                                display: 'block'
                            }} 
                        />
                        <h1 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: 'bold', 
                            color: '#ffffffff',
                            margin: '0 0 0.5rem 0'
                        }}>
                            Sobre o Gêmona
                        </h1>
                        <p style={{ 
                            fontSize: '1.125rem', 
                            color: '#db6f15ff',
                            margin: 0
                        }}>
                            Conectando clientes e prestadores de serviço
                        </p>
                    </div>

                    {/* Card: O que é o Gêmona */}
                    <Card className="shadow-lg" style={{ backgroundColor: 'transparent', border: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        <CardHeader style={{ paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Fish size={32} color="#f48f42" />
                                <h2 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: 'bold', 
                                    color: '#fff',
                                    margin: 0,
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                    O que é o Gêmona?
                                </h2>
                            </div>
                        </CardHeader>
                        <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                        <CardBody>
                            <p style={{ 
                                fontSize: '1.125rem', 
                                lineHeight: '1.8', 
                                color: '#fff',
                                margin: 0,
                                fontWeight: '500',
                                textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                            }}>
                                Conceituado na relação do mutualismo entre o peixe-palhaço e a anêmona, assim como o cliente e o prestador de serviço vivem nessa relação. Nossa plataforma web fornece um <strong>gerenciador de serviços</strong> para pequenos/médios empreendedores e consumidores.
                            </p>
                        </CardBody>
                    </Card>

                    {/* Card: Nosso Objetivo */}
                    <Card className="shadow-lg" style={{ backgroundColor: 'transparent', border: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        <CardHeader style={{ paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Target size={32} color="#f48f42" />
                                <h2 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: 'bold', 
                                    color: '#fff',
                                    margin: 0,
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                    Qual é o nosso objetivo?
                                </h2>
                            </div>
                        </CardHeader>
                        <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                        <CardBody>
                            <p style={{ 
                                fontSize: '1.125rem', 
                                lineHeight: '1.8', 
                                color: '#fff',
                                margin: 0,
                                fontWeight: '500',
                                textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                            }}>
                                O projeto tem como objetivo <strong>modernizar e facilitar a vida dos microempreendedores</strong>, trazendo um maior controle sobre seus negócios, como por exemplo: ter uma ferramenta que auxilie no agendamento e gerenciamento de serviços, realizar compra e venda de serviços, além de elevar as empresas para um maior grau tecnológico (modernizando seu negócio e apresentando para um público maior). Nossa aplicação tem como objetivo ser uma <strong>plataforma completa</strong>, mas que seja mais acessível, de baixa complexidade na questão do manuseio, evitando assim, gastos muito elevados para a realização de treinamentos para usar a plataforma, fazendo com que os empreendedores tenham um site e ferramenta amigável para a evolução do seu negócio.
                            </p>
                        </CardBody>
                    </Card>

                    {/* Card: Nossa Visão */}
                    <Card className="shadow-lg" style={{ backgroundColor: 'transparent', border: '2px solid rgba(255, 255, 255, 0.3)' }}>
                        <CardHeader style={{ paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Eye size={32} color="#f48f42" />
                                <h2 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: 'bold', 
                                    color: '#fff',
                                    margin: 0,
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                    Qual é a nossa visão?
                                </h2>
                            </div>
                        </CardHeader>
                        <Divider style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                        <CardBody>
                            <p style={{ 
                                fontSize: '1.125rem', 
                                lineHeight: '1.8', 
                                color: '#fff',
                                margin: 0,
                                fontWeight: '500',
                                textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                            }}>
                                Com o aumento da digitalização, muitas empresas passaram a oferecer seus serviços pela internet. No entanto, ainda existem algumas dificuldades na gestão de agendamentos, especialmente para pequenas e médias empresas, que não possuem ferramentas eficientes para organizar suas agendas. Isso pode resultar em atrasos, sobreposições e até mesmo em perda de clientes. Diante desse cenário, surge o seguinte problema: <strong>como desenvolver uma aplicação acessível e eficiente para o agendamento de serviços, que atenda às necessidades tanto dos prestadores quanto dos clientes?</strong> É pensando nisso, que desenvolvemos uma aplicação de gerenciamento de serviços. A nossa ferramenta também conta com recursos que ajudam estas empresas a modernizarem seus negócios, ter maior controle sobre suas agendas, usufruir do recurso de localização geográfica, pensando na captação de novos clientes (fazendo com que os serviços e empresas mais próximas dos usuários apareçam de uma forma mais destacada) e melhor interação na comunicação entre empresa e clientes.
                            </p>
                        </CardBody>
                    </Card>

                    {/* Card: Contato */}
                    <Card className="shadow-lg" style={{ 
                        background: 'linear-gradient(135deg, #05315f 0%, #062847 100%)'
                    }}>
                        <CardHeader style={{ paddingBottom: '1rem' }}>
                            <h2 style={{ 
                                fontSize: '1.75rem', 
                                fontWeight: 'bold', 
                                color: '#fff',
                                margin: 0,
                                textAlign: 'center',
                                width: '100%'
                            }}>
                                Precisa de Ajuda? Contate-nos:
                            </h2>
                        </CardHeader>
                        <Divider style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                        <CardBody>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                gap: '2rem',
                                flexWrap: 'wrap',
                                padding: '1rem 0'
                            }}>
                                <a 
                                    href="https://www.instagram.com/gemona.br/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s',
                                        textDecoration: 'none',
                                        color: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.color = '#E4405F';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faInstagram} size="3x" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Instagram</span>
                                </a>

                                <a 
                                    href="mailto:contato@gemona.com" 
                                    style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s',
                                        textDecoration: 'none',
                                        color: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.color = '#EA4335';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faEnvelope} size="3x" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Email</span>
                                </a>

                                <a 
                                    href="https://wa.me/5511999999999" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s',
                                        textDecoration: 'none',
                                        color: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.color = '#25D366';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faWhatsapp} size="3x" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>WhatsApp</span>
                                </a>

                                <a 
                                    href="https://facebook.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s',
                                        textDecoration: 'none',
                                        color: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.color = '#1877F2';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faFacebook} size="3x" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Facebook</span>
                                </a>

                                <a 
                                    href="https://github.com/Rafalvs/Gemona-Final" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s',
                                        textDecoration: 'none',
                                        color: '#fff'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.color = '#f48f42';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faGithub} size="3x" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>GitHub</span>
                                </a>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Card: Gemo */}
                    <Card className="shadow-lg" style={{ 
                        backgroundColor: 'transparent',
                        border: '2px solid transparent',
                    }}>
                        <CardBody style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '2rem'
                        }}>
                            <h3 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                color: '#fff',
                                margin: 0,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                            }}>

                            </h3>
                            <img 
                                src={Gemo} 
                                alt="Gemo - Mascote do Gêmona" 
                                style={{ 
                                    maxWidth: '400px',
                                    width: '100%',
                                    height: 'auto',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                                }}                                
                            />
                            <p>by rafael</p>
                        </CardBody>
                    </Card>
                </div>
            </main>
        </>
    )
}