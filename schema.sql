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

-- Folder/direktori untuk mengelompokkan file per proyek
create table if not exists download_folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- File yang bisa diunduh pengunjung (upload ke Storage atau link Google Drive)
create table if not exists downloads (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references download_folders(id) on delete set null,
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

-- Untuk database yang sudah punya tabel downloads sebelumnya:
alter table downloads add column if not exists folder_id uuid references download_folders(id) on delete set null;

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

-- Statistik pengunjung: satu baris per kunjungan halaman (tanpa data pribadi)
create table if not exists page_views (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  path text not null,
  referrer text,
  device text,
  created_at timestamp with time zone default now() not null
);
create index if not exists page_views_created_idx on page_views (created_at desc);
create index if not exists page_views_visitor_idx on page_views (visitor_id, created_at);

-- Rekening / e-wallet / QRIS untuk halaman Support
create table if not exists payment_accounts (
  id uuid default gen_random_uuid() primary key,
  kind text not null default 'bank' check (kind in ('bank', 'ewallet', 'qris')),
  name text not null,
  label text,
  account_number text not null,
  holder text,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------- Fungsi statistik pengunjung ----------
-- Mencatat kunjungan (dipanggil pengunjung tanpa login). Halaman /admin tidak dicatat.
create or replace function public.track_visit(p_visitor text, p_path text, p_referrer text default null, p_device text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor is null or char_length(p_visitor) not between 8 and 64 then return; end if;
  if p_path is null or char_length(p_path) > 300 or left(p_path, 1) <> '/' then return; end if;
  if left(p_path, 6) = '/admin' then return; end if;
  insert into public.page_views (visitor_id, path, referrer, device)
  values (
    p_visitor,
    p_path,
    nullif(left(p_referrer, 200), ''),
    case when p_device in ('mobile', 'tablet', 'desktop') then p_device else null end
  );
end;
$$;
grant execute on function public.track_visit(text, text, text, text) to anon, authenticated;

-- Ringkasan statistik untuk Admin Panel (hanya admin). Zona waktu: WITA (Asia/Makassar).
create or replace function public.get_visit_stats(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tz constant text := 'Asia/Makassar';
  d integer := greatest(1, least(coalesce(p_days, 30), 365));
  today date := (now() at time zone tz)::date;
  t0 timestamptz := (today::timestamp at time zone tz);
  start_ts timestamptz := ((today - (d - 1))::timestamp at time zone tz);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select jsonb_build_object(
    'online_now', (select count(distinct visitor_id) from page_views where created_at >= now() - interval '5 minutes'),
    'today', (select jsonb_build_object('views', count(*), 'visitors', count(distinct visitor_id)) from page_views where created_at >= t0),
    'last7', (select jsonb_build_object('views', count(*), 'visitors', count(distinct visitor_id)) from page_views where created_at >= t0 - interval '6 days'),
    'last30', (select jsonb_build_object('views', count(*), 'visitors', count(distinct visitor_id)) from page_views where created_at >= t0 - interval '29 days'),
    'total', (select jsonb_build_object('views', count(*), 'visitors', count(distinct visitor_id)) from page_views),
    'period', (select jsonb_build_object('views', count(*), 'visitors', count(distinct visitor_id)) from page_views where created_at >= start_ts),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('date', to_char(g.day, 'YYYY-MM-DD'), 'views', coalesce(a.views, 0), 'visitors', coalesce(a.visitors, 0)) order by g.day), '[]'::jsonb)
      from generate_series((today - (d - 1))::timestamp, today::timestamp, interval '1 day') as g(day)
      left join (
        select (created_at at time zone tz)::date as day, count(*) as views, count(distinct visitor_id) as visitors
        from page_views where created_at >= start_ts group by 1
      ) a on a.day = g.day::date
    ),
    'pages', (
      select coalesce(jsonb_agg(x order by x.views desc), '[]'::jsonb) from (
        select path, count(*) as views, count(distinct visitor_id) as visitors
        from page_views where created_at >= start_ts group by path order by count(*) desc limit 8
      ) x
    ),
    'referrers', (
      select coalesce(jsonb_agg(x order by x.views desc), '[]'::jsonb) from (
        select coalesce(referrer, 'Langsung / tanpa referrer') as source, count(*) as views
        from page_views where created_at >= start_ts group by 1 order by count(*) desc limit 8
      ) x
    ),
    'devices', (
      select coalesce(jsonb_agg(x order by x.views desc), '[]'::jsonb) from (
        select coalesce(device, 'lainnya') as device, count(*) as views
        from page_views where created_at >= start_ts group by 1
      ) x
    )
  ) into result;

  return result;
end;
$$;
grant execute on function public.get_visit_stats(integer) to authenticated;

-- ---------- Row Level Security ----------
alter table projects enable row level security;
alter table messages enable row level security;
alter table downloads enable row level security;
alter table download_folders enable row level security;
alter table site_settings enable row level security;
alter table admins enable row level security;
alter table page_views enable row level security;
alter table payment_accounts enable row level security;

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

-- download_folders: semua orang membaca, admin mengelola
drop policy if exists "folders read" on download_folders;
drop policy if exists "folders admin write" on download_folders;
create policy "folders read" on download_folders for select using (true);
create policy "folders admin write" on download_folders for all using (public.is_admin()) with check (public.is_admin());

-- site_settings: semua orang membaca, admin mengubah
drop policy if exists "settings read" on site_settings;
drop policy if exists "settings admin write" on site_settings;
create policy "settings read" on site_settings for select using (true);
create policy "settings admin write" on site_settings for all using (public.is_admin()) with check (public.is_admin());

-- admins: akun hanya bisa melihat barisnya sendiri (untuk cek login). Tambah admin hanya lewat SQL Editor.
drop policy if exists "admins read self" on admins;
create policy "admins read self" on admins for select using (user_id = auth.uid());

-- page_views: tidak ada akses langsung bagi pengunjung (hanya lewat fungsi track_visit). Admin boleh membaca.
drop policy if exists "page_views admin read" on page_views;
create policy "page_views admin read" on page_views for select using (public.is_admin());

-- payment_accounts: pengunjung hanya melihat yang dipublikasikan, admin mengelola
drop policy if exists "payments read" on payment_accounts;
drop policy if exists "payments admin write" on payment_accounts;
create policy "payments read" on payment_accounts for select using (is_published or public.is_admin());
create policy "payments admin write" on payment_accounts for all using (public.is_admin()) with check (public.is_admin());

-- Data awal halaman Support (hanya diisi jika tabel masih kosong; ubah dari Admin Panel > Rekening)
insert into payment_accounts (kind, name, label, account_number, holder, sort_order)
select * from (values
  ('bank',    'BANK BSI',   'BISNIS',    '5384254780',      'MUNAJAT SIRRI', 1),
  ('ewallet', 'GoPay',      'E-WALLET',  '082256354006',    'MUNAJAT SIRRI', 2),
  ('ewallet', 'ShopeePay',  'MERCHANT',  '082255679676',    'MUNAJAT SIRRI', 3),
  ('ewallet', 'ShopeePay',  'E-WALLET',  '087786943187',    'MUNAJAT SIRRI', 4),
  ('qris',    'QRIS All Payment', 'QRIS', 'ID1026632010975', 'MUNAJAT SIRRI', 5)
) as v(kind, name, label, account_number, holder, sort_order)
where not exists (select 1 from payment_accounts);

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
