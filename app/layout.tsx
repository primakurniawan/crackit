import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CrackIt — Truth or Dare Card Game',
  description: 'The ultimate Truth or Dare experience for couples, friends, family, and work events. Powered by AI-refreshed question banks.',
  keywords: ['truth or dare', 'card game', 'icebreaker', 'party game', 'couples game'],
  openGraph: {
    title: 'CrackIt — Truth or Dare Card Game',
    description: 'The ultimate Truth or Dare experience — AI-powered, for every occasion.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
          <Header />
          <main className="main-content" style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
            {children}
          </main>
          <style>{`
            .main-content {
              padding: 20px 16px 80px;
            }
            @media (min-width: 640px) {
              .main-content {
                padding: 32px 24px 60px;
              }
            }
          `}</style>
          <Footer />
        </div>
      </body>
    </html>
  );
}
