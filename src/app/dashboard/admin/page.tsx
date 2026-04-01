'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/types';

export default function AdminPage() {
  const sb = createClient();
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ nome: '', email: '', senha: '', role: 'operador' });
  const [criando, setCriando]   = useState(false);
  const [erro, setErro]         = useState('');
  const [sucesso, setSucesso]   = useState('');

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
    await sb.from('profiles').update({ role }).eq('id', u.id);
    await carregar();
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Usuários do sistema</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie quem tem acesso ao ERP</p>
      </div>

      {/* Criar usuário */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Criar novo usuário</h2>
        <form onSubmit={criarUsuario} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome completo</label>
              <input className="input" value={form.nome}
                onChange={e => setForm(f=>({...f, nome: e.target.value}))} required placeholder="João Silva" />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" value={form.email}
                onChange={e => setForm(f=>({...f, email: e.target.value}))} required placeholder="joao@empresa.com" />
            </div>
            <div>
              <label className="label">Senha inicial</label>
              <input className="input" type="password" value={form.senha}
                onChange={e => setForm(f=>({...f, senha: e.target.value}))} required placeholder="mínimo 6 caracteres" minLength={6} />
            </div>
            <div>
              <label className="label">Perfil</label>
              <select className="input" value={form.role}
                onChange={e => setForm(f=>({...f, role: e.target.value}))}>
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

      {/* Lista */}
      <div className="card divide-y divide-cream-200">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Carregando…</p>
        ) : usuarios.map(u => (
          <div key={u.id} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-forest-700 rounded-full flex items-center justify-center
                              text-white font-bold text-sm">
                {u.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-semibold ${!u.ativo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {u.nome}
                </p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="text-xs border border-cream-300 rounded-lg px-2 py-1.5 bg-white text-gray-700
                           focus:outline-none focus:ring-1 focus:ring-forest-400"
                value={u.role}
                onChange={e => alterarRole(u, e.target.value as 'admin' | 'operador')}
              >
                <option value="operador">Operador</option>
                <option value="admin">Admin</option>
              </select>
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
        ))}
      </div>
    </div>
  );
}
