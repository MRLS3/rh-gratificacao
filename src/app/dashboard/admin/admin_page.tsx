'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile, Permissoes } from '@/types';

const PERMISSOES_CONFIG: { key: keyof Permissoes; label: string; desc: string; adminOnly: boolean }[] = [
  { key: 'emitir_gratificacoes',  label: 'Emitir gratificações',   desc: 'Pode criar e gerar PDFs de novos recibos',         adminOnly: false },
  { key: 'ver_historico',         label: 'Ver histórico',          desc: 'Pode acessar o histórico de recibos emitidos',     adminOnly: false },
  { key: 'cadastrar_funcionarios',label: 'Cadastrar funcionários', desc: 'Pode adicionar, editar e desativar funcionários',  adminOnly: false },
  { key: 'baixar_pdf',            label: 'Baixar PDF',             desc: 'Pode baixar PDFs de lotes anteriores',             adminOnly: false },
  { key: 'excluir_historico',     label: 'Excluir histórico',      desc: 'Pode excluir registros individuais ou lotes inteiros', adminOnly: true },
];

const PERMISSOES_PADRAO: Permissoes = {
  emitir_gratificacoes:   true,
  ver_historico:          true,
  cadastrar_funcionarios: true,
  baixar_pdf:             true,
  excluir_historico:      false,
};

const PERMISSOES_ADMIN: Permissoes = {
  emitir_gratificacoes:   true,
  ver_historico:          true,
  cadastrar_funcionarios: true,
  baixar_pdf:             true,
  excluir_historico:      true,
};

export default function AdminPage() {
  const sb = createClient();
  const [usuarios, setUsuarios]       = useState<Profile[]>([]);
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState({ nome: '', email: '', senha: '', role: 'operador' });
  const [criando, setCriando]         = useState(false);
  const [erro, setErro]               = useState('');
  const [sucesso, setSucesso]         = useState('');
  const [editandoPerm, setEditandoPerm] = useState<Profile | null>(null);
  const [permTemp, setPermTemp]       = useState<Permissoes>(PERMISSOES_PADRAO);
  const [salvandoPerm, setSalvandoPerm] = useState(false);

  async function carregar() {
    const { data } = await sb.from('profiles').select('*').order('nome');
    setUsuarios((data ?? []) as Profile[]);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function criarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setSucesso(''); setCriando(true);
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setErro(json.error ?? 'Erro ao criar usuário');
    } else {
      setSucesso(`Usuário ${form.nome} criado com sucesso!`);
      setForm({ nome: '', email: '', senha: '', role: 'operador' });
      await carregar();
    }
    setCriando(false);
  }

  async function toggleAtivo(u: Profile) {
    await sb.from('profiles').update({ ativo: !u.ativo }).eq('id', u.id);
    await carregar();
  }

  async function alterarRole(u: Profile, role: 'admin' | 'operador') {
    const permissoes = role === 'admin' ? PERMISSOES_ADMIN : PERMISSOES_PADRAO;
    await sb.from('profiles').update({ role, permissoes }).eq('id', u.id);
    await carregar();
  }

  function abrirPermissoes(u: Profile) {
    setEditandoPerm(u);
    setPermTemp(u.permissoes ?? PERMISSOES_PADRAO);
  }

  async function salvarPermissoes() {
    if (!editandoPerm) return;
    setSalvandoPerm(true);
    await sb.from('profiles').update({ permissoes: permTemp }).eq('id', editandoPerm.id);
    await carregar();
    setSalvandoPerm(false);
    setEditandoPerm(null);
  }

  return (
    <div className="p-8 max-w-3xl">

      {/* Modal de permissões */}
      {editandoPerm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-forest-700 rounded-full flex items-center justify-center
                              text-white font-bold text-sm flex-shrink-0">
                {editandoPerm.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{editandoPerm.nome}</p>
                <p className="text-xs text-gray-400 capitalize">{editandoPerm.role}</p>
              </div>
            </div>

            <h3 className="font-display font-bold text-gray-900 mb-4">Permissões de acesso</h3>

            {editandoPerm.role === 'admin' ? (
              <div className="bg-forest-50 border border-forest-200 rounded-xl px-4 py-3 text-forest-700 text-sm mb-5">
                Administradores têm acesso total a todas as funcionalidades.
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {PERMISSOES_CONFIG.map(p => (
                  <div
                    key={p.key}
                    className={`flex items-start justify-between gap-4 p-3 rounded-xl border transition-all
                      ${permTemp[p.key]
                        ? 'bg-forest-50 border-forest-200'
                        : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{p.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                      {p.adminOnly && (
                        <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          Sensível
                        </span>
                      )}
                    </div>
                    <label className="flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={permTemp[p.key]}
                          onChange={e => setPermTemp(prev => ({ ...prev, [p.key]: e.target.checked }))}
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors ${permTemp[p.key] ? 'bg-forest-600' : 'bg-gray-300'}`} />
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                          ${permTemp[p.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setEditandoPerm(null)}>
                Cancelar
              </button>
              {editandoPerm.role !== 'admin' && (
                <button className="btn-primary flex-1" onClick={salvarPermissoes} disabled={salvandoPerm}>
                  {salvandoPerm ? 'Salvando…' : 'Salvar permissões'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Usuários do sistema</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie acessos e permissões</p>
      </div>

      {/* Criar usuário */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Criar novo usuário</h2>
        <form onSubmit={criarUsuario} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome completo</label>
              <input className="input" value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required placeholder="João Silva" />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="joao@empresa.com" />
            </div>
            <div>
              <label className="label">Senha inicial</label>
              <input className="input" type="password" value={form.senha}
                onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} required placeholder="mínimo 6 caracteres" minLength={6} />
            </div>
            <div>
              <label className="label">Perfil</label>
              <select className="input" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="operador">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          {erro    && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 text-sm">{erro}</div>}
          {sucesso && <div className="bg-forest-50 border border-forest-200 rounded-lg px-4 py-2 text-forest-700 text-sm">✅ {sucesso}</div>}
          <button type="submit" className="btn-primary" disabled={criando}>
            {criando ? 'Criando…' : 'Criar usuário'}
          </button>
        </form>
      </div>

      {/* Lista de usuários */}
      <div className="card divide-y divide-cream-200">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Carregando…</p>
        ) : usuarios.map(u => (
          <div key={u.id} className="px-5 py-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-forest-700 rounded-full flex items-center justify-center
                                text-white font-bold text-sm flex-shrink-0">
                  {u.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${!u.ativo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {u.nome}
                  </p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="text-xs border border-cream-300 rounded-lg px-2 py-1.5 bg-white text-gray-700
                             focus:outline-none focus:ring-1 focus:ring-forest-400"
                  value={u.role}
                  onChange={e => alterarRole(u, e.target.value as 'admin' | 'operador')}
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border border-forest-300
                             text-forest-700 hover:bg-forest-50 transition-all"
                  onClick={() => abrirPermissoes(u)}
                >
                  🔑 Permissões
                </button>
                <span className={u.ativo ? 'badge-green' : 'badge-gray'}>
                  {u.ativo ? 'Ativo' : 'Inativo'}
                </span>
                <button
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all
                    ${u.ativo ? 'text-red-500 hover:bg-red-50' : 'text-forest-600 hover:bg-forest-50'}`}
                  onClick={() => toggleAtivo(u)}
                >
                  {u.ativo ? 'Desativar' : 'Reativar'}
                </button>
              </div>
            </div>

            {/* Mini resumo de permissões */}
            {u.role === 'operador' && u.permissoes && (
              <div className="flex flex-wrap gap-1.5 mt-3 ml-12">
                {PERMISSOES_CONFIG.map(p => (
                  <span
                    key={p.key}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${u.permissoes[p.key]
                        ? 'bg-forest-100 text-forest-700'
                        : 'bg-gray-100 text-gray-400 line-through'}`}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
