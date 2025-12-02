import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';

// esse arquivo gerencia o contexto de autenticação do usuário, incluindo login, logout e verificação do status de autenticação. tipo se ele esta logado ou nao

// Criar o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Verifica se há usuário logado no localStorage ao inicializar
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('usuarioLogado');
            const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
            
            if (token && userData) {
                // Verificar se o token expirou
                if (tokenExpiresAt) {
                    const expirationDate = new Date(tokenExpiresAt);
                    const now = new Date();
                    
                    if (now >= expirationDate) {
                        logout();
                        setLoading(false);
                        return;
                    }
                }
                
                // Token válido, restaurar sessão
                const user = JSON.parse(userData);
                setUser(user);
                setIsAuthenticated(true);
            } else {
                // Sem dados de autenticação
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            logout(); // Limpar dados corrompidos
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, token) => {
        const dadosSessao = {
            id: userData.id,
            nome: userData.nome,
            email: userData.email,
            tipo_usuario: userData.tipo_usuario,
            latitude: userData.latitude,
            longitude: userData.longitude,
            loginTime: new Date().toISOString(), // hora que o usuario logou
            isLoggedIn: true
        };
        
        //seta usuario como logado
        setUser(dadosSessao);
        setIsAuthenticated(true);
        localStorage.setItem('usuarioLogado', JSON.stringify(dadosSessao));
        localStorage.setItem('isAuthenticated', 'true');
        if (token) {
            localStorage.setItem('token', token);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        // Limpar todos os dados do localStorage
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userType');
        localStorage.removeItem('tokenExpiresAt');
    };

    const updateUser = (newUserData) => {
        const updatedUser = { ...user, ...newUserData };
        setUser(updatedUser);
        localStorage.setItem('usuarioLogado', JSON.stringify(updatedUser));
    };

    // Valor fornecido pelo contexto
    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};