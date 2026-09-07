begin;

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;
grant select on public.portfolio_admins to authenticated;
drop policy if exists "portfolio_admins_read_self" on public.portfolio_admins;
create policy "portfolio_admins_read_self" on public.portfolio_admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.portfolio_valid_technologies(items text[])
returns boolean language sql immutable set search_path = '' as $$
  select items is not null and cardinality(items) <= 20 and not exists (
    select 1 from unnest(items) as item where item is null or char_length(btrim(item)) not between 1 and 40
  );
$$;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  category_ru text not null default '' check (char_length(category_ru) <= 120),
  category_en text not null default '' check (char_length(category_en) <= 120),
  description_ru text not null default '' check (char_length(description_ru) <= 4000),
  description_en text not null default '' check (char_length(description_en) <= 4000),
  role_ru text not null default '' check (char_length(role_ru) <= 120),
  role_en text not null default '' check (char_length(role_en) <= 120),
  alt_ru text not null default '' check (char_length(alt_ru) <= 300),
  alt_en text not null default '' check (char_length(alt_en) <= 300),
  technologies text[] not null default '{}' check (public.portfolio_valid_technologies(technologies)),
  website text not null default '' check (char_length(website) <= 2048 and (website = '' or website ~ '^https?://[^[:space:]@/]+([/?#][^[:space:]]*)?$')),
  repository text not null default '' check (char_length(repository) <= 2048 and (repository = '' or repository ~ '^https?://[^[:space:]@/]+([/?#][^[:space:]]*)?$')),
  image_path text check (image_path ~ '^projects/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  theme text not null default 'analytics' check (theme in ('store', 'analytics', 'booking')),
  status text not null default 'live' check (status in ('live', 'code', 'wip')),
  visibility text not null default 'draft' check (visibility in ('draft', 'published')),
  sort_order integer not null default 100 check (sort_order between 0 and 100000),
  demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_published_fields check (
    visibility <> 'published' or (
      char_length(btrim(category_ru)) > 0 and char_length(btrim(description_ru)) > 0
      and char_length(btrim(role_ru)) > 0 and char_length(btrim(alt_ru)) > 0 and image_path is not null
    )
  )
);

create index if not exists portfolio_projects_visibility_sort_idx
  on public.portfolio_projects (visibility, sort_order, created_at desc, id);
create index if not exists portfolio_projects_image_path_idx on public.portfolio_projects (image_path);

alter table public.portfolio_projects enable row level security;
revoke all on public.portfolio_projects from anon, authenticated;
grant select on public.portfolio_projects to anon;
grant select, insert, update, delete on public.portfolio_projects to authenticated;

drop policy if exists "portfolio_projects_public_read" on public.portfolio_projects;
create policy "portfolio_projects_public_read" on public.portfolio_projects
  for select to anon, authenticated using (visibility = 'published');

drop policy if exists "portfolio_projects_admin_manage" on public.portfolio_projects;
create policy "portfolio_projects_admin_manage" on public.portfolio_projects
  for all to authenticated
  using ((select auth.uid()) in (select user_id from public.portfolio_admins))
  with check ((select auth.uid()) in (select user_id from public.portfolio_admins));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-images', 'portfolio-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio_covers_admin_read" on storage.objects;
create policy "portfolio_covers_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'portfolio-images' and (select auth.uid()) in (select user_id from public.portfolio_admins));

drop policy if exists "portfolio_covers_admin_upload" on storage.objects;
create policy "portfolio_covers_admin_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'portfolio-images' and name ~ '^projects/[0-9a-f-]{36}\.(jpg|png|webp)$'
    and (select auth.uid()) in (select user_id from public.portfolio_admins)
  );

drop policy if exists "portfolio_covers_admin_delete_unused" on storage.objects;
create policy "portfolio_covers_admin_delete_unused" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'portfolio-images' and (select auth.uid()) in (select user_id from public.portfolio_admins)
    and not exists (select 1 from public.portfolio_projects where image_path = storage.objects.name)
  );

create or replace function public.portfolio_prepare_project()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.image_path is not null and not exists (
    select 1 from storage.objects where bucket_id = 'portfolio-images' and name = new.image_path
  ) then
    raise exception 'Project cover must exist in portfolio-images' using errcode = '23514';
  end if;
  if TG_OP = 'UPDATE' then
    new.created_at = old.created_at;
    new.id = old.id;
  else
    new.created_at = now();
  end if;
  new.updated_at = clock_timestamp();
  return new;
end;
$$;
revoke all on function public.portfolio_prepare_project() from public;
drop trigger if exists portfolio_projects_prepare on public.portfolio_projects;
create trigger portfolio_projects_prepare before insert or update on public.portfolio_projects
  for each row execute function public.portfolio_prepare_project();

commit;
