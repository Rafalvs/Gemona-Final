import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import logo from '../../assets/logo.png';

export default function Header() {

  // funcoes para busca e navegacao
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // contexto de autenticação (usuário logado ou não)
  const { user, isAuthenticated, logout } = useAuth();

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
          <Link to="/">
            <img id="logo" src={logo} alt="Logo" />
          </Link>
        </div>
        <div className="header-center header-search-container">
          <div className="search-input-centered">
            <div className="search-input-custom">
              <input 
                type="text" 
                placeholder="Buscar serviços..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch} 
              />
            </div>
          </div>
        </div>
        <div className="header-right">
          {!isLoginPage && !isRegisterPage && ( // esconde os botoes se ja estiver na pagina de login ou cadastro
            isAuthenticated ? (
              // Usuário logado
              <>
                <Link to="/profile"><h1>Olá, {user?.nome}!</h1></Link>
                {user?.tipo_usuario === 'pj' && (
                  <Link to="/businessProfile">
                    <button className="header-btn-company">🏢 Empresa</button>
                  </Link>
                )}
                <button onClick={logout}>Sair</button>
                <Link to="/admin"><button className="header-btn-admin">Admin</button></Link>
              </>
            ) : (
              // Usuário não logado
              <>
                <Link to="/login"><button className="header-btn-auth">Entrar</button></Link>
                <Link to="/register"><button className="header-btn-auth">Cadastro</button></Link>
                <Link to="/admin"><button className="header-btn-auth">Admin</button></Link>
              </>
            )
          )}
        </div>
      </header>
    </>
  );
}