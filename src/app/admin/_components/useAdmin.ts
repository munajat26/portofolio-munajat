'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export type AdminStatus = 'loading' | 'unconfigured' | 'out' | 'denied' | 'ok';

/** Cek apakah user tersebut terdaftar di tabel admins. */
export async function checkAdmin(userId: string) {
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  return !error && !!data;
}

export function useAdmin() {
  const [status, setStatus] = useState<AdminStatus>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('unconfigured');
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      const user = data.session?.user;
      if (!user) { setStatus('out'); return; }
      const ok = await checkAdmin(user.id);
      if (!alive) return;
      setEmail(user.email ?? '');
      setStatus(ok ? 'ok' : 'denied');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { setStatus('out'); setEmail(''); }
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setStatus('out');
    setEmail('');
  }, []);

  return { status, email, signOut };
}
