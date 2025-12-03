import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { authAPI } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardBody, Button, Divider } from '@heroui/react';
import { Mail, Lock, LogIn, UserPlus, Key } from 'lucide-react';
import Logo from '../../assets/peixe.png';

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
            <main style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: 'calc(100vh - 200px)', 
                padding: '2rem 1rem' 
            }}>
                <Card style={{ width: '100%', maxWidth: '450px' }} className="shadow-2xl">
                    <CardHeader style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1rem', 
                        paddingBottom: '1rem' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <img src={Logo} alt="Logo" style={{ maxWidth: '100px', height: 'auto' }} />
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.25rem', 
                            textAlign: 'center' 
                        }}>
                            <h2 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                color: '#05315f',
                                margin: 0
                            }}>
                                Bem-vindo de volta!
                            </h2>
                            <p style={{ 
                                fontSize: '0.875rem', 
                                color: '#666',
                                margin: 0
                            }}>
                                Entre com suas credenciais para acessar sua conta
                            </p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody style={{ gap: '1rem' }}>
                        {/* Mensagem de feedback */}
                        {message && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                                color: message.includes('✅') ? '#155724' : '#721c24',
                                border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
                            }}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '1rem' 
                        }}>
                            <div style={{ width: '100%' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#374151',
                                    fontSize: '0.875rem'
                                }}>
                                    Email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ 
                                        position: 'absolute', 
                                        left: '12px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af',
                                        zIndex: 1
                                    }} />
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={loading}
                                        placeholder="seu@email.com"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                            fontSize: '1rem',
                                            border: `2px solid ${errors.email ? '#dc3545' : '#d1d5db'}`,
                                            borderRadius: '0.5rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            backgroundColor: '#fff',
                                            color: '#05315f',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => {
                                            if (!errors.email) e.target.style.borderColor = '#05315f';
                                        }}
                                        onBlur={(e) => {
                                            if (!errors.email) e.target.style.borderColor = '#d1d5db';
                                        }}
                                    />
                                </div>
                                {errors.email && (
                                    <span style={{ 
                                        display: 'block',
                                        marginTop: '0.25rem',
                                        color: '#dc3545', 
                                        fontSize: '0.875rem' 
                                    }}>
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div style={{ width: '100%' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: '500',
                                    color: '#374151',
                                    fontSize: '0.875rem'
                                }}>
                                    Senha
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ 
                                        position: 'absolute', 
                                        left: '12px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af',
                                        zIndex: 1
                                    }} />
                                    <input 
                                        type="password" 
                                        value={formData.senha}
                                        onChange={(e) => handleInputChange('senha', e.target.value)}
                                        disabled={loading}
                                        placeholder="Digite sua senha"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                            fontSize: '1rem',
                                            border: `2px solid ${errors.senha ? '#dc3545' : '#d1d5db'}`,
                                            borderRadius: '0.5rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            backgroundColor: '#fff',
                                            color: '#05315f',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => {
                                            if (!errors.senha) e.target.style.borderColor = '#05315f';
                                        }}
                                        onBlur={(e) => {
                                            if (!errors.senha) e.target.style.borderColor = '#d1d5db';
                                        }}
                                    />
                                </div>
                                {errors.senha && (
                                    <span style={{ 
                                        display: 'block',
                                        marginTop: '0.25rem',
                                        color: '#dc3545', 
                                        fontSize: '0.875rem' 
                                    }}>
                                        {errors.senha}
                                    </span>
                                )}
                            </div>

                            <Button
                                type="submit"
                                isDisabled={loading}
                                isLoading={loading}
                                size="lg"
                                className="bg-[#05315f] text-white font-bold hover:bg-[#032447] transition-all duration-300 shadow-md hover:shadow-lg"
                                startContent={!loading && <LogIn size={20} />}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>

                            <Divider style={{ margin: '0.5rem 0' }} />

                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '0.75rem' 
                            }}>
                                <Button
                                    type="button"
                                    isDisabled={loading}
                                    size="lg"
                                    variant="bordered"
                                    className="bg-black border-2 border-gray-300 text-white font-semibold hover:border-[#05315f] hover:text-[#000000] hover:bg-white transition-all duration-300"
                                    startContent={<Key size={20} />}
                                >
                                    Esqueceu a senha?
                                </Button>

                                <Link to="/register" style={{ width: '100%' }}>
                                    <Button
                                        type="button"
                                        isDisabled={loading}
                                        size="lg"
                                        className="hover:bg-[#dbcab2] w-full bg-[#ffecd1] text-[#05315f] font-bold border-2 border-[#05315f] transition-all duration-300 shadow-md hover:shadow-lg"
                                        startContent={<UserPlus size={20} />}
                                    >
                                        Cadastre-se
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </main>
        </Layout>
    );
}