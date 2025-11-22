// obrigado IAs eu jamais escreveria tudo isso na mao com o tempo que tenho

import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import '../styles/AdminCRUD.css';
import { // importacoes das APIs
    categoriasAPI,
    usuariosAPI,
    profissionaisAPI,
    estabelecimentosAPI,
    clientesAPI,
    servicosAPI,
    servicosMaisProcuradosAPI,
    pedidosAPI,
    enderecosAPI,
    avaliacoesAPI,
    checkAPIConnection
} from '../services/apiService';

// Componente FormField FORA do componente principal
const FormField = ({ label, field, type = 'text', required = false, value, onChange }) => (
    <div className="form-field">
        <label className="form-label">
            {label} {required && <span className="required">*</span>}
        </label>
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            className="form-input"
            required={required}
        />
    </div>
);

export default function AdminCRUD() {

    // Estados gerais
    const [apiConnected, setApiConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('categorias');

    // Estados para cada entidade
    const [categorias, setCategorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [estabelecimentos, setEstabelecimentos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [servicosMaisProcurados, setServicosMaisProcurados] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [enderecos, setEnderecos] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState([]);

    // Estados para edição
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Verificar conexão com a API ao carregar
    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        const connected = await checkAPIConnection();
        setApiConnected(connected);
        
        if (connected) {
            loadAllData();
            setMessage('✅ Conectado com JSON Server!');
        } else {
            setMessage('❌ JSON Server não está rodando. Execute: npm run api');
        }
    };

    // Carregar todos os dados
    const loadAllData = async () => {
        setLoading(true);
        try {
            const [
                categoriasResult,
                usuariosResult,
                profissionaisResult,
                estabelecimentosResult,
                clientesResult,
                servicosResult,
                servicosMaisResult,
                pedidosResult,
                enderecosResult,
                avaliacoesResult
            ] = await Promise.all([
                categoriasAPI.getAll(),
                usuariosAPI.getAll(),
                profissionaisAPI.getAll(),
                estabelecimentosAPI.getAll(),
                clientesAPI.getAll(),
                servicosAPI.getAll(),
                servicosMaisProcuradosAPI.getAll(),
                pedidosAPI.getAll(),
                enderecosAPI.getAll(),
                avaliacoesAPI.getAll()
            ]);

            if (categoriasResult.success) setCategorias(categoriasResult.data);
            if (usuariosResult.success) setUsuarios(usuariosResult.data);
            if (profissionaisResult.success) setProfissionais(profissionaisResult.data);
            if (estabelecimentosResult.success) setEstabelecimentos(estabelecimentosResult.data);
            if (clientesResult.success) setClientes(clientesResult.data);
            if (servicosResult.success) setServicos(servicosResult.data);
            if (servicosMaisResult.success) setServicosMaisProcurados(servicosMaisResult.data);
            if (pedidosResult.success) setPedidos(pedidosResult.data);
            if (enderecosResult.success) setEnderecos(enderecosResult.data);
            if (avaliacoesResult.success) setAvaliacoes(avaliacoesResult.data);

            setMessage('✅ Dados carregados com sucesso!');
        } catch (error) {
            setMessage(`❌ Erro ao carregar dados: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Função genérica para deletar item
    const deleteItem = async (api, id, entityName, setState) => {
        if (!confirm(`Deletar ${entityName} ${id}?`)) return;

        setLoading(true);
        try {
            const result = await api.delete(id);
            if (result.success) {
                setMessage(`✅ ${entityName} ${id} deletado!`);
                loadAllData();
            } else {
                setMessage(`❌ Erro ao deletar: ${result.error}`);
            }
        } catch (error) {
            setMessage(`❌ Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Função genérica para editar item
    const startEdit = (item, entityType) => {
        setEditingItem({ ...item, entityType });
        setEditFormData(item);
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setEditFormData({});
        setShowCreateForm(false);
    };

    const saveEdit = async () => {
        setLoading(true);
        try {
            let api, result;
            
            switch (editingItem.entityType) {
                case 'categoria':
                    api = categoriasAPI;
                    break;
                case 'usuario':
                    api = usuariosAPI;
                    break;
                case 'profissional':
                    api = profissionaisAPI;
                    break;
                case 'estabelecimento':
                    api = estabelecimentosAPI;
                    break;
                case 'cliente':
                    api = clientesAPI;
                    break;
                case 'servico':
                    api = servicosAPI;
                    break;
                case 'servicoMaisProcurado':
                    api = servicosMaisProcuradosAPI;
                    break;
                case 'pedido':
                    api = pedidosAPI;
                    break;
                case 'endereco':
                    api = enderecosAPI;
                    break;
                case 'avaliacao':
                    api = avaliacoesAPI;
                    break;
                default:
                    throw new Error('Tipo de entidade não reconhecido');
            }

            if (showCreateForm) {
                // Configurar valores padrão para usuários
                let dataToCreate = { ...editFormData };
                if (editingItem?.entityType === 'usuario') {
                    if (dataToCreate.ativo === undefined) {
                        dataToCreate.ativo = true; // Padrão: usuário ativo
                    }
                }
                
                result = await api.create(dataToCreate);
                setMessage(result.success ? '✅ Item criado!' : `❌ Erro: ${result.error}`);
            } else {
                const id = editFormData.id;
                result = await api.patch(id, editFormData);
                setMessage(result.success ? '✅ Item atualizado!' : `❌ Erro: ${result.error}`);
            }

            if (result.success) {
                cancelEdit();
                loadAllData();
            }
        } catch (error) {
            setMessage(`❌ Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Renderizar lista de itens
    const renderItemList = (items, entityType, fields) => (
        <div className="entity-section">
            <div className="entity-header">
                <h3 className="entity-title">{entityType}s ({items.length})</h3>
                <button
                    onClick={() => {
                        setEditingItem({ entityType });
                        setEditFormData({});
                        setShowCreateForm(true);
                    }}
                    className="create-btn"
                >
                    ➕ Criar {entityType}
                </button>
            </div>

            {items.length === 0 ? (
                <p className="no-items-message">Nenhum {entityType} encontrado.</p>
            ) : (
                <div className="items-grid">
                    {items.map(item => {
                        const id = item.id;
                        return (
                            <div key={id} className="item-card">
                                <div className="item-info">
                                    {fields.map(field => (
                                        <div key={field} className="item-field">
                                            <strong>{field}:</strong> {item[field] || 'N/A'}
                                        </div>
                                    ))}
                                </div>
                                <div className="item-actions">
                                    <button
                                        onClick={() => startEdit(item, entityType)}
                                        className="edit-btn"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => {
                                            let api;
                                            switch (entityType) {
                                                case 'categoria':
                                                    api = categoriasAPI;
                                                    break;
                                                case 'usuario':
                                                    api = usuariosAPI;
                                                    break;
                                                case 'profissional':
                                                    api = profissionaisAPI;
                                                    break;
                                                case 'estabelecimento':
                                                    api = estabelecimentosAPI;
                                                    break;
                                                case 'cliente':
                                                    api = clientesAPI;
                                                    break;
                                                case 'servico':
                                                    api = servicosAPI;
                                                    break;
                                                case 'servicoMaisProcurado':
                                                    api = servicosMaisProcuradosAPI;
                                                    break;
                                                case 'pedido':
                                                    api = pedidosAPI;
                                                    break;
                                                case 'endereco':
                                                    api = enderecosAPI;
                                                    break;
                                                case 'avaliacao':
                                                    api = avaliacoesAPI;
                                                    break;
                                            }
                                            deleteItem(api, id, entityType, () => {});
                                        }}
                                        className="delete-btn"
                                    >
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // Renderizar conteúdo da aba ativa
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'categorias':
                return renderItemList(categorias, 'categoria', ['id', 'nome', 'descricao']);
            case 'usuarios':
                return renderItemList(usuarios, 'usuario', ['id', 'nome', 'email', 'cpf', 'tipo_usuario', 'ativo']);
            case 'profissionais':
                return renderItemList(profissionais, 'profissional', ['id', 'nome', 'email', 'cpf']);
            case 'estabelecimentos':
                return renderItemList(estabelecimentos, 'estabelecimento', ['id', 'nome', 'cnpj']);
            case 'clientes':
                return renderItemList(clientes, 'cliente', ['id', 'nome', 'email', 'telefone']);
            case 'servicos':
                return renderItemList(servicos, 'servico', ['id', 'nome', 'preco']);
            case 'servicosMaisProcurados':
                return renderItemList(servicosMaisProcurados, 'servicoMaisProcurado', ['nome', 'descricao']);
            case 'pedidos':
                return renderItemList(pedidos, 'pedido', ['id', 'cliente_id', 'servico_id', 'status']);
            case 'enderecos':
                return renderItemList(enderecos, 'endereco', ['id', 'rua', 'cidade', 'cep']);
            case 'avaliacoes':
                return renderItemList(avaliacoes, 'avaliacao', ['id', 'pedido_id', 'nota']);
            default:
                return <div>Selecione uma aba</div>;
        }
    };

    return (
        <Layout>
            <div className="admin-crud-container">
                <h1 className="admin-crud-title">🔧 Administração CRUD - JSON Server</h1>
                
                {/* Status da API */}
                <div className={`api-status ${apiConnected ? 'connected' : 'disconnected'}`}>
                    <h3>📡 Status da API</h3>
                    <p>{message}</p>
                    {!apiConnected && (
                        <div className="api-instructions">
                            <p><strong>Para iniciar o JSON Server:</strong></p>
                            <code className="api-code">
                                npm install<br/>
                                npm run api
                            </code>
                        </div>
                    )}
                    <button 
                        onClick={checkConnection}
                        className="api-refresh-btn"
                    >
                        🔄 Verificar Conexão
                    </button>
                </div>

                {apiConnected && (
                    <>
                        {/* Abas de navegação */}
                        <div className="tabs-navigation">
                            {[
                                { key: 'categorias', label: '📂 Categorias' },
                                { key: 'usuarios', label: '👤 Usuários' },
                                { key: 'profissionais', label: '👨‍💼 Profissionais' },
                                { key: 'estabelecimentos', label: '🏢 Estabelecimentos' },
                                { key: 'clientes', label: '👥 Clientes' },
                                { key: 'servicos', label: '🛎️ Serviços' },
                                { key: 'servicosMaisProcurados', label: '⭐ Mais Procurados' },
                                { key: 'pedidos', label: '📋 Pedidos' },
                                { key: 'enderecos', label: '📍 Endereços' },
                                { key: 'avaliacoes', label: '⭐ Avaliações' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Conteúdo da aba ativa */}
                        {loading ? (
                            <div className="loading-container">
                                <p className="loading-text">⏳ Carregando...</p>
                            </div>
                        ) : (
                            renderActiveTab()
                        )}

                        {/* Modal de edição/criação */}
                        {(editingItem || showCreateForm) && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h3 className="modal-title">
                                        {showCreateForm ? '➕ Criar' : '✏️ Editar'} {editingItem?.entityType}
                                    </h3>
                                    
                                    {/* Campos do formulário baseados no tipo de entidade */}
                                    {editingItem?.entityType === 'categoria' && (
                                        <>
                                            <FormField 
                                                label="Nome" 
                                                field="nome" 
                                                required 
                                                value={editFormData.nome}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                            />
                                            <FormField 
                                                label="Descrição" 
                                                field="descricao" 
                                                value={editFormData.descricao}
                                                onChange={(e) => handleInputChange('descricao', e.target.value)}
                                            />
                                            <FormField 
                                                label="Ícone" 
                                                field="icone" 
                                                value={editFormData.icone}
                                                onChange={(e) => handleInputChange('icone', e.target.value)}
                                            />
                                        </>
                                    )}
                                    
                                    {editingItem?.entityType === 'usuario' && (
                                        <>
                                            <FormField 
                                                label="Nome" 
                                                field="nome" 
                                                required 
                                                value={editFormData.nome}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                            />
                                            <FormField 
                                                label="Email" 
                                                field="email" 
                                                type="email" 
                                                required 
                                                value={editFormData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                            <FormField 
                                                label="CPF" 
                                                field="cpf" 
                                                value={editFormData.cpf}
                                                onChange={(e) => handleInputChange('cpf', e.target.value)}
                                            />
                                            <FormField 
                                                label="CEP" 
                                                field="cep" 
                                                value={editFormData.cep}
                                                onChange={(e) => handleInputChange('cep', e.target.value)}
                                            />
                                            <div>
                                                <label>Tipo de Usuário:</label>
                                                <select 
                                                    value={editFormData.tipo_usuario || ''}
                                                    onChange={(e) => handleInputChange('tipo_usuario', e.target.value)}
                                                >
                                                    <option value="">Selecione...</option>
                                                    <option value="pf">Pessoa Física</option>
                                                    <option value="pj">Pessoa Jurídica</option>
                                                </select>
                                            </div>
                                            <FormField 
                                                label="Senha" 
                                                field="senha_hash" 
                                                type="password"
                                                value={editFormData.senha_hash}
                                                onChange={(e) => handleInputChange('senha_hash', e.target.value)}
                                            />
                                            <div>
                                                <label>Data de Cadastro:</label>
                                                <input 
                                                    type="text" 
                                                    value={editFormData.data_cadastro ? new Date(editFormData.data_cadastro).toLocaleString() : ''} 
                                                    readOnly 
                                                    className="admin-form-disabled"
                                                />
                                            </div>
                                            <div>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={editFormData.ativo !== false}
                                                        onChange={(e) => handleInputChange('ativo', e.target.checked)}
                                                    />
                                                    Usuário Ativo
                                                </label>
                                            </div>
                                        </>
                                    )}

                                    {editingItem?.entityType === 'profissional' && (
                                        <>
                                            <FormField 
                                                label="Nome" 
                                                field="nome" 
                                                required 
                                                value={editFormData.nome}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                            />
                                            <FormField 
                                                label="Email" 
                                                field="email" 
                                                type="email" 
                                                required 
                                                value={editFormData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                            <FormField 
                                                label="CPF" 
                                                field="cpf" 
                                                required 
                                                value={editFormData.cpf}
                                                onChange={(e) => handleInputChange('cpf', e.target.value)}
                                            />
                                            <FormField 
                                                label="Data de Nascimento" 
                                                field="data_nascimento" 
                                                type="date" 
                                                value={editFormData.data_nascimento}
                                                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                                            />
                                        </>
                                    )}

                                    {editingItem?.entityType === 'cliente' && (
                                        <>
                                            <FormField 
                                                label="Nome" 
                                                field="nome" 
                                                required 
                                                value={editFormData.nome}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                            />
                                            <FormField 
                                                label="Email" 
                                                field="email" 
                                                type="email" 
                                                required 
                                                value={editFormData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                            />
                                            <FormField 
                                                label="Telefone" 
                                                field="telefone" 
                                                value={editFormData.telefone}
                                                onChange={(e) => handleInputChange('telefone', e.target.value)}
                                            />
                                            <FormField 
                                                label="CPF" 
                                                field="cpf" 
                                                required 
                                                value={editFormData.cpf}
                                                onChange={(e) => handleInputChange('cpf', e.target.value)}
                                            />
                                            <FormField 
                                                label="Data de Nascimento" 
                                                field="data_nascimento" 
                                                type="date" 
                                                value={editFormData.data_nascimento}
                                                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                                            />
                                        </>
                                    )}

                                    {editingItem?.entityType === 'estabelecimento' && (
                                        <>
                                            <FormField 
                                                label="Nome" 
                                                field="nome" 
                                                required 
                                                value={editFormData.nome}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                            />
                                            <FormField 
                                                label="CNPJ" 
                                                field="cnpj" 
                                                required 
                                                value={editFormData.cnpj}
                                                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                                            />
                                            <FormField 
                                                label="ID do Profissional" 
                                                field="profissional_id" 
                                                type="number" 
                                                value={editFormData.profissional_id}
                                                onChange={(e) => handleInputChange('profissional_id', e.target.value)}
                                            />
                                            <FormField 
                                                label="ID do Endereço" 
                                                field="endereco_id" 
                                                type="number" 
                                                value={editFormData.endereco_id}
                                                onChange={(e) => handleInputChange('endereco_id', e.target.value)}
                                            />
                                        </>
                                    )}

                                    {editingItem?.entityType === 'servico' && (
                                        <>
                                            <FormField 
                                                label="Nome" 
                                                field="nome" 
                                                required 
                                                value={editFormData.nome}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                            />
                                            <FormField 
                                                label="Preço" 
                                                field="preco" 
                                                type="number" 
                                                step="0.01" 
                                                required 
                                                value={editFormData.preco}
                                                onChange={(e) => handleInputChange('preco', e.target.value)}
                                            />
                                            <FormField 
                                                label="ID da Sub-categoria" 
                                                field="sub_categoria_id" 
                                                type="number" 
                                                value={editFormData.sub_categoria_id}
                                                onChange={(e) => handleInputChange('sub_categoria_id', e.target.value)}
                                            />
                                            <FormField 
                                                label="ID do Estabelecimento" 
                                                field="estabelecimento_id" 
                                                type="number" 
                                                value={editFormData.estabelecimento_id}
                                                onChange={(e) => handleInputChange('estabelecimento_id', e.target.value)}
                                            />
                                        </>
                                    )}

                                    {editingItem?.entityType === 'servicoMaisProcurado' && (
                                        <>
                                            <FormField 
                                                label="Nome" 
                                                field="nome" 
                                                required 
                                                value={editFormData.nome}
                                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                            />
                                            <FormField 
                                                label="Descrição" 
                                                field="descricao" 
                                                value={editFormData.descricao}
                                                onChange={(e) => handleInputChange('descricao', e.target.value)}
                                            />
                                            <FormField 
                                                label="Ícone" 
                                                field="icone" 
                                                value={editFormData.icone}
                                                onChange={(e) => handleInputChange('icone', e.target.value)}
                                            />
                                        </>
                                    )}

                                    {editingItem?.entityType === 'endereco' && (
                                        <>
                                            <FormField 
                                                label="Rua" 
                                                field="rua" 
                                                required 
                                                value={editFormData.rua}
                                                onChange={(e) => handleInputChange('rua', e.target.value)}
                                            />
                                            <FormField 
                                                label="Número" 
                                                field="numero" 
                                                required 
                                                value={editFormData.numero}
                                                onChange={(e) => handleInputChange('numero', e.target.value)}
                                            />
                                            <FormField 
                                                label="Bairro" 
                                                field="bairro" 
                                                required 
                                                value={editFormData.bairro}
                                                onChange={(e) => handleInputChange('bairro', e.target.value)}
                                            />
                                            <FormField 
                                                label="Cidade" 
                                                field="cidade" 
                                                required 
                                                value={editFormData.cidade}
                                                onChange={(e) => handleInputChange('cidade', e.target.value)}
                                            />
                                            <FormField 
                                                label="Estado" 
                                                field="estado" 
                                                required 
                                                value={editFormData.estado}
                                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                            />
                                            <FormField 
                                                label="CEP" 
                                                field="cep" 
                                                required 
                                                value={editFormData.cep}
                                                onChange={(e) => handleInputChange('cep', e.target.value)}
                                            />
                                            <FormField 
                                                label="Complemento" 
                                                field="complemento" 
                                                value={editFormData.complemento}
                                                onChange={(e) => handleInputChange('complemento', e.target.value)}
                                            />
                                        </>
                                    )}

                                    <div className="form-actions">
                                        <button
                                            onClick={saveEdit}
                                            disabled={loading}
                                            className="save-btn"
                                        >
                                            💾 Salvar
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="cancel-btn"
                                        >
                                            ❌ Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}