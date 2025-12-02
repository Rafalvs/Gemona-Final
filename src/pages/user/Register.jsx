import React from 'react';
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { enderecosAPI, clientesAPI, profissionaisAPI } from '../../services/apiService';
import { useForm } from '../../hooks/useForm';

export default function Register() {
    const navigate = useNavigate();
    const [showAddressForm, setShowAddressForm] = React.useState(false);
    const [buscandoCep, setBuscandoCep] = React.useState(false);
    const [dataNascimento, setDataNascimento] = React.useState('');
    const [addressData, setAddressData] = React.useState({
        rua: '',
        numero: '',
        complemento: '',
        cidade: '',
        estado: ''
    });
    
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
    } = useForm(initialState);

    // Função para buscar CEP
    const buscarCep = async () => {
        const cepLimpo = formData.cep.replace(/\D/g, '');
        
        if (cepLimpo.length !== 8) {
            setFormMessage('❌ CEP deve ter 8 dígitos');
            return;
        }

        setBuscandoCep(true);
        setFormMessage('');

        try {
            const resultado = await enderecosAPI.getByCep(cepLimpo);
            
            if (resultado.success && resultado.data) {
                const endereco = resultado.data;
                setAddressData({
                    rua: endereco.rua || '',
                    numero: addressData.numero,
                    complemento: addressData.complemento,
                    cidade: endereco.cidade || '',
                    estado: endereco.estado || ''
                });
                setFormMessage('✅ CEP encontrado!');
                setTimeout(() => setFormMessage(''), 2000);
            } else {
                setFormMessage('❌ CEP não encontrado');
            }
        } catch (error) {
            setFormMessage('❌ Erro ao buscar CEP: ' + error.message);
        } finally {
            setBuscandoCep(false);
        }
    };

    // Verificar se todos os campos estão preenchidos
    const isFormComplete = () => {
        // Campos básicos para todos os tipos (incluindo CPF e data de nascimento)
        const basicFieldsFilled = formData.nome && formData.email && formData.senha && 
                                  formData.telefone && formData.cpf && dataNascimento && 
                                  formData.tipoUsuario;
        
        // Endereço obrigatório apenas para PF
        if (formData.tipoUsuario === 'pj') {
            return basicFieldsFilled;
        }
        
        const addressFieldsFilled = formData.cep && addressData.rua && addressData.numero && 
                                    addressData.cidade && addressData.estado;
        return basicFieldsFilled && addressFieldsFilled;
    };

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
            const isPF = formData.tipoUsuario === 'pf';
            
            // Preparar dados base
            const dadosBase = {
                nome: formData.nome.trim(),
                email: formData.email.trim().toLowerCase(),
                telefone: formData.telefone.replace(/\D/g, ''),
                senha: formData.senha
            };

            let resultado;
            
            if (isPF) {
                // Cadastro de Cliente (Pessoa Física)
                const dadosCliente = {
                    ...dadosBase,
                    cpf: formData.cpf.replace(/\D/g, ''),
                    dataNascimento: dataNascimento ? new Date(dataNascimento).toISOString() : null,
                    // Dados de endereço
                    rua: addressData.rua.trim(),
                    numero: addressData.numero.trim(),
                    bairro: '', // Campo não coletado no formulário atual
                    complemento: addressData.complemento.trim(),
                    cidade: addressData.cidade.trim(),
                    estado: addressData.estado.trim(),
                    cep: formData.cep.replace(/\D/g, ''),
                    latitude: 0,
                    longitude: 0
                };
                
                resultado = await clientesAPI.create(dadosCliente);
            } else {
                // Cadastro de Profissional (Pessoa Jurídica)
                const dadosProfissional = {
                    ...dadosBase,
                    cpf: formData.cpf.replace(/\D/g, ''),
                    dataNascimento: dataNascimento ? new Date(dataNascimento).toISOString() : null
                };
                
                resultado = await profissionaisAPI.create(dadosProfissional);
            }

            if (resultado.success) {
                setFormMessage(`✅ ${isPF ? 'Cliente' : 'Profissional'} cadastrado com sucesso!`);
                resetForm();
                setAddressData({
                    rua: '',
                    numero: '',
                    complemento: '',
                    cidade: '',
                    estado: ''
                });
                setDataNascimento('');

                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setFormMessage('❌ Algum campo foi preenchido incorretamente. Verifique os dados e tente novamente.');
            }
        } catch (error) {
            setFormMessage('❌ Algum campo foi preenchido incorretamente. Verifique os dados e tente novamente.');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Layout>
            <main>
                <form className="form-center" onSubmit={handleSubmit}>
                    <h2 className="register-title">
                        📝 Cadastro de Usuário
                    </h2>

                    {/* Mensagem de feedback */}
                    {message && (
                        <div className={`feedback-message ${message.includes('✅') ? 'feedback-success' : 'feedback-error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Formulário de Dados Pessoais */}
                    {!showAddressForm && (
                        <div>
                    <div className="form-group">
                        <label htmlFor="nameInput">Nome:</label>
                        <input 
                            name="nameInput" 
                            id="nameInput" 
                            type="text" 
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={errors.nome ? 'input-error' : ''}
                            disabled={loading}
                        />
                        {errors.nome && (
                            <span className="error-text">
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
                            className={errors.email ? 'input-error' : ''}
                            disabled={loading}
                        />
                        {errors.email && (
                            <span className="error-text">
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
                            className={errors.senha ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="Mínimo 8 caracteres"
                        />
                        <small style={{ color: '#999', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                            A senha deve conter um número, um caractere alfanumérico e uma letra maiúscula.
                        </small>
                        {errors.senha && (
                            <span className="error-text">
                                {errors.senha}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPasswordInput">Confirme sua Senha:</label>
                        <input 
                            name="confirmPasswordInput" 
                            id="confirmPasswordInput" 
                            type="password" 
                            disabled={loading}
                            placeholder="Digite a senha novamente"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefoneInput">Telefone:</label>
                        <input 
                            name="telefoneInput" 
                            id="telefoneInput" 
                            type="text" 
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            className={errors.telefone ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="(11) 99999-9999"
                        />
                        {errors.telefone && (
                            <span className="error-text">
                                {errors.telefone}
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
                            className={errors.cpf ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="000.000.000-00"
                        />
                        {errors.cpf && (
                            <span className="error-text">
                                {errors.cpf}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="dataNascimentoInput">Data de Nascimento:</label>
                        <input 
                            name="dataNascimentoInput" 
                            id="dataNascimentoInput" 
                            type="date" 
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    
                    <div className="form-group">
                        <label>Tipo de Usuário:</label>
                        <div className="radio-group">
                            <label htmlFor="pfInput" className="radio-label">
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
                            <label htmlFor="pjInput" className="radio-label">
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
                            <span className="error-text">
                                {errors.tipoUsuario}
                            </span>
                        )}
                    </div>

                    {!showAddressForm && formData.tipoUsuario === 'pf' && (
                        <button 
                            type="button"
                            onClick={() => setShowAddressForm(true)}
                            disabled={loading}
                            style={{
                                backgroundColor: '#28a745',
                                width: '100%',
                                marginTop: '10px'
                            }}
                        >
                            ➡️ Cadastrar Endereço
                        </button>
                    )}
                    {!showAddressForm && formData.tipoUsuario === 'pj' && (
                        <button 
                            type="submit"
                            disabled={loading || !isFormComplete()}
                            style={{
                                backgroundColor: '#28a745',
                                width: '100%',
                                marginTop: '10px',
                                opacity: (!isFormComplete() && !loading) ? 0.5 : 1,
                                cursor: (!isFormComplete() && !loading) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? '⏳ Cadastrando...' : '📝 Cadastrar'}
                        </button>
                    )}
                </div>
            )}

            {/* Formulário de Endereço */}
            {showAddressForm && (
                <div>
                    <h2 className="register-section-title2">
                        🏡 Endereço
                    </h2>

                    <div className="form-group">
                        <label htmlFor="enderecoInput">CEP:</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <input 
                                name="enderecoInput" 
                                id="enderecoInput" 
                                type="text" 
                                value={formData.cep}
                                onChange={(e) => handleInputChange('cep', e.target.value)}
                                className={errors.cep ? 'input-error' : ''}
                                disabled={loading}
                                placeholder="00000-000"
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={buscarCep}
                                disabled={loading || buscandoCep || !formData.cep}
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    opacity: (!formData.cep || loading || buscandoCep) ? 0.5 : 1
                                }}
                                title="Buscar endereço pelo CEP"
                            >
                                {buscandoCep ? '⏳' : '🔍'}
                            </button>
                        </div>
                        {errors.cep && (
                            <span className="error-text">
                                {errors.cep}
                            </span>
                        )}
                    </div>

                    <div className="form-group form-row">
                        <div className="form-col-3">
                            <label htmlFor="ruaInput">Rua:</label>
                            <input 
                                name="ruaInput" 
                                id="ruaInput" 
                                type="text" 
                                value={addressData.rua}
                                onChange={(e) => setAddressData({...addressData, rua: e.target.value})}
                                disabled={loading}
                                placeholder="Aguardando CEP..."
                            />
                        </div>
                        <div className="form-col-1">
                            <label htmlFor="numeroInput">Número:</label>
                            <input 
                                name="numeroInput" 
                                id="numeroInput" 
                                type="text" 
                                value={addressData.numero}
                                onChange={(e) => setAddressData({...addressData, numero: e.target.value})}
                                disabled={loading}
                                placeholder="Nº"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="complementoInput">Complemento:</label>
                        <input 
                            name="complementoInput" 
                            id="complementoInput" 
                            type="text" 
                            value={addressData.complemento}
                            onChange={(e) => setAddressData({...addressData, complemento: e.target.value})}
                            disabled={loading}
                            placeholder="Apartamento, bloco, etc. (opcional)"
                        />
                    </div>

                    <div className="form-group form-row">
                        <div className="form-col-2">
                            <label htmlFor="cidadeInput">Cidade:</label>
                            <input 
                                name="cidadeInput" 
                                id="cidadeInput" 
                                type="text" 
                                value={addressData.cidade}
                                onChange={(e) => setAddressData({...addressData, cidade: e.target.value})}
                                disabled={loading}
                                placeholder="Aguardando CEP..."
                            />
                        </div>
                        <div className="form-col-1">
                            <label htmlFor="estadoInput">Estado:</label>
                            <input 
                                name="estadoInput" 
                                id="estadoInput" 
                                type="text" 
                                value={addressData.estado}
                                onChange={(e) => setAddressData({...addressData, estado: e.target.value})}
                                disabled={loading}
                                placeholder="UF"
                                maxLength="2"
                            />
                        </div>
                    </div>

                    <button 
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        disabled={loading}
                        style={{
                            backgroundColor: '#6c757d',
                            width: '100%',
                            marginBottom: '20px',
                            marginTop: '20px'
                        }}
                    >
                        ⬅️ Retornar
                    </button>

                    <button 
                        type="submit" 
                        disabled={loading || !isFormComplete()}
                        className="submit-button"
                        style={{
                            opacity: (!isFormComplete() && !loading) ? 0.5 : 1,
                            cursor: (!isFormComplete() && !loading) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '⏳ Cadastrando...' : '📝 Cadastrar'}
                    </button>
                </div>
            )}

            {!showAddressForm && formData.tipoUsuario !== 'pj' && (
                <Link to="/login">
                    <button type="button" disabled={loading}>
                        🔑 Já tenho conta
                    </button>
                </Link>
            )}
            {!showAddressForm && formData.tipoUsuario === 'pj' && (
                <Link to="/login">
                    <button type="button" disabled={loading}>
                        🔑 Já tenho conta
                    </button>
                </Link>
            )}
                </form>
            </main>
        </Layout>
    );
}