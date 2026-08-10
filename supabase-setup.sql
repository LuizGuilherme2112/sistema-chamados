-- Execute este script no SQL Editor do Supabase.
-- Se você já rodou uma versão anterior deste script (tabela "tickets" já existe),
-- pode rodar este script inteiro mesmo assim — ele só recria a política de acesso.

-- 1. Tabela de perfis (nome + função de cada usuário logado)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'Funcionário' check (role in ('Funcionário', 'TI')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "Usuários veem o próprio perfil" on profiles;
create policy "Usuários veem o próprio perfil"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Usuários criam o próprio perfil" on profiles;
create policy "Usuários criam o próprio perfil"
  on profiles for insert
  with check (auth.uid() = id);

-- 2. Tabela de chamados (caso ainda não exista)
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  number serial,
  title text not null,
  description text not null,
  category text not null,
  priority text not null default 'Média',
  status text not null default 'Aberto',
  requester text not null,
  assignee text,
  comments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table tickets enable row level security;

-- 3. Só usuários logados (com login/senha) podem ler e escrever chamados.
--    Isso substitui qualquer política antiga que liberava acesso para qualquer um.
drop policy if exists "Permitir tudo (uso interno)" on tickets;
drop policy if exists "Autenticados podem tudo" on tickets;
create policy "Autenticados podem tudo"
  on tickets
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
