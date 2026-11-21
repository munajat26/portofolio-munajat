'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, EyeOff, Eye, FileText, Link2, Loader2, Pencil, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { driveDownloadUrl, formatBytes } from '@/lib/settings';
import type { DownloadItem } from '@/types';
import { Empty, Field, NoticeBar, PageTitle, errMsg, fmtDate, inputCls, safeFileName, useNotice } from './ui';

const BUCKET = 'downloads';
const MAX_MB = 50;
type Mode = 'upload' | 'link';
const EMPTY = { name: '', description: '', url: '', published: true };

export default function FilesManager() {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('upload');
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<DownloadItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useNotice();
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('downloads').select('*').order('created_at', { ascending: false });
    if (error) setNotice({ type: 'error', text: error.message });
    else setItems((data ?? []) as DownloadItem[]);
    setLoading(false);
  }, [setNotice]);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setForm(EMPTY);
    setFile(null);
    setEditing(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const startEdit = (it: DownloadItem) => {
    setEditing(it);
    setMode(it.storage_path ? 'upload' : 'link');
    setForm({ name: it.name, description: it.description ?? '', url: it.storage_path ? '' : it.file_url, published: it.is_published });
    setFile(null);
    window.scrollTo?.({ top: 0 });
  };

  const onPick = (f: File | null) => {
    setFile(f);
    if (f && !form.name.trim()) setForm((s) => ({ ...s, name: f.name.replace(/\.[^.]+$/, '') }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim() || null;
    if (!name) { setNotice({ type: 'error', text: 'Nama file wajib diisi.' }); return; }
    setBusy(true);
    try {
      if (editing) {
        const patch: Record<string, unknown> = { name, description, is_published: form.published };
        if (!editing.storage_path) {
          const url = form.url.trim();
          if (!/^https?:\/\//i.test(url)) throw new Error('Link harus diawali http:// atau https://');
          patch.file_url = url;
        }
        const { error } = await supabase.from('downloads').update(patch).eq('id', editing.id);
        if (error) throw error;
        setNotice({ type: 'success', text: 'Perubahan disimpan.' });
      } else if (mode === 'upload') {
        if (!file) throw new Error('Pilih file yang akan diupload.');
        if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Ukuran file maksimal ${MAX_MB} MB. Untuk file lebih besar, gunakan mode Link Google Drive.`);
        const path = `${Date.now()}-${safeFileName(file.name)}`;
        const up = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });
        if (up.error) throw up.error;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const { error } = await supabase.from('downloads').insert({ name, description, file_url: pub.publicUrl, storage_path: path, file_name: file.name, file_size: file.size, is_published: form.published });
        if (error) {
          await supabase.storage.from(BUCKET).remove([path]);
          throw error;
        }
        setNotice({ type: 'success', text: 'File berhasil diupload.' });
      } else {
        const url = form.url.trim();
        if (!/^https?:\/\//i.test(url)) throw new Error('Tempel link yang diawali http:// atau https://');
        const { error } = await supabase.from('downloads').insert({ name, description, file_url: url, is_published: form.published });
        if (error) throw error;
        setNotice({ type: 'success', text: 'Link file ditambahkan.' });
      }
      reset();
      await load();
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (it: DownloadItem) => {
    const { error } = await supabase.from('downloads').update({ is_published: !it.is_published }).eq('id', it.id);
    if (error) setNotice({ type: 'error', text: error.message });
    else await load();
  };

  const remove = async (it: DownloadItem) => {
    if (!window.confirm(`Hapus "${it.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    if (it.storage_path) {
      const r = await supabase.storage.from(BUCKET).remove([it.storage_path]);
      if (r.error) { setNotice({ type: 'error', text: r.error.message }); return; }
    }
    const { error } = await supabase.from('downloads').delete().eq('id', it.id);
    if (error) setNotice({ type: 'error', text: error.message });
    else { if (editing?.id === it.id) reset(); setNotice({ type: 'success', text: 'File dihapus.' }); await load(); }
  };

  const openUrl = (it: DownloadItem) => (it.storage_path ? it.file_url : driveDownloadUrl(it.file_url));

  return (
    <div className="space-y-6">
      <PageTitle title="File download" desc="Upload file atau tempel link Google Drive. File yang dipublikasikan tampil di menu Download pada situs." />
      <NoticeBar notice={notice} />

      <form onSubmit={submit} className="card space-y-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl uppercase tracking-wide text-fg">{editing ? 'Ubah file' : 'Tambah file'}</h2>
          {editing && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><X size={14} /> Batal</button>}
        </div>

        {!editing && (
          <div className="inline-flex rounded-full border border-fg/10 bg-fg/[0.06] p-1 text-sm">
            {([['upload', 'Upload file', Upload], ['link', 'Link Google Drive', Link2]] as const).map(([m, label, Icon]) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all ${mode === m ? 'bg-panel text-fg shadow-md ring-1 ring-fg/10' : 'text-muted hover:text-fg'}`}><Icon size={14} /> {label}</button>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama file"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Mis. Panduan Penggunaan" /></Field>
          <Field label="Keterangan (opsional)"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="Keterangan singkat" /></Field>
        </div>

        {!editing && mode === 'upload' && (
          <Field label="Pilih file" hint={`Maksimal ${MAX_MB} MB per file (batas paket gratis Supabase).`}>
            <input ref={fileRef} type="file" onChange={(e) => onPick(e.target.files?.[0] ?? null)} className={`${inputCls} file:mr-3 file:rounded-lg file:border-0 file:bg-crimson file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`} />
          </Field>
        )}
        {((!editing && mode === 'link') || (editing && !editing.storage_path)) && (
          <Field label="Link Google Drive / URL file" hint="Pastikan akses file: 'Siapa saja yang memiliki link'. Link berbagi Drive otomatis diubah menjadi link unduh langsung.">
            <input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputCls} placeholder="https://drive.google.com/file/d/.../view?usp=sharing" />
          </Field>
        )}
        {editing?.storage_path && <p className="text-xs text-muted">File yang sudah diupload tidak bisa diganti. Hapus lalu upload ulang jika ingin menggantinya.</p>}

        <label className="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--crimson))]" /> Tampilkan di situs
        </label>

        <button type="submit" disabled={busy} className="btn-primary gap-2 px-6 py-3 text-sm disabled:opacity-60">
          {busy ? <><Loader2 size={16} className="animate-spin" /> {editing ? 'Menyimpan...' : mode === 'upload' ? 'Mengupload...' : 'Menyimpan...'}</> : editing ? 'Simpan perubahan' : mode === 'upload' ? <><Upload size={16} /> Upload</> : <><Link2 size={16} /> Tambah link</>}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-xl uppercase tracking-wide text-fg">Daftar file ({items.length})</h2>
        {loading ? <Empty text="Memuat..." /> : items.length === 0 ? <Empty text="Belum ada file. Tambahkan file pertama di atas." /> : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson/10 ring-1 ring-crimson/25"><FileText size={20} className="text-crimson" strokeWidth={1.75} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">{it.name}</p>
                  {it.description && <p className="truncate text-xs text-muted">{it.description}</p>}
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>{it.storage_path ? `Upload${it.file_size ? ` · ${formatBytes(it.file_size)}` : ''}` : 'Link'}</span>
                    <span className="inline-flex items-center gap-1"><Download size={12} /> {it.download_count}x</span>
                    <span>{fmtDate(it.created_at)}</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${it.is_published ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-fg/10 text-muted'}`}>{it.is_published ? 'Tampil' : 'Disembunyikan'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <a href={openUrl(it)} target="_blank" rel="noreferrer" aria-label="Buka file" className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-crimson hover:text-crimson"><ExternalLink size={15} /></a>
                  <button type="button" onClick={() => togglePublish(it)} aria-label={it.is_published ? 'Sembunyikan' : 'Tampilkan'} className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-crimson hover:text-crimson">{it.is_published ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  <button type="button" onClick={() => startEdit(it)} aria-label="Ubah" className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-crimson hover:text-crimson"><Pencil size={15} /></button>
                  <button type="button" onClick={() => remove(it)} aria-label="Hapus" className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-red-500 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
