import './globals.css';

export const metadata = {
  title: 'Mi Bandeja · Menú escolar',
  description: 'Descubre de forma visual qué comerán en el colegio: platos, alérgenos, valores nutricionales y sugerencias para la cena.',
  applicationName: 'Mi Bandeja',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Mi Bandeja', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#edf5ff' };

export default function RootLayout({ children }) {
  return <html lang="es"><body>{children}</body></html>;
}
