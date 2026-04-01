'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [erro, setErro]       = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setLoading(true);
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro('E-mail ou senha incorretos.');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-950 via-forest-800 to-forest-700 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-forest-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-forest-400 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="8" width="40" height="32" rx="5" stroke="#a8d5ab" strokeWidth="2.5"/>
              <path d="M12 20h24M12 26h16" stroke="#a8d5ab" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="34" cy="30" r="7" fill="#2b8a3e"/>
              <path d="M31 30l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-white font-bold">ERP Administrativo</h1>
          <p className="text-forest-200 mt-2 text-sm">Módulo de Gratificações</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-forest-200 uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                           placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-forest-300
                           focus:border-transparent text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-forest-200 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                           placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-forest-300
                           focus:border-transparent text-sm transition-all"
              />
            </div>

            {erro && (
              <div className="bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-3 text-red-200 text-sm">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-forest-500 hover:bg-forest-400 text-white font-semibold
                         text-sm transition-all active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? 'Entrando…' : 'Entrar no sistema'}
            </button>
          </form>
        </div>

        <p className="text-center text-forest-400 text-xs mt-6">
          Problemas de acesso? Fale com o administrador.
        </p>
      </div>
    </div>
  );
}
