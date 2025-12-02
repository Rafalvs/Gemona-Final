import React, { useState, useEffect } from 'react';
import { avaliacoesAPI, pedidosAPI } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './RatingForm.css';

// Helper para renderizar estrelas
function renderStars(nota) {
  const filled = '★'.repeat(Math.max(0, Math.min(5, Math.round(nota))));
  const empty = '☆'.repeat(5 - filled.length);
  return filled + empty;
}

const RatingForm = ({ servico, pedidoId = null, onAvaliacoesAtualizadas }) => {
  const { user, isAuthenticated } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [usuariosMap, setUsuariosMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [permitido, setPermitido] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);
  const [pedidoDoUsuario, setPedidoDoUsuario] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    // Carregar avaliações do serviço
    const load = async () => {
      if (!servico) return;
      const res = await avaliacoesAPI.getByServico(servico.id);
      if (res && res.success) {
        setAvaliacoes(res.data);
      } else {
        setAvaliacoes([]);
      }
    };
    load();
  }, [servico]);

  useEffect(() => {
    // Permitir avaliar somente se usuário for cliente e tiver contratado o serviço
    const checkPermissao = async () => {
      if (!isAuthenticated || !user || !servico) {
        setPermitido(false);
        return;
      }

      // Apenas clientes podem avaliar
      if (user.tipo_usuario !== 'cliente') {
        setPermitido(false);
        return;
      }

      try {
        // Buscar pedidos do cliente
        const resultado = await pedidosAPI.getByCliente(user.id);
        
        if (resultado.success && resultado.data) {
          // Filtrar pedidos ativos do serviço específico
          const pedidosAtivos = resultado.data.filter(
            p => p.ativo !== false && p.servicoId === servico.id
          );
          
          if (pedidosAtivos.length > 0) {
            // Cliente tem pedido ativo para este serviço
            setPedidoDoUsuario(pedidosAtivos[0]); // Usar o primeiro pedido
            
            // Verificar se já avaliou este pedido
            const avaliacaoExistente = avaliacoes.find(
              a => a.pedidoId === pedidosAtivos[0].pedidoId
            );
            
            if (avaliacaoExistente) {
              setJaAvaliou(true);
              setPermitido(false);
            } else {
              setJaAvaliou(false);
              setPermitido(true);
            }
          } else {
            setPermitido(false);
            setPedidoDoUsuario(null);
          }
        }
      } catch (error) {
        setPermitido(false);
      }
    };

    checkPermissao();
  }, [isAuthenticated, user, servico, pedidoId, avaliacoes]);

  const enviarAvaliacao = async () => {
    if (!isAuthenticated || !user) {
      setErro('Você precisa estar logado para avaliar.');
      return;
    }

    if (user.tipo_usuario !== 'cliente') {
      setErro('Apenas clientes podem avaliar serviços.');
      return;
    }

    if (!pedidoDoUsuario) {
      setErro('Você precisa ter contratado este serviço para avaliá-lo.');
      return;
    }

    const n = Number(nota);
    if (isNaN(n) || n < 1 || n > 5) {
      setErro('A nota deve ser entre 1 e 5');
      return;
    }

    // Validar comentário: se fornecido, deve ter pelo menos 10 caracteres
    const comentarioTrim = comentario.trim();
    if (comentarioTrim && comentarioTrim.length < 10) {
      setErro('O comentário deve ter no mínimo 10 caracteres');
      return;
    }

    if (comentarioTrim && comentarioTrim.length > 500) {
      setErro('O comentário deve ter no máximo 500 caracteres');
      return;
    }

    setLoading(true);
    setErro('');

    // Backend espera PascalCase para as propriedades
    const payload = {
      PedidoId: Number(pedidoDoUsuario.pedidoId),
      ClienteId: Number(user.id),
      Nota: Number(n), // Backend espera um número de 1-5 (enum NotaAvaliacao)
    };

    // Adicionar comentário se houver e for válido (10+ caracteres)
    if (comentarioTrim && comentarioTrim.length >= 10) {
      payload.Comentario = comentarioTrim;
    }

    try {
      const res = await avaliacoesAPI.create(payload);

      if (res && res.success) {
        alert('✅ Avaliação enviada com sucesso!');
        
        // Recarregar avaliações
        const updated = await avaliacoesAPI.getByServico(servico.id);
        if (updated && updated.success) {
          setAvaliacoes(updated.data);
          if (onAvaliacoesAtualizadas) onAvaliacoesAtualizadas(updated.data);
        }
        
        // Limpar formulário
        setNota(5);
        setComentario('');
        setJaAvaliou(true);
      } else {
        const msg = res && res.error ? res.error : 'Erro ao enviar avaliação.';
        setErro(msg);
      }
    } catch (err) {
      setErro(err && err.message ? `Erro: ${err.message}` : 'Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-form">
      <div className="rating-form-header">
        <h4 className="rating-form-title">Avaliações</h4>
        <div className="rating-form-summary">
          {avaliacoes.length > 0 ? (
            <>
              <strong>{(avaliacoes.reduce((s, r) => s + Number(r.nota), 0) / avaliacoes.length).toFixed(1)}</strong>
              {' '}• {avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'}
            </>
          ) : (
            <span className="rating-form-no-ratings">Sem avaliações ainda</span>
          )}
        </div>
      </div>

      {avaliacoes.length === 0 ? null : (
        <div className="ratings-list">
          {avaliacoes.map(a => (
            <div key={a.id} className="rating-item">
              <div className="rating-item-header">
                <div className="rating-item-stars">{renderStars(Number(a.nota))}</div>
                <div className="rating-item-author">
                  {usuariosMap[a.clienteId] ? usuariosMap[a.clienteId].nome : `Cliente ${a.clienteId}`}
                </div>
              </div>
              {a.comentario && (
                <div className="rating-item-comment">{a.comentario}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <hr className="rating-form-divider" />

      <div className={`rating-form-input-container ${permitido ? 'enabled' : ''}`}>
        <label className="rating-form-label">Sua avaliação</label>
        
        <div className="rating-form-field">
          <label className="rating-form-field-label">Nota:</label>
          <select value={nota} onChange={(e) => setNota(e.target.value)} disabled={!permitido || loading || jaAvaliou} className="rating-form-select">
            <option value={5}>⭐⭐⭐⭐⭐ (5 - Excelente)</option>
            <option value={4}>⭐⭐⭐⭐ (4 - Muito bom)</option>
            <option value={3}>⭐⭐⭐ (3 - Bom)</option>
            <option value={2}>⭐⭐ (2 - Ruim)</option>
            <option value={1}>⭐ (1 - Muito ruim)</option>
          </select>
        </div>

        <div className="rating-form-field">
          <label className="rating-form-field-label">
            Comentário (opcional, mín. 10 caracteres):
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={!permitido || loading || jaAvaliou}
            placeholder="Compartilhe sua experiência (mínimo 10 caracteres)..."
            rows={3}
            className="rating-form-textarea"
          />
          {comentario.trim() && comentario.trim().length < 10 && (
            <small className="rating-form-char-warning">
              ⚠️ Faltam {10 - comentario.trim().length} caracteres
            </small>
          )}
          {comentario.trim().length >= 10 && (
            <small className="rating-form-char-success">
              ✓ {comentario.trim().length}/500 caracteres
            </small>
          )}
        </div>

        {!isAuthenticated && (
          <p className="rating-form-message rating-form-error">Você precisa estar logado para avaliar.</p>
        )}

        {isAuthenticated && user && user.tipo_usuario !== 'cliente' && (
          <p className="rating-form-message rating-form-error">Apenas clientes podem avaliar serviços.</p>
        )}

        {isAuthenticated && user && user.tipo_usuario === 'cliente' && !permitido && !jaAvaliou && (
          <p className="rating-form-message rating-form-error">Você precisa ter contratado este serviço para poder avaliá-lo.</p>
        )}

        {jaAvaliou && (
          <p className="rating-form-message rating-form-success">✅ Você já avaliou este serviço.</p>
        )}

        {erro && <p className="rating-form-submit-error">{erro}</p>}

        <div className="rating-form-button-container">
          <button 
            onClick={enviarAvaliacao} 
            disabled={!permitido || loading || jaAvaliou} 
            className={`rating-form-submit ${(!permitido || loading || jaAvaliou) ? 'disabled' : 'enabled'}`}
          >
            {loading ? '⏳ Enviando...' : jaAvaliou ? '✅ Já Avaliado' : '📝 Enviar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingForm;
