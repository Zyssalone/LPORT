import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import Rightbar from '@/components/Rightbar';
import NeonOrbs from '@/components/NeonOrbs';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // optional, but recommended for performance
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'LPORT',
  description: 'Tconecta',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#0E1113] text-white">
        <NeonOrbs />
        <div className="flex min-h-screen w-full relative">
          <div className="w-[220px] shrink-0 sticky top-0 h-screen">
            <Sidebar />
          </div>
          
          <main className="flex-1 p-6 relative z-10"> {/* Removed overflow-y-auto */}
            {children}
          </main>

          <div className="w-[250px] shrink-0 hidden lg:block sticky top-0 h-screen">
            <Rightbar />
          </div>
        </div>
      </body>
    </html>
  );
}
