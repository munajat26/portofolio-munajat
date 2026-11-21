import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Support & Pembayaran | Mun's Project",
  description: 'Daftar rekening bank, dompet digital, dan QRIS resmi Mun’s Project untuk pembayaran dan dukungan.',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
