import { createContext, useContext, useState, useEffect } from 'react';

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

    // Verificar se há usuário logado no localStorage ao inicializar
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        try {
            const isAuth = localStorage.getItem('isAuthenticated') === 'true';
            const userData = localStorage.getItem('usuarioLogado');
            
            if (isAuth && userData) {
                const user = JSON.parse(userData);
                setUser(user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            logout(); // Limpar dados corrompidos
        } finally {
            setLoading(false);
        }
    };

    const login = (userData) => {
        const dadosSessao = {
            id: userData.id,
            nome: userData.nome,
            email: userData.email,
            tipo_usuario: userData.tipo_usuario,
            loginTime: new Date().toISOString(),
            isLoggedIn: true
        };
        
        setUser(dadosSessao);
        setIsAuthenticated(true);
        localStorage.setItem('usuarioLogado', JSON.stringify(dadosSessao));
        localStorage.setItem('isAuthenticated', 'true');
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('isAuthenticated');
    };

    const updateUser = (newUserData) => {
        const updatedUser = { ...user, ...newUserData };
        setUser(updatedUser);
        localStorage.setItem('usuarioLogado', JSON.stringify(updatedUser));
    };

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