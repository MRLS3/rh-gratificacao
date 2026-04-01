import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  const [{ count: totalFunc }, { count: totalGrat }, { data: recentes }] = await Promise.all([
    supabase.from('funcionarios').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase.from('gratificacoes').select('*', { count: 'exact', head: true }),
    supabase.from('gratificacoes')
      .select('*, funcionarios(nome)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: 'Funcionários ativos', value: totalFunc ?? 0, icon: '👥', color: 'bg-forest-50 border-forest-200' },
    { label: 'Gratificações emitidas', value: totalGrat ?? 0, icon: '📄', color: 'bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Painel</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do sistema de gratificações</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg">
        {stats.map(s => (
          <div key={s.label} className={`card p-5 border ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recentes */}
      <div className="card p-6 max-w-2xl">
        <h2 className="font-semibold text-gray-900 mb-4">Últimas gratificações emitidas</h2>
        {(recentes ?? []).length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma gratificação emitida ainda.</p>
        ) : (
          <div className="divide-y divide-cream-200">
            {(recentes ?? []).map((g: any) => (
              <div key={g.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{g.funcionarios?.nome}</p>
                  <p className="text-xs text-gray-400">{g.ref_mes_ano} · {g.data_emissao}</p>
                </div>
                <span className="font-semibold text-forest-700 text-sm">
                  {Number(g.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
