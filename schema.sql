-- Create Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  tags text[] not null,
  demo_url text,
  github_url text,
  image_url text,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Messages Table (untuk Contact Form)
create table messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Allow Public Insert for Messages
alter table messages enable row level security;
create policy "Allow public insert to messages" on messages for insert with check (true);

-- Allow Public Read for Projects
alter table projects enable row level security;
create policy "Allow public read to projects" on projects for select using (true);


-- Jika tabel projects sudah dibuat sebelumnya, jalankan ini untuk thumbnail:
-- alter table projects add column if not exists image_url text;
