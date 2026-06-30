-- ════════════════════════════════════════════════════════════════
--  FURA HANDBÓK — uppsetning gagnagrunns (keyrt einu sinni)
--  Límdu allt þetta í Supabase → SQL Editor → Run.
--  Óhætt að keyra aftur (það skemmir ekkert sem fyrir er).
-- ════════════════════════════════════════════════════════════════

-- 1) Handbókin geymd sem eitt JSON-tré í einni röð
create table if not exists public.handbook (
  id         text primary key default 'main',
  data       jsonb not null default '{"tree":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.handbook (id, data)
values ('main', '{"tree":[]}'::jsonb)
on conflict (id) do nothing;

-- 2) Kóðarnir (leynileg tafla)
create table if not exists public.app_config (
  key   text primary key,
  value text not null
);

insert into public.app_config (key, value) values
  ('view_code', '1234'),
  ('edit_code', '2808')
on conflict (key) do update set value = excluded.value;

-- 3) Læsa beinum aðgangi — aðeins föllin að neðan komast að gögnunum
alter table public.handbook  enable row level security;
alter table public.app_config enable row level security;

-- 4) Sækja handbók með kóða. Skilar {role, data} eða null ef kóði rangur.
create or replace function public.get_handbook(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_view text; v_edit text; v_role text; v_data jsonb;
begin
  select value into v_view from app_config where key = 'view_code';
  select value into v_edit from app_config where key = 'edit_code';
  if    p_code = v_edit then v_role := 'edit';
  elsif p_code = v_view then v_role := 'view';
  else  return null;
  end if;
  select data into v_data from handbook where id = 'main';
  return jsonb_build_object('role', v_role, 'data', v_data);
end;
$$;

-- 5) Vista handbók — krefst breytingakóða
create or replace function public.save_handbook(p_code text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_edit text;
begin
  select value into v_edit from app_config where key = 'edit_code';
  if p_code is distinct from v_edit then
    raise exception 'Rangur breytingakóði';
  end if;
  update handbook set data = p_data, updated_at = now() where id = 'main';
end;
$$;

grant execute on function public.get_handbook(text)         to anon;
grant execute on function public.save_handbook(text, jsonb) to anon;

-- 6) Myndageymsla (public lestur, leyfa upphleðslu)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "fura read photos"   on storage.objects;
drop policy if exists "fura upload photos" on storage.objects;

create policy "fura read photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "fura upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos');
