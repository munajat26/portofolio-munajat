'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const VISITOR_KEY = 'visitor_id';

function getVisitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id || id.length < 8) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null; // penyimpanan diblokir: kunjungan tidak dicatat
  }
}

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** Host situs perujuk (mis. google.com). Kosong jika langsung / dari situs sendiri. */
function referrerHost(): string | null {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname.replace(/^www\./, '');
    return host && host !== location.hostname.replace(/^www\./, '') ? host : null;
  } catch {
    return null;
  }
}

/**
 * Mencatat kunjungan halaman ke tabel page_views (lewat fungsi track_visit).
 * - Halaman /admin tidak dicatat.
 * - Jika sedang login (admin), kunjungan tidak dihitung supaya angka tidak terdongkrak oleh Anda sendiri.
 */
export default function VisitTracker() {
  const pathname = usePathname();
  const last = useRef('');

  useEffect(() => {
    if (!isSupabaseConfigured || !pathname || pathname.startsWith('/admin')) return;
    // cegah hitungan ganda (React Strict Mode / render ulang)
    if (last.current === pathname) return;
    last.current = pathname;

    (async () => {
      const visitor = getVisitorId();
      if (!visitor) return;
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) return;
        await supabase.rpc('track_visit', {
          p_visitor: visitor,
          p_path: pathname,
          p_referrer: referrerHost(),
          p_device: deviceType(),
        });
      } catch {
        /* pencatatan gagal tidak boleh mengganggu pengunjung */
      }
    })();
  }, [pathname]);

  return null;
}
