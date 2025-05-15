
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Cosmic Impact',
  description: 'A HTML5 based space impact game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = [
    GeistSans?.variable,
    GeistMono?.variable,
  ].filter(Boolean).join(' ');

  return (
    <html lang="en" className={fontVariables}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
