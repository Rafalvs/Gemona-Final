import { useState } from 'react';
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { estabelecimentosAPI, enderecosAPI } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/NewCompany.css';

export default function NewCompany(){
    const [formData, setFormData] = useState({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        descricao: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        complemento: '',
        latitude: null,
        longitude: null
    });
    
    const [imagemFile, setImagemFile] = useState(null);
    const [imagemPreview, setImagemPreview] = useState(null);
    const [imagemBase64, setImagemBase64] = useState(null);
    
    const [horarios, setHorarios] = useState([
        { diaSemana: 1, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
        { diaSemana: 2, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
        { diaSemana: 3, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
        { diaSemana: 4, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
        { diaSemana: 5, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
        { diaSemana: 6, horaAbertura: '09:00', horaFechamento: '13:00', fechado: false },
        { diaSemana: 7, horaAbertura: '00:00', horaFechamento: '00:00', fechado: true }
    ]);
    
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagemFile(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setImagemPreview(base64String);
                
                const base64Data = base64String.split(',')[1];
                setImagemBase64({
                    fileName: file.name,
                    contentType: file.type,
                    base64Data: base64Data
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            setErrors(prev => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }));
            return;
        }
        
        setLoadingCep(true);
        setErrors(prev => ({ ...prev, cep: '' }));
        
        try {
            const resultado = await enderecosAPI.getByCep(cep);
            
            if (resultado.success && resultado.data) {
                setFormData(prev => ({
                    ...prev,
                    rua: resultado.data.rua || '',
                    bairro: resultado.data.bairro || '',
                    cidade: resultado.data.cidade || '',
                    estado: resultado.data.estado || '',
                    latitude: resultado.data.latitude || null,
                    longitude: resultado.data.longitude || null
                }));
                setMessage('✅ Endereço encontrado!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' }));
        } finally {
            setLoadingCep(false);
        }
    };
    
    const handleHorarioChange = (index, field, value) => {
        setHorarios(prev => {
            const newHorarios = [...prev];
            newHorarios[index] = {
                ...newHorarios[index],
                [field]: value
            };
            return newHorarios;
        });
    };

    const validarFormulario = () => {
        const erros = {};
        
        if (!formData.nome?.trim()) erros.nome = 'Nome do estabelecimento é obrigatório';
        if (!formData.cnpj?.trim()) erros.cnpj = 'CNPJ é obrigatório';
        if (!formData.telefone?.trim()) erros.telefone = 'Telefone é obrigatório';
        if (!formData.email?.trim()) erros.email = 'Email é obrigatório';
        if (!formData.descricao?.trim()) erros.descricao = 'Descrição é obrigatória';
        if (!formData.rua?.trim()) erros.rua = 'Rua é obrigatória';
        if (!formData.numero?.trim()) erros.numero = 'Número é obrigatório';
        if (!formData.bairro?.trim()) erros.bairro = 'Bairro é obrigatório';
        if (!formData.cidade?.trim()) erros.cidade = 'Cidade é obrigatória';
        if (!formData.estado?.trim()) erros.estado = 'Estado é obrigatório';
        if (!formData.cep?.trim()) erros.cep = 'CEP é obrigatório';
        
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
            const horariosFormatados = horarios.map(h => ({
                diaSemana: h.diaSemana,
                horaAbertura: h.fechado ? '00:00:00' : `${h.horaAbertura}:00`,
                horaFechamento: h.fechado ? '00:00:00' : `${h.horaFechamento}:00`,
                fechado: h.fechado
            }));

            const dadosEstabelecimento = {
                nome: formData.nome.trim(),
                telefone: formData.telefone.trim(),
                email: formData.email.trim(),
                descricao: formData.descricao.trim(),
                cnpj: formData.cnpj.replace(/\D/g, ''),
                imagemEstabelecimento: imagemBase64 || null,
                profissionalId: user.id,
                rua: formData.rua.trim(),
                numero: formData.numero.trim(),
                bairro: formData.bairro.trim(),
                complemento: formData.complemento.trim(),
                cidade: formData.cidade.trim(),
                estado: formData.estado.trim().toUpperCase(),
                cep: formData.cep.replace(/\D/g, ''),
                latitude: formData.latitude || 0,
                longitude: formData.longitude || 0,
                horarios: horariosFormatados
            };

            const resultadoEstabelecimento = await estabelecimentosAPI.create(dadosEstabelecimento);

            if (resultadoEstabelecimento.success) {
                setMessage('✅ Estabelecimento cadastrado com sucesso!');
                
                setFormData({
                    nome: '',
                    cnpj: '',
                    telefone: '',
                    email: '',
                    descricao: '',
                    rua: '',
                    numero: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    cep: '',
                    complemento: '',
                    latitude: null,
                    longitude: null
                });
                setImagemFile(null);
                setImagemPreview(null);
                setImagemBase64(null);
                setHorarios([
                    { diaSemana: 1, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
                    { diaSemana: 2, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
                    { diaSemana: 3, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
                    { diaSemana: 4, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
                    { diaSemana: 5, horaAbertura: '08:00', horaFechamento: '18:00', fechado: false },
                    { diaSemana: 6, horaAbertura: '09:00', horaFechamento: '13:00', fechado: false },
                    { diaSemana: 7, horaAbertura: '00:00', horaFechamento: '00:00', fechado: true }
                ]);

                setTimeout(() => {
                    navigate('/companyProfile');
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
                    <h2 className="new-company-title">
                        🏢 Cadastro de Estabelecimento
                    </h2>

                    {message && (
                        <div className={`feedback-message ${message.includes('✅') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <h3 className="section-title">📋 Dados do Estabelecimento</h3>
                    
                    <div className="form-group">
                        <label htmlFor="nomeInput">Nome do Estabelecimento *</label>
                        <input 
                            name="nomeInput" 
                            id="nomeInput" 
                            type="text" 
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={errors.nome ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="Ex: Salão Beleza Pura"
                        />
                        {errors.nome && (
                            <span className="error-text">{errors.nome}</span>
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
                            className={errors.cnpj ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="00.000.000/0000-00"
                        />
                        {errors.cnpj && (
                            <span className="error-text">{errors.cnpj}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefoneInput">Telefone *</label>
                        <input 
                            name="telefoneInput" 
                            id="telefoneInput" 
                            type="tel" 
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            className={errors.telefone ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="(11) 91234-5678"
                        />
                        {errors.telefone && (
                            <span className="error-text">{errors.telefone}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="emailInput">Email *</label>
                        <input 
                            name="emailInput" 
                            id="emailInput" 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={errors.email ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="contato@estabelecimento.com"
                        />
                        {errors.email && (
                            <span className="error-text">{errors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="descricaoInput">Descrição *</label>
                        <textarea 
                            name="descricaoInput" 
                            id="descricaoInput" 
                            value={formData.descricao}
                            onChange={(e) => handleInputChange('descricao', e.target.value)}
                            className={errors.descricao ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="Descreva seu estabelecimento, serviços oferecidos, diferenciais..."
                            rows="4"
                        />
                        {errors.descricao && (
                            <span className="error-text">{errors.descricao}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="imagemInput">Imagem do Estabelecimento</label>
                        <input 
                            name="imagemInput" 
                            id="imagemInput" 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                        />
                        {imagemPreview && (
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <img 
                                    src={imagemPreview} 
                                    alt="Preview" 
                                    style={{
                                        maxWidth: '300px',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        border: '2px solid #f48f42'
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <h3 className="section-title address">📍 Endereço</h3>
                    
                    <div className="form-group">
                        <label htmlFor="cepInput">CEP *</label>
                        <input 
                            name="cepInput" 
                            id="cepInput" 
                            type="text" 
                            value={formData.cep}
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                            onBlur={handleCepBlur}
                            className={errors.cep ? 'input-error' : ''}
                            disabled={loading || loadingCep}
                            placeholder="01310-100"
                        />
                        {loadingCep && <span className="info-text">🔍 Buscando CEP...</span>}
                        {errors.cep && (
                            <span className="error-text">{errors.cep}</span>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="ruaInput">Rua *</label>
                        <input 
                            name="ruaInput" 
                            id="ruaInput" 
                            type="text" 
                            value={formData.rua}
                            onChange={(e) => handleInputChange('rua', e.target.value)}
                            className={errors.rua ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="Ex: Av. Paulista"
                        />
                        {errors.rua && (
                            <span className="error-text">{errors.rua}</span>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group form-field">
                            <label htmlFor="numeroInput">Número *</label>
                            <input 
                                name="numeroInput" 
                                id="numeroInput" 
                                type="text" 
                                value={formData.numero}
                                onChange={(e) => handleInputChange('numero', e.target.value)}
                                className={errors.numero ? 'input-error' : ''}
                                disabled={loading}
                                placeholder="1000"
                            />
                            {errors.numero && (
                                <span className="error-text">{errors.numero}</span>
                            )}
                        </div>

                        <div className="form-group form-field complement">
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
                            className={errors.bairro ? 'input-error' : ''}
                            disabled={loading}
                            placeholder="Ex: Bela Vista"
                        />
                        {errors.bairro && (
                            <span className="error-text">{errors.bairro}</span>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group form-field city">
                            <label htmlFor="cidadeInput">Cidade *</label>
                            <input 
                                name="cidadeInput" 
                                id="cidadeInput" 
                                type="text" 
                                value={formData.cidade}
                                onChange={(e) => handleInputChange('cidade', e.target.value)}
                                className={errors.cidade ? 'input-error' : ''}
                                disabled={loading}
                                placeholder="São Paulo"
                            />
                            {errors.cidade && (
                                <span className="error-text">{errors.cidade}</span>
                            )}
                        </div>

                        <div className="form-group form-field state">
                            <label htmlFor="estadoInput">Estado *</label>
                            <input 
                                name="estadoInput" 
                                id="estadoInput" 
                                type="text" 
                                value={formData.estado}
                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                className={errors.estado ? 'input-error' : ''}
                                disabled={loading}
                                placeholder="SP"
                                maxLength="2"
                            />
                            {errors.estado && (
                                <span className="error-text">{errors.estado}</span>
                            )}
                        </div>
                    </div>

                    <h3 className="section-title">🕐 Horários de Funcionamento</h3>
                    
                    {horarios.map((horario, index) => (
                        <div key={horario.diaSemana} className="horario-row">
                            <div className="horario-dia">
                                <strong>{diasSemana[index]}</strong>
                            </div>
                            
                            <div className="horario-inputs">
                                <label>
                                    <input 
                                        type="checkbox"
                                        checked={horario.fechado}
                                        onChange={(e) => handleHorarioChange(index, 'fechado', e.target.checked)}
                                        disabled={loading}
                                    />
                                    <span style={{ marginLeft: '5px' }}>Fechado</span>
                                </label>
                                
                                {!horario.fechado && (
                                    <>
                                        <div className="horario-field">
                                            <label>Abertura:</label>
                                            <input 
                                                type="time"
                                                value={horario.horaAbertura}
                                                onChange={(e) => handleHorarioChange(index, 'horaAbertura', e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        
                                        <div className="horario-field">
                                            <label>Fechamento:</label>
                                            <input 
                                                type="time"
                                                value={horario.horaFechamento}
                                                onChange={(e) => handleHorarioChange(index, 'horaFechamento', e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`btn-submit ${loading ? 'loading' : 'normal'}`}
                    >
                        {loading ? '⏳ Cadastrando...' : '🏢 Cadastrar Estabelecimento'}
                    </button>
                    
                    <Link to="/companyProfile">
                        <button type="button" disabled={loading}>
                            ⬅️ Voltar ao Perfil
                        </button>
                    </Link>
                </form>
            </main>
        </Layout>
    )
}
