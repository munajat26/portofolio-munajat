import { Project } from '@/types';

// Proyek contoh. Dipakai situs jika tabel projects masih kosong,
// dan bisa diimpor ke database lewat Admin Panel > Proyek.
export const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'Sistem Manajemen Sekolah', description: 'Aplikasi web untuk mengelola administrasi dan akademik sekolah secara terpusat.', tags: ['Next.js', 'React.js', 'Google App Script'], demo_url: 'https://app.sdi-imam-syafii-sangatta.sch.id', featured: true, image_url: 'https://qjipahjpognzmvqbicnv.supabase.co/storage/v1/object/public/uploads/hero/img-ab91b1d0-2ae3-4881-a7b4-3f825ab02648.png' },
  { id: '2', title: 'Website Profil Sekolah', description: 'Website sekolah yang menampilkan profil, galeri, dan kegiatan sekolah.', tags: ['Next.js', 'PostgreSQL', 'Supabase'], demo_url: 'https://sdi-imam-syafii-sangatta.sch.id', featured: true, image_url: 'https://qjipahjpognzmvqbicnv.supabase.co/storage/v1/object/public/uploads/hero/img-e82e1947-4223-4ec2-b153-3818d1536ab2.png' },
  { id: '3', title: 'Web Biro Jodoh Syariah', description: 'Website peserta dan dashboard admin untuk mengelola pendaftar, taaruf, dan proses lainnya.', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], demo_url: 'https://almawaddah.vercel.app', featured: false, image_url: 'https://drive.google.com/file/d/1yPobe0-QMlWwe1OARmdDERL7iILPEFdY/view?usp=sharing' },
  { id: '4', title: 'Bakkah Mart', description: 'Aplikasi kasir dan transaksi cashless untuk Maahad Bakkah Martapura.', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], demo_url: 'https://mart.bakkah.sch.id', featured: false, image_url: 'https://drive.google.com/file/d/1Pjzzl021cau4MO3ek1qB2DJzRgYFxnu-/view?usp=sharing' },
  { id: '5', title: 'Rumina Store', description: 'Toko online perlengkapan busana akhwat.', tags: ['Next.js', 'React.js', 'Supabase'], demo_url: 'https://rumina-store.vercel.app', featured: false, image_url: 'https://drive.google.com/file/d/1TMZgwPjXxBbE-Oq1U-190UFsfPfjiU2e/view?usp=sharing' },
  { id: '6', title: 'KPI Pegawai YSM', description: 'Aplikasi penilaian kinerja pegawai berdasarkan Key Performance Indicators (KPI).', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], demo_url: 'https://kpi.bakkah.sch.id', featured: false, image_url: 'https://drive.google.com/file/d/1X1tOqFouDKgR8VuB7MH_vasubzSkwjV0/view?usp=sharing' },
];
