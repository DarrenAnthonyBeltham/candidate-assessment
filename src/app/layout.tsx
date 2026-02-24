import './globals.css';
import Providers from './components/Providers';
import Navbar from './components/Navbar';
import AuthSync from './components/AuthSync';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-light"> 
        <Providers>
          <AuthSync />
          <div className="mx-auto bg-white min-vh-100 shadow-sm" style={{ maxWidth: '390px' }}>
            <Navbar />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}