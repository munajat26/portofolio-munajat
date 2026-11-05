import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Anton, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const script = Mrs_Saint_Delafield({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });

export const metadata: Metadata = {
  title: "Munajat - Web Developer",
  description: "Portofolio profesional menampilkan proyek web dengan variasi front-end dan back-end.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#13141A" },
    { media: "(prefers-color-scheme: light)", color: "#EAE7E0" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Terapkan tema tersimpan (atau preferensi sistem) sebelum halaman tampil, agar tidak berkedip
const themeScript = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${script.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans selection:bg-crimson selection:text-white">{children}</body>
    </html>
  );
}
