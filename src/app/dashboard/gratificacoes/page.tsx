'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { valorPorExtenso, parseMoeda, formatarDataExtenso, formatarDataISO, maskData } from '@/lib/utils';
import type { Funcionario } from '@/types';

interface LinhaForm {
  id: string;
  funcionarioId: string;
  valorRaw: string;
  discriminar: boolean;
  discriminacao: string;
  usarObs: boolean;
  observacao: string;
}

function newLinha(): LinhaForm {
  return {
    id: Math.random().toString(36).slice(2),
    funcionarioId: '',
    valorRaw: '',
    discriminar: false,
    discriminacao: '',
    usarObs: false,
    observacao: '',
  };
}

export default function GratificacoesPage() {
  const sb = createClient();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [ref, setRef]                   = useState('');
  const [refLocked, setRefLocked]       = useState(false);
  const [dataRaw, setDataRaw]           = useState('');
  const [linhas, setLinhas]             = useState<LinhaForm[]>([newLinha()]);
  const [salvando, setSalvando]         = useState(false);
  const [sucesso, setSucesso]           = useState('');
  const [erro, setErro]                 = useState('');

  useEffect(() => {
    sb.from('funcionarios_bravo').select('*').eq('ativo', true).order('nome_completo')
      .then(({ data }) => setFuncionarios(data ?? []));
    const hoje = new Date();
    const dd   = String(hoje.getDate()).padStart(2, '0');
    const mm   = String(hoje.getMonth() + 1).padStart(2, '0');
    const aaaa = String(hoje.getFullYear());
    setDataRaw(dd + mm + aaaa);
    setRef(`${mm}/${aaaa}`);
  }, []);

  function setLinha(id: string, patch: Partial<LinhaForm>) {
    setLinhas(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  function adicionarLinha() {
    setLinhas(ls => [...ls, newLinha()]);
  }

  function removerLinha(id: string) {
    setLinhas(ls => ls.filter(l => l.id !== id));
  }

  function handleRefBlur() {
    if (ref.trim()) setRefLocked(true);
  }

  function handleValorInput(id: string, raw: string) {
    const nums = raw.replace(/\D/g, '');
    if (!nums) { setLinha(id, { valorRaw: '' }); return; }
    const cents = parseInt(nums);
    const formatted = (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    setLinha(id, { valorRaw: formatted });
  }

  const dataExtenso = formatarDataExtenso(dataRaw, 'Salvador');
  const dataISO     = formatarDataISO(dataRaw);

  async function gerarPDF(recibos: any[]) {
    const { gerarPDFGratificacoes } = await import('@/lib/pdf');
    await gerarPDFGratificacoes(recibos);
  }

  async function handleGerar() {
    setErro(''); setSucesso('');
    if (!ref.trim()) { setErro('Preencha o campo Ref (MM/AAAA).'); return; }
    if (!dataISO)    { setErro('Data invalida.'); return; }

    const linhasValidas = linhas.filter(l => l.funcionarioId && l.valorRaw);
    if (linhasValidas.length === 0) { setErro('Adicione pelo menos um funcionario com valor.'); return; }

    setSalvando(true);

    const { data: { user } } = await sb.auth.getUser();

    const inserts = linhasValidas.map(l => ({
      ref_mes_ano:    ref.trim(),
      funcionario_id: l.funcionarioId,
      valor:          parseMoeda(l.valorRaw),
      valor_extenso:  valorPorExtenso(parseMoeda(l.valorRaw)),
      discriminacao:  l.discriminar ? l.discriminacao : null,
      observacao:     l.usarObs ? l.observacao : null,
      data_emissao:   dataISO,
      cidade:         'Salvador',
      emitido_por:    user?.id ?? null,
      pdf_gerado:     true,
    }));

    const { error } = await sb.from('gratificacoes').insert(inserts);
    if (error) {
      setErro('Erro ao salvar: ' + error.message);
      setSalvando(false);
      return;
    }

    const recibos = linhasValidas.map(l => {
      const func = funcionarios.find(f => f.id === l.funcionarioId);
      return {
        ref: ref.trim(),
        funcionarioNome: func?.nome_completo ?? '',
        valor: parseMoeda(l.valorRaw),
        discriminacao: l.discriminar ? l.discriminacao : undefined,
        observacao: l.usarObs ? l.observacao : undefined,
        dataExtenso,
      };
    });

    await gerarPDF(recibos);

    setSucesso(`${linhasValidas.length} gratificacao(oes) gerada(s) com sucesso!`);
    setSalvando(false);
    setLinhas([newLinha()]);
  }

  const maskRef = (v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length <= 2) return d;
    return d.substring(0, 2) + '/' + d.substring(2, 6);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Emitir Gratificacoes</h1>
        <p className="text-gray-500 text-sm mt-1">Preencha e gere os recibos do mes</p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-forest-700 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
          Referencia do lote
        </h2>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="label">Ref (MM/AAAA)</label>
            <div className="flex items-center gap-2">
              <input
                className="input w-32"
                placeholder="04/2026"
                value={ref}
                disabled={refLocked}
                onChange={e => setRef(maskRef(e.target.value))}
                onBlur={handleRefBlur}
                maxLength={7}
              />
              {refLocked && (
                <button onClick={() => setRefLocked(false)} className="text-xs text-forest-600 hover:underline">
                  Alterar
                </button>
              )}
            </div>
            {refLocked && (
              <p className="text-xs text-forest-600 mt-1 font-medium">Ref fixada para o lote</p>
            )}
          </div>
          <div>
            <label className="label">Data de emissao (DDMMAAAA)</label>
            <input
              className="input w-40"
              placeholder="24032026"
              value={maskData(dataRaw)}
              onChange={e => setDataRaw(e.target.value.replace(/\D/g, '').substring(0, 8))}
              maxLength={10}
            />
            {dataExtenso && <p className="text-xs text-gray-500 mt-1">{dataExtenso}</p>}
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-forest-700 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
          Funcionarios e valores
        </h2>
        <div className="space-y-4">
          {linhas.map((linha, idx) => (
            <LinhaFuncionario
              key={linha.id}
              linha={linha}
              idx={idx}
              funcionarios={funcionarios}
              onChange={(patch) => setLinha(linha.id, patch)}
              onRemove={() => removerLinha(linha.id)}
              onValorInput={(raw) => handleValorInput(linha.id, raw)}
              podRemover={linhas.length > 1}
            />
          ))}
        </div>
        <button className="btn-secondary mt-4 text-sm" onClick={adicionarLinha}>
          + Adicionar funcionario
        </button>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm mb-4">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl px-5 py-3 text-forest-700 text-sm mb-4">
          {sucesso}
        </div>
      )}

      <button className="btn-primary text-base px-8 py-3" onClick={handleGerar} disabled={salvando}>
        {salvando ? 'Gerando...' : `Gerar PDF (${linhas.filter(l => l.funcionarioId && l.valorRaw).length} recibo${linhas.filter(l => l.funcionarioId && l.valorRaw).length !== 1 ? 's' : ''})`}
      </button>
      <p className="text-xs text-gray-400 mt-2">O PDF sera baixado com 8 recibos por folha A4 (4 linhas x 2 colunas)</p>
    </div>
  );
}

function LinhaFuncionario({
  linha, idx, funcionarios, onChange, onRemove, onValorInput, podRemover
}: {
  linha: LinhaForm;
  idx: number;
  funcionarios: Funcionario[];
  onChange: (p: Partial<LinhaForm>) => void;
  onRemove: () => void;
  onValorInput: (raw: string) => void;
  podRemover: boolean;
}) {
  const valorNum = parseMoeda(linha.valorRaw);
  const extenso  = valorNum > 0 ? valorPorExtenso(valorNum) : '';

  return (
    <div className="border border-cream-300 rounded-xl p-4 bg-cream-50">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="w-6 h-6 bg-forest-100 text-forest-700 rounded-full text-xs flex items-center justify-center font-bold mt-1 flex-shrink-0">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-[180px]">
          <label className="label">Funcionario</label>
          <select
            className="input"
            value={linha.funcionarioId}
            onChange={e => onChange({ funcionarioId: e.target.value })}
          >
            <option value="">Selecione...</option>
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>{f.nome_completo}</option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className="label">Valor (R$)</label>
          <input
            className="input text-right font-mono"
            placeholder="0,00"
            value={linha.valorRaw}
            onChange={e => onValorInput(e.target.value)}
          />
          {extenso && <p className="text-xs text-gray-500 mt-1 leading-tight">{extenso}</p>}
        </div>
        <div className="flex flex-col gap-1 mt-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={linha.discriminar}
              onChange={e => onChange({ discriminar: e.target.checked })}
              className="w-4 h-4 accent-forest-700" />
            <span className="text-xs font-semibold text-gray-600">Discriminar</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={linha.usarObs}
              onChange={e => onChange({ usarObs: e.target.checked })}
              className="w-4 h-4 accent-forest-700" />
            <span className="text-xs font-semibold text-gray-600">Observacao</span>
          </label>
        </div>
        {podRemover && (
          <button onClick={onRemove}
            className="text-red-400 hover:text-red-600 transition-colors mt-5 text-lg leading-none">
            x
          </button>
        )}
      </div>
      {linha.discriminar && (
        <div className="mt-3">
          <label className="label">Discriminacao do valor</label>
          <textarea className="input min-h-[72px] resize-y"
            placeholder="Ex: R$ 500,00 fixo | R$ 300,00 loja"
            value={linha.discriminacao}
            onChange={e => onChange({ discriminacao: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">
            Um segundo recibo com esta discriminacao sera gerado para este funcionario.
          </p>
        </div>
      )}
      {linha.usarObs && (
        <div className="mt-3">
          <label className="label">Observacao (aparece no recibo)</label>
          <textarea className="input min-h-[56px] resize-y"
            placeholder="Ex: Gratificacao referente ao mes de marco"
            value={linha.observacao}
            onChange={e => onChange({ observacao: e.target.value })} />
        </div>
      )}
    </div>
  );
}
