insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'admin@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'visitor@example.test');
insert into public.portfolio_admins (user_id) values ('11111111-1111-4111-8111-111111111111');

set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
insert into storage.objects (bucket_id, name) values ('portfolio-images', 'projects/33333333-3333-4333-8333-333333333333.webp');
insert into public.portfolio_projects (id, name) values ('44444444-4444-4444-8444-444444444444', 'Private draft');
insert into public.portfolio_projects (id, name, category_ru, description_ru, role_ru, alt_ru, image_path, visibility, sort_order)
values ('55555555-5555-4555-8555-555555555555', 'Published work', 'Web app', 'Description', 'Fullstack', 'App screen', 'projects/33333333-3333-4333-8333-333333333333.webp', 'published', 0);

do $$ begin
  if (select count(*) from public.portfolio_projects) <> 2 then raise exception 'Admin cannot read drafts'; end if;
  begin
    insert into public.portfolio_projects (name, visibility) values ('Incomplete', 'published');
    raise exception 'Incomplete publication was allowed';
  exception when check_violation then null; end;
  begin
    insert into public.portfolio_projects (name, website) values ('Unsafe URL', 'javascript:alert(1)');
    raise exception 'Unsafe URL was allowed';
  exception when check_violation then null; end;
  begin
    insert into public.portfolio_projects (name, image_path) values ('Missing image', 'projects/66666666-6666-4666-8666-666666666666.webp');
    raise exception 'Missing cover reference was allowed';
  exception when check_violation then null; end;
  begin
    insert into public.portfolio_projects (name, sort_order) values ('Invalid order', -1);
    raise exception 'Negative order was allowed';
  exception when check_violation then null; end;
  begin
    insert into public.portfolio_projects (name, technologies) values ('Too many tags', array_fill('React'::text, array[21]));
    raise exception 'Too many technologies were allowed';
  exception when check_violation then null; end;
end $$;

-- Anonymous visitors get published rows only, even when bypassing the frontend.
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  if (select count(*) from public.portfolio_projects) <> 1 then raise exception 'Anonymous draft disclosure'; end if;
  begin
    insert into public.portfolio_projects (name) values ('Intruder');
    raise exception 'Anonymous insert was allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform * from public.portfolio_admins;
    raise exception 'Anonymous admin membership disclosure';
  exception when insufficient_privilege then null; end;
end $$;

-- Authentication alone does not make a user an administrator.
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
do $$ declare affected integer; begin
  if (select count(*) from public.portfolio_projects) <> 1 then raise exception 'Regular user draft disclosure'; end if;
  if (select count(*) from public.portfolio_admins) <> 0 then raise exception 'Regular user sees admin memberships'; end if;
  begin
    insert into public.portfolio_projects (name) values ('Intruder');
    raise exception 'Regular user insert was allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.portfolio_admins (user_id) values ('22222222-2222-4222-8222-222222222222');
    raise exception 'Self-promotion was allowed';
  exception when insufficient_privilege then null; end;
  update public.portfolio_projects set name = 'Tampered';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Regular user update was allowed'; end if;
  delete from public.portfolio_projects;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Regular user delete was allowed'; end if;
  begin
    insert into storage.objects (bucket_id, name) values ('portfolio-images', 'projects/77777777-7777-4777-8777-777777777777.webp');
    raise exception 'Regular user upload was allowed';
  exception when insufficient_privilege then null; end;
  delete from storage.objects;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Regular user cover deletion was allowed'; end if;
end $$;

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
do $$ declare affected integer; previous_time timestamptz; begin
  delete from storage.objects where name = 'projects/33333333-3333-4333-8333-333333333333.webp';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Referenced image could be deleted'; end if;

  select updated_at into previous_time from public.portfolio_projects where id = '55555555-5555-4555-8555-555555555555';
  update public.portfolio_projects set description_ru = 'New version' where id = '55555555-5555-4555-8555-555555555555' and updated_at = previous_time;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Initial optimistic update failed'; end if;
  update public.portfolio_projects set description_ru = 'Stale version' where id = '55555555-5555-4555-8555-555555555555' and updated_at = previous_time;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Stale update overwrote newer version'; end if;

  update public.portfolio_projects set visibility = 'draft' where id = '55555555-5555-4555-8555-555555555555';
end $$;

reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  if (select count(*) from public.portfolio_projects) <> 0 then raise exception 'Unpublished work is still public'; end if;
end $$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
delete from public.portfolio_projects where id = '55555555-5555-4555-8555-555555555555';
do $$ declare affected integer; begin
  delete from storage.objects where name = 'projects/33333333-3333-4333-8333-333333333333.webp';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Unused image cleanup failed'; end if;
end $$;

reset role;
delete from public.portfolio_admins where user_id = '11111111-1111-4111-8111-111111111111';
set role authenticated;
do $$ begin
  begin
    insert into public.portfolio_projects (name) values ('Revoked admin');
    raise exception 'Revoked admin retains write access';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: migration is repeatable; admin CRUD, draft privacy, privilege escalation, URL/content constraints, stale writes, cover cleanup and access revocation verified.' as result;
