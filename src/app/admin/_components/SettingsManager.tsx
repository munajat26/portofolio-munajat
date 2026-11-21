'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_SETTINGS, mergeSettings, normalizeWhatsapp, type SiteSettings } from '@/lib/settings';
import { Field, NoticeBar, PageTitle, errMsg, inputCls, useNotice } from './ui';

export default function SettingsManager() {
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [wa, setWa] = useState(DEFAULT_SETTINGS.whatsapp);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useNotice();

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwNotice, setPwNotice] = useNotice();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('site_settings').select('data').eq('id', 1).maybeSingle();
      if (error) setNotice({ type: 'error', text: error.message });
      const m = mergeSettings(data?.data);
      setS(m);
      setWa(m.whatsapp);
      setLoading(false);
    })();
  }, [setNotice]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const next: SiteSettings = {
        ...s,
        whatsapp: normalizeWhatsapp(wa),
        drive_folder: s.drive_folder.trim(),
      };
      if (next.drive_folder && !/^https?:\/\//i.test(next.drive_folder)) throw new Error('Link folder Google Drive harus diawali http:// atau https://');
      const { error } = await supabase.from('site_settings').upsert({ id: 1, data: next, updated_at: new Date().toISOString() });
      if (error) throw error;
      setS(next);
      setWa(next.whatsapp);
      setNotice({ type: 'success', text: 'Pengaturan disimpan. Perubahan langsung tampil di situs.' });
    } catch (err) {
      setNotice({ type: 'error', text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) { setPwNotice({ type: 'error', text: 'Password minimal 8 karakter.' }); return; }
    if (pw !== pw2) { setPwNotice({ type: 'error', text: 'Konfirmasi password tidak sama.' }); return; }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) setPwNotice({ type: 'error', text: error.message });
    else { setPwNotice({ type: 'success', text: 'Password berhasil diganti.' }); setPw(''); setPw2(''); }
    setPwBusy(false);
  };

  const setStat = (i: number, key: 'value' | 'label', v: string) =>
    setS((x) => ({ ...x, stats: x.stats.map((st, j) => (j === i ? { ...st, [key]: v } : st)) }));

  if (loading) return <p className="card p-6 text-center text-sm text-muted">Memuat...</p>;

  return (
    <div className="space-y-6">
      <PageTitle title="Pengaturan situs" desc="Semua teks dan tautan utama situs diatur dari sini, tanpa perlu mengubah kode." />

      <form onSubmit={save} className="space-y-6">
        <section className="card space-y-4 p-5 md:p-6">
          <h2 className="font-display text-xl uppercase tracking-wide text-fg">Identitas</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama brand"><input required value={s.brand} onChange={(e) => setS({ ...s, brand: e.target.value })} className={inputCls} /></Field>
            <Field label="Tagline"><input required value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="WhatsApp" hint="Isi nomor (mis. 0822xxxx atau 62822xxxx) atau link wa.me. Otomatis dijadikan link wa.me."><input required value={wa} onChange={(e) => setWa(e.target.value)} className={inputCls} /></Field>
        </section>

        <section className="card space-y-4 p-5 md:p-6">
          <h2 className="font-display text-xl uppercase tracking-wide text-fg">Halaman Download</h2>
          <Field label="Link folder Google Drive (opsional)" hint="Jika diisi, muncul tombol 'Buka folder Google Drive' di halaman Download."><input value={s.drive_folder} onChange={(e) => setS({ ...s, drive_folder: e.target.value })} className={inputCls} placeholder="https://drive.google.com/drive/folders/..." /></Field>
        </section>

        <section className="card space-y-4 p-5 md:p-6">
          <h2 className="font-display text-xl uppercase tracking-wide text-fg">Statistik beranda</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {s.stats.map((st, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <input aria-label={`Angka ${i + 1}`} value={st.value} onChange={(e) => setStat(i, 'value', e.target.value)} className={inputCls} placeholder="5+" />
                <input aria-label={`Keterangan ${i + 1}`} value={st.label} onChange={(e) => setStat(i, 'label', e.target.value)} className={`${inputCls} col-span-2`} placeholder="Tahun pengalaman" />
              </div>
            ))}
          </div>
        </section>

        <section className="card space-y-4 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl uppercase tracking-wide text-fg">Banner promo</h2>
            <label className="flex items-center gap-2 text-sm text-fg">
              <input type="checkbox" checked={s.promo.enabled} onChange={(e) => setS({ ...s, promo: { ...s.promo, enabled: e.target.checked } })} className="h-4 w-4 accent-[rgb(var(--crimson))]" /> Tampilkan
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Label"><input value={s.promo.badge} onChange={(e) => setS({ ...s, promo: { ...s.promo, badge: e.target.value } })} className={inputCls} /></Field>
            <div className="md:col-span-2"><Field label="Judul promo"><input value={s.promo.title} onChange={(e) => setS({ ...s, promo: { ...s.promo, title: e.target.value } })} className={inputCls} /></Field></div>
          </div>
          <Field label="Deskripsi"><input value={s.promo.desc} onChange={(e) => setS({ ...s, promo: { ...s.promo, desc: e.target.value } })} className={inputCls} /></Field>
          <Field label="Pesan otomatis di formulir kontak" hint="Terisi otomatis saat pengunjung mengklik banner promo."><input value={s.promo.message} onChange={(e) => setS({ ...s, promo: { ...s.promo, message: e.target.value } })} className={inputCls} /></Field>
        </section>

        <NoticeBar notice={notice} />
        <button type="submit" disabled={busy} className="btn-primary gap-2 px-7 py-3.5 text-sm disabled:opacity-60">
          {busy ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan pengaturan</>}
        </button>
      </form>

      <form onSubmit={changePassword} className="card space-y-4 p-5 md:p-6">
        <h2 className="font-display text-xl uppercase tracking-wide text-fg">Ganti password admin</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Password baru"><input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} /></Field>
          <Field label="Ulangi password baru"><input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={inputCls} /></Field>
        </div>
        <NoticeBar notice={pwNotice} />
        <button type="submit" disabled={pwBusy} className="btn-ghost gap-2 px-6 py-3 text-sm disabled:opacity-60"><KeyRound size={16} /> {pwBusy ? 'Menyimpan...' : 'Ganti password'}</button>
      </form>
    </div>
  );
}
