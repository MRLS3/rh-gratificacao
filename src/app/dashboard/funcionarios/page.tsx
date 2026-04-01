'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Funcionario } from '@/types';

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [nome, setNome]         = useState('');
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [loading, setLoading]   = useState(false);
  const [filtro, setFiltro]     = useState<'ativos' | 'todos'>('ativos');
  const sb = createClient();

  async function carregar() {
    let q = sb.from('funcionarios').select('*').order('nome');
    if (filtro === 'ativos') q = q.eq('ativo', true);
    const { data } = await q;
    setFuncionarios(data ?? []);
  }

  useEffect(() => { carregar(); }, [filtro]);

  async function salvar() {
    if (!nome.trim()) return;
    setLoading(true);
    if (editando) {
      await sb.from('funcionarios').update({ nome: nome.trim() }).eq('id', editando.id);
      setEditando(null);
    } else {
      await sb.from('funcionarios').insert({ nome: nome.trim() });
    }
    setNome('');
    await carregar();
    setLoading(false);
  }

  async function toggleAtivo(f: Funcionario) {
    await sb.from('funcionarios').update({ ativo: !f.ativo }).eq('id', f.id);
    await carregar();
  }

  function iniciarEdicao(f: Funcionario) {
    setEditando(f);
    setNome(f.nome);
  }

  function cancelar() {
    setEditando(null);
    setNome('');
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Funcionários</h1>
        <p className="text-gray-500 text-sm mt-1">Cadastre e gerencie os funcionários do sistema</p>
      </div>

      {/* Form */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">
          {editando ? `Editando: ${editando.nome}` : 'Adicionar funcionário'}
        </h2>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="Nome completo do funcionário"
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && salvar()}
          />
          <button className="btn-primary" onClick={salvar} disabled={loading || !nome.trim()}>
            {loading ? '…' : editando ? 'Salvar alteração' : 'Adicionar'}
          </button>
          {editando && (
            <button className="btn-secondary" onClick={cancelar}>Cancelar</button>
          )}
        </div>
        {!editando && (
          <p className="text-xs text-gray-400 mt-2">Pressione Enter para adicionar rapidamente</p>
        )}
      </div>

      {/* Filtro */}
      <div className="flex gap-2 mb-4">
        {(['ativos', 'todos'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all
              ${filtro === f ? 'bg-forest-700 text-white' : 'bg-white border border-cream-300 text-gray-600 hover:border-forest-400'}`}
          >
            {f === 'ativos' ? 'Ativos' : 'Todos'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card divide-y divide-cream-200">
        {funcionarios.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">Nenhum funcionário encontrado.</p>
        )}
        {funcionarios.map(f => (
          <div key={f.id} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center
                              text-forest-700 font-bold text-sm">
                {f.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-medium ${!f.ativo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {f.nome}
                </p>
                <p className="text-xs text-gray-400">
                  Desde {new Date(f.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={f.ativo ? 'badge-green' : 'badge-gray'}>
                {f.ativo ? 'Ativo' : 'Inativo'}
              </span>
              {f.ativo && (
                <button
                  className="btn-ghost text-xs px-3 py-1.5"
                  onClick={() => iniciarEdicao(f)}
                >
                  Editar
                </button>
              )}
              <button
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium
                  ${f.ativo
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-forest-600 hover:bg-forest-50'}`}
                onClick={() => toggleAtivo(f)}
              >
                {f.ativo ? 'Desativar' : 'Reativar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
