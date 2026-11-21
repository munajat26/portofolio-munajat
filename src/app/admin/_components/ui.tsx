'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const inputCls =
  'w-full rounded-xl border border-fg/15 bg-panel px-4 py-3 text-sm text-fg shadow-sm placeholder:text-muted/70 transition-all focus:border-crimson focus:outline-none focus:ring-4 focus:ring-crimson/15';

export type Notice = { type: 'success' | 'error'; text: string } | null;

export function useNotice() {
  const [notice, setNotice] = useState<Notice>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  return [notice, setNotice] as const;
}

export function NoticeBar({ notice }: { notice: Notice }) {
  return (
    <div role="status" aria-live="polite">
      {notice && (
        <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${notice.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'}`}>
          {notice.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function PageTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <h1 className="font-display text-3xl uppercase tracking-wide text-fg md:text-4xl">{title}</h1>
      <span aria-hidden className="mt-3 block h-1 w-10 rounded-full bg-crimson" />
      {desc && <p className="mt-3 max-w-2xl text-sm text-muted">{desc}</p>}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="card p-6 text-center text-sm text-muted">{text}</p>;
}

export function errMsg(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') return (e as { message: string }).message;
  return 'Terjadi kesalahan.';
}

export function safeFileName(name: string) {
  return name.normalize('NFKD').replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_');
}

export function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}
