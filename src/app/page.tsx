"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { Github, ArrowRight, ArrowUpRight, Sun, Moon, Database, Code2, Layers, Terminal, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Project } from '@/types';

// ====== UBAH DATA PRIBADI DI SINI ======
const SITE = {
  firstName: 'munajat',
  lastName: '',
  role: 'Full-Stack Web Developer',
  photo: '/profile.png', // taruh foto (PNG transparan paling bagus) di folder public/
  github: 'https://github.com',
  whatsapp: 'https://wa.me/6282255679676', // ganti dengan nomor WhatsApp Anda (format 62..., tanpa + atau 0 di depan)
  stats: [
    { value: '5+', label: 'Tahun pengalaman' },
    { value: '20+', label: 'Proyek selesai' },
    { value: '10+', label: 'Klien puas' },
  ],
};

const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'Shool Web App Management', description: 'Web App untuk mengelola Administrasi & Akademik Sekolah.', tags: ['Next.js', 'React.js', 'Google App Script'], github_url: 'https://github.com/munajat26', demo_url: 'https://app.sdi-imam-syafii-sangatta.sch.id', featured: true, image_url: 'https://qjipahjpognzmvqbicnv.supabase.co/storage/v1/object/public/uploads/hero/img-ab91b1d0-2ae3-4881-a7b4-3f825ab02648.png' },
  { id: '2', title: 'Shool Landing Page Web', description: 'Web Sekolah yang menampilkan profil sekolah, galeri, kegiatan sekolah dan yang lainnya.', tags: ['Next.js', 'PostgreSQL', 'Supabase'], github_url: 'https://github.com/munajat26', demo_url: 'https://sdi-imam-syafii-sangatta.sch.id', featured: true, image_url: 'https://qjipahjpognzmvqbicnv.supabase.co/storage/v1/object/public/uploads/hero/img-e82e1947-4223-4ec2-b153-3818d1536ab2.png' },
  { id: '3', title: 'Web Biro Jodoh Syariah', description: 'Web untuk menampilkan peserta biro jodoh syariah dan admin panel dashboard untuk mengelola pendaftar, taaruf dan proses lainnya.', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], github_url: 'https://github.com/munajat26', demo_url: 'https://almawaddah.vercel.app', featured: false, image_url: 'https://drive.google.com/file/d/1yPobe0-QMlWwe1OARmdDERL7iILPEFdY/view?usp=sharing' },
  { id: '4', title: 'Bakkah Mart', description: 'Web App untuk Transaksi Cashless di Maahad Bakkah Martapura', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], github_url: 'https://github.com/munajat26', demo_url: 'https://mart.bakkah.sch.id', featured: false, image_url: 'https://drive.google.com/file/d/1Pjzzl021cau4MO3ek1qB2DJzRgYFxnu-/view?usp=sharing' },
  { id: '5', title: 'Rumina Store', description: 'Web untuk online shoping, khusus untuk perlengkapan busana akhwat.', tags: ['Next.js', 'React.js', 'Supabase'], github_url: 'https://github.com/munajat26', demo_url: 'https://rumina-store.vercel.app', featured: false, image_url: 'https://drive.google.com/file/d/1TMZgwPjXxBbE-Oq1U-190UFsfPfjiU2e/view?usp=sharing' },
  { id: '6', title: 'KPI Pegawai YSM', description: 'Web untuk melakukan penilaian kinerja berdasarkan Key Performance Indicators (KPI) yang telah ditentukan.', tags: ['Next.js', 'Google App Script', 'Google Spreadsheet'], github_url: 'https://github.com', demo_url: 'https://kpi.bakkah.sch.id', featured: false, image_url: 'https://drive.google.com/file/d/1X1tOqFouDKgR8VuB7MH_vasubzSkwjV0/view?usp=sharing' },
];

const SKILLS = [
  { name: 'Front-End', desc: 'HTML, CSS & JavaScript', icon: Code2 },
  { name: 'Back-End', desc: 'Logika server & REST API', icon: Terminal },
  { name: 'Database', desc: 'SQL & manajemen data', icon: Database },
  { name: 'Responsive UI', desc: 'Rapi di semua perangkat', icon: Layers },
];

const PROCESS = [
  { t: 'Discover', d: 'Memahami kebutuhan, audiens, dan tujuan proyek.' },
  { t: 'Design', d: 'Menyusun struktur, wireframe, dan konsep visual.' },
  { t: 'Develop', d: 'Membangun aplikasi yang cepat, responsif, dan rapi.' },
  { t: 'Deliver', d: 'Pengujian, optimasi, dan peluncuran yang mulus.' },
];

const inputCls = 'w-full rounded-xl border border-fg/15 bg-panel px-4 py-3.5 text-fg shadow-sm placeholder:text-muted/70 transition-all focus:border-crimson focus:outline-none focus:ring-4 focus:ring-crimson/15';

const VIEWS = [
  { id: 'about', label: 'Beranda' },
  { id: 'projects', label: 'Proyek' },
  { id: 'skills', label: 'Keahlian' },
  { id: 'contact', label: 'Kontak' },
];
const EASE = [0.22, 1, 0.36, 1] as const;
const TOP = 'pt-[calc(5.5rem+env(safe-area-inset-top))]';
const BOX = 'mx-auto w-full max-w-[140rem] px-5 sm:px-8 lg:px-12 2xl:px-16';

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

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="flex items-center gap-3 font-display text-3xl uppercase tracking-wide text-fg md:text-4xl"><span aria-hidden className="h-6 w-1.5 rounded-full bg-crimson md:h-8" />{children}</h2>;
}

/* ---------- Beranda ---------- */
function Hero({ go }: { go: (i: number) => void }) {
  const reduce = useReducedMotion();
  const [photoOk, setPhotoOk] = useState(true);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const tx = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const ty = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const px = useTransform(sx, [-0.5, 0.5], [8, -8]);
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section onMouseMove={onMove} className="relative isolate h-full overflow-hidden">
      <motion.span aria-hidden style={{ x: reduce ? 0 : tx, y: reduce ? 0 : ty }} className="pointer-events-none absolute inset-x-0 top-[calc(5.5rem+env(safe-area-inset-top))] select-none text-center font-display text-[22vw] uppercase leading-none text-crimson md:text-[min(20rem,19vw)]">
        Portfolio
      </motion.span>
      {photoOk && (
        <motion.div initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: EASE }} style={{ x: reduce ? 0 : px }} className="absolute inset-x-0 bottom-0 z-10 flex h-[92%] justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.photo} alt={`Foto ${SITE.firstName} ${SITE.lastName}`} onError={() => setPhotoOk(false)} className="h-full w-auto max-w-none object-contain object-bottom" />
        </motion.div>
      )}
      <div className="absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-t from-ink via-ink/70 to-transparent" />

      <div className={`${BOX} relative z-30 flex h-full flex-col justify-end pb-6 md:pb-10`}>
        <motion.p {...rise(0.1)} className="font-script text-5xl text-fg md:text-6xl">Halo, saya</motion.p>
        <motion.h1 {...rise(0.2)} className="font-display text-6xl uppercase leading-[0.95] text-fg md:text-8xl">
          {SITE.firstName}<br />{SITE.lastName}
        </motion.h1>
        <motion.p {...rise(0.3)} className="mt-3 text-sm font-semibold uppercase tracking-[0.15em] text-crimson">{SITE.role}</motion.p>
        <motion.p {...rise(0.4)} className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Saya membangun aplikasi web modern dengan berbagai macam jenis front-end dan back-end, hingga antarmuka yang responsif.
        </motion.p>
        <motion.div {...rise(0.5)} className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <button type="button" onClick={() => go(3)} className="btn-primary group gap-2 px-7 py-3.5 text-sm">
            Hubungi saya <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button type="button" onClick={() => go(1)} className="btn-ghost px-6 py-3.5 text-sm">Lihat proyek</button>
        </motion.div>
        <motion.dl {...rise(0.6)} className="mt-6 flex gap-8 md:absolute md:bottom-10 md:right-8 md:mt-0 md:flex-col md:gap-3 md:text-right lg:right-12 2xl:right-16">
          {SITE.stats.map((s) => (
            <div key={s.label} className="md:glass-card md:min-w-[11rem] md:px-5 md:py-3">
              <dd className="font-display text-4xl text-crimson md:text-5xl"><CountUp value={s.value} /></dd>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">{s.label}</dt>
            </div>
          ))}
        </motion.dl>
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
  const gh = (proj: Project) =>
    proj.github_url && (
      <a href={proj.github_url} target="_blank" rel="noreferrer" aria-label={`Kode ${proj.title}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-fg"><Github size={16} /></a>
    );
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    ...(expanded ? {} : { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }),
  };

  return (
    <div className={`${BOX} flex flex-col pb-4 ${TOP} ${expanded ? 'min-h-full' : 'h-full'}`}>
      <div className="flex shrink-0 items-end justify-between border-b border-fg/10 pb-3 md:pb-4">
        <Heading>Proyek pilihan</Heading>
        <span className="text-xs text-muted">{sorted.length} proyek</span>
      </div>

      {loading ? (
        <div className={compact ? 'mt-4 space-y-2.5' : 'mt-5 grid min-h-0 flex-1 gap-6'} style={compact ? undefined : gridStyle} aria-busy="true">
          {Array.from({ length: compact ? 4 : LIMIT }).map((_, i) => <div key={i} className={`animate-pulse rounded-2xl bg-fg/10 ${compact ? 'h-16' : ''}`} />)}
        </div>
      ) : compact ? (
        <ul className="mt-4 flex flex-col gap-2.5">
          {shown.map((proj, i) => {
            const href = proj.demo_url || proj.github_url;
            return (
              <motion.li key={proj.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % LIMIT) * 0.07, duration: 0.5, ease: EASE }} className="group card flex items-center gap-3 p-2">
                <a href={href} target="_blank" rel="noreferrer" aria-label={`Buka ${proj.title}`} className="block w-24 shrink-0 overflow-hidden rounded-md">
                  <div className="aspect-[16/10] overflow-hidden">{thumb(proj, false)}</div>
                </a>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-semibold uppercase leading-tight tracking-wide text-fg">{proj.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted">{proj.description}</p>
                  <p className="mt-1 line-clamp-1 text-[10px] uppercase tracking-[0.08em] text-muted">{proj.tags.join(' · ')}</p>
                </div>
                {gh(proj)}
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <ul className={`mt-5 grid gap-x-6 gap-y-5 lg:gap-x-8 ${expanded ? '' : 'min-h-0 flex-1'}`} style={gridStyle}>
          {shown.map((proj, i) => {
            const href = proj.demo_url || proj.github_url;
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
                    <p className="mt-1 line-clamp-1 text-[11px] uppercase tracking-[0.1em] text-muted">{proj.tags.join(' · ')}</p>
                  </div>
                  {gh(proj)}
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

/* ---------- Keahlian ---------- */
function SkillsView() {
  return (
    <div className={`${BOX} flex h-full items-center pb-4 ${TOP}`}>
      <div className="grid w-full gap-6 md:gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Heading>Keahlian</Heading>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-2">
            {SKILLS.map((s) => (
              <div key={s.name} className="group card card-hover p-4 md:p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-crimson/10 ring-1 ring-crimson/25"><s.icon size={20} className="text-crimson transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" strokeWidth={1.75} /></span>
                <p className="mt-3 text-sm font-semibold text-fg">{s.name}</p>
                <p className="mt-0.5 text-xs text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <Heading>Alur kerja</Heading>
          <ol className="card mt-5 divide-y divide-fg/10 px-5">
            {PROCESS.map((p, i) => (
              <li key={p.t} className="group flex items-start gap-3 py-2.5 md:items-baseline md:gap-5 md:py-4">
                <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-crimson text-[11px] font-semibold text-white md:hidden">{i + 1}</span>
                <span className="hidden font-display text-2xl text-crimson transition-transform duration-300 group-hover:translate-x-1 md:block">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-wide text-crimson md:text-sm">{p.t}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted md:mt-1 md:text-sm">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <figure className="hidden flex-col justify-between crimson-panel rounded-2xl p-8 lg:col-span-3 lg:flex">
          <blockquote className="font-display text-3xl uppercase leading-tight text-white">Desain yang baik bukan hanya soal tampilan, tetapi cara kerjanya.</blockquote>
          <figcaption className="mt-8 font-script text-5xl text-white">{SITE.firstName.charAt(0) + SITE.firstName.slice(1).toLowerCase()}</figcaption>
        </figure>
      </div>
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
        <h2 className="font-display text-4xl uppercase leading-[0.95] text-fg md:text-6xl">
          Mari bekerja <span className="text-crimson">bersama</span>
        </h2>
        <p className="mt-4 hidden max-w-sm text-sm leading-relaxed text-muted sm:block">Ceritakan ide atau kebutuhan proyek Anda. Pesan akan tersimpan langsung ke database dan saya balas lewat email.</p>
        <div className="mt-4 flex gap-2 md:mt-5">
          <a href={SITE.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-crimson hover:text-crimson"><Github size={18} /></a>
          <a href={SITE.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-crimson hover:text-crimson"><WhatsappIcon size={18} /></a>
        </div>
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
          <textarea id="message" required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={`${inputCls} resize-none`} placeholder="Tuliskan ide proyek atau pesan Anda..." />
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
        <div className={`${BOX} flex h-16 items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em]`}>
          <button type="button" onClick={() => go(0)} className="flex items-center gap-3 text-left" aria-label="Ke beranda">
            <span aria-hidden className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-crimson to-crimson/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-6px_var(--glow1)] ring-1 ring-white/15 transition-transform duration-300 hover:scale-105">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                <path d="M8 7l-5 5 5 5" />
                <path d="M16 7l5 5-5 5" />
                <path d="M13.5 5.5l-3 13" />
              </svg>
            </span>
            <span className="hidden sm:block">
              <p className="text-fg">Web Developer</p>
              <p className="text-muted">Full-Stack Engineer</p>
            </span>
          </button>
          <nav className="hidden items-center gap-1 rounded-full border border-fg/10 bg-fg/[0.06] p-1 md:flex" aria-label="Menu utama">
            {VIEWS.map((v, i) => (
              <button key={v.id} type="button" onClick={() => go(i)} aria-current={idx === i ? 'page' : undefined} className={`rounded-full px-4 py-2 transition-all duration-300 ${idx === i ? 'bg-panel text-fg shadow-md ring-1 ring-fg/10' : 'text-muted hover:bg-fg/10 hover:text-fg'}`}>
                {v.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
          <button type="button" onClick={() => go(3)} className="hidden items-center gap-2.5 rounded-full border border-fg/15 bg-card px-4 py-2.5 text-fg shadow-sm transition-colors hover:border-crimson md:flex">
            Tersedia untuk proyek <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" /></span>
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
              <button type="button" onClick={() => go(3)} className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-fg">
                Tersedia untuk proyek <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
              </button>
              <div className="mt-5 flex items-center gap-2">
                <a href={SITE.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 transition-colors hover:border-crimson hover:text-crimson"><Github size={18} /></a>
                <a href={SITE.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 transition-colors hover:border-crimson hover:text-crimson"><WhatsappIcon size={18} /></a>
                <span className="ml-auto text-xs text-muted">© {new Date().getFullYear()} {SITE.firstName} {SITE.lastName}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konten: satu layar, pindah antar tampilan */}
      <main className="absolute inset-x-0 top-0 bottom-[env(safe-area-inset-bottom)]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={idx} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: EASE }} className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {idx === 0 && <Hero go={go} />}
            {idx === 1 && <ProjectsView projects={projects} loading={loading} />}
            {idx === 2 && <SkillsView />}
            {idx === 3 && <ContactView formData={formData} setFormData={setFormData} formStatus={formStatus} onSubmit={handleSubmit} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
