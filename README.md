# Mun's Project - Website Promo

Website promo **Mun's Project**: tim yang mengerjakan website dan aplikasi untuk klien (sekolah, kampus, inventory & kasir, keuangan, HRD, dan lainnya). Dibangun dengan **Next.js (App Router)** dan **Supabase**.

## 🚀 Cara Menjalankan di Local (VS Code)

1. Extract file `.zip` ini ke komputer Anda.
2. Buka folder proyek ini di **VS Code**.
3. Buka Terminal di VS Code (`Ctrl + ~` atau `Cmd + ~`), lalu jalankan:
   ```bash
   npm install
   ```
4. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
5. Jalankan perintah SQL dari file `schema.sql` di **SQL Editor Supabase**.
6. Atur kredensial Supabase Anda di file `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
7. Jalankan server pengembang:
   ```bash
   npm run dev
   ```
8. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 🔐 Admin Panel

Panel admin ada di **`/admin`** (login di `/admin/login`). Dari sini Anda mengelola:

- **File Download**: upload file (maks 50 MB) atau tempel link Google Drive. File tampil di menu *Download* pada situs.
- **Proyek**: tambah/ubah/hapus karya, termasuk upload thumbnail.
- **Pesan**: baca, balas, dan hapus pesan dari formulir kontak.
- **Pengaturan**: nama brand, tagline, WhatsApp, link menu *Support*, folder Google Drive, statistik beranda, banner promo, dan ganti password admin.

### Menyiapkan admin (sekali saja)

1. Jalankan seluruh isi `schema.sql` di **Supabase > SQL Editor** (aman dijalankan ulang).
2. Buat akun: **Authentication > Users > Add user** (isi email + password, centang *Auto Confirm User*).
3. Daftarkan akun itu sebagai admin dengan menjalankan SQL ini (ganti emailnya):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'EMAIL_ADMIN_ANDA'
   on conflict do nothing;
   ```
4. Disarankan: **Authentication > Sign In / Providers**, matikan *Allow new users to sign up*.
5. Buka `/admin/login` dan masuk.

Keamanan ditegakkan di database (Row Level Security): hanya akun yang ada di tabel `admins` yang bisa mengubah data atau mengupload file. Pengunjung hanya bisa membaca konten yang dipublikasikan dan mengirim pesan.

## 🖼️ Aset

- Thumbnail proyek: simpan di `public/projects/`, lalu isi kolom `image_url` di tabel `projects` dengan `/projects/nama-file.png` (atau link gambar dari internet).
- Nama brand, statistik, nomor WhatsApp, dan link Support kini diatur dari **Admin Panel > Pengaturan** (nilai bawaan ada di `src/lib/settings.ts`).
- Edit daftar layanan di konstanta `SERVICES`, dan alur kerja di `PROCESS`.

## 🔐 Environment Variable

Salin `.env.example` menjadi `.env.local` lalu isi nilainya. File `.env.local` sudah ada di `.gitignore`, jadi tidak ikut ter-upload ke GitHub.

## 📤 Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: Muns Project"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Pastikan `package-lock.json` ikut ter-commit supaya versi paket di Vercel sama dengan di komputer Anda.

## 📦 Deploy ke Vercel

1. Di [vercel.com](https://vercel.com), pilih **Add New > Project**, lalu import repository GitHub tadi.
2. Framework akan terdeteksi otomatis sebagai **Next.js**. Biarkan pengaturan build default.
3. Buka **Environment Variables**, tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (nilainya sama dengan `.env.local`).
4. Klik **Deploy**. Setiap `git push` ke branch `main` akan otomatis di-deploy ulang.

Jika mengubah environment variable setelah deploy, lakukan **Redeploy** agar nilainya terpakai.
