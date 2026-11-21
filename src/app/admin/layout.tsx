import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin | Mun's Project",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
