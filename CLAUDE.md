# CLAUDE.md — Projeto RH Gratificação

## Visão Geral
Sistema ERP interno para emissão e gestão de recibos de gratificação de funcionários.

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
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
- **Schema:** ver `supabase-schema.sql` na raiz do projeto

### Tabelas principais
- `profiles` — usuários do sistema (admin/operador)
- `funcionarios` — cadastro de funcionários
- `gratificacoes` — recibos emitidos

## Variáveis de Ambiente
Configuradas na Vercel em Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Publishable key)
- `SUPABASE_SERVICE_ROLE_KEY` (Secret key)

Arquivo local: `C:\Programas\rh-gratificacao\.env.local` (não sobe para o GitHub)

## Arquivos Importantes
| Arquivo | Descrição |
|---------|-----------|
| `src/app/page.tsx` | Redireciona direto para `/dashboard` |
| `src/app/dashboard/layout.tsx` | Layout sem autenticação obrigatória |
| `src/middleware.ts` | Middleware sem proteção de rotas |
| `src/lib/supabase.ts` | Client-side Supabase |
| `src/lib/supabase-server.ts` | Server-side Supabase |
| `src/lib/pdf.ts` | Geração de PDF dos recibos |
| `src/lib/utils.ts` | Funções utilitárias (moeda, datas, extenso) |
| `src/types/index.ts` | Interfaces TypeScript (Profile, Permissoes, Funcionario, Gratificacao) |
| `tsconfig.json` | target: es2015, noImplicitAny: false |
| `vercel.json` | framework: nextjs |

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

## Histórico de Deploy (01/04/2026)

### Problemas resolvidos
1. Repositório antigo `vale` deletado e substituído por `rh-gratificacao`
2. `node_modules` removido do histórico git com `filter-branch`
3. Branch renomeada de `master` para `main`
4. Erros de TypeScript corrigidos:
   - `Permissoes` ausente em `src/types/index.ts`
   - `target` ausente no `tsconfig.json` (adicionado `es2015`)
   - `noImplicitAny` desativado no `tsconfig.json`
   - Tipos explícitos em `supabase-server.ts` e `middleware.ts`
5. Vercel configurada com `vercel.json` (framework: nextjs)
6. Autenticação removida temporariamente:
   - `src/middleware.ts` — retorna `NextResponse.next()` diretamente
   - `src/app/page.tsx` — redireciona direto para `/dashboard`
   - `src/app/dashboard/layout.tsx` — sem verificação de sessão
7. Novo projeto Supabase criado com schema atualizado

## Como fazer deploy de alterações
```cmd
cd C:\Programas\rh-gratificacao
git add .
git commit -m "descrição da alteração"
git push origin main
```
A Vercel faz o deploy automaticamente após o push.

## Pendências
- [ ] Configurar RLS no Supabase para as tabelas (funcionarios, gratificacoes)
- [ ] Testar adição de funcionários com novo banco
- [ ] Reativar autenticação quando necessário
- [ ] Trocar chaves antigas do Supabase (expostas acidentalmente em 01/04/2026)
