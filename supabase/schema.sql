create extension if not exists "pgcrypto";

create table if not exists public.notebooks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Notebook',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.coding_items (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('link', 'text')),
  title text not null,
  body text not null,
  url text,
  folder text not null default 'general',
  tags text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.notebooks enable row level security;
alter table public.coding_items enable row level security;

create policy "Owners can read their notebooks"
on public.notebooks
for select
to authenticated
using (owner_id = auth.uid());

create policy "Anyone can read public notebooks"
on public.notebooks
for select
using (is_public = true);

create policy "Signed in users can create notebooks"
on public.notebooks
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Owners can update notebooks"
on public.notebooks
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Owners can delete notebooks"
on public.notebooks
for delete
to authenticated
using (owner_id = auth.uid());

create policy "Owners can read notebook items"
on public.coding_items
for select
to authenticated
using (owner_id = auth.uid());

create policy "Anyone can read items in public notebooks"
on public.coding_items
for select
using (
  exists (
    select 1 from public.notebooks
    where notebooks.id = coding_items.notebook_id
    and notebooks.is_public = true
  )
);

create policy "Owners can insert notebook items"
on public.coding_items
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.notebooks
    where notebooks.id = coding_items.notebook_id
    and notebooks.owner_id = auth.uid()
  )
);

create policy "Owners can update notebook items"
on public.coding_items
for update
to authenticated
using (owner_id = auth.uid())
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.notebooks
    where notebooks.id = coding_items.notebook_id
    and notebooks.owner_id = auth.uid()
  )
);

create policy "Owners can delete notebook items"
on public.coding_items
for delete
to authenticated
using (owner_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('coding-images', 'coding-images', true)
on conflict (id) do update set public = true;

create policy "Anyone can read coding images"
on storage.objects
for select
using (bucket_id = 'coding-images');

create policy "Signed in users can upload coding images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'coding-images');

create policy "Signed in users can update coding images"
on storage.objects
for update
to authenticated
using (bucket_id = 'coding-images')
with check (bucket_id = 'coding-images');

create policy "Signed in users can delete coding images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'coding-images');
