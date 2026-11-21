// Pengaturan situs yang bisa diubah dari Admin Panel (disimpan di tabel site_settings).
// Nilai di bawah dipakai sebagai cadangan jika database belum diisi.

export interface SiteSettings {
  brand: string;
  tagline: string;
  whatsapp: string; // link wa.me/...
  support_url: string; // tujuan menu Support
  drive_folder: string; // opsional: folder Google Drive di halaman Download
  stats: { value: string; label: string }[];
  promo: { enabled: boolean; badge: string; title: string; desc: string; message: string };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brand: "Mun's Project",
  tagline: 'Web & Application Development',
  whatsapp: 'https://wa.me/6282255679676',
  support_url: 'https://rekeningku.munajat.my.id',
  drive_folder: '',
  stats: [
    { value: '5+', label: 'Tahun pengalaman' },
    { value: '20+', label: 'Proyek selesai' },
    { value: '10+', label: 'Klien puas' },
  ],
  promo: {
    enabled: true,
    badge: '7 hari',
    title: 'Free trial website selama 7 hari',
    desc: 'Plus konsultasi gratis. Coba dulu, puas baru lanjut.',
    message: 'Halo, saya tertarik dengan promo free trial website 7 hari.',
  },
};

const str = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v.trim() : fallback);

export function mergeSettings(raw: unknown): SiteSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const p = (r.promo && typeof r.promo === 'object' ? r.promo : {}) as Record<string, unknown>;
  const stats = Array.isArray(r.stats)
    ? (r.stats as Record<string, unknown>[])
        .filter((s) => s && typeof s.value === 'string' && typeof s.label === 'string' && s.value.trim() && s.label.trim())
        .map((s) => ({ value: String(s.value).trim(), label: String(s.label).trim() }))
    : [];
  return {
    brand: str(r.brand, DEFAULT_SETTINGS.brand),
    tagline: str(r.tagline, DEFAULT_SETTINGS.tagline),
    whatsapp: str(r.whatsapp, DEFAULT_SETTINGS.whatsapp),
    support_url: str(r.support_url, DEFAULT_SETTINGS.support_url),
    drive_folder: typeof r.drive_folder === 'string' ? r.drive_folder.trim() : '',
    stats: stats.length ? stats : DEFAULT_SETTINGS.stats,
    promo: {
      enabled: typeof p.enabled === 'boolean' ? p.enabled : DEFAULT_SETTINGS.promo.enabled,
      badge: str(p.badge, DEFAULT_SETTINGS.promo.badge),
      title: str(p.title, DEFAULT_SETTINGS.promo.title),
      desc: str(p.desc, DEFAULT_SETTINGS.promo.desc),
      message: str(p.message, DEFAULT_SETTINGS.promo.message),
    },
  };
}

/** Ubah nomor (0822..., +62822..., 62822...) atau link menjadi link wa.me */
export function normalizeWhatsapp(input: string): string {
  const v = input.trim();
  if (/^https?:\/\//i.test(v)) return v;
  let d = v.replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return d ? `https://wa.me/${d}` : DEFAULT_SETTINGS.whatsapp;
}

/** Ubah link berbagi Google Drive menjadi link unduh langsung */
export function driveDownloadUrl(url: string) {
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m && /drive\.google\.com/.test(url) ? `https://drive.google.com/uc?export=download&id=${m[1]}` : url;
}

export function formatBytes(n?: number | null) {
  if (!n || n <= 0) return '';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}
