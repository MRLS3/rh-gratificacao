# CLAUDE.md — Projeto RH Gratificação

## Visão Geral
Sistema ERP interno para emissão e gestão de recibos de gratificação de funcionários.

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + RLS desativado)
- **Deploy:** Vercel (produção)
- **Repositório:** https://github.com/MRLS3/rh-gratificacao

## URLs
- **Produção:** https://rh-gratificacao.vercel.app
- **Dashboard:** https://rh-gratificacao.vercel.app/dashboard

## Estrutura Local
- **Pasta local:** `C:\Programas\rh-gratificacao`
- **Branch principal:** `main`

## Banco de Dados — Supabase
- **Projeto:** rh-gratificacao
- **Project ID:** qrkyrktali eupountgig
- **Project URL:** https://qrkyrktali eupountgig.supabase.co
- **Região:** South America (São Paulo)
- **RLS:** Desativado em todas as tabelas (acesso livre sem autenticação)
- **Schema:** ver `supabase-schema.sql` na raiz do projeto

### Tabelas
- `profiles` — usuários do sistema (admin/operador)
- `funcionarios` — cadastro de funcionários
- `gratificacoes` — recibos emitidos

## Variáveis de Ambiente
Configuradas na Vercel em Settings → Environment Variables (All Environments):
- `NEXT_PUBLIC_SUPABASE_URL` = `https://qrkyrktali eupountgig.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_...`
- `SUPABASE_SERVICE_ROLE_KEY` = `sb_secret_...`

Arquivo local: `C:\Programas\rh-gratificacao\.env.local` (não sobe para o GitHub)

## Arquivos Importantes
| Arquivo | Descrição |
|---------|-----------|
| `src/app/page.tsx` | Redireciona direto para `/dashboard` sem autenticação |
| `src/app/dashboard/layout.tsx` | Layout sem verificação de sessão |
| `src/middleware.ts` | Retorna `NextResponse.next()` — sem proteção de rotas |
| `src/lib/supabase.ts` | Client-side Supabase |
| `src/lib/supabase-server.ts` | Server-side Supabase com tipos explícitos |
| `src/lib/pdf.ts` | Geração de PDF dos recibos |
| `src/lib/utils.ts` | Funções utilitárias (moeda, datas, extenso) |
| `src/types/index.ts` | Interfaces: Profile, Permissoes, Funcionario, Gratificacao |
| `tsconfig.json` | target: es2015, noImplicitAny: false |
| `vercel.json` | framework: nextjs |
| `supabase-schema.sql` | Schema completo do banco de dados |

## Rotas do Sistema
| Rota | Descrição |
|------|-----------|
| `/` | Redireciona para `/dashboard` |
| `/login` | Tela de login (desativada temporariamente) |
| `/dashboard` | Painel com estatísticas |
| `/dashboard/funcionarios` | Cadastro de funcionários |
| `/dashboard/gratificacoes` | Emissão de recibos |
| `/dashboard/historico` | Histórico de gratificações |
| `/dashboard/admin` | Administração de usuários |

## Como fazer deploy de alterações
```cmd
cd C:\Programas\rh-gratificacao
git add .
git commit -m "descrição da alteração"
git push origin main
```
A Vercel faz o deploy automaticamente após o push.

## Histórico de Problemas Resolvidos (01/04/2026)

1. Repositório antigo `vale` deletado e substituído por `rh-gratificacao`
2. `node_modules` removido do histórico git com `filter-branch`
3. Branch renomeada de `master` para `main`
4. Erros de TypeScript corrigidos:
   - `Permissoes` ausente em `src/types/index.ts`
   - `target` ausente no `tsconfig.json` (adicionado `es2015`)
   - `noImplicitAny: false` adicionado ao `tsconfig.json`
   - Tipos explícitos em `supabase-server.ts` e `middleware.ts`
5. `vercel.json` criado com `framework: nextjs`
6. Autenticação removida temporariamente:
   - `middleware.ts` retorna `NextResponse.next()` diretamente
   - `page.tsx` redireciona direto para `/dashboard`
   - `dashboard/layout.tsx` sem verificação de sessão
7. Novo projeto Supabase criado (`rh-gratificacao`)
8. Schema importado via SQL Editor
9. RLS desativado em todas as tabelas (policies de recursão removidas)
10. Supabase atualizado para versão mais recente (suporte a chaves `sb_publishable_`)

## Pendências
- [ ] Reativar autenticação quando o sistema for integrado ao dashboard externo
- [ ] Reativar RLS com políticas corretas quando autenticação for reativada
- [ ] Trocar chaves antigas do Supabase (expostas acidentalmente em 01/04/2026)
- [ ] Testar fluxo completo: cadastrar funcionário → emitir gratificação → gerar PDF
