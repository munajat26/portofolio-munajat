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

export interface DownloadItem {
  id: string;
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
