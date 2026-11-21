import { supabase } from '@/lib/supabaseClient';
import type { VisitStats } from '@/types';

/** Ambil ringkasan statistik pengunjung (fungsi get_visit_stats di database, khusus admin). */
export async function fetchVisitStats(days: number): Promise<VisitStats> {
  const { data, error } = await supabase.rpc('get_visit_stats', { p_days: days });
  if (error) throw error;
  return data as VisitStats;
}

export const nf = (n: number | undefined | null) => (n ?? 0).toLocaleString('id-ID');
