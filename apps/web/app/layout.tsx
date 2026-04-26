import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NzemFi — Stream. Support. Earn.',
  description:
    'NzemFi is a tokenized music streaming platform where artists upload music for free and fans earn NZM tokens on every stream.',
  keywords: ['music streaming', 'web3 music', 'earn tokens', 'nzm token', 'afrobeats', 'nzemfi'],
  authors: [{ name: 'NzemFi' }],
  openGraph: {
    title: 'NzemFi — Stream. Support. Earn.',
    description: 'Music meets the new digital economy. Earn NZM tokens on every stream.',
    url: 'https://nzemfi.com',
    siteName: 'NzemFi',
    images: [{ url: '/logo.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NzemFi — Stream. Support. Earn.',
    description: 'Music meets the new digital economy. Earn NZM tokens on every stream.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
