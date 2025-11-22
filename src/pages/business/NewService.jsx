import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { servicosAPI, estabelecimentosAPI } from '../../services/apiService';
import { campoObrigatorio } from '../../utils/validators';

export default function NewService(){
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome: '',
        preco: '',
        descricao: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // verifica se usuário tem estabelecimento
    const [estabelecimentoId, setEstabelecimentoId] = useState(null);

    useEffect(() => {
        const loadEstabelecimento = async () => {
            if (!isAuthenticated || !user) return;
            if (user.tipo_usuario !== 'pj') return;

            const res = await estabelecimentosAPI.getByProfissional(user.id);
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                setEstabelecimentoId(res.data[0].id);
            }
        };

        loadEstabelecimento();
    }, [isAuthenticated, user]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validar = () => {
        const novosErros = {};
        if (!campoObrigatorio(formData.nome)) novosErros.nome = 'Nome é obrigatório';
        if (!campoObrigatorio(formData.preco) || isNaN(Number(formData.preco))) novosErros.preco = 'Preço válido é obrigatório';
        return novosErros;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setMessage('❌ Você precisa estar logado');
            return;
        }

        if (user.tipo_usuario !== 'pj') {
            setMessage('❌ Apenas Pessoa Jurídica pode cadastrar serviços');
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
                preco: Number(formData.preco),
                descricao: formData.descricao.trim(),
                estabelecimento_id: estabelecimentoId
            };

            const res = await servicosAPI.create(servicoDados);
            if (res.success) {
                setMessage('✅ Serviço criado com sucesso!');
                setFormData({ nome: '', preco: '', descricao: '' });
                setTimeout(() => navigate('/services'), 1200);
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
                <div className="company-profile-container">
                    <h2 className="form-title">➕ Novo Serviço</h2>

                    {!isAuthenticated && (
                        <div>
                            <p>Você precisa estar logado para cadastrar serviços.</p>
                            <Link to="/login"><button>🔑 Fazer Login</button></Link>
                        </div>
                    )}

                    {isAuthenticated && user?.tipo_usuario !== 'pj' && (
                        <div>
                            <p>Somente contas do tipo Pessoa Jurídica podem cadastrar serviços.</p>
                        </div>
                    )}

                    {isAuthenticated && user?.tipo_usuario === 'pj' && !estabelecimentoId && (
                        <div>
                            <p>Você precisa cadastrar um estabelecimento primeiro.</p>
                            <Link to="/createBusiness"><button>🏢 Cadastrar Estabelecimento</button></Link>
                        </div>
                    )}

                    {isAuthenticated && user?.tipo_usuario === 'pj' && estabelecimentoId && (
                        <form className="form-center" onSubmit={handleSubmit}>
                            {message && <div className="form-success-message">{message}</div>}

                            <div className="form-group">
                                <label>Nome do Serviço</label>
                                <input value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} disabled={loading} />
                                {errors.nome && <span className="form-error-message">{errors.nome}</span>}
                            </div>

                            <div className="form-group">
                                <label>Preço (R$)</label>
                                <input value={formData.preco} onChange={(e) => handleInputChange('preco', e.target.value)} disabled={loading} placeholder="0.00" />
                                {errors.preco && <span className="form-error-message">{errors.preco}</span>}
                            </div>

                            <div className="form-group">
                                <label>Descrição (opcional)</label>
                                <textarea value={formData.descricao} onChange={(e) => handleInputChange('descricao', e.target.value)} disabled={loading}></textarea>
                            </div>

                            <div className="service-edit-buttons">
                                <button type="submit" disabled={loading} className="btn-save">{loading ? '⏳ Salvando...' : '💾 Salvar Serviço'}</button>
                                <Link to="/services"><button type="button" disabled={loading}>⬅️ Voltar</button></Link>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </Layout>
    );
}
