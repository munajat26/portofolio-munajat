'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, Download, Landmark, Moon, QrCode, ShieldCheck, Smartphone, Sun, Wallet, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { DEFAULT_SETTINGS, mergeSettings, type SiteSettings } from '@/lib/settings';
import { DEFAULT_PAYMENTS, KIND_LABEL, copyValue, groupNumber } from '@/lib/payments';
import type { PaymentAccount, PaymentKind } from '@/types';

type Filter = 'all' | PaymentKind;

const KIND_ICON = { bank: Landmark, ewallet: Smartphone, qris: QrCode } as const;

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function WhatsappIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function QrisModal({ item, onClose }: { item: PaymentAccount; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [dlBusy, setDlBusy] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const download = async () => {
    if (!item.image_url) return;
    setDlBusy(true);
    try {
      const res = await fetch(item.image_url);
      if (!res.ok) throw new Error('gagal');
      const blob = await res.blob();
      const ext = blob.type.split('/')[1]?.split('+')[0] || 'png';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QRIS-${item.holder ?? 'pembayaran'}.${ext}`.replace(/\s+/g, '-');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(item.image_url, '_blank', 'noopener,noreferrer'); // cadangan jika server gambar memblokir unduhan langsung
    } finally {
      setDlBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Barcode QRIS" onClick={(e) => e.stopPropagation()} className="card relative max-h-[92dvh] w-full max-w-sm space-y-4 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-center">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-fg/15 text-muted transition-colors hover:border-crimson hover:text-crimson"><X size={16} /></button>
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-crimson">QRIS</p>
        <h2 className="font-display text-2xl uppercase tracking-wide text-fg">Barcode Pembayaran</h2>
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={`Barcode QRIS ${item.holder ?? ''}`} className="mx-auto w-full max-w-[18rem] rounded-xl bg-white p-2" />
        ) : (
          <p className="rounded-xl border border-dashed border-fg/20 p-8 text-sm text-muted">Gambar QRIS belum tersedia.</p>
        )}
        <div className="space-y-0.5 text-sm">
          {item.holder && <p className="font-semibold text-fg">{item.holder}</p>}
          <p className="font-mono text-xs tracking-wider text-muted">NMID: {groupNumber(item.account_number)}</p>
        </div>
        <p className="text-xs text-muted">Pindai dengan aplikasi bank atau e-wallet apa pun yang mendukung QRIS.</p>
        {item.image_url && (
          <button type="button" onClick={download} disabled={dlBusy} className="btn-primary w-full gap-2 px-6 py-3 text-sm disabled:opacity-60"><Download size={16} /> Unduh Gambar QRIS</button>
        )}
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [site, setSite] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [qris, setQris] = useState<PaymentAccount | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured) { setItems(DEFAULT_PAYMENTS); setLoading(false); return; }
      try {
        const [cfg, pay] = await Promise.all([
          supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
          supabase.from('payment_accounts').select('*').eq('is_published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
        ]);
        if (!cfg.error && cfg.data) setSite(mergeSettings(cfg.data.data));
        // Jika tabel belum dibuat (schema.sql belum dijalankan ulang), pakai data bawaan
        setItems(pay.error ? DEFAULT_PAYMENTS : ((pay.data ?? []) as PaymentAccount[]));
      } catch {
        setItems(DEFAULT_PAYMENTS);
      } finally {
        setLoading(false);
      }
    })();
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

  const onCopy = async (p: PaymentAccount) => {
    if (!(await copyText(copyValue(p.account_number)))) return;
    setCopied(p.id);
    setToast(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setCopied(null); setToast(false); }, 2200);
  };

  const closeQris = useCallback(() => setQris(null), []);

  const kinds = (['bank', 'ewallet', 'qris'] as PaymentKind[]).filter((k) => items.some((i) => i.kind === k));
  const shown = filter === 'all' ? items : items.filter((i) => i.kind === filter);
  const filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'Semua' }, ...kinds.map((k) => ({ id: k as Filter, label: KIND_LABEL[k] }))];

  return (
    <div className="relative h-dvh overflow-y-auto bg-ink text-fg">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(50%_70%_at_15%_0%,var(--glow1),transparent_70%),radial-gradient(40%_60%_at_88%_0%,var(--glow2),transparent_70%)]" />
      <div aria-hidden className="bg-dots pointer-events-none absolute inset-x-0 top-0 h-[32rem]" />

      <header className="sticky top-0 z-20 border-b border-fg/15 bg-glass pt-[env(safe-area-inset-top)] shadow-[var(--glass-shadow)] backdrop-blur-2xl backdrop-saturate-[1.8]">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" className="btn-ghost gap-2 px-4 py-2 text-xs"><ArrowLeft size={14} /> Beranda</Link>
          <p className="hidden text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-fg sm:block">{site.brand}</p>
          <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 bg-card text-fg shadow-sm transition-all hover:border-crimson hover:text-crimson">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-5xl px-5 pb-[calc(4rem+env(safe-area-inset-bottom))] pt-10 sm:px-8 md:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-card px-4 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted">
            <ShieldCheck size={13} className="text-crimson" /> Direktori resmi
          </span>
          <h1 className="mt-5 font-display text-4xl uppercase leading-[1.05] tracking-wide text-fg md:text-6xl">Support &amp; <span className="text-crimson">Pembayaran</span></h1>
          <span aria-hidden className="mx-auto mt-5 block h-1 w-10 rounded-full bg-crimson" />
          <p className="mt-5 text-sm text-muted md:text-base">Pilih rekening bank, e-wallet, atau QRIS tujuan, lalu klik salin agar transfer cepat dan terhindar dari salah nomor.</p>
        </div>

        {filters.length > 2 && (
          <div role="group" aria-label="Filter jenis rekening" className="mt-8 flex justify-center">
            <div className="inline-flex gap-1 rounded-full border border-fg/10 bg-fg/[0.06] p-1">
              {filters.map((f) => (
                <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${filter === f.id ? 'bg-panel font-semibold text-fg shadow-md ring-1 ring-fg/10' : 'text-muted hover:bg-fg/10 hover:text-fg'}`}>{f.label}</button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="card mt-8 p-8 text-center text-sm text-muted">Memuat...</p>
        ) : shown.length === 0 ? (
          <p className="card mt-8 p-8 text-center text-sm text-muted">Belum ada rekening yang ditampilkan.</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {shown.map((p) => {
              const Icon = KIND_ICON[p.kind] ?? Wallet;
              const isQris = p.kind === 'qris';
              const done = copied === p.id;
              return (
                <li key={p.id} className="card card-hover flex flex-col gap-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson/10 ring-1 ring-crimson/25"><Icon size={19} className="text-crimson" strokeWidth={1.75} /></span>
                      <p className="truncate font-display text-xl uppercase tracking-wide text-fg">{p.name}</p>
                    </div>
                    {p.label && <span className="shrink-0 rounded-full bg-fg/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted">{p.label}</span>}
                  </div>

                  <div className="rounded-xl border border-fg/10 bg-fg/[0.04] p-3.5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{isQris ? 'NMID / Kode Transaksi' : 'Nomor Rekening / Account'}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <p className="min-w-0 break-all font-mono text-lg tracking-wider text-fg md:text-xl">{groupNumber(p.account_number)}</p>
                      {isQris ? (
                        <button type="button" onClick={() => setQris(p)} className="btn-primary shrink-0 gap-1.5 px-4 py-2 text-xs"><QrCode size={14} /> Buka</button>
                      ) : (
                        <button type="button" onClick={() => onCopy(p)} aria-label={`Salin nomor ${p.name}`} className={`btn-primary shrink-0 gap-1.5 px-4 py-2 text-xs ${done ? 'brightness-110' : ''}`}>
                          {done ? <><Check size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                        </button>
                      )}
                    </div>
                  </div>

                  {p.holder && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{isQris ? 'Merchant / Pemilik' : 'Atas Nama'}</p>
                      <p className="mt-0.5 text-sm font-semibold text-fg">{p.holder}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="card mt-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-fg">Sudah transfer?</p>
            <p className="text-xs text-muted">Kirim bukti pembayaran lewat WhatsApp agar cepat kami proses.</p>
          </div>
          <a href={site.whatsapp} target="_blank" rel="noreferrer" className="btn-primary gap-2 px-6 py-3 text-sm"><WhatsappIcon size={16} /> Konfirmasi via WhatsApp</a>
        </div>

        <p className="mt-10 text-center text-xs text-muted">© {new Date().getFullYear()} {site.brand}</p>
      </main>

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
        {toast && <p className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-panel px-4 py-2.5 text-sm text-emerald-600 shadow-lg dark:text-emerald-300"><Check size={15} /> Nomor rekening berhasil disalin!</p>}
      </div>

      {qris && <QrisModal item={qris} onClose={closeQris} />}
    </div>
  );
}
