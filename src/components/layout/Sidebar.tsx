'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/types';

const NAV = [
  { href: '/dashboard',               label: 'Painel',        icon: 'grid',    adminOnly: false },
  { href: '/dashboard/gratificacoes', label: 'Gratificacoes', icon: 'doc',     adminOnly: false },
  { href: '/dashboard/historico',     label: 'Historico',     icon: 'clock',   adminOnly: false },
  { href: '/dashboard/admin',         label: 'Usuarios',      icon: 'gear',    adminOnly: true  },
];

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-forest-950 flex flex-col z-40">
      <div className="px-6 py-6 border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center text-white text-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="3" width="16" height="12" rx="2" stroke="#a8d5ab" strokeWidth="1.5"/>
              <path d="M4 8h10M4 11h6" stroke="#a8d5ab" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Gratificacoes</p>
            <p className="text-forest-400 text-xs">Big Ben Tecidos</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.filter(n => !n.adminOnly || profile?.role === 'admin').map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${active
                  ? 'bg-forest-700 text-white font-semibold'
                  : 'text-forest-300 hover:bg-forest-800 hover:text-white'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-forest-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-forest-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {profile?.nome?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.nome ?? 'Usuario'}</p>
            <p className="text-forest-400 text-xs capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-xs text-forest-400
                     hover:bg-forest-800 hover:text-white transition-all flex items-center gap-2"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M10 10l3-3-3-3M13 7H5"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}