-- ============================================================
-- ERP Gratificação — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Perfis de usuário (ligado ao auth.users do Supabase) ──────
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'operador' CHECK (role IN ('admin', 'operador')),
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Funcionários ──────────────────────────────────────────────
CREATE TABLE public.funcionarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Gratificações ─────────────────────────────────────────────
CREATE TABLE public.gratificacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_mes_ano      TEXT NOT NULL,          -- formato MM/AAAA
  funcionario_id   UUID NOT NULL REFERENCES public.funcionarios(id),
  valor            NUMERIC(12,2) NOT NULL,
  valor_extenso    TEXT NOT NULL,
  discriminacao    TEXT,                   -- NULL se não usado
  observacao       TEXT,                   -- NULL se não usado
  data_emissao     DATE NOT NULL,
  cidade           TEXT NOT NULL DEFAULT 'Salvador',
  emitido_por      UUID REFERENCES public.profiles(id),
  pdf_gerado       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Trigger: updated_at automático ───────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_funcionarios_updated_at
  BEFORE UPDATE ON public.funcionarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Trigger: criar profile automaticamente após signup ────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'operador')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratificacoes ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário vê o próprio; admin vê todos
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Funcionários: qualquer autenticado lê; só admin modifica
CREATE POLICY "funcionarios_select"
  ON public.funcionarios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "funcionarios_admin_write"
  ON public.funcionarios FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Gratificações: autenticado lê e insere; admin deleta
CREATE POLICY "gratificacoes_select"
  ON public.gratificacoes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "gratificacoes_insert"
  ON public.gratificacoes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "gratificacoes_admin_delete"
  ON public.gratificacoes FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX idx_gratificacoes_ref      ON public.gratificacoes (ref_mes_ano);
CREATE INDEX idx_gratificacoes_func     ON public.gratificacoes (funcionario_id);
CREATE INDEX idx_gratificacoes_emissao  ON public.gratificacoes (data_emissao DESC);
CREATE INDEX idx_funcionarios_nome      ON public.funcionarios (nome);
