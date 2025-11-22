import React from 'react';
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { usuariosAPI } from '../../services/apiService';
import { validarFormularioRegistro, apenasNumeros } from '../../utils/validators';
import { useForm } from '../../hooks/useForm';

export default function Register() {
    const navigate = useNavigate();
    
    // Estado inicial do formulário
    const initialState = {
        nome: '',
        email: '',
        senha: '',
        cpf: '',
        cep: '',
        telefone: '',
        tipoUsuario: ''
    };

    // Usar o hook personalizado
    const {
        formData,
        errors,
        loading,
        message,
        handleInputChange,
        validateForm,
        resetForm,
        setFormMessage,
        setFormLoading,
        setFormErrors
    } = useForm(initialState, validarFormularioRegistro);

    // Função para enviar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setFormMessage('❌ Por favor, corrija os erros no formulário');
            return;
        }

        setFormLoading(true);
        setFormMessage('');

        try {
            // Verificar se email já existe
            const emailExiste = await usuariosAPI.getByEmail(formData.email);
            if (emailExiste.success && emailExiste.data) {
                setFormErrors({ email: 'Este email já está cadastrado' });
                setFormMessage('❌ Email já está em uso');
                setFormLoading(false);
                return;
            }

            // Preparar dados para envio
            const dadosUsuario = {
                nome: formData.nome.trim(),
                email: formData.email.trim().toLowerCase(),
                cpf: apenasNumeros(formData.cpf),
                cep: apenasNumeros(formData.cep),
                telefone: apenasNumeros(formData.telefone),
                tipo_usuario: formData.tipoUsuario,
                senha_hash: formData.senha,
                ativo: true
            };

            // Criar usuário
            const resultado = await usuariosAPI.create(dadosUsuario);

            if (resultado.success) {
                setFormMessage('✅ Usuário cadastrado com sucesso!');
                resetForm();

                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setFormMessage(`❌ Erro ao cadastrar: ${resultado.error}`);
            }
        } catch (error) {
            setFormMessage(`❌ Erro: ${error.message}`);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Layout>
            <main>
                <form className="form-center" onSubmit={handleSubmit}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px'}}>
                        📝 Cadastro de Usuário
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
                        <label htmlFor="nameInput">Nome:</label>
                        <input 
                            name="nameInput" 
                            id="nameInput" 
                            type="text" 
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            style={{
                                borderColor: errors.nome ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                        />
                        {errors.nome && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.nome}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="emailInput">E-mail:</label>
                        <input 
                            name="emailInput" 
                            id="emailInput" 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            style={{
                                borderColor: errors.email ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
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
                            placeholder="Mínimo 6 caracteres"
                        />
                        {errors.senha && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.senha}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cpfInput">CPF:</label>
                        <input 
                            name="cpfInput" 
                            id="cpfInput" 
                            type="text" 
                            value={formData.cpf}
                            onChange={(e) => handleInputChange('cpf', e.target.value)}
                            style={{
                                borderColor: errors.cpf ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="000.000.000-00"
                        />
                        {errors.cpf && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.cpf}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="enderecoInput">CEP:</label>
                        <input 
                            name="enderecoInput" 
                            id="enderecoInput" 
                            type="text" 
                            value={formData.cep}
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                            style={{
                                borderColor: errors.cep ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="00000-000"
                        />
                        {errors.cep && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.cep}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefoneInput">Telefone:</label>
                        <input 
                            name="telefoneInput" 
                            id="telefoneInput" 
                            type="text" 
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            style={{
                                borderColor: errors.telefone ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="(11) 99999-9999"
                        />
                        {errors.telefone && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.telefone}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Tipo de Usuário:</label>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                            <label htmlFor="pfInput" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    name="tipoUsuario" 
                                    id="pfInput" 
                                    type="radio" 
                                    value="pf"
                                    checked={formData.tipoUsuario === 'pf'}
                                    onChange={(e) => handleInputChange('tipoUsuario', e.target.value)}
                                    disabled={loading}
                                />
                                Pessoa Física
                            </label>
                            <label htmlFor="pjInput" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    name="tipoUsuario" 
                                    id="pjInput" 
                                    type="radio" 
                                    value="pj"
                                    checked={formData.tipoUsuario === 'pj'}
                                    onChange={(e) => handleInputChange('tipoUsuario', e.target.value)}
                                    disabled={loading}
                                />
                                Pessoa Jurídica
                            </label>
                        </div>
                        {errors.tipoUsuario && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.tipoUsuario}
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
                        {loading ? '⏳ Cadastrando...' : '📝 Cadastrar'}
                    </button>
                    
                    <Link to="/login">
                        <button type="button" disabled={loading}>
                            🔑 Já tenho conta
                        </button>
                    </Link>
                </form>
            </main>
        </Layout>
    );
}