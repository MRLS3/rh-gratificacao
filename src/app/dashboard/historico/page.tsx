'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { formatarMoeda } from '@/lib/utils';
import type { Gratificacao } from '@/types';

export default function HistoricoPage() {
  const sb = createClient();
  const [dados, setDados]     = useState<Gratificacao[]>([]);
  const [refs, setRefs]       = useState<string[]>([]);
  const [filtroRef, setFiltroRef] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarRefs();
  }, []);

  useEffect(() => {
    carregar();
  }, [filtroRef]);

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

  async function regenarPDF(ref: string) {
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
      }).replace(',','')}`,
    }));
    await gerarPDFGratificacoes(recibos);
  }

  // Agrupa por ref
  const grupos: Record<string, Gratificacao[]> = {};
  dados.forEach(g => {
    if (!grupos[g.ref_mes_ano]) grupos[g.ref_mes_ano] = [];
    grupos[g.ref_mes_ano].push(g);
  });

  return (
    <div className="p-8 max-w-4xl">
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-50 rounded-t-xl">
                  <div>
                    <span className="font-display font-bold text-lg text-gray-900">Ref {ref}</span>
                    <span className="text-xs text-gray-500 ml-3">{grats.length} recibo{grats.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total do período</p>
                      <p className="font-bold text-forest-700">{formatarMoeda(total)}</p>
                    </div>
                    <button
                      className="btn-secondary text-xs"
                      onClick={() => regenarPDF(ref)}
                    >
                      ⬇ Baixar PDF
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-cream-100">
                  {grats.map(g => (
                    <div key={g.id} className="flex items-center justify-between px-6 py-3.5">
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
                            Emitido em {new Date(g.data_emissao + 'T12:00:00').toLocaleDateString('pt-BR')}
                            {g.discriminacao && ' · com discriminação'}
                            {g.observacao    && ' · com observação'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">{formatarMoeda(Number(g.valor))}</p>
                        <p className="text-xs text-gray-400 italic truncate max-w-[180px]">{g.valor_extenso}</p>
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
