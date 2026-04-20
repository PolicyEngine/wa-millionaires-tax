import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content" role="main">
        {children}
      </main>
      <Footer />
    </>
  );
}
