import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { servicosAPI, estabelecimentosAPI, subcategoriasAPI } from '../../services/apiService';

export default function NewService(){
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        subcategoria_id: ''
    });
    const [subcategorias, setSubcategorias] = useState([]);
    const [imagemPreview, setImagemPreview] = useState(null);
    const [imagemBase64, setImagemBase64] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // verifica se usuário tem estabelecimento
    const [estabelecimentoId, setEstabelecimentoId] = useState(null);
    const [checkingEstabelecimento, setCheckingEstabelecimento] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!isAuthenticated || !user) {
                setCheckingEstabelecimento(false);
                return;
            }
            if (user.tipo_usuario !== 'profissional') {
                setCheckingEstabelecimento(false);
                return;
            }

            setCheckingEstabelecimento(true);

            // Carregar estabelecimento
            const resEst = await estabelecimentosAPI.getByProfissional(user.id);
            if (resEst.success && Array.isArray(resEst.data) && resEst.data.length > 0) {
                setEstabelecimentoId(resEst.data[0].estabelecimentoId);
            }

            // Carregar todas subcategorias
            const resSub = await subcategoriasAPI.getAll();
            if (resSub.success) {
                setSubcategorias(resSub.data);
            }

            setCheckingEstabelecimento(false);
        };

        loadData();
    }, [isAuthenticated, user]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            setMessage('❌ Por favor, selecione apenas arquivos de imagem');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage('❌ A imagem deve ter no máximo 5MB');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Criar preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagemPreview(reader.result);
            // Extrair apenas a parte Base64 (remover o prefixo data:image/...)
            const base64String = reader.result.split(',')[1];
            setImagemBase64({
                fileName: file.name,
                contentType: file.type,
                base64Data: base64String
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagemPreview(null);
        setImagemBase64(null);
        const inputFile = document.getElementById('imagemServicoInput');
        if (inputFile) inputFile.value = '';
    };

    const validar = () => {
        const novosErros = {};
        if (!formData.nome?.trim()) novosErros.nome = 'Nome é obrigatório';
        if (!formData.descricao?.trim()) novosErros.descricao = 'Descrição é obrigatória';
        if (!formData.preco?.trim() || isNaN(Number(formData.preco))) novosErros.preco = 'Preço válido é obrigatório';
        if (!formData.subcategoria_id) novosErros.subcategoria_id = 'Selecione uma subcategoria';
        return novosErros;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setMessage('❌ Você precisa estar logado');
            return;
        }

        if (user.tipo_usuario !== 'profissional') {
            setMessage('❌ Apenas profissionais podem cadastrar serviços');
            return;
        }

        if (!estabelecimentoId) {
            setMessage('❌ Você precisa cadastrar um estabelecimento antes de criar serviços');
            return;
        }

        const novosErros = validar();
        setErrors(novosErros);
        if (Object.keys(novosErros).length > 0) return;

        setLoading(true);
        setMessage('');

        try {
            const servicoDados = {
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim(),
                subCategoriaId: parseInt(formData.subcategoria_id),
                preco: parseFloat(formData.preco),
                imagemServico: imagemBase64 || null,
                estabelecimentoId: estabelecimentoId
            };

            const res = await servicosAPI.create(servicoDados);
            if (res.success) {
                setMessage('✅ Serviço criado com sucesso!');
                setFormData({ nome: '', descricao: '', preco: '', subcategoria_id: '' });
                setImagemPreview(null);
                setImagemBase64(null);
                setTimeout(() => navigate('/companyProfile'), 1200);
            } else {
                setMessage(`❌ Erro ao criar serviço: ${res.error}`);
            }
        } catch (error) {
            setMessage(`❌ Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <main>
                <div style={{ maxWidth: 700, margin: '0 auto', padding: 20, color: '#fff' }}>
                    <h2 style={{ textAlign: 'center' }}>➕ Novo Serviço</h2>

                    {!isAuthenticated && (
                        <div>
                            <p>Você precisa estar logado para cadastrar serviços.</p>
                            <Link to="/login"><button>🔑 Fazer Login</button></Link>
                        </div>
                    )}

                    {isAuthenticated && user?.tipo_usuario !== 'profissional' && (
                        <div>
                            <p>Somente profissionais podem cadastrar serviços.</p>
                        </div>
                    )}

                    {checkingEstabelecimento && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p>⏳ Verificando estabelecimento...</p>
                        </div>
                    )}

                    {!checkingEstabelecimento && isAuthenticated && user?.tipo_usuario === 'profissional' && !estabelecimentoId && (
                        <div>
                            <p>Você precisa cadastrar um estabelecimento primeiro.</p>
                            <Link to="/newCompany"><button>🏢 Cadastrar Estabelecimento</button></Link>
                        </div>
                    )}

                    {!checkingEstabelecimento && isAuthenticated && user?.tipo_usuario === 'profissional' && estabelecimentoId && (
                        <form className="form-center" onSubmit={handleSubmit}>
                            {message && <div style={{ marginBottom: 12 }}>{message}</div>}

                            <div className="form-group">
                                <label>Nome do Serviço</label>
                                <input value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} disabled={loading} placeholder="Ex: Corte de Cabelo" />
                                {errors.nome && <span style={{ color: '#dc3545' }}>{errors.nome}</span>}
                            </div>

                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} disabled={loading} placeholder="Descreva o serviço..." rows="4" style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                                {errors.descricao && <span style={{ color: '#dc3545' }}>{errors.descricao}</span>}
                            </div>

                            <div className="form-group">
                                <label>Imagem do Serviço (Opcional)</label>
                                {imagemPreview && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <img 
                                            src={imagemPreview} 
                                            alt="Preview"
                                            style={{
                                                maxWidth: '300px',
                                                width: '100%',
                                                height: 'auto',
                                                borderRadius: '8px',
                                                border: '2px solid #28a745'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            disabled={loading}
                                            style={{
                                                marginTop: '10px',
                                                padding: '8px 16px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            🗑️ Remover Imagem
                                        </button>
                                    </div>
                                )}
                                <input 
                                    type="file"
                                    id="imagemServicoInput"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={loading}
                                    style={{ marginBottom: '5px' }}
                                />
                                <small style={{ color: '#999', fontSize: '12px', display: 'block' }}>
                                    Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Subcategoria</label>
                                <select 
                                    value={formData.subcategoria_id} 
                                    onChange={(e) => handleInputChange('subcategoria_id', e.target.value)} 
                                    disabled={loading}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                                >
                                    <option value="">Selecione uma subcategoria...</option>
                                    {subcategorias.map(sub => (
                                        <option key={sub.subCategoriaId} value={sub.subCategoriaId}>{sub.nome}</option>
                                    ))}
                                </select>
                                {errors.subcategoria_id && <span style={{ color: '#dc3545' }}>{errors.subcategoria_id}</span>}
                            </div>

                            <div className="form-group">
                                <label>Preço (R$)</label>
                                <input value={formData.preco} onChange={(e) => handleInputChange('preco', e.target.value)} disabled={loading} placeholder="0.00" />
                                {errors.preco && <span style={{ color: '#dc3545' }}>{errors.preco}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                                <button type="submit" disabled={loading} style={{ backgroundColor: '#28a745' }}>{loading ? '⏳ Salvando...' : '💾 Salvar Serviço'}</button>
                                <Link to="/companyProfile"><button type="button" disabled={loading}>⬅️ Voltar</button></Link>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </Layout>
    );
}
