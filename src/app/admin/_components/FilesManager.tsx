'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Download, ExternalLink, EyeOff, Eye, FileText, Folder, FolderPlus, Link2, Loader2, Pencil, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { driveDownloadUrl, formatBytes } from '@/lib/settings';
import type { DownloadFolder, DownloadItem } from '@/types';
import { Empty, Field, NoticeBar, PageTitle, errMsg, fmtDate, inputCls, safeFileName, useNotice } from './ui';

const BUCKET = 'downloads';
const MAX_MB = 50;
type Mode = 'upload' | 'link';
const EMPTY = { name: '', description: '', url: '', published: true };
const ALL = '__all';
const NONE = '__none';

export default function FilesManager() {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [folders, setFolders] = useState<DownloadFolder[]>([]);
  const [loading, setLoading] = useState(true);

  // form file
  const [mode, setMode] = useState<Mode>('upload');
  const [form, setForm] = useState(EMPTY);
  const [folderId, setFolderId] = useState<string>(''); // '' = tanpa folder
  const [files, setFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState<DownloadItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // filter daftar
  const [filter, setFilter] = useState<string>(ALL);

  // form folder
  const [fName, setFName] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fEditing, setFEditing] = useState<DownloadFolder | null>(null);
  const [fBusy, setFBusy] = useState(false);

  const [notice, setNotice] = useNotice();

  const load = useCallback(async () => {
    const [f, d] = await Promise.all([
      supabase.from('download_folders').select('*').order('name', { ascending: true }),
      supabase.from('downloads').select('*').order('created_at', { ascending: false }),
    ]);
    if (f.error) setNotice({ type: 'error', text: f.error.message });
    else setFolders((f.data ?? []) as DownloadFolder[]);
    if (d.error) setNotice({ type: 'error', text: d.error.message });
    else setItems((d.data ?? []) as DownloadItem[]);
    setLoading(false);
  }, [setNotice]);

  useEffect(() => { load(); }, [load]);

  const folderName = (id: string | null) => folders.find((f) => f.id === id)?.name ?? null;

  /* ---------------- Folder ---------------- */
  const resetFolder = () => { setFName(''); setFDesc(''); setFEditing(null); };

  const submitFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fName.trim();
    if (!name) { setNotice({ type: 'error', text: 'Nama folder wajib diisi.' }); return; }
    setFBusy(true);
    const payload = { name, description: fDesc.trim() || null };
    const { error } = fEditing ? await supabase.from('download_folders').update(payload).eq('id', fEditing.id) : await supabase.from('download_folders').insert(payload);
    if (error) setNotice({ type: 'error', text: error.message });
    else { setNotice({ type: 'success', text: fEditing ? 'Folder diperbarui.' : 'Folder dibuat.' }); resetFolder(); await load(); }
    setFBusy(false);
  };

  const removeFolder = async (f: DownloadFolder) => {
    const n = items.filter((i) => i.folder_id === f.id).length;
    const msg = n > 0
      ? `Hapus folder "${f.name}"? ${n} file di dalamnya TIDAK dihapus, tetapi menjadi "Tanpa folder".`
      : `Hapus folder "${f.name}"?`;
    if (!window.confirm(msg)) return;
    const { error } = await supabase.from('download_folders').delete().eq('id', f.id);
    if (error) setNotice({ type: 'error', text: error.message });
    else { if (filter === f.id) setFilter(ALL); if (folderId === f.id) setFolderId(''); if (fEditing?.id === f.id) resetFolder(); await load(); }
  };

  /* ---------------- File ---------------- */
  const reset = () => {
    setForm(EMPTY);
    setFiles([]);
    setEditing(null);
    if (fileRef.current) fileRef.current.value = '';
    // folder sengaja dipertahankan agar mudah upload banyak file ke folder yang sama
  };

  const startEdit = (it: DownloadItem) => {
    setEditing(it);
    setMode(it.storage_path ? 'upload' : 'link');
    setFolderId(it.folder_id ?? '');
    setForm({ name: it.name, description: it.description ?? '', url: it.storage_path ? '' : it.file_url, published: it.is_published });
    setFiles([]);
    window.scrollTo?.({ top: 0 });
  };

  const onPick = (list: FileList | null) => {
    const arr = list ? Array.from(list) : [];
    setFiles(arr);
    if (arr.length === 1 && !form.name.trim()) setForm((s) => ({ ...s, name: arr[0].name }));
  };

  const uploadOne = async (file: File, name: string, description: string | null) => {
    if (file.size > MAX_MB * 1024 * 1024) throw new Error(`"${file.name}" melebihi ${MAX_MB} MB. Untuk file lebih besar, gunakan mode Link Google Drive.`);
    const path = `${folderId || 'umum'}/${Date.now()}-${safeFileName(file.name)}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });
    if (up.error) throw up.error;
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error } = await supabase.from('downloads').insert({
      folder_id: folderId || null, name, description, file_url: pub.publicUrl, storage_path: path,
      file_name: file.name, file_size: file.size, is_published: form.published,
    });
    if (error) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw error;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim() || null;
    const multi = !editing && mode === 'upload' && files.length > 1;
    if (!multi && !name) { setNotice({ type: 'error', text: 'Nama file wajib diisi.' }); return; }
    setBusy(true);
    try {
      if (editing) {
        const patch: Record<string, unknown> = { name, description, is_published: form.published, folder_id: folderId || null };
        if (!editing.storage_path) {
          const url = form.url.trim();
          if (!/^https?:\/\//i.test(url)) throw new Error('Link harus diawali http:// atau https://');
          patch.file_url = url;
        }
        const { error } = await supabase.from('downloads').update(patch).eq('id', editing.id);
        if (error) throw error;
        setNotice({ type: 'success', text: 'Perubahan disimpan.' });
      } else if (mode === 'upload') {
        if (files.length === 0) throw new Error('Pilih file yang akan diupload.');
        let done = 0;
        try {
          for (const f of files) {
            setProgress(files.length > 1 ? `Mengupload ${done + 1} dari ${files.length}...` : 'Mengupload...');
            await uploadOne(f, multi ? f.name : name, description);
            done++;
          }
        } catch (err) {
          if (done > 0) await load();
          throw new Error(`${errMsg(err)}${done > 0 ? ` (${done} file sebelumnya sudah berhasil diupload.)` : ''}`);
        }
        setNotice({ type: 'success', text: done > 1 ? `${done} file berhasil diupload.` : 'File berhasil diupload.' });
      } else {
        const url = form.url.trim();
        if (!/^https?:\/\//i.test(url)) throw new Error('Tempel link yang diawali http:// atau https://');
        const { error } = await supabase.from('downloads').insert({ folder_id: folderId || null, name, description, file_url: url, is_published: form.published });
        if (error) throw error;
        setNotice({ type: 'success', text: 'Link file ditambahkan.' });
      }
      reset();
      await load();
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) });
    } finally {
      setBusy(false);
      setProgress('');
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

  const visible = items.filter((i) => (filter === ALL ? true : filter === NONE ? !i.folder_id : i.folder_id === filter));
  const countIn = (id: string) => items.filter((i) => i.folder_id === id).length;
  const noFolderCount = items.filter((i) => !i.folder_id).length;
  const multi = !editing && mode === 'upload' && files.length > 1;

  const chip = (id: string, label: string, n: number) => (
    <button key={id} type="button" onClick={() => setFilter(id)} className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition-all ${filter === id ? 'bg-crimson font-semibold text-white' : 'border border-fg/15 text-muted hover:border-crimson hover:text-crimson'}`}>
      {label} <span className={filter === id ? 'text-white/80' : 'text-muted'}>{n}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <PageTitle title="File download" desc="Kelompokkan file ke dalam folder per proyek, lalu upload file atau tempel link Google Drive. Pengunjung melihat file per folder di menu Download." />
      <NoticeBar notice={notice} />

      {/* ---------- Folder ---------- */}
      <section className="card space-y-4 p-5 md:p-6">
        <h2 className="font-display text-xl uppercase tracking-wide text-fg">Folder / proyek</h2>
        <form onSubmit={submitFolder} className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
          <input value={fName} onChange={(e) => setFName(e.target.value)} className={inputCls} placeholder="Nama folder, mis. Web Biro Jodoh" aria-label="Nama folder" />
          <input value={fDesc} onChange={(e) => setFDesc(e.target.value)} className={inputCls} placeholder="Keterangan (opsional)" aria-label="Keterangan folder" />
          <div className="flex gap-2">
            <button type="submit" disabled={fBusy} className="btn-primary gap-2 px-5 py-3 text-sm disabled:opacity-60">
              {fBusy ? <Loader2 size={15} className="animate-spin" /> : fEditing ? <Check size={15} /> : <FolderPlus size={15} />} {fEditing ? 'Simpan' : 'Buat folder'}
            </button>
            {fEditing && <button type="button" onClick={resetFolder} aria-label="Batal ubah folder" className="btn-ghost px-3.5 py-3"><X size={15} /></button>}
          </div>
        </form>
        {loading ? null : folders.length === 0 ? (
          <p className="text-sm text-muted">Belum ada folder. Buat folder pertama, mis. nama proyek, lalu pilih saat mengupload file.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((f) => (
              <li key={f.id} className="flex items-center gap-3 rounded-xl border border-fg/10 bg-fg/[0.03] p-3">
                <Folder size={20} className="shrink-0 text-crimson" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">{f.name}</p>
                  <p className="truncate text-xs text-muted">{countIn(f.id)} file{f.description ? ` · ${f.description}` : ''}</p>
                </div>
                <button type="button" onClick={() => { setFEditing(f); setFName(f.name); setFDesc(f.description ?? ''); }} aria-label={`Ubah folder ${f.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:text-crimson"><Pencil size={14} /></button>
                <button type="button" onClick={() => removeFolder(f)} aria-label={`Hapus folder ${f.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:text-red-500"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- Form file ---------- */}
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

        <Field label="Folder / proyek" hint={folders.length === 0 ? 'Belum ada folder. Buat dulu di bagian Folder di atas agar file terkelompok per proyek.' : 'Pilih proyek pemilik file ini. Folder tetap terpilih setelah upload, jadi mudah mengupload banyak file ke proyek yang sama.'}>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className={inputCls}>
            <option value="">Tanpa folder</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          {!multi && <Field label="Nama file"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Mis. index.html" /></Field>}
          <Field label="Keterangan (opsional)"><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="Keterangan singkat" /></Field>
        </div>
        {multi && <p className="text-xs text-muted">{files.length} file dipilih. Nama setiap file otomatis memakai nama aslinya.</p>}

        {!editing && mode === 'upload' && (
          <Field label="Pilih file" hint={`Bisa memilih beberapa file sekaligus. Maksimal ${MAX_MB} MB per file (batas paket gratis Supabase).`}>
            <input ref={fileRef} type="file" multiple onChange={(e) => onPick(e.target.files)} className={`${inputCls} file:mr-3 file:rounded-lg file:border-0 file:bg-crimson file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`} />
          </Field>
        )}
        {((!editing && mode === 'link') || (editing && !editing.storage_path)) && (
          <Field label="Link Google Drive / URL file" hint="Pastikan akses file: 'Siapa saja yang memiliki link'. Link berbagi Drive otomatis diubah menjadi link unduh langsung.">
            <input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputCls} placeholder="https://drive.google.com/file/d/.../view?usp=sharing" />
          </Field>
        )}
        {editing?.storage_path && <p className="text-xs text-muted">File yang sudah diupload tidak bisa diganti isinya, tetapi nama, keterangan, dan foldernya bisa diubah. Hapus lalu upload ulang untuk mengganti isinya.</p>}

        <label className="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--crimson))]" /> Tampilkan di situs
        </label>

        <button type="submit" disabled={busy} className="btn-primary gap-2 px-6 py-3 text-sm disabled:opacity-60">
          {busy ? <><Loader2 size={16} className="animate-spin" /> {progress || 'Menyimpan...'}</> : editing ? 'Simpan perubahan' : mode === 'upload' ? <><Upload size={16} /> {files.length > 1 ? `Upload ${files.length} file` : 'Upload'}</> : <><Link2 size={16} /> Tambah link</>}
        </button>
      </form>

      {/* ---------- Daftar ---------- */}
      <div className="space-y-3">
        <h2 className="font-display text-xl uppercase tracking-wide text-fg">Daftar file ({visible.length})</h2>
        {(folders.length > 0 || noFolderCount > 0) && (
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chip(ALL, 'Semua', items.length)}
            {folders.map((f) => chip(f.id, f.name, countIn(f.id)))}
            {chip(NONE, 'Tanpa folder', noFolderCount)}
          </div>
        )}
        {loading ? <Empty text="Memuat..." /> : visible.length === 0 ? <Empty text={items.length === 0 ? 'Belum ada file. Tambahkan file pertama di atas.' : 'Tidak ada file di folder ini.'} /> : (
          <ul className="space-y-3">
            {visible.map((it) => (
              <li key={it.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson/10 ring-1 ring-crimson/25"><FileText size={20} className="text-crimson" strokeWidth={1.75} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">{it.name}</p>
                  {it.description && <p className="truncate text-xs text-muted">{it.description}</p>}
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-1 font-medium text-fg/80"><Folder size={12} /> {folderName(it.folder_id) ?? 'Tanpa folder'}</span>
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
