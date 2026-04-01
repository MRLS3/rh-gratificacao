# ERP Gratificação — Contexto do Projeto

## O que é esse projeto
Sistema web administrativo para emissão de gratificações mensais para funcionários.
Módulo inicial de um ERP administrativo mais completo.

## Stack
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Banco de dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **PDF**: jsPDF (8 recibos por folha A4 — 4 linhas × 2 colunas)
- **Deploy futuro**: Vercel

## Credenciais e configuração
- Arquivo de ambiente: `.env.local` na raiz do projeto
- Projeto Supabase: `xcjwylqsdnfrixkmyhdu.supabase.co`
- Variáveis necessárias:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xcjwylqsdnfrixkmyhdu.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
  ```

## Como rodar localmente
```bash
cd C:\PROGRAMAS\erp-gratificacao
npm run dev
# Acesse http://localhost:3000
```

## Estrutura de pastas
```
src/
├── app/
│   ├── login/                  — Tela de login
│   ├── dashboard/
│   │   ├── page.tsx            — Painel inicial com estatísticas
│   │   ├── layout.tsx          — Layout com sidebar
│   │   ├── gratificacoes/      — ⭐ Módulo principal de emissão
│   │   ├── funcionarios/       — Cadastro de funcionários
│   │   ├── historico/          — Histórico, exclusão individual e por lote
│   │   └── admin/              — Gerenciar usuários e permissões (só admin)
│   └── api/usuarios/           — API para criar usuários (service role)
├── components/
│   └── layout/Sidebar.tsx      — Menu lateral verde escuro
└── lib/
    ├── supabase.ts             — Cliente browser
    ├── supabase-server.ts      — Cliente server (SSR)
    ├── utils.ts                — Valor por extenso PT-BR, moeda, datas
    └── pdf.ts                  — Geração de PDF (v2)
```

## Banco de dados — Tabelas
- `profiles` — Usuários com campo `permissoes` (JSONB)
- `funcionarios` — Cadastro de funcionários ativos/inativos
- `gratificacoes` — Recibos emitidos com histórico completo

## Estrutura de permissões (JSONB no profiles)
```json
{
  "emitir_gratificacoes": true,
  "ver_historico": true,
  "cadastrar_funcionarios": true,
  "baixar_pdf": true,
  "excluir_historico": false
}
```
- Admins têm todas as permissões automaticamente
- Ao mudar role para admin/operador, permissões são resetadas para o padrão do perfil
- O admin pode ajustar permissões individualmente pelo modal "🔑 Permissões"

## Perfis de usuário
- `admin` — Acesso total, permissões fixas, pode gerenciar usuários
- `operador` — Permissões configuráveis pelo admin

## Políticas RLS aplicadas
```sql
-- Funcionários
funcionarios_auth_write  → ALL para authenticated
funcionarios_auth_select → SELECT para authenticated

-- Gratificações
gratificacoes_select       → SELECT para authenticated
gratificacoes_insert       → INSERT para authenticated
gratificacoes_delete_admin → DELETE só para role = admin

-- Profiles
profiles_auth_select  → SELECT para authenticated
profiles_update_admin → UPDATE só para role = admin
```

## Funcionalidades implementadas
- [x] Login / logout com e-mail e senha
- [x] Sidebar com navegação por perfil
- [x] Cadastro, edição, ativação/desativação de funcionários
- [x] Emissão de gratificações em lote
- [x] Campo Ref (MM/AAAA) travado durante o lote
- [x] Valor em moeda → extenso automático em português
- [x] Checkbox "Discriminar" → campo + recibo extra
- [x] Checkbox "Observação" → campo opcional
- [x] Data DDMMAAAA → "Salvador, 24 de março de 2026"
- [x] PDF com 8 recibos por folha A4
- [x] Histórico filtrável por período
- [x] Re-download de PDF de lotes anteriores
- [x] Exclusão individual de registro (botão aparece no hover)
- [x] Exclusão de lote inteiro com confirmação
- [x] Gerenciamento de usuários pelo admin
- [x] Painel de permissões granulares por usuário
- [x] Mini-resumo de permissões visível na lista de usuários

## Layout do recibo PDF (v2)
- Cabeçalho cinza: GRATIFICAÇÃO | Ref | VALOR
- "Valor" label pequeno + extenso em itálico negrito 9pt
- Nome em negrito itálico 10pt
- Data 8.5pt — "Salvador, DD de mês de AAAA"
- Slip discriminação: retângulo branco com borda + assinatura na base

## Problemas conhecidos e soluções
| Problema | Solução |
|---|---|
| Supabase erro de extensão Chrome | Aba anônima Ctrl+Shift+N |
| Trigger de profiles não disparou | INSERT manual com UUID |
| npm não reconhecido | Instalar Node.js LTS |
| .env.local não existia | `copy .env.local.example .env.local` |
| .env.local sem nomes de variáveis | Reescrever com formato NOME=valor |
| Funcionários não salvavam | Política RLS funcionarios_auth_write |
| Histórico não carregava | Políticas RLS de SELECT em todas as tabelas |

## Próximos módulos planejados (ERP)
Para adicionar novos módulos:
1. Criar `src/app/dashboard/novo-modulo/page.tsx`
2. Adicionar entrada em `src/components/layout/Sidebar.tsx`
3. Adicionar tabelas no Supabase com políticas RLS
