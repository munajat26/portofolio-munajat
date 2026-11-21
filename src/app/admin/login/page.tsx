'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Lock, LogIn } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { checkAdmin } from '../_components/useAdmin';
import { NoticeBar, inputCls, type Notice } from '../_components/ui';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  // Jika sudah login sebagai admin, langsung ke panel
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (user && (await checkAdmin(user.id))) router.replace('/admin');
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setNotice({ type: 'error', text: 'Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      setNotice({ type: 'error', text: 'Email atau password salah.' });
      setBusy(false);
      return;
    }
    const ok = await checkAdmin(data.user.id);
    if (!ok) {
      await supabase.auth.signOut();
      setNotice({ type: 'error', text: 'Akun ini tidak terdaftar sebagai admin.' });
      setBusy(false);
      return;
    }
    router.replace('/admin');
  };

  return (
    <div className="h-dvh overflow-y-auto bg-ink">
      <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5 py-10">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_80%_at_50%_0%,var(--glow1),transparent_70%)]" />
        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson to-crimson/80 text-white shadow-[0_10px_24px_-8px_var(--glow1)]">
            <Lock size={26} strokeWidth={2} />
          </div>
          <h1 className="mt-5 text-center font-display text-4xl uppercase tracking-wide text-fg">Admin Panel</h1>
          <p className="mt-2 text-center text-sm text-muted">Masuk untuk mengelola file, proyek, pesan, dan pengaturan situs.</p>

          <form onSubmit={submit} className="card mt-7 space-y-4 p-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-fg">Email</label>
              <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="admin@email.com" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-fg">Password</label>
              <div className="relative">
                <input id="password" type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} pr-12`} placeholder="Password" />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:text-fg">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <NoticeBar notice={notice} />
            <button type="submit" disabled={busy} className="btn-primary w-full gap-2 px-6 py-3.5 text-sm disabled:opacity-60">
              <LogIn size={16} /> {busy ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>

          <a href="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"><ArrowLeft size={14} /> Kembali ke situs</a>
        </div>
      </div>
    </div>
  );
}
