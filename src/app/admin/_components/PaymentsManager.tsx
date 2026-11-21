'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EyeOff, Loader2, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { KIND_LABEL, groupNumber } from '@/lib/payments';
import type { PaymentAccount, PaymentKind } from '@/types';
import { Empty, Field, NoticeBar, PageTitle, errMsg, inputCls, safeFileName, useNotice } from './ui';

const BUCKET = 'site-assets';
const EMPTY = { kind: 'bank' as PaymentKind, name: '', label: '', account_number: '', holder: '', image_url: '', sort_order: 0, is_published: true };

export default function PaymentsManager() {
  const [items, setItems] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<PaymentAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useNotice();
  const imgRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('payment_accounts').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) {
      if (/payment_accounts|schema cache|does not exist/i.test(error.message)) setMissing(true);
      else setNotice({ type: 'error', text: error.message });
    } else setItems((data ?? []) as PaymentAccount[]);
    setLoading(false);
  }, [setNotice]);

  useEffect(() => { load(); }, [load]);

  const reset = () => { setForm({ ...EMPTY, sort_order: items.length + 1 }); setEditing(null); if (imgRef.current) imgRef.current.value = ''; };

  const startEdit = (p: PaymentAccount) => {
    setEditing(p);
    setForm({ kind: p.kind, name: p.name, label: p.label ?? '', account_number: p.account_number, holder: p.holder ?? '', image_url: p.image_url ?? '', sort_order: p.sort_order, is_published: p.is_published });
    window.scrollTo?.({ top: 0 });
  };

  const uploadImage = async (f: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setNotice({ type: 'error', text: 'Ukuran gambar maksimal 5 MB.' }); return; }
    setUploading(true);
    try {
      const path = `payments/${Date.now()}-${safeFileName(f.name)}`;
      const up = await supabase.storage.from(BUCKET).upload(path, f, { cacheControl: '3600', upsert: false, contentType: f.type || undefined });
      if (up.error) throw up.error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setForm((s) => ({ ...s, image_url: data.publicUrl }));
      setNotice({ type: 'success', text: 'Gambar diupload. Klik simpan untuk menerapkan.' });
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      kind: form.kind,
      name: form.name.trim(),
      label: form.label.trim() || null,
      account_number: form.account_number.replace(/\s+/g, ''),
      holder: form.holder.trim() || null,
      image_url: form.kind === 'qris' ? form.image_url.trim() || null : null,
      sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      is_published: form.is_published,
    };
    const { error } = editing ? await supabase.from('payment_accounts').update(payload).eq('id', editing.id) : await supabase.from('payment_accounts').insert(payload);
    if (error) setNotice({ type: 'error', text: error.message });
    else { setNotice({ type: 'success', text: editing ? 'Rekening diperbarui.' : 'Rekening ditambahkan.' }); await load(); setEditing(null); setForm({ ...EMPTY, sort_order: items.length + 2 }); if (imgRef.current) imgRef.current.value = ''; }
    setBusy(false);
  };

  const remove = async (p: PaymentAccount) => {
    if (!window.confirm(`Hapus "${p.name}" (${groupNumber(p.account_number)})?`)) return;
    const { error } = await supabase.from('payment_accounts').delete().eq('id', p.id);
    if (error) setNotice({ type: 'error', text: error.message });
    else { if (editing?.id === p.id) reset(); await load(); }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Rekening Support" desc="Kelola daftar rekening bank, e-wallet, dan QRIS yang tampil di halaman Support (/support)." />
      <NoticeBar notice={notice} />

      {missing ? (
        <div className="card space-y-2 p-6 text-sm text-fg">
          <p className="font-semibold">Tabel rekening belum dibuat di database.</p>
          <p className="text-muted">Jalankan ulang seluruh isi <code className="rounded bg-fg/10 px-1.5 py-0.5">schema.sql</code> di Supabase &gt; SQL Editor (aman dijalankan ulang), lalu muat ulang halaman ini.</p>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="card space-y-4 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl uppercase tracking-wide text-fg">{editing ? 'Ubah rekening' : 'Tambah rekening'}</h2>
              {editing && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><X size={14} /> Batal</button>}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Jenis">
                <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as PaymentKind })} className={inputCls}>
                  {(Object.keys(KIND_LABEL) as PaymentKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </select>
              </Field>
              <Field label="Nama bank / aplikasi"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="BANK BSI, GoPay, ..." /></Field>
              <Field label="Label (opsional)" hint="Mis. BISNIS, MERCHANT, E-WALLET"><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={inputCls} /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={form.kind === 'qris' ? 'NMID / kode transaksi' : 'Nomor rekening / HP'} hint="Spasi otomatis dihapus saat disimpan; tampilan dirapikan per 4 digit."><input required value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} className={inputCls} inputMode={form.kind === 'qris' ? 'text' : 'numeric'} /></Field>
              <Field label="Atas nama"><input value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} className={inputCls} /></Field>
            </div>
            {form.kind === 'qris' && (
              <Field label="Gambar barcode QRIS" hint="Upload gambar QRIS (maks 5 MB) atau tempel link gambar. Dipakai untuk tombol Buka dan Unduh.">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls} placeholder="https://..." />
                  <label className="btn-ghost shrink-0 cursor-pointer gap-2 px-4 py-3 text-sm">
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload
                    <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </Field>
            )}
            <div className="flex flex-wrap items-end gap-6">
              <Field label="Urutan" hint="Angka kecil tampil lebih dulu."><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value || '0', 10) })} className={`${inputCls} w-28`} /></Field>
              <label className="flex items-center gap-2 pb-6 text-sm text-fg">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--crimson))]" /> Tampilkan di halaman Support
              </label>
            </div>
            <button type="submit" disabled={busy || uploading} className="btn-primary gap-2 px-6 py-3 text-sm disabled:opacity-60">
              {busy ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : editing ? 'Simpan perubahan' : <><Plus size={16} /> Tambah rekening</>}
            </button>
          </form>

          <div className="space-y-3">
            <h2 className="font-display text-xl uppercase tracking-wide text-fg">Daftar rekening ({items.length})</h2>
            {loading ? <Empty text="Memuat..." /> : items.length === 0 ? <Empty text="Belum ada rekening. Halaman Support akan tampil kosong." /> : (
              <ul className="space-y-3">
                {items.map((p) => (
                  <li key={p.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                        {p.name}
                        <span className="rounded-full bg-fg/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">{KIND_LABEL[p.kind]}{p.label ? ` · ${p.label}` : ''}</span>
                        {!p.is_published && <span className="inline-flex items-center gap-1 text-xs font-normal text-muted"><EyeOff size={12} /> Disembunyikan</span>}
                      </p>
                      <p className="font-mono text-sm tracking-wider text-fg/90">{groupNumber(p.account_number)}</p>
                      <p className="text-xs text-muted">{p.holder}{p.kind === 'qris' && !p.image_url ? ' · gambar QRIS belum diupload' : ''}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => startEdit(p)} aria-label="Ubah" className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-crimson hover:text-crimson"><Pencil size={15} /></button>
                      <button type="button" onClick={() => remove(p)} aria-label="Hapus" className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-red-500 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
