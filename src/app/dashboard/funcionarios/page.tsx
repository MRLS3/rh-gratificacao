'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Funcionario {
  id: string;
  apelido: string;
  nome_completo: string;
  chave_pix: string;
  telefone: string;
  ferias_inicio: string;
  ferias_fim: string;
  ativo: boolean;
  criado_em: string;
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [filtro, setFiltro] = useState<'ativos' | 'todos'>('ativos');
  const sb = createClient();

  async function carregar() {
    let q = sb.from('funcionarios_bravo').select('*').order('nome_completo');
    if (filtro === 'ativos') q = q.eq('ativo', true);
    const { data } = await q;
    setFuncionarios(data ?? []);
  }

  useEffect(() => { carregar(); }, [filtro]);

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Funcionarios</h1>
        <p className="text-gray-500 text-sm mt-1">
          Cadastro gerenciado pelo Bravo —{' '}
          <a href="https://bravo.obigben.com.br/rh/funcionarios" target="_blank" rel="noopener noreferrer"
            className="text-forest-600 underline">
            Editar no Bravo
          </a>
        </p>
      </div>

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

      <div className="card divide-y divide-cream-200">
        {funcionarios.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">Nenhum funcionario encontrado.</p>
        )}
        {funcionarios.map(f => (
          <div key={f.id} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center
                              text-forest-700 font-bold text-sm">
                {f.apelido.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-medium ${!f.ativo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {f.nome_completo}
                </p>
                <p className="text-xs text-gray-400">{f.apelido}</p>
              </div>
            </div>
            <span className={f.ativo ? 'badge-green' : 'badge-gray'}>
              {f.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}