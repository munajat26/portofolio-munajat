'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Pencil, Plus, Star, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { MOCK_PROJECTS } from '@/lib/defaults';
import type { Project } from '@/types';
import { Empty, Field, NoticeBar, PageTitle, errMsg, inputCls, safeFileName, useNotice } from './ui';

const BUCKET = 'site-assets';
const EMPTY = { title: '', description: '', tags: '', demo_url: '', github_url: '', image_url: '', featured: false };

export default function ProjectsManager() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useNotice();
  const imgRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) setNotice({ type: 'error', text: error.message });
    else setItems((data ?? []) as Project[]);
    setLoading(false);
  }, [setNotice]);

  useEffect(() => { load(); }, [load]);

  const reset = () => { setForm(EMPTY); setEditing(null); if (imgRef.current) imgRef.current.value = ''; };

  const startEdit = (p: Project) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, tags: (p.tags ?? []).join(', '), demo_url: p.demo_url ?? '', github_url: p.github_url ?? '', image_url: p.image_url ?? '', featured: !!p.featured });
    window.scrollTo?.({ top: 0 });
  };

  const uploadImage = async (f: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setNotice({ type: 'error', text: 'Ukuran gambar maksimal 5 MB.' }); return; }
    setUploading(true);
    try {
      const path = `projects/${Date.now()}-${safeFileName(f.name)}`;
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
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      demo_url: form.demo_url.trim() || null,
      github_url: form.github_url.trim() || null,
      image_url: form.image_url.trim() || null,
      featured: form.featured,
    };
    const { error } = editing ? await supabase.from('projects').update(payload).eq('id', editing.id) : await supabase.from('projects').insert(payload);
    if (error) setNotice({ type: 'error', text: error.message });
    else { setNotice({ type: 'success', text: editing ? 'Proyek diperbarui.' : 'Proyek ditambahkan.' }); reset(); await load(); }
    setBusy(false);
  };

  const remove = async (p: Project) => {
    if (!window.confirm(`Hapus proyek "${p.title}"?`)) return;
    const { error } = await supabase.from('projects').delete().eq('id', p.id);
    if (error) setNotice({ type: 'error', text: error.message });
    else { if (editing?.id === p.id) reset(); await load(); }
  };

  const importDefaults = async () => {
    setBusy(true);
    const rows = MOCK_PROJECTS.map(({ title, description, tags, demo_url, featured, image_url }) => ({ title, description, tags, demo_url: demo_url ?? null, featured: !!featured, image_url: image_url ?? null }));
    const { error } = await supabase.from('projects').insert(rows);
    if (error) setNotice({ type: 'error', text: error.message });
    else { setNotice({ type: 'success', text: 'Proyek bawaan berhasil diimpor.' }); await load(); }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Proyek" desc="Kelola daftar karya yang tampil di menu Karya. Jika daftar ini kosong, situs menampilkan proyek contoh bawaan." />
      <NoticeBar notice={notice} />

      <form onSubmit={submit} className="card space-y-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl uppercase tracking-wide text-fg">{editing ? 'Ubah proyek' : 'Tambah proyek'}</h2>
          {editing && <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><X size={14} /> Batal</button>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Judul"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} /></Field>
          <Field label="Teknologi" hint="Pisahkan dengan koma, mis. Next.js, Supabase"><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="Next.js, Supabase" /></Field>
        </div>
        <Field label="Deskripsi"><textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Link demo"><input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} className={inputCls} placeholder="https://..." /></Field>
          <Field label="Link GitHub (opsional)"><input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className={inputCls} placeholder="https://github.com/..." /></Field>
        </div>
        <Field label="Gambar thumbnail" hint="Tempel link gambar, atau upload dari perangkat (maks 5 MB).">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls} placeholder="https://... atau /projects/nama.png" />
            <label className="btn-ghost shrink-0 cursor-pointer gap-2 px-4 py-3 text-sm">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--crimson))]" /> Proyek unggulan
        </label>
        <button type="submit" disabled={busy || uploading} className="btn-primary gap-2 px-6 py-3 text-sm disabled:opacity-60">
          {busy ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : editing ? 'Simpan perubahan' : <><Plus size={16} /> Tambah proyek</>}
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl uppercase tracking-wide text-fg">Daftar proyek ({items.length})</h2>
          {!loading && items.length === 0 && <button type="button" onClick={importDefaults} disabled={busy} className="btn-ghost px-4 py-2 text-sm disabled:opacity-60">Impor proyek bawaan</button>}
        </div>
        {loading ? <Empty text="Memuat..." /> : items.length === 0 ? <Empty text="Belum ada proyek di database. Situs sedang menampilkan proyek contoh." /> : (
          <ul className="space-y-3">
            {items.map((p) => (
              <li key={p.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-fg">{p.title}{p.featured && <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />}</p>
                  <p className="line-clamp-1 text-xs text-muted">{p.description}</p>
                  <p className="mt-1 text-xs text-muted">{(p.tags ?? []).join(' · ')}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" aria-label="Buka demo" className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-crimson hover:text-crimson"><ExternalLink size={15} /></a>}
                  <button type="button" onClick={() => startEdit(p)} aria-label="Ubah" className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-crimson hover:text-crimson"><Pencil size={15} /></button>
                  <button type="button" onClick={() => remove(p)} aria-label="Hapus" className="flex h-9 w-9 items-center justify-center rounded-lg border border-fg/15 text-muted transition-colors hover:border-red-500 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
