import 'bootstrap/dist/css/bootstrap.min.css';
import AuthProvider from './components/AuthProvider';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Event Hook',
  description: 'Event Booking Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-light min-vh-100 d-flex flex-column align-items-center">
        <AuthProvider>
          <div className="bg-white min-vh-100 w-100 shadow-sm d-flex flex-column position-relative" style={{ maxWidth: '390px' }}>
            <Navbar />
            <main className="grow d-flex flex-column">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}