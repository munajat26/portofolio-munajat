# Next.js & Supabase Portfolio

Proyek Web Portofolio modern, elegan, dan profesional berbasis **Next.js (App Router)** dan **Supabase**.

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

## 🖼️ Aset

- Foto profil: simpan sebagai `public/profile.png` (PNG transparan paling bagus).
- Thumbnail proyek: simpan di `public/projects/`, lalu isi kolom `image_url` di tabel `projects` dengan `/projects/nama-file.png` (atau link gambar dari internet).
- Edit nama, statistik, dan link sosial di objek `SITE` pada `src/app/page.tsx`.

## 🔐 Environment Variable

Salin `.env.example` menjadi `.env.local` lalu isi nilainya. File `.env.local` sudah ada di `.gitignore`, jadi tidak ikut ter-upload ke GitHub.

## 📤 Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: portfolio"
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
Deployment managed through GitHub and Vercel.
