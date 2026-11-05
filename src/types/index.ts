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
