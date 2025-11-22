import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { usuariosAPI } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { validarFormularioLogin } from '../../utils/validators';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();
    const { login } = useAuth(); // Usar contexto de autenticação

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

    const validarFormulario = () => {
        const erros = validarFormularioLogin(formData);
        setErrors(erros);
        return Object.keys(erros).length === 0;
    };

    // Função para fazer login
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            setMessage('❌ Por favor, corrija os erros no formulário');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Buscar usuário por email
            const resultado = await usuariosAPI.getByEmail(formData.email.trim().toLowerCase());

            if (!resultado.success || !resultado.data) {
                setErrors({ email: 'Email não encontrado' });
                setMessage('❌ Email não cadastrado');
                setLoading(false);
                return;
            }

            const usuario = resultado.data;

            // Verificar se usuário tomou ban
            if (usuario.ativo === false) {
                setMessage('❌ Usuário inativo. Entre em contato com o suporte.');
                setLoading(false);
                return;
            }

            // Verificar senha
            if (usuario.senha_hash !== formData.senha) {
                setErrors({ senha: 'Senha incorreta' });
                setMessage('❌ Senha incorreta');
                setLoading(false);
                return;
            }

            // Login bem-sucedido
            setMessage('✅ Login realizado com sucesso!');
            
            // Usar contexto para fazer login
            login(usuario);

            // Limpar formulário
            setFormData({ email: '', senha: '' });

            // Redirecionar após 1 segundo
            setTimeout(() => {
                // Redirecionar baseado no tipo de usuário
                if (usuario.tipo_usuario === 'pj') {
                    navigate('/createBusiness'); // Página para criar estabelecimento (PJ)
                } else {
                    navigate('/profile'); // Perfil pessoal (PF)
                }
            }, 1000);

        } catch (error) {
            setMessage(`❌ Erro no sistema: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <main>
                <form className="form-center" onSubmit={handleSubmit}>
                    <h2 className="form-title">
                        🔑 Login do Usuário
                    </h2>

                    {/* Mensagem de feedback */}
                    {message && (
                        <div className={`${
                            message.includes('✅') ? 'form-success-message' : 'form-error-message'
                        }`}>
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
                            className={errors.email ? 'form-input-error' : ''}
                            disabled={loading}
                            placeholder="Digite seu email..."
                        />
                        {errors.email && (
                            <span className="form-error-message">
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
                            className={errors.senha ? 'form-input-error' : ''}
                            disabled={loading}
                            placeholder="Digite sua senha..."
                        />
                        {errors.senha && (
                            <span className="form-error-message">
                                {errors.senha}
                            </span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`form-submit-btn ${loading ? 'form-submit-btn-disabled' : ''}`}
                    >
                        {loading ? '⏳ Entrando...' : '🔑 Entrar'}
                    </button>
                    
                    <div className="login-links-container">
                        <button 
                            type="button" 
                            disabled={loading}
                            className={`form-submit-btn ${loading ? 'form-submit-btn-disabled' : ''}`}
                        >
                            🔄 Esqueceu a senha?
                        </button>
                        
                        <Link to="/register">
                            <button 
                                type="button" 
                                disabled={loading}
                                className={`form-submit-btn ${loading ? 'form-submit-btn-disabled' : ''}`}
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