import type { Metadata } from 'next';
import { Newsreader, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { BRAND } from '@/lib/brand';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
});

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.systemName}`,
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.name} PC parts sales and payments monitoring system.`,
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full ${newsreader.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="h-full flex flex-col font-sans bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
