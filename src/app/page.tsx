"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform, useInView, MotionValue } from 'framer-motion';
import { Gift, ArrowRight, ArrowUpRight, Sun, Moon, Code2, Send, CheckCircle2, AlertCircle, GraduationCap, ShoppingCart, Wallet, Users, Landmark, Globe, Smartphone, GitBranch, Database, Server, Terminal, Cpu, SlidersHorizontal, Trophy, Zap, ShieldCheck, Headset } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Project } from '@/types';

// ====== UBAH DATA BRAND DI SINI ======
const SITE = {
  brand: "Mun's Project",
  tagline: 'Web & Application Development',
  whatsapp: 'https://wa.me/6282255679676', // ganti dengan nomor WhatsApp tim (format 62..., tanpa + atau 0 di depan)
  stats: [
    { value: '5+', label: 'Tahun pengalaman' },
    { value: '20+', label: 'Proyek selesai' },
    { value: '10+', label: 'Klien puas' },
  ],
};

const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'Sistem Manajemen Sekolah', description: 'Aplikasi web untuk mengelola administrasi dan akademik sekolah secara terpusat.', tags: ['Next.js', 'React.js', 'Google App Script'], demo_url: 'https://app.sdi-imam-syafii-sangatta.sch.id', featured: true, image_url: 'https://qjipahjpognzmvqbicnv.supabase.co/storage/v1/object/public/uploads/hero/img-ab91b1d0-2ae3-4881-a7b4-3f825ab02648.png' },
  { id: '2', title: 'Website Profil Sekolah', description: 'Website sekolah yang menampilkan profil, galeri, dan kegiatan sekolah.', tags: ['Next.js', 'PostgreSQL', 'Supabase'], demo_url: 'https://sdi-imam-syafii-sangatta.sch.id', featured: true, image_url: 'https://qjipahjpognzmvqbicnv.supabase.co/storage/v1/object/public/uploads/hero/img-e82e1947-4223-4ec2-b153-3818d1536ab2.png' },
  { id: '3', title: 'Web Biro Jodoh Syariah', description: 'Website peserta dan dashboard admin untuk mengelola pendaftar, taaruf, dan proses lainnya.', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], demo_url: 'https://almawaddah.vercel.app', featured: false, image_url: 'https://drive.google.com/file/d/1yPobe0-QMlWwe1OARmdDERL7iILPEFdY/view?usp=sharing' },
  { id: '4', title: 'Bakkah Mart', description: 'Aplikasi kasir dan transaksi cashless untuk Maahad Bakkah Martapura.', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], demo_url: 'https://mart.bakkah.sch.id', featured: false, image_url: 'https://drive.google.com/file/d/1Pjzzl021cau4MO3ek1qB2DJzRgYFxnu-/view?usp=sharing' },
  { id: '5', title: 'Rumina Store', description: 'Toko online perlengkapan busana akhwat.', tags: ['Next.js', 'React.js', 'Supabase'], demo_url: 'https://rumina-store.vercel.app', featured: false, image_url: 'https://drive.google.com/file/d/1TMZgwPjXxBbE-Oq1U-190UFsfPfjiU2e/view?usp=sharing' },
  { id: '6', title: 'KPI Pegawai YSM', description: 'Aplikasi penilaian kinerja pegawai berdasarkan Key Performance Indicators (KPI).', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], demo_url: 'https://kpi.bakkah.sch.id', featured: false, image_url: 'https://drive.google.com/file/d/1X1tOqFouDKgR8VuB7MH_vasubzSkwjV0/view?usp=sharing' },
];

const SERVICES = [
  { name: 'Sistem Sekolah', desc: 'Administrasi, akademik, PPDB, hingga website profil sekolah.', icon: GraduationCap },
  { name: 'Inventory & Kasir', desc: 'Stok barang, transaksi kasir, dan laporan penjualan.', icon: ShoppingCart },
  { name: 'Keuangan', desc: 'Pencatatan kas, tagihan, dan laporan keuangan terpadu.', icon: Wallet },
  { name: 'HRD & Kepegawaian', desc: 'Data pegawai, absensi, penilaian KPI, dan penggajian.', icon: Users },
  { name: 'Sistem Kampus', desc: 'Akademik, data mahasiswa, jadwal, dan layanan kampus.', icon: Landmark },
  { name: 'Web & Aplikasi Custom', desc: 'Company profile, toko online, atau sistem sesuai kebutuhan.', icon: Globe },
];

const REASONS = [
  { t: 'Teknologi Terkini', d: 'Kami memakai Next.js, React, dan Supabase agar aplikasi cepat, modern, dan mudah dikembangkan.', icon: Cpu },
  { t: 'Sesuai Kebutuhan', d: 'Sistem dirancang mengikuti alur kerja Anda, bukan sebaliknya. Tanpa fitur yang tidak diperlukan.', icon: SlidersHorizontal },
  { t: 'Berpengalaman', d: 'Sudah beberapa kali menggarap sistem sekolah, inventory & kasir, keuangan, HRD, dan kampus.', icon: Trophy },
  { t: 'Pengerjaan Efisien', d: 'Alur kerja terstruktur dari konsultasi hingga peluncuran, agar proyek berjalan lancar dan jelas.', icon: Zap },
  { t: 'Aman & Terjamin', d: 'Data dijaga dengan praktik keamanan yang baik, dan setiap sistem diuji sebelum diserahkan.', icon: ShieldCheck },
  { t: 'Pendampingan Lanjutan', d: 'Kami tetap mendampingi setelah rilis: pelatihan, perbaikan, dan pengembangan fitur lanjutan.', icon: Headset },
];

const TECH = ['Next.js', 'React', 'Supabase', 'PostgreSQL', 'Google Apps Script', 'Tailwind CSS'];

const PROCESS = [
  { t: 'Konsultasi', d: 'Kami memahami kebutuhan, alur kerja, dan tujuan Anda.' },
  { t: 'Design', d: 'Kami menyusun struktur, wireframe, dan konsep visual.' },
  { t: 'Develop', d: 'Kami membangun aplikasi yang cepat, responsif, dan rapi.' },
  { t: 'Deliver', d: 'Pengujian, optimasi, dan peluncuran yang mulus.' },
  { t: 'Support', d: 'Pendampingan, pelatihan, dan perbaikan setelah rilis.' },
];

const inputCls = 'w-full rounded-xl border border-fg/15 bg-panel px-4 py-3.5 text-fg shadow-sm placeholder:text-muted/70 transition-all focus:border-crimson focus:outline-none focus:ring-4 focus:ring-crimson/15';

const VIEWS = [
  { id: 'about', label: 'Beranda' },
  { id: 'services', label: 'Layanan' },
  { id: 'why', label: 'Kenapa Kami' },
  { id: 'projects', label: 'Karya' },
  { id: 'contact', label: 'Kontak' },
];
const V = { about: 0, services: 1, why: 2, projects: 3, contact: 4 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;
const TOP = 'pt-[calc(5.5rem+env(safe-area-inset-top))]';
const BOX = 'mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12';

function WhatsappIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
  const base = 'absolute transition-all duration-500';
  return (
    <button type="button" onClick={onToggle} aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-card text-fg shadow-sm transition-all hover:border-crimson hover:text-crimson">
      <Sun size={18} className={`${base} ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} />
      <Moon size={18} className={`${base} ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
    </button>
  );
}

function imageSrc(url?: string | null) {
  if (!url) return null;
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/) || url.match(/[?&]id=([^&]+)/);
  if (url.includes('drive.google.com') && m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200`;
  return url;
}

function CountUp({ value }: { value: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const m = value.match(/^(\d+)(.*)$/);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || !m || reduce) return;
    const target = Number(m[1]);
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1400, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  if (!m || reduce) return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{n}{m[2]}</span>;
}

function usePerPage() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const f = () => setN(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return n;
}

function SectionHead({ title, desc }: { title: React.ReactNode; desc?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-4xl uppercase leading-[1.02] tracking-wide text-fg md:text-5xl">{title}</h2>
      <span aria-hidden className="mt-4 block h-1 w-12 rounded-full bg-crimson" />
      {desc && <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">{desc}</p>}
    </div>
  );
}

/* ---------- Beranda ---------- */
type Tok = [string, string];
const KW = 'text-crimson';
const STR = 'text-emerald-500';
const PROP = 'text-sky-500';
const FN = 'text-amber-500';
const PUN = 'text-fg/70';
const CM = 'italic text-muted';

const CODE: Tok[][] = [
  [["// Mun's Project", CM]],
  [['const ', KW], ['project ', 'text-fg'], ['= {', PUN]],
  [['  type', PROP], [': ', PUN], ['"Web & Aplikasi"', STR], [',', PUN]],
  [['  for', PROP], [': [', PUN], ['"Sekolah"', STR], [', ', PUN], ['"Kampus"', STR], [', ', PUN], ['"Bisnis"', STR], ['],', PUN]],
  [['  stack', PROP], [': [', PUN], ['"Next.js"', STR], [', ', PUN], ['"Supabase"', STR], ['],', PUN]],
  [['  status', PROP], [': ', PUN], ['"Siap online"', STR], [',', PUN]],
  [['};', PUN]],
  [],
  [['await ', KW], ['deliver', FN], ['(project);', PUN]],
];

const TERMINAL: Tok[][] = [
  [['$ ', KW], ['npm run dev', 'text-fg']],
  [['✓ ', STR], ['Ready in 1.2s', 'text-muted']],
];

/* Teks yang "diketik" otomatis lalu diulang */
function TypedLines({ lines, speed = 34, hold = 3200, className = '' }: { lines: Tok[][]; speed?: number; hold?: number; className?: string }) {
  const reduce = useReducedMotion();
  const total = lines.reduce((n, l) => n + l.reduce((m, t) => m + t[0].length, 0) + 1, 0) - 1;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) { setCount(total); return; }
    let c = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (c >= total) {
        timer = setTimeout(() => { c = 0; setCount(0); timer = setTimeout(tick, 500); }, hold);
        return;
      }
      c += 1;
      setCount(c);
      timer = setTimeout(tick, speed);
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [reduce, total, speed, hold]);

  let rem = count;
  return (
    <div className={className}>
      {lines.map((line, li) => {
        const len = line.reduce((m, t) => m + t[0].length, 0);
        const here = rem >= 0 && rem <= len;
        const left = Math.max(0, rem);
        rem -= len + 1;
        let used = 0;
        return (
          <div key={li} className="min-h-[1.55em] whitespace-pre">
            {line.map(([t, c], ti) => {
              const part = t.slice(0, Math.max(0, left - used));
              used += t.length;
              return part ? <span key={ti} className={c}>{part}</span> : null;
            })}
            {here && <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-crimson align-middle motion-safe:animate-pulse" />}
          </div>
        );
      })}
    </div>
  );
}

function CodeEditor() {
  return (
    <div className="card overflow-hidden shadow-2xl">
      <div className="flex items-center border-b border-fg/10 bg-fg/[0.04]">
        <div className="flex gap-1.5 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-fg/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-fg/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-fg/20" />
        </div>
        <span className="border-b-2 border-crimson bg-fg/[0.05] px-3 py-2 font-mono text-[0.625rem] text-fg">project.ts</span>
        <span className="px-3 py-2 font-mono text-[0.625rem] text-muted">schema.sql</span>
      </div>
      <div className="flex gap-3 p-4 font-mono text-[0.6875rem] leading-[1.55] xl:text-xs">
        <div className="select-none text-right text-muted/60">{CODE.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
        <TypedLines lines={CODE} className="min-w-0 flex-1" />
      </div>
      <div className="flex items-center justify-between bg-crimson px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-wider text-white">
        <span>TypeScript</span><span>UTF-8 · Ln 9</span>
      </div>
    </div>
  );
}

function ReactAtom({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="-12 -12 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1" className="motion-safe:animate-[spin_14s_linear_infinite]">
      <circle r="1.8" fill="currentColor" stroke="none" />
      <ellipse rx="10" ry="4" />
      <ellipse rx="10" ry="4" transform="rotate(60)" />
      <ellipse rx="10" ry="4" transform="rotate(120)" />
    </svg>
  );
}

const MINI: Tok[][] = [
  [['const ', KW], ['project ', 'text-fg'], ['= {', PUN]],
  [['  type', PROP], [': ', PUN], ['"Web & Aplikasi"', STR], [',', PUN]],
  [['  status', PROP], [': ', PUN], ['"Siap online"', STR], [',', PUN]],
  [['};', PUN]],
];

/* Mockup responsif: tampilan asli aplikasi di monitor, tablet, dan HP.
   Ukuran bezel & sudut memakai satuan cqw (relatif lebar mockup) agar proporsinya selalu terjaga. */
const cq = (n: number) => `${n}cqw`;

function Screen({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover object-left-top" />;
}

function DeviceShowcase({ reduce }: { reduce: boolean | null }) {
  const float = (delay: number, amp: number, dur: number) =>
    reduce ? {} : { animate: { y: [0, -amp, 0] }, transition: { duration: dur, delay, repeat: Infinity, ease: 'easeInOut' as const } };
  const bezel = 'border-[#1b1c23] bg-[#1b1c23] shadow-2xl ring-1 ring-black/30';
  return (
    <div className="relative w-full [container-type:inline-size]">
      {/* Desktop */}
      <div className="relative" style={{ width: '80%', marginLeft: '5%' }}>
        <div className={`relative border ${bezel}`} style={{ borderWidth: cq(0.8), borderRadius: cq(1.4) }}>
          <span aria-hidden className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/25" style={{ top: cq(-0.5), width: cq(0.4), height: cq(0.4) }} />
          <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9', borderRadius: cq(0.7) }}>
            <Screen src="/showcase/desktop.webp" />
          </div>
        </div>
        <div aria-hidden className="mx-auto bg-gradient-to-b from-neutral-400 to-neutral-600" style={{ width: '9%', height: cq(3.2) }} />
        <div aria-hidden className="mx-auto bg-gradient-to-b from-neutral-300 to-neutral-500 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.5)]" style={{ width: '24%', height: cq(0.9), borderRadius: cq(0.9) }} />
      </div>

      {/* Tablet */}
      <motion.div {...float(0.4, 5, 7)} className="absolute bottom-0 right-0" style={{ width: '25%' }}>
        <div className={`relative overflow-hidden border ${bezel}`} style={{ aspectRatio: '526 / 792', borderWidth: cq(0.9), borderRadius: cq(2.2) }}>
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: cq(1.3) }}><Screen src="/showcase/tablet.webp" /></div>
        </div>
      </motion.div>

      {/* HP */}
      <motion.div {...float(0.9, 6, 6)} className="absolute bottom-0 left-0" style={{ width: '12.5%' }}>
        <div className={`relative overflow-hidden border ${bezel}`} style={{ aspectRatio: '326 / 717', borderWidth: cq(0.6), borderRadius: cq(2.2) }}>
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: cq(1.6) }}><Screen src="/showcase/mobile.webp" /></div>
          <span aria-hidden className="absolute left-1/2 top-[1.6%] z-10 h-[1.2%] w-[28%] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </motion.div>
    </div>
  );
}

/* Versi untuk HP & tablet */
function MobileVisual({ reduce }: { reduce: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none relative px-3 pb-2 lg:hidden [@media(max-height:880px)]:hidden">
      <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} className="mx-auto w-full max-w-[19rem] md:max-w-md">
        <DeviceShowcase reduce={reduce} />
      </motion.div>
    </div>
  );
}

/* Visual desktop */
function HeroVisual({ x, reduce }: { x: MotionValue<number>; reduce: boolean | null }) {
  const enter = (delay: number, y = 24) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });
  const float = (delay: number, amp = 8, dur = 6) =>
    reduce ? {} : { animate: { y: [0, -amp, 0] }, transition: { duration: dur, delay, repeat: Infinity, ease: 'easeInOut' as const } };

  return (
    <motion.div aria-hidden style={{ x: reduce ? 0 : x }} className="pointer-events-none relative hidden w-full max-w-[40rem] lg:block">
      <div className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" className="h-full w-full text-crimson/25 motion-safe:animate-[spin_60s_linear_infinite]">
          <circle cx="200" cy="200" r="190" strokeDasharray="2 8" strokeLinecap="round" />
          <circle cx="390" cy="200" r="4" className="fill-crimson" stroke="none" />
          <circle cx="50" cy="200" r="3" className="fill-crimson" stroke="none" />
        </svg>
      </div>

      <motion.div {...enter(0.3, 30)}><DeviceShowcase reduce={reduce} /></motion.div>

      <motion.div {...enter(0.9)} className="absolute -left-5 -top-8">
        <motion.div {...float(0.2, 9, 6.5)} className="glass-card flex h-14 w-14 items-center justify-center !rounded-full text-sky-400"><ReactAtom size={30} /></motion.div>
      </motion.div>

      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
        <motion.div {...enter(1.3)}>
          <motion.div {...float(0.6, 6, 6.5)} className="glass-card flex items-center gap-2 whitespace-nowrap !rounded-full px-4 py-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-fg">
            <Smartphone size={13} className="text-crimson" /> Desktop · Tablet · Mobile
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function PromoBanner({ onClaim, reduce }: { onClaim: () => void; reduce: boolean | null }) {
  return (
    <motion.button type="button" onClick={onClaim} initial={reduce ? false : { opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: EASE }} className="group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border border-crimson/30 bg-gradient-to-r from-crimson/15 via-crimson/[0.06] to-transparent p-3 pr-4 text-left shadow-sm transition-all duration-300 hover:border-crimson/60 lg:col-span-12 lg:w-fit lg:pr-7">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgb(var(--crimson)/0.7)] md:h-12 md:w-12">
        <Gift size={22} strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-crimson">
          Promo <span className="rounded-full bg-crimson px-2 py-0.5 text-[0.625rem] tracking-wider text-white">7 hari</span>
        </span>
        <span className="mt-0.5 block text-sm font-semibold text-fg md:text-base">Free trial website selama 7 hari</span>
        <span className="block text-xs text-muted">Plus konsultasi gratis. Coba dulu, puas baru lanjut.</span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-crimson transition-transform duration-300 group-hover:translate-x-1" />
    </motion.button>
  );
}

function Hero({ go, onPromo }: { go: (i: number) => void; onPromo: () => void }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const px = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
  };
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section onMouseMove={onMove} className="relative isolate h-full overflow-hidden">
      <div className={`${BOX} relative z-10 flex h-full flex-col justify-start gap-5 pb-6 ${TOP} lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-10 lg:gap-y-8 lg:pb-10`}>
        <PromoBanner onClaim={onPromo} reduce={reduce} />
        <MobileVisual reduce={reduce} />

        <div className="lg:col-span-6">
          <motion.p {...rise(0.05)} className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-card px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-crimson" /> {SITE.tagline}
          </motion.p>
          <motion.h1 {...rise(0.15)} className="mt-5 font-display text-4xl uppercase leading-[1.02] tracking-wide text-fg sm:text-6xl xl:text-7xl">
            Kami bangun <span className="text-crimson">website &amp; aplikasi</span> sesuai kebutuhan Anda
          </motion.h1>
          <motion.p {...rise(0.3)} className="mt-5 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            Untuk sekolah, kampus, bisnis, hingga instansi. Dari sistem sekolah, inventory &amp; kasir, keuangan, sampai HRD, semuanya dirancang rapi, cepat, dan mudah dipakai.
          </motion.p>
          <motion.div {...rise(0.45)} className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <button type="button" onClick={() => go(V.contact)} className="btn-primary group gap-2 px-7 py-3.5 text-sm">
              Konsultasi gratis <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button type="button" onClick={() => go(V.projects)} className="btn-ghost px-6 py-3.5 text-sm">Lihat karya kami</button>
          </motion.div>
          <motion.p {...rise(0.52)} className="mt-3 flex items-center gap-1.5 text-xs text-muted"><CheckCircle2 size={14} className="text-emerald-500" /> Konsultasi gratis, tanpa biaya. Ceritakan kebutuhan Anda.</motion.p>
          <motion.dl {...rise(0.6)} className="mt-7 flex items-center gap-6 border-t border-fg/10 pt-5 sm:gap-8">
            {SITE.stats.map((s, i) => (
              <div key={s.label} className={i > 0 ? 'border-l border-fg/15 pl-6 sm:pl-8' : ''}>
                <dd className="font-display text-3xl text-crimson md:text-4xl"><CountUp value={s.value} /></dd>
                <dt className="text-[0.625rem] uppercase tracking-[0.12em] text-muted sm:text-[0.6875rem]">{s.label}</dt>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="hidden items-center justify-center lg:col-span-6 lg:flex">
          <HeroVisual x={px} reduce={reduce} />
        </div>
      </div>
    </section>
  );
}

/* ---------- Proyek ---------- */
const LIMIT = 6;

function ProjectsView({ projects, loading }: { projects: Project[]; loading: boolean }) {
  const cols = usePerPage();
  const compact = cols === 1;
  const [expanded, setExpanded] = useState(false);
  const sorted = [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const hasMore = sorted.length > LIMIT;
  const shown = expanded ? sorted : sorted.slice(0, LIMIT);
  const rows = Math.ceil(LIMIT / cols);

  const thumb = (proj: Project, big: boolean) =>
    proj.image_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageSrc(proj.image_url) ?? ''} referrerPolicy="no-referrer" alt={`Thumbnail ${proj.title}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-crimson/30 via-panel to-panel">
        <span className={`font-display uppercase text-fg/20 ${big ? 'text-6xl' : 'text-3xl'}`}>{proj.title.slice(0, 2)}</span>
      </div>
    );
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    ...(expanded ? {} : { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }),
  };

  return (
    <div className={`${BOX} flex flex-col pb-4 ${TOP} ${expanded ? 'min-h-full' : 'h-full'}`}>
      <div className="flex shrink-0 items-end justify-between gap-4">
        <SectionHead title="Karya kami" desc="Sebagian sistem dan website yang telah kami kerjakan." />
        <span className="shrink-0 rounded-full border border-fg/15 bg-card px-3.5 py-1.5 text-xs font-semibold text-muted shadow-sm">{sorted.length} proyek</span>
      </div>

      {loading ? (
        <div className={compact ? 'mt-4 space-y-2.5' : 'mt-5 grid min-h-0 flex-1 gap-6'} style={compact ? undefined : gridStyle} aria-busy="true">
          {Array.from({ length: compact ? 4 : LIMIT }).map((_, i) => <div key={i} className={`animate-pulse rounded-2xl bg-fg/10 ${compact ? 'h-16' : ''}`} />)}
        </div>
      ) : compact ? (
        <ul className="mt-4 flex flex-col gap-2.5">
          {shown.map((proj, i) => {
            const href = proj.demo_url;
            return (
              <motion.li key={proj.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % LIMIT) * 0.07, duration: 0.5, ease: EASE }} className="group card flex items-center gap-3 p-2">
                <a href={href} target="_blank" rel="noreferrer" aria-label={`Buka ${proj.title}`} className="block w-24 shrink-0 overflow-hidden rounded-md">
                  <div className="aspect-[16/10] overflow-hidden">{thumb(proj, false)}</div>
                </a>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[0.8125rem] font-semibold uppercase leading-tight tracking-wide text-fg">{proj.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[0.6875rem] leading-snug text-muted">{proj.description}</p>
                  <p className="mt-1 line-clamp-1 text-[0.625rem] uppercase tracking-[0.08em] text-muted">{proj.tags.join(' · ')}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <ul className={`mt-5 grid gap-x-6 gap-y-5 lg:gap-x-8 ${expanded ? '' : 'min-h-0 flex-1'}`} style={gridStyle}>
          {shown.map((proj, i) => {
            const href = proj.demo_url;
            return (
              <motion.li key={proj.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % LIMIT) * 0.06, duration: 0.55, ease: EASE }} className="group card card-hover flex min-h-0 min-w-0 flex-col p-2.5">
                <a href={href} target="_blank" rel="noreferrer" className={`relative block overflow-hidden rounded-xl ${expanded ? 'aspect-[16/10]' : 'min-h-0 flex-1'}`}>
                  <div className="absolute inset-0 overflow-hidden">{thumb(proj, true)}</div>
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span aria-hidden className="absolute right-3 top-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-crimson text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={16} /></span>
                </a>
                <div className="mt-3 flex shrink-0 items-start gap-3 px-1.5 pb-1">
                  <span className="font-display text-3xl leading-none text-crimson">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-sm font-semibold uppercase tracking-wide text-fg transition-colors duration-300 group-hover:text-crimson">{proj.title}</h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{proj.description}</p>
                    <div className="mt-1.5 flex max-h-6 flex-wrap gap-1.5 overflow-hidden">{proj.tags.map((t) => <span key={t} className="whitespace-nowrap rounded-md bg-fg/[0.07] px-2 py-0.5 text-[0.6875rem] font-medium text-muted">{t}</span>)}</div>
                  </div>
                  </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      {hasMore && !loading && (
        <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="mt-4 shrink-0 self-center py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted underline decoration-fg/30 underline-offset-8 transition-colors hover:text-fg hover:decoration-crimson">
          {expanded ? 'Tampilkan lebih sedikit' : `Tampilkan lainnya (${sorted.length - LIMIT})`}
        </button>
      )}
    </div>
  );
}

/* ---------- Layanan ---------- */
function ServicesView({ go }: { go: (i: number) => void }) {
  return (
    <div className={`${BOX} flex min-h-full flex-col justify-center gap-6 pb-8 ${TOP} lg:gap-8`}>
      <SectionHead title="Layanan kami" desc="Solusi digital yang sudah beberapa kali kami kerjakan untuk sekolah, kampus, bisnis, dan instansi." />
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {SERVICES.map((s) => (
              <div key={s.name} className="group card card-hover flex items-start gap-3.5 p-4 sm:block md:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson/10 ring-1 ring-crimson/25"><s.icon size={20} className="text-crimson transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" strokeWidth={1.75} /></span>
                <div className="sm:mt-3.5">
                  <p className="text-sm font-semibold text-fg md:text-[0.9375rem]">{s.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted md:text-[0.8125rem]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-5">
            <span className="mr-1 text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-muted">Teknologi</span>
            {TECH.map((t) => (
              <span key={t} className="rounded-full border border-fg/15 bg-card px-3 py-1 text-[0.6875rem] font-medium text-fg shadow-sm">{t}</span>
            ))}
          </div>
        </div>

        <aside className="card p-5 md:p-6 lg:col-span-4">
          <h3 className="font-display text-xl uppercase tracking-wide text-fg">Alur kerja</h3>
          <ol className="mt-4">
            {PROCESS.map((p, i) => (
              <li key={p.t} className="relative flex gap-4 pb-4 last:pb-0">
                {i < PROCESS.length - 1 && <span aria-hidden className="absolute bottom-0 left-3.5 top-8 w-px bg-fg/15" />}
                <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-crimson text-xs font-semibold text-white">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-fg">{p.t}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted md:text-[0.8125rem]">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => go(V.contact)} className="btn-primary group mt-5 w-full gap-2 px-5 py-3 text-sm">
            Konsultasi gratis <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Kenapa Kami ---------- */
function WhyView({ go }: { go: (i: number) => void }) {
  return (
    <div className={`${BOX} flex min-h-full flex-col justify-center gap-6 pb-8 ${TOP} lg:grid lg:grid-cols-12 lg:items-center lg:gap-12`}>
      <div className="lg:col-span-4">
        <SectionHead title={<>Kenapa pilih <span className="text-crimson">Mun&apos;s Project</span>?</>} desc="Alasan Anda bisa mempercayakan website dan sistem Anda kepada kami sebagai mitra pengembangan." />
        <button type="button" onClick={() => go(V.contact)} className="btn-primary group mt-6 gap-2 px-6 py-3 text-sm">
          Konsultasi gratis <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:col-span-8">
        {REASONS.map((r, i) => (
          <motion.li key={r.t} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.55, ease: EASE }} className="group card card-hover flex items-start gap-4 p-4 md:p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson/10 ring-1 ring-crimson/25"><r.icon size={20} className="text-crimson transition-transform duration-300 group-hover:scale-110" strokeWidth={1.75} /></span>
            <div>
              <h3 className="text-sm font-semibold text-fg md:text-base">{r.t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted md:text-[0.8125rem]">{r.d}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Kontak ---------- */
type FormState = { type: 'idle' | 'loading' | 'success' | 'error'; text?: string };

function ContactView({ formData, setFormData, formStatus, onSubmit }: {
  formData: { name: string; email: string; message: string };
  setFormData: (d: { name: string; email: string; message: string }) => void;
  formStatus: FormState;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className={`${BOX} grid h-full content-center gap-5 pb-4 ${TOP} md:grid-cols-12 md:items-center md:gap-12`}>
      <div className="md:col-span-5">
        <SectionHead title={<>Mari bekerja <span className="text-crimson">bersama</span></>} desc="Ceritakan kebutuhan website atau sistem Anda. Pesan akan tersimpan langsung ke database dan tim kami akan membalasnya lewat email atau WhatsApp." />
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={14} /> Konsultasi gratis, tanpa biaya</p>
        <a href={SITE.whatsapp} target="_blank" rel="noreferrer" className="btn-ghost mt-4 gap-2 px-5 py-3 text-sm md:mt-5"><WhatsappIcon size={18} /> Chat via WhatsApp</a>
      </div>

      <form onSubmit={onSubmit} className="card space-y-3 p-5 md:col-span-7 md:space-y-4 md:p-8">
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-fg">Nama lengkap</label>
            <input id="name" type="text" required autoComplete="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="Nama Anda" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-fg">Alamat email</label>
            <input id="email" type="email" required autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} placeholder="nama@email.com" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="message" className="text-sm font-medium text-fg">Pesan</label>
          <textarea id="message" required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={`${inputCls} resize-none`} placeholder="Tuliskan kebutuhan proyek Anda..." />
        </div>
        <div role="status" aria-live="polite">
          {formStatus.text && (
            <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${formStatus.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'}`}>
              {formStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {formStatus.text}
            </div>
          )}
        </div>
        <button type="submit" disabled={formStatus.type === 'loading'} className="btn-primary w-full gap-2 px-7 py-3.5 text-sm disabled:opacity-60 sm:w-auto">
          {formStatus.type === 'loading' ? 'Mengirim...' : (<><Send size={16} /> Kirim pesan</>)}
        </button>
      </form>
    </div>
  );
}

/* ---------- Halaman (SPA) ---------- */
export default function Home() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') setTheme(t);
  }, []);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.add('theme-anim');
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
    setTheme(next);
    setTimeout(() => root.classList.remove('theme-anim'), 500);
  };
  const [dir, setDir] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<FormState>({ type: 'idle' });

  const go = (i: number) => {
    setMenuOpen(false);
    const n = Math.max(0, Math.min(VIEWS.length - 1, i));
    if (n === idx) return;
    setDir(n > idx ? 1 : -1);
    setIdx(n);
    history.replaceState(null, '', `#${VIEWS[n].id}`);
  };

  const claimPromo = () => {
    setFormData((f) => (f.message ? f : { ...f, message: 'Halo, saya tertarik dengan promo free trial website 7 hari.' }));
    go(V.contact);
  };

  useEffect(() => {
    const i = VIEWS.findIndex((v) => `#${v.id}` === window.location.hash);
    if (i > 0) setIdx(i);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(t.tagName)) return;
      if (e.key === 'ArrowRight') go(idx + 1);
      if (e.key === 'ArrowLeft') go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    (async () => {
      try {
        if (!isSupabaseConfigured) { setProjects(MOCK_PROJECTS); return; }
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        setProjects(error || !data || data.length === 0 ? MOCK_PROJECTS : data);
      } catch {
        setProjects(MOCK_PROJECTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: 'loading' });
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (res.ok) {
        setFormStatus({ type: 'success', text: 'Pesan Anda telah berhasil terkirim!' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormStatus({ type: 'error', text: result.error || 'Terjadi kesalahan.' });
      }
    } catch {
      setFormStatus({ type: 'error', text: 'Gagal menghubungkan ke server.' });
    }
  };

  const shift = reduce ? 0 : 60;
  const slide = {
    enter: (d: number) => ({ opacity: 0, x: d * shift }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -shift }),
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(50%_70%_at_15%_0%,var(--glow1),transparent_70%),radial-gradient(40%_60%_at_88%_0%,var(--glow2),transparent_70%)]" />
      <div aria-hidden className="bg-dots pointer-events-none absolute inset-x-0 top-0 h-[32rem]" />
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-40 border-b border-fg/15 bg-glass pt-[env(safe-area-inset-top)] shadow-[var(--glass-shadow)] backdrop-blur-2xl backdrop-saturate-[1.8]">
        <div className={`${BOX} flex h-16 items-center justify-between text-[0.6875rem] font-medium uppercase tracking-[0.18em]`}>
          <button type="button" onClick={() => go(0)} className="flex items-center gap-3 text-left" aria-label="Ke beranda">
            <span aria-hidden className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-crimson to-crimson/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-6px_var(--glow1)] ring-1 ring-white/15 transition-transform duration-300 hover:scale-105">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                <path d="M8 7l-5 5 5 5" />
                <path d="M16 7l5 5-5 5" />
                <path d="M13.5 5.5l-3 13" />
              </svg>
            </span>
            <span className="hidden whitespace-nowrap sm:block">
              <p className="text-fg">{SITE.brand}</p>
              <p className="text-muted">Web &amp; App Studio</p>
            </span>
          </button>
          <nav className="hidden items-center gap-1 rounded-full border border-fg/10 bg-fg/[0.06] p-1 md:flex" aria-label="Menu utama">
            {VIEWS.map((v, i) => (
              <button key={v.id} type="button" onClick={() => go(i)} aria-current={idx === i ? 'page' : undefined} className={`whitespace-nowrap rounded-full px-3 py-2 transition-all duration-300 lg:px-4 ${idx === i ? 'bg-panel text-fg shadow-md ring-1 ring-fg/10' : 'text-muted hover:bg-fg/10 hover:text-fg'}`}>
                {v.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
          <button type="button" onClick={() => go(V.contact)} className="hidden items-center gap-2.5 whitespace-nowrap rounded-full border border-fg/15 bg-card px-4 py-2.5 text-fg shadow-sm transition-colors hover:border-crimson lg:flex">
            Terima proyek baru <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" /></span>
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-controls="menu-seluler" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-card text-fg shadow-sm transition-colors hover:border-crimson md:hidden">
            <span aria-hidden className={`absolute h-px w-5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span aria-hidden className={`absolute h-px w-5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span aria-hidden className={`absolute h-px w-5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
          </div>
        </div>
      </header>

      {/* Menu hamburger (HP) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div id="menu-seluler" role="dialog" aria-modal="true" aria-label="Menu" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.5, ease: EASE }} className="fixed inset-0 z-30 flex flex-col justify-between overflow-hidden bg-ink px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(5.5rem+env(safe-area-inset-top))] md:hidden">
            <span aria-hidden className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-crimson/20 blur-3xl" />
            <ul className="relative">
              {VIEWS.map((v, i) => (
                <li key={v.id} className="border-b border-fg/10 first:border-t">
                  <motion.button type="button" onClick={() => go(i)} aria-current={idx === i ? 'page' : undefined} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: EASE }} className="flex w-full items-center gap-4 py-3.5 text-left">
                    <span className={`font-display text-3xl uppercase leading-none tracking-wide transition-colors ${idx === i ? 'text-fg' : 'text-fg/40 active:text-fg'}`}>{v.label}</span>
                    {idx === i && <span aria-hidden className="ml-auto h-2 w-2 self-center rounded-full bg-crimson" />}
                  </motion.button>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5, ease: EASE }} className="relative">
              <button type="button" onClick={() => go(V.contact)} className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-fg">
                Terima proyek baru <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
              </button>
              <div className="mt-5 flex items-center gap-2">
                <a href={SITE.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 transition-colors hover:border-crimson hover:text-crimson"><WhatsappIcon size={18} /></a>
                <span className="ml-auto text-xs text-muted">© {new Date().getFullYear()} {SITE.brand}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konten: satu layar, pindah antar tampilan */}
      <main className="absolute inset-x-0 top-0 bottom-[env(safe-area-inset-bottom)]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={idx} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: EASE }} className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {idx === 0 && <Hero go={go} onPromo={claimPromo} />}
            {idx === 1 && <ServicesView go={go} />}
            {idx === V.why && <WhyView go={go} />}
            {idx === V.projects && <ProjectsView projects={projects} loading={loading} />}
            {idx === V.contact && <ContactView formData={formData} setFormData={setFormData} formStatus={formStatus} onSubmit={handleSubmit} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
