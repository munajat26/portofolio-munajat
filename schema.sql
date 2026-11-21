-- =====================================================================
-- Mun's Project: skema database + Admin Panel
-- Jalankan seluruh isi file ini di Supabase > SQL Editor.
-- Aman dijalankan ulang (tidak menghapus data yang sudah ada).
-- =====================================================================

-- ---------- Tabel ----------
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  tags text[] not null default '{}',
  demo_url text,
  github_url text,
  image_url text,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table projects add column if not exists image_url text;

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table messages add column if not exists is_read boolean default false not null;

-- File yang bisa diunduh pengunjung (upload ke Storage atau link Google Drive)
create table if not exists downloads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  file_url text not null,
  storage_path text,
  file_name text,
  file_size bigint,
  download_count integer default 0 not null,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pengaturan situs (satu baris saja, id = 1)
create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
insert into site_settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- Daftar akun admin (terhubung ke Supabase Auth)
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- Fungsi ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Menambah hitungan unduhan (dipanggil pengunjung tanpa login)
create or replace function public.increment_download(item_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.downloads set download_count = download_count + 1
  where id = item_id and is_published;
$$;
grant execute on function public.increment_download(uuid) to anon, authenticated;

-- ---------- Row Level Security ----------
alter table projects enable row level security;
alter table messages enable row level security;
alter table downloads enable row level security;
alter table site_settings enable row level security;
alter table admins enable row level security;

-- projects: pengunjung membaca, admin mengelola
drop policy if exists "Allow public read to projects" on projects;
drop policy if exists "projects read" on projects;
drop policy if exists "projects admin write" on projects;
create policy "projects read" on projects for select using (true);
create policy "projects admin write" on projects for all using (public.is_admin()) with check (public.is_admin());

-- messages: pengunjung hanya mengirim, admin membaca & mengelola
drop policy if exists "Allow public insert to messages" on messages;
drop policy if exists "messages public insert" on messages;
drop policy if exists "messages admin all" on messages;
create policy "messages public insert" on messages for insert
  with check (char_length(name) between 1 and 200 and char_length(email) between 3 and 320 and char_length(message) between 1 and 5000);
create policy "messages admin all" on messages for all using (public.is_admin()) with check (public.is_admin());

-- downloads: pengunjung hanya melihat yang dipublikasikan
drop policy if exists "downloads read" on downloads;
drop policy if exists "downloads admin write" on downloads;
create policy "downloads read" on downloads for select using (is_published or public.is_admin());
create policy "downloads admin write" on downloads for all using (public.is_admin()) with check (public.is_admin());

-- site_settings: semua orang membaca, admin mengubah
drop policy if exists "settings read" on site_settings;
drop policy if exists "settings admin write" on site_settings;
create policy "settings read" on site_settings for select using (true);
create policy "settings admin write" on site_settings for all using (public.is_admin()) with check (public.is_admin());

-- admins: akun hanya bisa melihat barisnya sendiri (untuk cek login). Tambah admin hanya lewat SQL Editor.
drop policy if exists "admins read self" on admins;
create policy "admins read self" on admins for select using (user_id = auth.uid());

-- ---------- Storage ----------
-- downloads: file untuk diunduh (maks 50 MB sesuai batas paket gratis Supabase)
-- site-assets: gambar thumbnail proyek (maks 5 MB)
insert into storage.buckets (id, name, public, file_size_limit)
values ('downloads', 'downloads', true, 52428800),
       ('site-assets', 'site-assets', true, 5242880)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "admin storage select" on storage.objects;
drop policy if exists "admin storage insert" on storage.objects;
drop policy if exists "admin storage update" on storage.objects;
drop policy if exists "admin storage delete" on storage.objects;
create policy "admin storage select" on storage.objects for select
  using (bucket_id in ('downloads', 'site-assets') and public.is_admin());
create policy "admin storage insert" on storage.objects for insert
  with check (bucket_id in ('downloads', 'site-assets') and public.is_admin());
create policy "admin storage update" on storage.objects for update
  using (bucket_id in ('downloads', 'site-assets') and public.is_admin());
create policy "admin storage delete" on storage.objects for delete
  using (bucket_id in ('downloads', 'site-assets') and public.is_admin());

-- =====================================================================
-- LANGKAH TERAKHIR (jalankan setelah membuat akun admin):
-- 1) Supabase > Authentication > Users > Add user (isi email + password,
--    centang "Auto Confirm User").
-- 2) Jalankan SQL ini dengan mengganti emailnya:
--
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'EMAIL_ADMIN_ANDA'
--    on conflict do nothing;
--
-- 3) Disarankan: Authentication > Sign In / Providers > matikan
--    "Allow new users to sign up" agar tidak ada yang bisa mendaftar.
-- =====================================================================
