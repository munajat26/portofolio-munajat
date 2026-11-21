'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Loader2, Monitor, RefreshCw, Smartphone, Tablet, TrendingUp, Users, Radio } from 'lucide-react';
import type { VisitStats } from '@/types';
import { Empty, NoticeBar, PageTitle, errMsg, useNotice } from './ui';
import { fetchVisitStats, nf } from './stats';

const RANGES = [7, 30, 90] as const;
const DEVICE_LABEL: Record<string, string> = { mobile: 'HP', tablet: 'Tablet', desktop: 'Komputer', lainnya: 'Lainnya' };

function dayLabel(iso: string, long = false) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', long ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short' });
}

function SummaryCard({ label, views, visitors, icon: Icon }: { label: string; views?: number; visitors?: number; icon: typeof Eye }) {
  return (
    <div className="card p-4 md:p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-crimson/10 ring-1 ring-crimson/25"><Icon size={18} className="text-crimson" strokeWidth={1.75} /></span>
      <p className="mt-3 font-display text-3xl text-fg">{views === undefined ? '…' : nf(visitors)}</p>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xs text-muted/80">{views === undefined ? '' : `${nf(views)} kali dilihat`}</p>
    </div>
  );
}

function BarList({ rows, total }: { rows: { label: string; value: number }[]; total: number }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-fg" title={r.label}>{r.label}</span>
            <span className="shrink-0 text-xs text-muted">{nf(r.value)} · {total ? Math.round((r.value / total) * 100) : 0}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-fg/10">
            <div className="h-full rounded-full bg-crimson" style={{ width: `${total ? Math.max(2, (r.value / total) * 100) : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Chart({ daily }: { daily: VisitStats['daily'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.views));
  const shown = hover !== null ? daily[hover] : null;
  const tickEvery = Math.ceil(daily.length / 6);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-crimson/30" /> Dilihat</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-crimson" /> Pengunjung</span>
        </span>
        <span aria-live="polite" className="text-fg">
          {shown ? `${dayLabel(shown.date, true)}: ${nf(shown.visitors)} pengunjung, ${nf(shown.views)} dilihat` : 'Arahkan kursor / sentuh batang untuk detail'}
        </span>
      </div>
      <div className="flex h-44 items-end gap-[3px]" onMouseLeave={() => setHover(null)}>
        {daily.map((d, i) => (
          <button
            key={d.date}
            type="button"
            aria-label={`${dayLabel(d.date, true)}: ${d.visitors} pengunjung, ${d.views} dilihat`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onClick={() => setHover(i)}
            className="relative flex h-full min-w-0 flex-1 items-end rounded-sm outline-offset-2 hover:bg-fg/[0.06]"
          >
            <span className="absolute inset-x-0 bottom-0 rounded-t-sm bg-crimson/30" style={{ height: `${(d.views / max) * 100}%`, minHeight: d.views ? 2 : 0 }} />
            <span className="absolute inset-x-0 bottom-0 rounded-t-sm bg-crimson" style={{ height: `${(d.visitors / max) * 100}%`, minHeight: d.visitors ? 2 : 0 }} />
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-[3px] text-[10px] text-muted">
        {daily.map((d, i) => (
          <span key={d.date} className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center">{i % tickEvery === 0 ? dayLabel(d.date) : ''}</span>
        ))}
      </div>
    </div>
  );
}

export default function StatsManager() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [notice, setNotice] = useNotice();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await fetchVisitStats(days));
      setMissing(false);
    } catch (err) {
      const msg = errMsg(err);
      if (/get_visit_stats|schema cache|does not exist/i.test(msg)) setMissing(true);
      else setNotice({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  }, [days, setNotice]);

  useEffect(() => { load(); }, [load]);

  const deviceRows = useMemo(() => (stats?.devices ?? []).map((d) => ({ label: DEVICE_LABEL[d.device] ?? d.device, value: d.views, key: d.device })), [stats]);
  const DeviceIcon = (k: string) => (k === 'mobile' ? Smartphone : k === 'tablet' ? Tablet : Monitor);

  return (
    <div className="space-y-6">
      <PageTitle title="Statistik pengunjung" desc="Jumlah pengunjung dan halaman yang dilihat di situs Anda. Kunjungan ke /admin dan kunjungan Anda saat login tidak dihitung." />
      <NoticeBar notice={notice} />

      {missing ? (
        <div className="card space-y-2 p-6 text-sm text-fg">
          <p className="font-semibold">Fitur statistik belum aktif di database.</p>
          <p className="text-muted">Jalankan ulang seluruh isi <code className="rounded bg-fg/10 px-1.5 py-0.5">schema.sql</code> di Supabase &gt; SQL Editor (aman dijalankan ulang), lalu muat ulang halaman ini.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Rentang waktu" className="inline-flex gap-1 rounded-full border border-fg/10 bg-fg/[0.06] p-1">
              {RANGES.map((r) => (
                <button key={r} type="button" onClick={() => setDays(r)} aria-pressed={days === r} className={`rounded-full px-4 py-1.5 text-sm transition-all ${days === r ? 'bg-panel font-semibold text-fg shadow-md ring-1 ring-fg/10' : 'text-muted hover:text-fg'}`}>{r} hari</button>
              ))}
            </div>
            <button type="button" onClick={load} disabled={loading} className="btn-ghost gap-2 px-4 py-2 text-sm disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Muat ulang
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <SummaryCard label="Pengunjung hari ini" views={stats?.today.views} visitors={stats?.today.visitors} icon={Users} />
            <SummaryCard label="7 hari terakhir" views={stats?.last7.views} visitors={stats?.last7.visitors} icon={TrendingUp} />
            <SummaryCard label="30 hari terakhir" views={stats?.last30.views} visitors={stats?.last30.visitors} icon={Eye} />
            <SummaryCard label="Sejak pencatatan dimulai" views={stats?.total.views} visitors={stats?.total.visitors} icon={Users} />
          </div>

          {stats && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Radio size={14} className={stats.online_now > 0 ? 'text-emerald-500' : 'text-muted'} />
              {stats.online_now > 0 ? `${nf(stats.online_now)} pengunjung aktif dalam 5 menit terakhir` : 'Tidak ada pengunjung aktif dalam 5 menit terakhir'}
            </p>
          )}

          <section className="card space-y-4 p-5 md:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl uppercase tracking-wide text-fg">Grafik {days} hari</h2>
              {stats && <p className="text-xs text-muted">{nf(stats.period.visitors)} pengunjung unik · {nf(stats.period.views)} halaman dilihat</p>}
            </div>
            {!stats ? <Empty text="Memuat..." /> : stats.period.views === 0 ? <Empty text="Belum ada kunjungan tercatat pada rentang ini." /> : <Chart daily={stats.daily} />}
          </section>

          {stats && stats.period.views > 0 && (
            <div className="grid gap-4 lg:grid-cols-3">
              <section className="card space-y-4 p-5 md:p-6">
                <h2 className="font-display text-xl uppercase tracking-wide text-fg">Halaman populer</h2>
                <BarList rows={stats.pages.map((p) => ({ label: p.path, value: p.views }))} total={stats.period.views} />
              </section>
              <section className="card space-y-4 p-5 md:p-6">
                <h2 className="font-display text-xl uppercase tracking-wide text-fg">Sumber kunjungan</h2>
                <BarList rows={stats.referrers.map((r) => ({ label: r.source, value: r.views }))} total={stats.period.views} />
              </section>
              <section className="card space-y-4 p-5 md:p-6">
                <h2 className="font-display text-xl uppercase tracking-wide text-fg">Perangkat</h2>
                <ul className="space-y-3">
                  {deviceRows.map((d) => {
                    const Icon = DeviceIcon(d.key);
                    return (
                      <li key={d.key} className="flex items-center gap-3 text-sm">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-crimson/10 text-crimson"><Icon size={16} /></span>
                        <span className="flex-1 text-fg">{d.label}</span>
                        <span className="text-xs text-muted">{nf(d.value)} · {Math.round((d.value / stats.period.views) * 100)}%</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          )}

          <p className="text-xs text-muted">Catatan: pengunjung unik dihitung per browser/perangkat. Orang yang sama membuka dari HP dan laptop terhitung dua pengunjung. Hari dihitung menurut zona waktu WITA.</p>
        </>
      )}
    </div>
  );
}
