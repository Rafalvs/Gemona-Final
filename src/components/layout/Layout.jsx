import Header from './Header';
import Footer from './Footer';

// layout que ja tras o header e o footer juntos deixando o meio do sanduiche aberto

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