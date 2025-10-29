import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenServ Arena",
  description: "OpenServ Agent Arena",
icons: {
    icon: "/openservlogolight.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const stored = localStorage.getItem('theme');
              const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              const useDark = stored ? stored === 'dark' : prefersDark || true;
              const root = document.documentElement;
              if (useDark) {
                if (!root.classList.contains('dark')) root.classList.add('dark');
              } else {
                if (root.classList.contains('dark')) root.classList.remove('dark');
              }
            } catch {}
          `}
        </Script>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
