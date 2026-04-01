'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/utils';
import type { Gratificacao, Profile } from '@/types';

export default function HistoricoPage() {
  const sb = createClient();
  const [dados, setDados]         = useState<Gratificacao[]>([]);
  const [refs, setRefs]           = useState<string[]>([]);
  const [filtroRef, setFiltroRef] = useState('');
  const [loading, setLoading]     = useState(true);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [confirmando, setConfirmando] = useState<{ tipo: 'lote' | 'individual'; ref?: string; id?: string } | null>(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    carregarPerfil();
    carregarRefs();
  }, []);

  useEffect(() => { carregar(); }, [filtroRef]);

  async function carregarPerfil() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data as Profile);
  }

  async function carregarRefs() {
    const { data } = await sb
      .from('gratificacoes')
      .select('ref_mes_ano')
      .order('ref_mes_ano', { ascending: false });
    const unicos = [...new Set((data ?? []).map((d: any) => d.ref_mes_ano))];
    setRefs(unicos);
  }

  async function carregar() {
    setLoading(true);
    let q = sb
      .from('gratificacoes')
      .select('*, funcionarios(nome), profiles(nome)')
      .order('created_at', { ascending: false });
    if (filtroRef) q = q.eq('ref_mes_ano', filtroRef);
    const { data } = await q;
    setDados((data ?? []) as Gratificacao[]);
    setLoading(false);
  }

  async function regerarPDF(ref: string) {
    const { gerarPDFGratificacoes } = await import('@/lib/pdf');
    const lote = dados.filter(g => g.ref_mes_ano === ref);
    const recibos = lote.map(g => ({
      ref: g.ref_mes_ano,
      funcionarioNome: (g.funcionarios as any)?.nome ?? '',
      valor: Number(g.valor),
      discriminacao: g.discriminacao ?? undefined,
      observacao: g.observacao ?? undefined,
      dataExtenso: `Salvador, ${new Date(g.data_emissao + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).replace(',', '')}`,
    }));
    await gerarPDFGratificacoes(recibos);
  }

  async function confirmarDelete() {
    if (!confirmando) return;
    setDeletando(true);
    if (confirmando.tipo === 'lote' && confirmando.ref) {
      await sb.from('gratificacoes').delete().eq('ref_mes_ano', confirmando.ref);
    } else if (confirmando.tipo === 'individual' && confirmando.id) {
      await sb.from('gratificacoes').delete().eq('id', confirmando.id);
    }
    setConfirmando(null);
    setDeletando(false);
    await carregarRefs();
    await carregar();
  }

  const podeExcluir = profile?.role === 'admin' || profile?.permissoes?.excluir_historico === true;

  const grupos: Record<string, Gratificacao[]> = {};
  dados.forEach(g => {
    if (!grupos[g.ref_mes_ano]) grupos[g.ref_mes_ano] = [];
    grupos[g.ref_mes_ano].push(g);
  });

  return (
    <div className="p-8 max-w-4xl">
      {/* Modal de confirmação */}
      {confirmando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-2xl mb-3">🗑️</div>
            <h3 className="font-display font-bold text-gray-900 text-lg mb-2">
              {confirmando.tipo === 'lote' ? `Excluir lote ${confirmando.ref}?` : 'Excluir este registro?'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {confirmando.tipo === 'lote'
                ? `Todos os recibos do período ${confirmando.ref} serão excluídos permanentemente.`
                : 'Este registro será excluído permanentemente. Esta ação não pode ser desfeita.'}
            </p>
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setConfirmando(null)}
                disabled={deletando}
              >
                Cancelar
              </button>
              <button
                className="btn-danger flex-1"
                onClick={confirmarDelete}
                disabled={deletando}
              >
                {deletando ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Histórico</h1>
          <p className="text-gray-500 text-sm mt-1">Gratificações emitidas por período</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-semibold">Filtrar por período:</label>
          <select
            className="input w-40"
            value={filtroRef}
            onChange={e => setFiltroRef(e.target.value)}
          >
            <option value="">Todos</option>
            {refs.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Carregando…</div>
      ) : Object.keys(grupos).length === 0 ? (
        <div className="card p-8 text-center text-gray-400 text-sm">
          Nenhuma gratificação encontrada.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grupos).map(([ref, grats]) => {
            const total = grats.reduce((s, g) => s + Number(g.valor), 0);
            return (
              <div key={ref} className="card">
                {/* Cabeçalho do lote */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-50 rounded-t-xl flex-wrap gap-3">
                  <div>
                    <span className="font-display font-bold text-lg text-gray-900">Ref {ref}</span>
                    <span className="text-xs text-gray-500 ml-3">
                      {grats.length} recibo{grats.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total do período</p>
                      <p className="font-bold text-forest-700">{formatarMoeda(total)}</p>
                    </div>
                    <button className="btn-secondary text-xs" onClick={() => regerarPDF(ref)}>
                      ⬇ Baixar PDF
                    </button>
                    {podeExcluir && (
                      <button
                        className="btn-danger text-xs"
                        onClick={() => setConfirmando({ tipo: 'lote', ref })}
                      >
                        🗑 Excluir lote
                      </button>
                    )}
                  </div>
                </div>

                {/* Linhas individuais */}
                <div className="divide-y divide-cream-100">
                  {grats.map(g => (
                    <div key={g.id} className="flex items-center justify-between px-6 py-3.5 group">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-forest-100 rounded-full flex items-center justify-center
                                        text-forest-700 font-bold text-xs flex-shrink-0">
                          {((g.funcionarios as any)?.nome ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {(g.funcionarios as any)?.nome ?? '—'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(g.data_emissao + 'T12:00:00').toLocaleDateString('pt-BR')}
                            {g.discriminacao && ' · com discriminação'}
                            {g.observacao    && ' · com observação'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">{formatarMoeda(Number(g.valor))}</p>
                          <p className="text-xs text-gray-400 italic truncate max-w-[160px]">{g.valor_extenso}</p>
                        </div>
                        {podeExcluir && (
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400
                                       hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 text-xs"
                            onClick={() => setConfirmando({ tipo: 'individual', id: g.id })}
                            title="Excluir este registro"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
