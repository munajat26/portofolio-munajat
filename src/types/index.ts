export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  demo_url?: string;
  github_url?: string;
  featured?: boolean;
  image_url?: string | null;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface MessageRow extends ContactMessage {
  id: string;
  is_read: boolean;
  created_at: string;
}

export interface DownloadFolder {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface DownloadItem {
  id: string;
  folder_id: string | null; // folder/proyek tempat file berada (kosong = tanpa folder)
  name: string;
  description: string | null;
  file_url: string;
  storage_path: string | null; // terisi jika file diupload ke Supabase Storage, kosong jika berupa link (mis. Google Drive)
  file_name: string | null;
  file_size: number | null;
  download_count: number;
  is_published: boolean;
  created_at: string;
}

export type PaymentKind = 'bank' | 'ewallet' | 'qris';

export interface PaymentAccount {
  id: string;
  kind: PaymentKind;
  name: string; // mis. "BANK BSI", "GoPay"
  label: string | null; // mis. "BISNIS", "E-WALLET"
  account_number: string; // nomor rekening / nomor HP / NMID QRIS
  holder: string | null;
  image_url: string | null; // gambar barcode (khusus QRIS)
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface VisitCount {
  views: number;
  visitors: number;
}

export interface VisitStats {
  online_now: number;
  today: VisitCount;
  last7: VisitCount;
  last30: VisitCount;
  total: VisitCount;
  period: VisitCount;
  daily: { date: string; views: number; visitors: number }[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { source: string; views: number }[];
  devices: { device: string; views: number }[];
}
