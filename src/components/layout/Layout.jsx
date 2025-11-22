import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, showFooter = true }) {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}