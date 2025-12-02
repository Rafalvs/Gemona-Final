import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { authAPI } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();

    // atualiza os campos do formulário
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // se digitou errado, vai limpar o campo ao clicar nele
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Função para fazer login
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage('');
        setErrors({});

        try {
            // Tentar login na API
            const loginResult = await authAPI.login({
                email: formData.email.trim(),
                senha: formData.senha
            });

            if (!loginResult.success) {
                setMessage('❌ Algum campo foi preenchido incorretamente. Verifique os dados e tente novamente.');
                setLoading(false);
                return;
            }

            // Extrair dados da resposta
            const { token, userType, userId, nome, email, expiresAt } = loginResult.data;
            
            // IMPORTANTE: Salvar o token ANTES de fazer outras requisições
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', nome);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userType', userType);
            localStorage.setItem('tokenExpiresAt', expiresAt);

            // Preparar objeto do usuário para o contexto
            const usuario = {
                id: userId,
                nome: nome,
                email: email,
                tipo_usuario: userType.toLowerCase(), // "profissional" ou "cliente",
                ativo: true
            };

            // Se for cliente, buscar latitude e longitude (token já está no localStorage)
            if (userType === 'Cliente') {
                try {
                    const { clientesAPI } = await import('../../services/apiService');
                    const clienteResult = await clientesAPI.getById(userId);
                    
                    if (clienteResult.success && clienteResult.data) {
                        const clienteData = clienteResult.data;
                        
                        // Buscar latitude/longitude no objeto endereco (como faz o Profile.jsx)
                        if (clienteData.endereco) {
                            const latitude = clienteData.endereco.latitude || clienteData.endereco.Latitude;
                            const longitude = clienteData.endereco.longitude || clienteData.endereco.Longitude;
                            
                            if (latitude && longitude) {
                                usuario.latitude = latitude;
                                usuario.longitude = longitude;
                                console.log('✅ Localização carregada do endereço:', { latitude, longitude });
                            } else {
                                console.warn('⚠️ Endereço sem latitude/longitude');
                            }
                        } else {
                            console.warn('⚠️ Cliente sem endereço cadastrado');
                        }
                    }
                } catch (error) {
                    console.error('⚠️ Erro ao carregar dados do cliente:', error);
                }
            }

            // Fazer login no contexto (atualiza o estado com os dados do usuário)
            login(usuario, token);

            // Mensagem de sucesso
            setMessage(`✅ ${loginResult.message || 'Login realizado com sucesso!'}`);
            
            // Limpar formulário
            setFormData({ email: '', senha: '' });

            // Redirecionar após 1.5 segundos baseado no tipo de usuário
            setTimeout(async () => {
                if (userType === 'Profissional') {
                    // Verificar se o profissional já tem empresa cadastrada
                    try {
                        const { estabelecimentosAPI } = await import('../../services/apiService');
                        const estabelecimentosResult = await estabelecimentosAPI.getByProfissional(userId);
                        
                        if (estabelecimentosResult.success && estabelecimentosResult.data && estabelecimentosResult.data.length > 0) {
                            // Já tem empresa cadastrada - vai para o perfil da empresa
                            navigate('/companyProfile');
                        } else {
                            // Não tem empresa cadastrada - vai para criar empresa
                            navigate('/companyProfile');
                        }
                    } catch (error) {
                        // Em caso de erro, vai para criar empresa (mais seguro)
                        navigate('/newCompany');
                    }
                } else if (userType === 'Cliente') {
                    // Cliente vai para a home
                    navigate('/');
                } else {
                    // Fallback para home
                    navigate('/');
                }
            }, 1500);

        } catch (error) {
            setMessage('❌ Algum campo foi preenchido incorretamente. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <main>
                <form className="form-center" onSubmit={handleSubmit}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
                        🔑 Login do Usuário
                    </h2>

                    {/* Mensagem de feedback */}
                    {message && (
                        <div style={{
                            padding: '10px',
                            marginBottom: '20px',
                            borderRadius: '4px',
                            textAlign: 'center',
                            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                            color: message.includes('✅') ? '#155724' : '#721c24',
                            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
                        }}>
                            {message}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="userInput">Email:</label>
                        <input 
                            name="userInput" 
                            id="userInput" 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            style={{
                                borderColor: errors.email ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="Digite seu email..."
                        />
                        {errors.email && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="passwordInput">Senha:</label>
                        <input 
                            name="passwordInput" 
                            id="passwordInput" 
                            type="password" 
                            value={formData.senha}
                            onChange={(e) => handleInputChange('senha', e.target.value)}
                            style={{
                                borderColor: errors.senha ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="Digite sua senha..."
                        />
                        {errors.senha && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.senha}
                            </span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#ccc' : '#007bff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? '⏳ Entrando...' : '🔑 Entrar'}
                    </button>
                    
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px', 
                        marginTop: '15px' 
                    }}>
                        <button 
                            type="button" 
                            disabled={loading}
                            style={{
                                backgroundColor: '#6c757d',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            🔄 Esqueceu a senha?
                        </button>
                        
                        <Link to="/register">
                            <button 
                                type="button" 
                                disabled={loading}
                                style={{
                                    backgroundColor: '#28a745',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    width: '100%'
                                }}
                            >
                                📝 Cadastre-se
                            </button>
                        </Link>
                    </div>
                </form>
            </main>
        </Layout>
    );
}