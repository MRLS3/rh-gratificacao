# ERP Administrativo — Módulo de Gratificações

Sistema web completo para emissão, gestão e histórico de gratificações,  
com autenticação de usuários, banco de dados Supabase e geração de PDF.

---

## Stack

| Camada       | Tecnologia                         |
|--------------|------------------------------------|
| Frontend     | Next.js 14 (App Router) + React 18 |
| Estilos      | Tailwind CSS                       |
| Banco        | Supabase (PostgreSQL)              |
| Auth         | Supabase Auth                      |
| PDF          | jsPDF                              |
| Deploy       | Vercel (grátis)                    |

---

## Funcionalidades

- ✅ Login / logout com e-mail e senha
- ✅ Perfis: **Admin** (acesso total) e **Operador** (emite e consulta)
- ✅ Cadastro, edição e desativação de funcionários
- ✅ Emissão de gratificações em lote (vários funcionários de uma vez)
- ✅ Campo **Ref (MM/AAAA)** fixado durante o lote
- ✅ Valor digitado como moeda → extenso gerado automaticamente
- ✅ Checkbox **Discriminar** → abre campo de texto + gera recibo extra
- ✅ Checkbox **Observação** → campo opcional no recibo
- ✅ Data no formato DDMMAAAA → "Salvador, 24 de março de 2026"
- ✅ PDF com 8 recibos por folha A4 (4 linhas × 2 colunas)
- ✅ Histórico filtrável por período com re-download de PDF
- ✅ Gerenciamento de usuários pelo admin

---

## Setup em 5 passos

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → New Project
2. Escolha nome, senha (guarde!) e região **South America (São Paulo)**
3. Aguarde o projeto inicializar (~2 min)

### 2. Rodar o schema do banco

1. No painel do Supabase: **SQL Editor** → **New query**
2. Cole o conteúdo de `supabase-schema.sql`
3. Clique **Run** — deve aparecer "Success"

### 3. Configurar variáveis de ambiente

1. No Supabase: **Settings → API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (⚠️ nunca exponha) → `SUPABASE_SERVICE_ROLE_KEY`
3. Renomeie `.env.local.example` para `.env.local` e cole os valores

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 4. Criar o primeiro admin (direto no Supabase)

1. No Supabase: **Authentication → Users → Add user**
2. Preencha e-mail e senha → **Create user**
3. Vá em **Table Editor → profiles** → edite o registro criado:
   - `nome` → seu nome completo
   - `role` → `admin`
4. Agora você pode logar e criar outros usuários pelo painel do sistema

### 5. Rodar localmente ou fazer deploy

**Local:**
```bash
npm install
npm run dev
# Abra http://localhost:3000
```

**Deploy na Vercel (recomendado):**
1. Suba o código no GitHub
2. Acesse [vercel.com](https://vercel.com) → Import project
3. Adicione as 3 variáveis de ambiente no painel da Vercel
4. Deploy automático — você recebe um link público

---

## Estrutura do projeto

```
src/
├── app/
│   ├── login/          — Tela de login
│   ├── dashboard/
│   │   ├── page.tsx             — Painel inicial
│   │   ├── gratificacoes/       — Emissão de recibos ← módulo principal
│   │   ├── funcionarios/        — Cadastro de funcionários
│   │   ├── historico/           — Histórico e re-download
│   │   └── admin/               — Gerenciar usuários (só admin)
│   └── api/usuarios/   — API para criar usuários (service role)
├── components/
│   └── layout/Sidebar.tsx
└── lib/
    ├── supabase.ts      — Cliente browser
    ├── supabase-server.ts — Cliente server (SSR)
    ├── utils.ts         — Extenso, moeda, datas
    └── pdf.ts           — Geração PDF (8 por A4)
```

---

## Evolução para ERP completo

Este módulo foi estruturado para ser a base de um ERP maior.  
Para adicionar novos módulos (ex: Folha de Pagamento, Controle de Ponto):

1. Crie `src/app/dashboard/novo-modulo/page.tsx`
2. Adicione a entrada em `src/components/layout/Sidebar.tsx`
3. Adicione as tabelas no Supabase com suas políticas RLS

---

## Suporte

Dúvidas de configuração? Verifique:
- As 3 variáveis de ambiente estão corretas
- O schema SQL foi executado sem erros
- O primeiro usuário tem `role = 'admin'` na tabela `profiles`
