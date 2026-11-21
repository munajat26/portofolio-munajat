'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Download, ExternalLink, FolderKanban, Heart, LayoutDashboard, LogOut, Mail, Settings, ShieldAlert, FileText, Users, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdmin } from './_components/useAdmin';
import { PageTitle } from './_components/ui';
import FilesManager from './_components/FilesManager';
import ProjectsManager from './_components/ProjectsManager';
import MessagesManager from './_components/MessagesManager';
import SettingsManager from './_components/SettingsManager';
import StatsManager from './_components/StatsManager';
import PaymentsManager from './_components/PaymentsManager';
import { fetchVisitStats, nf } from './_components/stats';
import type { VisitStats } from '@/types';

type Tab = 'dashboard' | 'stats' | 'files' | 'projects' | 'messages' | 'payments' | 'settings';
const TABS: { id: Tab; label: string; icon: typeof Settings }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stats', label: 'Statistik', icon: BarChart3 },
  { id: 'files', label: 'File Download', icon: FileText },
  { id: 'projects', label: 'Proyek', icon: FolderKanban },
  { id: 'messages', label: 'Pesan', icon: Mail },
  { id: 'payments', label: 'Rekening', icon: Heart },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

function Dashboard({ go }: { go: (t: Tab) => void }) {
  const [stats, setStats] = useState<{ files: number; downloads: number; projects: number; unread: number } | null>(null);
  const [visits, setVisits] = useState<VisitStats | null | 'na'>(null);

  useEffect(() => {
    (async () => {
      const [f, p, m] = await Promise.all([
        supabase.from('downloads').select('download_count'),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
      ]);
      const rows = (f.data ?? []) as { download_count: number }[];
      setStats({ files: rows.length, downloads: rows.reduce((a, r) => a + (r.download_count || 0), 0), projects: p.count ?? 0, unread: m.count ?? 0 });
    })();
    fetchVisitStats(7).then(setVisits).catch(() => setVisits('na'));
  }, []);

  const v = visits && visits !== 'na' ? visits : null;
  const vv = (n?: number) => (visits === 'na' ? '–' : v ? nf(n) : '…');

  const cards: { label: string; value: number | string; tab: Tab; icon: typeof Settings }[] = [
    { label: 'Pengunjung hari ini', value: vv(v?.today.visitors), tab: 'stats', icon: Users },
    { label: 'Pengunjung 7 hari', value: vv(v?.last7.visitors), tab: 'stats', icon: Eye },
    { label: 'File tersedia', value: stats?.files ?? '…', tab: 'files', icon: FileText },
    { label: 'Total unduhan', value: stats?.downloads ?? '…', tab: 'files', icon: Download },
    { label: 'Proyek', value: stats?.projects ?? '…', tab: 'projects', icon: FolderKanban },
    { label: 'Pesan belum dibaca', value: stats?.unread ?? '…', tab: 'messages', icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" desc="Ringkasan situs. Pilih menu di samping untuk mengelola konten dan pengaturan." />
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
        {cards.map((c) => (
          <button key={c.label} type="button" onClick={() => go(c.tab)} className="group card card-hover p-4 text-left md:p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-crimson/10 ring-1 ring-crimson/25"><c.icon size={18} className="text-crimson" strokeWidth={1.75} /></span>
            <p className="mt-3 font-display text-3xl text-fg">{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </button>
        ))}
      </div>
      <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-fg">Tambah file untuk diunduh pengunjung</p>
          <p className="text-xs text-muted">Upload file langsung atau tempel link Google Drive.</p>
        </div>
        <button type="button" onClick={() => go('files')} className="btn-primary px-6 py-3 text-sm">Kelola file</button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { status, email, signOut } = useAdmin();
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const h = window.location.hash.replace('#', '') as Tab;
    if (TABS.some((t) => t.id === h)) setTab(h);
  }, []);

  useEffect(() => {
    if (status === 'out') router.replace('/admin/login');
  }, [status, router]);

  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, '', `#${t}`);
  };

  if (status === 'loading' || status === 'out') {
    return <div className="flex h-dvh items-center justify-center bg-ink text-sm text-muted">Memuat...</div>;
  }

  if (status === 'unconfigured' || status === 'denied') {
    return (
      <div className="flex h-dvh items-center justify-center bg-ink px-5">
        <div className="card max-w-md space-y-4 p-6 text-center">
          <ShieldAlert className="mx-auto text-crimson" size={32} />
          <p className="text-sm text-fg">
            {status === 'unconfigured'
              ? 'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY, lalu muat ulang.'
              : 'Akun ini tidak terdaftar sebagai admin.'}
          </p>
          {status === 'denied' && <button type="button" onClick={signOut} className="btn-primary px-6 py-3 text-sm">Keluar</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-y-auto bg-ink text-fg">
      <header className="sticky top-0 z-20 border-b border-fg/15 bg-glass pt-[env(safe-area-inset-top)] backdrop-blur-2xl backdrop-saturate-[1.8]">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <p className="font-display text-xl uppercase tracking-wide">Admin <span className="text-crimson">Panel</span></p>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[14rem] truncate text-xs text-muted sm:block">{email}</span>
            <a href="/" target="_blank" rel="noreferrer" className="btn-ghost gap-1.5 px-3.5 py-2 text-xs"><ExternalLink size={13} /> Lihat situs</a>
            <button type="button" onClick={signOut} className="btn-ghost gap-1.5 px-3.5 py-2 text-xs"><LogOut size={13} /> Keluar</button>
          </div>
        </div>
        <nav aria-label="Menu admin" className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-3 pb-2 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined} className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${tab === t.id ? 'bg-panel font-semibold text-fg shadow-md ring-1 ring-fg/10' : 'text-muted hover:bg-fg/10 hover:text-fg'}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-6 sm:px-6">
        {tab === 'dashboard' && <Dashboard go={go} />}
        {tab === 'files' && <FilesManager />}
        {tab === 'projects' && <ProjectsManager />}
        {tab === 'stats' && <StatsManager />}
        {tab === 'messages' && <MessagesManager />}
        {tab === 'payments' && <PaymentsManager />}
        {tab === 'settings' && <SettingsManager />}
      </main>
    </div>
  );
}
