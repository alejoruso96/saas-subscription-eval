import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Meridiano',
    template: '%s · Meridiano',
  },
  description: 'Consola para administrar licencias y el consumo de API de cuentas corporativas.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
