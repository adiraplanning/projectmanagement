-- ============================================================
-- Gestão de Projeto — esquema Supabase (acesso aberto, sem login)
-- Correr uma vez no Supabase: SQL Editor → New query → colar → Run
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default 'Novo projeto',
  client       text,
  description  text,
  status       text not null default 'ativo'
               check (status in ('ativo', 'pausado', 'concluido', 'arquivado')),
  -- Todo o planeamento do projeto (tarefas, por planear, concluídas, sábados de trabalho).
  data         jsonb not null default '{"pieces": [], "workSaturdays": []}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists projects_status_idx  on public.projects (status);
create index if not exists projects_updated_idx on public.projects (updated_at desc);

-- Data de criação fixa; data de alteração atualizada automaticamente.
create or replace function public.projects_touch()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
  else
    new.created_at := old.created_at;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch
before insert or update on public.projects
for each row execute function public.projects_touch();

-- ------------------------------------------------------------
-- Acesso: aberto a quem tiver o link do site (chave "anon").
-- ------------------------------------------------------------
alter table public.projects enable row level security;

drop policy if exists "acesso aberto - ler"    on public.projects;
drop policy if exists "acesso aberto - criar"  on public.projects;
drop policy if exists "acesso aberto - editar" on public.projects;
drop policy if exists "acesso aberto - apagar" on public.projects;

create policy "acesso aberto - ler"    on public.projects for select to anon, authenticated using (true);
create policy "acesso aberto - criar"  on public.projects for insert to anon, authenticated with check (true);
create policy "acesso aberto - editar" on public.projects for update to anon, authenticated using (true) with check (true);
create policy "acesso aberto - apagar" on public.projects for delete to anon, authenticated using (true);

grant select, insert, update, delete on public.projects to anon, authenticated;
