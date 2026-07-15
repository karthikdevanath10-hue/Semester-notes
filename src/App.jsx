import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="app-container">
          {/* Global Header / Navigation */}
          <Navbar onOpenLogin={() => setIsLoginOpen(true)} />
          
          {/* Main Routing Panel */}
          <Routes>
            <Route 
              path="/" 
              element={<Home onOpenLogin={() => setIsLoginOpen(true)} />} 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Fallback route back to home */}
            <Route 
              path="*" 
              element={<Home onOpenLogin={() => setIsLoginOpen(true)} />} 
            />
          </Routes>

          {/* Authentication Modal Overlay */}
          <LoginModal 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)} 
          />

          {/* Global Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
