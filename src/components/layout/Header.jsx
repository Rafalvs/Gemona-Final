import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { clientesAPI, profissionaisAPI, imagensAPI } from '../../services/apiService';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Input,
  Image,
  Button
} from '@heroui/react'

import Logo from '../ui/Logo';

export default function Header() {

  // funcoes para busca e navegacao
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // contexto de autenticação (usuário logado ou não)
  const { user, isAuthenticated, logout } = useAuth();
  
  // Estado para foto de perfil
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);

  // Carregar foto de perfil quando usuário estiver logado
  useEffect(() => {
    const loadProfileImage = async () => {
      if (isAuthenticated && user?.id) {
        // Verificar se tem imagem no localStorage
        const cacheKey = `profileImage_${user.id}_${user.tipo_usuario}`;
        const cachedImage = localStorage.getItem(cacheKey);
        
        if (cachedImage) {
          setFotoPerfilUrl(cachedImage);
          return;
        }

        // Se não tem cache, buscar da API
        try {
          if (user.tipo_usuario === 'cliente') {
            const resultado = await clientesAPI.getById(user.id);
            if (resultado.success && resultado.data.imagemPerfilUrl) {
              const urlFoto = imagensAPI.getImageUrl(resultado.data.imagemPerfilUrl);
              setFotoPerfilUrl(urlFoto);
              localStorage.setItem(cacheKey, urlFoto);
            }
          } else if (user.tipo_usuario === 'profissional') {
            const resultado = await profissionaisAPI.getById(user.id);
            if (resultado.success && resultado.data.imagemPerfilUrl) {
              const urlFoto = imagensAPI.getImageUrl(resultado.data.imagemPerfilUrl);
              setFotoPerfilUrl(urlFoto);
              localStorage.setItem(cacheKey, urlFoto);
            }
          }
        } catch (error) {
        }
      } else {
        setFotoPerfilUrl(null);
      }
    };

    loadProfileImage();
  }, [isAuthenticated, user]);

  const handleSearch = (e) => {
      if (e.key === 'Enter') { 
          e.preventDefault();
          if (searchTerm.trim()) {
            navigate(`/services?busca=${encodeURIComponent(searchTerm.trim())}`); // cria a URL de busca
          } else {
            navigate('/services'); // caso nao digitar nada, navega para a pagina de servicos
          }
      }
  };
  
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <>
      <header className="bg-gradient-to-r from-black via-[#05315e] to-black text-[#ffecd1] shadow-2xl border-b border-[#ffecd1]/20 header-compact"> 
        <div className="header-left">
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              textDecoration: 'none',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
           <Logo size="md" textSize="2xl" />
          </Link>
        </div>
        <div className="header-center">
          <input 
            type="text" 
            placeholder="Busca" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch} 
          />
        </div>
        <div className="header-right">
          {!isLoginPage && !isRegisterPage && ( // esconde os botoes se ja estiver na pagina de login ou cadastro
            isAuthenticated ? (
              // Usuário logado
              <>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                  {fotoPerfilUrl ? (
                    <img 
                      src={fotoPerfilUrl} 
                      alt="Foto de perfil" 
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #f48f42',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#f48f42',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      👤
                    </div>
                  )}
                  <h1 
                    style={{ 
                      color: '#f48f42', 
                      fontWeight: 'bold', 
                      fontSize: '18px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = 'white';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#f48f42';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {user?.nome}
                  </h1>
                </Link>
                {user?.tipo_usuario === 'pj' && (
                  <Button 
                    as={Link} 
                    to="/companyProfile"
                    color="primary"
                    variant="solid"
                    size="md"
                    className="bg-white text-[#ffecd1] border border-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    🏢 Empresa
                  </Button>
                )}
                  <Button 
                    onClick={logout} 
                    to="/login"
                    color="primary"
                    variant="solid"
                    size="md"
                    className="bg-black text-[#ffecd1] border border-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
                > 
                    Sair
                  </Button>

              </>
            ) : (
              // Usuário não logado
              <>
                <Button 
              as={Link} 
              to="/login"
              color="primary"
              variant="solid"
              size="md"
              className="bg-black text-[#ffecd1] border border-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Entrar
            </Button>
            <Button 
              as={Link} 
              to="/register"
              color="secondary"
              variant="bordered"
              size="md"
              className="bg-black border border-[#ffecd1] text-[#ffecd1] font-bold px-4 py-2 rounded-lg hover:bg-[#ffecd1] hover:text-black transition-all duration-300"
            >
              Cadastro
            </Button>
              </>
            )
          )}
        </div>
      </header>
    </>
  );
}