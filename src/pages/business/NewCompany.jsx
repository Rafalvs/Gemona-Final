import { useState } from 'react';
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { estabelecimentosAPI, enderecosAPI } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { validarFormularioEstabelecimento, apenasNumeros } from '../../utils/validators';

export default function NewCompany(){
    const [formData, setFormData] = useState({
        // Dados do estabelecimento
        nome: '',
        cnpj: '',
        
        // Dados do endereço
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        complemento: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();
    const { user } = useAuth(); // Para obter o ID do usuário logado

    // Função para atualizar campos do formulário
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpar erro do campo quando usuário começar a digitar
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validarFormulario = () => {
        const erros = validarFormularioEstabelecimento(formData);
        setErrors(erros);
        return Object.keys(erros).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            setMessage('❌ Por favor, corrija os erros no formulário');
            return;
        }

        if (!user || !user.id) {
            setMessage('❌ Erro: usuário não está logado');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // 1. Primeiro, criar o endereço
            const dadosEndereco = {
                rua: formData.rua.trim(),
                numero: formData.numero.trim(),
                bairro: formData.bairro.trim(),
                cidade: formData.cidade.trim(),
                estado: formData.estado.trim().toUpperCase(),
                cep: apenasNumeros(formData.cep),
                complemento: formData.complemento.trim(),
                latitude: null, // Pode ser implementado com API de geolocalização
                longitude: null,
                ativo: 1
            };

            const resultadoEndereco = await enderecosAPI.create(dadosEndereco);

            if (!resultadoEndereco.success) {
                setMessage(`❌ Erro ao criar endereço: ${resultadoEndereco.error}`);
                setLoading(false);
                return;
            }

            // 2. Depois, criar o estabelecimento
            const dadosEstabelecimento = {
                nome: formData.nome.trim(),
                cnpj: apenasNumeros(formData.cnpj),
                profissional_id: user.id, // ID do usuário logado
                endereco_id: resultadoEndereco.data.id // ID do endereço criado
            };

            const resultadoEstabelecimento = await estabelecimentosAPI.create(dadosEstabelecimento);

            if (resultadoEstabelecimento.success) {
                setMessage('✅ Estabelecimento cadastrado com sucesso!');
                
                // Limpar formulário
                setFormData({
                    nome: '',
                    cnpj: '',
                    rua: '',
                    numero: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    cep: '',
                    complemento: ''
                });

                // Redirecionar para o perfil do negócio após 2 segundos
                setTimeout(() => {
                    navigate('/businessProfile');
                }, 2000);
            } else {
                setMessage(`❌ Erro ao criar estabelecimento: ${resultadoEstabelecimento.error}`);
            }
        } catch (error) {
            setMessage(`❌ Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return(
        <Layout>
            <main>
                <form className="form-center" onSubmit={handleSubmit}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
                        🏢 Cadastro de Estabelecimento
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

                    {/* Seção: Dados do Estabelecimento */}
                    <h3 style={{ color: '#fff', marginBottom: '15px' }}>📋 Dados do Estabelecimento</h3>
                    
                    <div className="form-group">
                        <label htmlFor="nomeInput">Nome do Estabelecimento *</label>
                        <input 
                            name="nomeInput" 
                            id="nomeInput" 
                            type="text" 
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            style={{
                                borderColor: errors.nome ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="Ex: Salão Beleza Pura"
                        />
                        {errors.nome && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.nome}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cnpjInput">CNPJ *</label>
                        <input 
                            name="cnpjInput" 
                            id="cnpjInput" 
                            type="text" 
                            value={formData.cnpj}
                            onChange={(e) => handleInputChange('cnpj', e.target.value)}
                            style={{
                                borderColor: errors.cnpj ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="00.000.000/0000-00"
                        />
                        {errors.cnpj && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.cnpj}
                            </span>
                        )}
                    </div>

                    {/* Seção: Endereço */}
                    <h3 style={{ color: '#fff', marginBottom: '15px', marginTop: '30px' }}>📍 Endereço</h3>
                    
                    <div className="form-group">
                        <label htmlFor="ruaInput">Rua *</label>
                        <input 
                            name="ruaInput" 
                            id="ruaInput" 
                            type="text" 
                            value={formData.rua}
                            onChange={(e) => handleInputChange('rua', e.target.value)}
                            style={{
                                borderColor: errors.rua ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="Ex: Av. Paulista"
                        />
                        {errors.rua && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.rua}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: '2' }}>
                            <label htmlFor="numeroInput">Número *</label>
                            <input 
                                name="numeroInput" 
                                id="numeroInput" 
                                type="text" 
                                value={formData.numero}
                                onChange={(e) => handleInputChange('numero', e.target.value)}
                                style={{
                                    borderColor: errors.numero ? '#dc3545' : '#ddd'
                                }}
                                disabled={loading}
                                placeholder="1000"
                            />
                            {errors.numero && (
                                <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                    {errors.numero}
                                </span>
                            )}
                        </div>

                        <div className="form-group" style={{ flex: '3' }}>
                            <label htmlFor="complementoInput">Complemento</label>
                            <input 
                                name="complementoInput" 
                                id="complementoInput" 
                                type="text" 
                                value={formData.complemento}
                                onChange={(e) => handleInputChange('complemento', e.target.value)}
                                disabled={loading}
                                placeholder="Sala 101, Andar 5..."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bairroInput">Bairro *</label>
                        <input 
                            name="bairroInput" 
                            id="bairroInput" 
                            type="text" 
                            value={formData.bairro}
                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                            style={{
                                borderColor: errors.bairro ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="Ex: Bela Vista"
                        />
                        {errors.bairro && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.bairro}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: '3' }}>
                            <label htmlFor="cidadeInput">Cidade *</label>
                            <input 
                                name="cidadeInput" 
                                id="cidadeInput" 
                                type="text" 
                                value={formData.cidade}
                                onChange={(e) => handleInputChange('cidade', e.target.value)}
                                style={{
                                    borderColor: errors.cidade ? '#dc3545' : '#ddd'
                                }}
                                disabled={loading}
                                placeholder="São Paulo"
                            />
                            {errors.cidade && (
                                <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                    {errors.cidade}
                                </span>
                            )}
                        </div>

                        <div className="form-group" style={{ flex: '1' }}>
                            <label htmlFor="estadoInput">Estado *</label>
                            <input 
                                name="estadoInput" 
                                id="estadoInput" 
                                type="text" 
                                value={formData.estado}
                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                style={{
                                    borderColor: errors.estado ? '#dc3545' : '#ddd'
                                }}
                                disabled={loading}
                                placeholder="SP"
                                maxLength="2"
                            />
                            {errors.estado && (
                                <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                    {errors.estado}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="cepInput">CEP *</label>
                        <input 
                            name="cepInput" 
                            id="cepInput" 
                            type="text" 
                            value={formData.cep}
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                            style={{
                                borderColor: errors.cep ? '#dc3545' : '#ddd'
                            }}
                            disabled={loading}
                            placeholder="01310-100"
                        />
                        {errors.cep && (
                            <span style={{ color: '#dc3545', fontSize: '14px' }}>
                                {errors.cep}
                            </span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#ccc' : '#007bff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            marginTop: '20px'
                        }}
                    >
                        {loading ? '⏳ Cadastrando...' : '🏢 Cadastrar Estabelecimento'}
                    </button>
                    
                    <Link to="/businessProfile">
                        <button type="button" disabled={loading}>
                            ⬅️ Voltar ao Perfil
                        </button>
                    </Link>
                </form>
            </main>
        </Layout>
    )
}