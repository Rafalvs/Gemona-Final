import React from 'react';
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { enderecosAPI, clientesAPI, profissionaisAPI } from '../../services/apiService';
import { useForm } from '../../hooks/useForm';
import { Card, CardHeader, CardBody, Button, Divider } from '@heroui/react';
import { User, Mail, Lock, Phone, CreditCard, Calendar, MapPin, Home, Building, ArrowRight, ArrowLeft, UserPlus, LogIn, Search } from 'lucide-react';
import Logo from '../../assets/peixe.png';

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
            <main style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: 'calc(100vh - 200px)', 
                padding: '2rem 1rem' 
            }}>
                <Card style={{ width: '100%', maxWidth: '600px' }} className="shadow-2xl">
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
                                {showAddressForm ? '🏡 Cadastro de Endereço' : '📝 Cadastro de Usuário'}
                            </h2>
                            <p style={{ 
                                fontSize: '0.875rem', 
                                color: '#666',
                                margin: 0
                            }}>
                                {showAddressForm ? 'Complete seu cadastro com seu endereço' : 'Preencha os dados abaixo para criar sua conta'}
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

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Formulário de Dados Pessoais */}
                    {!showAddressForm && (
                        <>
                            {/* Nome */}
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                    Nome Completo
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                                    <input 
                                        type="text" 
                                        value={formData.nome}
                                        onChange={(e) => handleInputChange('nome', e.target.value)}
                                        disabled={loading}
                                        placeholder="Digite seu nome completo"
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', fontSize: '1rem', border: `2px solid ${errors.nome ? '#dc3545' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fff', color: '#05315f', boxSizing: 'border-box' }}
                                        onFocus={(e) => { if (!errors.nome) e.target.style.borderColor = '#05315f'; }}
                                        onBlur={(e) => { if (!errors.nome) e.target.style.borderColor = '#d1d5db'; }}
                                    />
                                </div>
                                {errors.nome && <span style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545', fontSize: '0.875rem' }}>{errors.nome}</span>}
                            </div>

                            {/* Email */}
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                    E-mail
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={loading}
                                        placeholder="seu@email.com"
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', fontSize: '1rem', border: `2px solid ${errors.email ? '#dc3545' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fff', color: '#05315f', boxSizing: 'border-box' }}
                                        onFocus={(e) => { if (!errors.email) e.target.style.borderColor = '#05315f'; }}
                                        onBlur={(e) => { if (!errors.email) e.target.style.borderColor = '#d1d5db'; }}
                                    />
                                </div>
                                {errors.email && <span style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545', fontSize: '0.875rem' }}>{errors.email}</span>}
                            </div>

                            {/* Senha */}
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                    Senha
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                                    <input 
                                        type="password" 
                                        value={formData.senha}
                                        onChange={(e) => handleInputChange('senha', e.target.value)}
                                        disabled={loading}
                                        placeholder="Mínimo 8 caracteres"
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', fontSize: '1rem', border: `2px solid ${errors.senha ? '#dc3545' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fff', color: '#05315f', boxSizing: 'border-box' }}
                                        onFocus={(e) => { if (!errors.senha) e.target.style.borderColor = '#05315f'; }}
                                        onBlur={(e) => { if (!errors.senha) e.target.style.borderColor = '#d1d5db'; }}
                                    />
                                </div>
                                <small style={{ color: '#666', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                                    Deve conter número, caractere especial e letra maiúscula
                                </small>
                                {errors.senha && <span style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545', fontSize: '0.875rem' }}>{errors.senha}</span>}
                            </div>

                            {/* Confirmar Senha */}
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                    Confirmar Senha
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                                    <input 
                                        type="password" 
                                        disabled={loading}
                                        placeholder="Digite a senha novamente"
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', fontSize: '1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fff', color: '#05315f', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = '#05315f'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>
                            </div>

                            {/* Telefone */}
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                    Telefone
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                                    <input 
                                        type="text" 
                                        value={formData.telefone}
                                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                                        disabled={loading}
                                        placeholder="(11) 99999-9999"
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', fontSize: '1rem', border: `2px solid ${errors.telefone ? '#dc3545' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fff', color: '#05315f', boxSizing: 'border-box' }}
                                        onFocus={(e) => { if (!errors.telefone) e.target.style.borderColor = '#05315f'; }}
                                        onBlur={(e) => { if (!errors.telefone) e.target.style.borderColor = '#d1d5db'; }}
                                    />
                                </div>
                                {errors.telefone && <span style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545', fontSize: '0.875rem' }}>{errors.telefone}</span>}
                            </div>

                            {/* CPF */}
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                    CPF
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                                    <input 
                                        type="text" 
                                        value={formData.cpf}
                                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                                        disabled={loading}
                                        placeholder="000.000.000-00"
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', fontSize: '1rem', border: `2px solid ${errors.cpf ? '#dc3545' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fff', color: '#05315f', boxSizing: 'border-box' }}
                                        onFocus={(e) => { if (!errors.cpf) e.target.style.borderColor = '#05315f'; }}
                                        onBlur={(e) => { if (!errors.cpf) e.target.style.borderColor = '#d1d5db'; }}
                                    />
                                </div>
                                {errors.cpf && <span style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545', fontSize: '0.875rem' }}>{errors.cpf}</span>}
                            </div>

                            {/* Data de Nascimento */}
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                    Data de Nascimento
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                                    <input 
                                        type="date" 
                                        value={dataNascimento}
                                        onChange={(e) => setDataNascimento(e.target.value)}
                                        disabled={loading}
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', fontSize: '1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fff', color: '#05315f', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = '#05315f'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>
                            </div>


                            {/* Tipo de Usuário */}
                            <div style={{ width: '100%' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                    Tipo de Usuário
                                </label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: `2px solid ${formData.tipoUsuario === 'pf' ? '#05315f' : '#d1d5db'}`, borderRadius: '0.5rem', flex: 1, backgroundColor: formData.tipoUsuario === 'pf' ? '#f0f9ff' : '#fff', transition: 'all 0.2s' }}>
                                        <input 
                                            type="radio" 
                                            name="tipoUsuario"
                                            value="pf"
                                            checked={formData.tipoUsuario === 'pf'}
                                            onChange={(e) => handleInputChange('tipoUsuario', e.target.value)}
                                            disabled={loading}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Pessoa Física</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: `2px solid ${formData.tipoUsuario === 'pj' ? '#05315f' : '#d1d5db'}`, borderRadius: '0.5rem', flex: 1, backgroundColor: formData.tipoUsuario === 'pj' ? '#f0f9ff' : '#fff', transition: 'all 0.2s' }}>
                                        <input 
                                            type="radio" 
                                            name="tipoUsuario"
                                            value="pj"
                                            checked={formData.tipoUsuario === 'pj'}
                                            onChange={(e) => handleInputChange('tipoUsuario', e.target.value)}
                                            disabled={loading}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Pessoa Jurídica</span>
                                    </label>
                                </div>
                                {errors.tipoUsuario && <span style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545', fontSize: '0.875rem' }}>{errors.tipoUsuario}</span>}
                            </div>

                            <Divider style={{ margin: '0.5rem 0' }} />

                            {/* Botões */}
                            {formData.tipoUsuario === 'pf' && (
                                <Button
                                    type="button"
                                    onClick={() => setShowAddressForm(true)}
                                    isDisabled={loading}
                                    size="lg"
                                    className="hover:bg-[#dbcab2] w-full bg-[#ffecd1] text-[#05315f] font-bold border-2 border-[#05315f] transition-all duration-300 shadow-md hover:shadow-lg"
                                    endContent={<ArrowRight size={20} />}
                                >
                                    Cadastrar Endereço
                                </Button>
                            )}
                            {formData.tipoUsuario === 'pj' && (
                                <Button
                                    type="submit"
                                    isDisabled={loading || !isFormComplete()}
                                    isLoading={loading}
                                    size="lg"
                                    className="bg-[#05315f] text-white font-bold hover:bg-[#041f3f] transition-all duration-300 shadow-md hover:shadow-lg"
                                    startContent={!loading && <UserPlus size={20} />}
                                >
                                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                                </Button>
                            )}

                            <Link to="/login">
                                <Button
                                    type="button"
                                    isDisabled={loading}
                                    size="lg"
                                    variant="bordered"
                                    className="bg-black border-2 w-full border-gray-300 text-white font-semibold hover:border-[#05315f] hover:text-[#000000] hover:bg-white transition-all duration-300"
                                    startContent={<LogIn size={20} />}
                                >
                                    Já tenho conta
                                </Button>
                            </Link>
                        </>
                    )}

            {/* Formulário de Endereço */}
            {showAddressForm && (
                <>
                    <Divider style={{ margin: '1.5rem 0' }} />
                    
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#05315f', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={24} />
                        Endereço
                    </h3>

                    {/* CEP */}
                    <div style={{ width: '100%' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>CEP</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                <input
                                    type="text"
                                    name="enderecoInput"
                                    placeholder="00000-000"
                                    value={formData.cep}
                                    onChange={(e) => handleInputChange('cep', e.target.value)}
                                    disabled={loading}
                                    style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', fontSize: '1rem', border: `2px solid ${errors.cep ? '#dc3545' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: loading ? '#f3f4f6' : '#fff' }}
                                    onFocus={(e) => e.target.style.borderColor = '#05315f'}
                                    onBlur={(e) => { if (!e.target.value && !errors.cep) e.target.style.borderColor = '#d1d5db'; }}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={buscarCep}
                                isDisabled={loading || buscandoCep || !formData.cep}
                                isLoading={buscandoCep}
                                size="lg"
                                className="bg-black border-2 border-gray-300 text-white font-semibold hover:border-[#05315f] hover:text-[#000000] hover:bg-white transition-all duration-300"
                                startContent={!buscandoCep && <Search size={18} />}
                            >
                                Buscar
                            </Button>
                        </div>
                        {errors.cep && <span style={{ display: 'block', marginTop: '0.25rem', color: '#dc3545', fontSize: '0.875rem' }}>{errors.cep}</span>}
                    </div>

                    {/* Rua e Número */}
                    <div style={{ width: '100%', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 3 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Rua</label>
                            <div style={{ position: 'relative' }}>
                                <Home size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                <input
                                    type="text"
                                    name="ruaInput"
                                    placeholder="Aguardando CEP..."
                                    value={addressData.rua}
                                    onChange={(e) => setAddressData({...addressData, rua: e.target.value})}
                                    disabled={loading}
                                    style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', fontSize: '1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: loading ? '#f3f4f6' : '#fff' }}
                                    onFocus={(e) => e.target.style.borderColor = '#05315f'}
                                    onBlur={(e) => { if (!e.target.value) e.target.style.borderColor = '#d1d5db'; }}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Número</label>
                            <div style={{ position: 'relative' }}>
                                <Building size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                <input
                                    type="text"
                                    name="numeroInput"
                                    placeholder="Nº"
                                    value={addressData.numero}
                                    onChange={(e) => setAddressData({...addressData, numero: e.target.value})}
                                    disabled={loading}
                                    style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', fontSize: '1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: loading ? '#f3f4f6' : '#fff' }}
                                    onFocus={(e) => e.target.style.borderColor = '#05315f'}
                                    onBlur={(e) => { if (!e.target.value) e.target.style.borderColor = '#d1d5db'; }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Complemento */}
                    <div style={{ width: '100%' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Complemento <span style={{ color: '#6b7280' }}>(Opcional)</span></label>
                        <div style={{ position: 'relative' }}>
                            <Home size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                            <input
                                type="text"
                                name="complementoInput"
                                placeholder="Apartamento, bloco, etc."
                                value={addressData.complemento}
                                onChange={(e) => setAddressData({...addressData, complemento: e.target.value})}
                                disabled={loading}
                                style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', fontSize: '1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: loading ? '#f3f4f6' : '#fff' }}
                                onFocus={(e) => e.target.style.borderColor = '#05315f'}
                                onBlur={(e) => { if (!e.target.value) e.target.style.borderColor = '#d1d5db'; }}
                            />
                        </div>
                    </div>

                    {/* Cidade e Estado */}
                    <div style={{ width: '100%', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 3 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Cidade</label>
                            <div style={{ position: 'relative' }}>
                                <Building size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                <input
                                    type="text"
                                    name="cidadeInput"
                                    placeholder="Aguardando CEP..."
                                    value={addressData.cidade}
                                    onChange={(e) => setAddressData({...addressData, cidade: e.target.value})}
                                    disabled={loading}
                                    style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', fontSize: '1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: loading ? '#f3f4f6' : '#fff' }}
                                    onFocus={(e) => e.target.style.borderColor = '#05315f'}
                                    onBlur={(e) => { if (!e.target.value) e.target.style.borderColor = '#d1d5db'; }}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Estado</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                                <input
                                    type="text"
                                    name="estadoInput"
                                    placeholder="UF"
                                    value={addressData.estado}
                                    onChange={(e) => setAddressData({...addressData, estado: e.target.value})}
                                    disabled={loading}
                                    maxLength="2"
                                    style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', fontSize: '1rem', border: '2px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'all 0.2s', backgroundColor: loading ? '#f3f4f6' : '#fff', textTransform: 'uppercase' }}
                                    onFocus={(e) => e.target.style.borderColor = '#05315f'}
                                    onBlur={(e) => { if (!e.target.value) e.target.style.borderColor = '#d1d5db'; }}
                                />
                            </div>
                        </div>
                    </div>

                    <Divider style={{ margin: '1rem 0' }} />

                    {/* Botões do formulário de endereço */}
                    <Button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        isDisabled={loading}
                        size="lg"
                        variant="bordered"
                        className="bg-[#ffecd1] w-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-500 hover:text-gray-900 transition-all duration-300 mb-3"
                        startContent={<ArrowLeft size={20} />}
                    >
                        Retornar
                    </Button>

                    <Button
                        type="submit"
                        isDisabled={loading || !isFormComplete()}
                        isLoading={loading}
                        size="lg"
                        className="w-full bg-[#05315f] text-white font-bold hover:bg-[#041f3f] transition-all duration-300 shadow-md hover:shadow-lg"
                        startContent={!loading && <UserPlus size={20} />}
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>

                    <Link to="/login">
                        <Button
                            type="button"
                            isDisabled={loading}
                            size="lg"
                            variant="bordered"
                            className="bg-black border-2 w-full border-gray-300 text-white font-semibold hover:border-[#05315f] hover:text-[#000000] hover:bg-white transition-all duration-300"
                            startContent={<LogIn size={20} />}
                        >
                            Já tenho conta
                        </Button>
                    </Link>
                </>
            )}
                </form>
                </CardBody>
            </Card>
            </main>
        </Layout>
    );
}