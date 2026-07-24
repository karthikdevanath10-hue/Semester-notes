import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, LogIn, LayoutDashboard, Notebook, Menu, X } from 'lucide-react';

const Navbar = ({ onOpenLogin }) => {
  const { currentUser, userRole, userData, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const handleHomeClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={handleHomeClick}>
          <Notebook size={24} className="brand-icon" style={{ color: 'var(--accent-color)' }} />
          <span>AcademiX</span>
        </Link>

        {/* Center Navigation Links for Desktop */}
        <div className="navbar-links">
          <Link to="/" className="nav-link" onClick={handleHomeClick}>Home</Link>
          <a href="/#about" className="nav-link">About Us</a>
          <a href="/#departments" className="nav-link">Departments</a>
          <a href="/#contact" className="nav-link">Contact</a>
        </div>

        <div className="navbar-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {currentUser ? (
            <>
              {userRole === 'admin' && (
                <Link to="/admin" className="nav-text-link desktop-only-nav" onClick={handleLinkClick}>
                  <LayoutDashboard size={15} />
                  <span>Admin Panel</span>
                </Link>
              )}

              <div className="user-nav-badge desktop-only-nav">
                <span className="user-nav-badge-name">{userData?.name || 'User'}</span>
                <span className="user-nav-badge-role">
                  {userRole === 'admin' ? 'Faculty' : userData?.usn || 'Student'}
                </span>
              </div>

              <button className="btn btn-outline btn-sm-nav desktop-only-nav" onClick={handleLogout} style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '20px' }}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button className="btn btn-primary desktop-only-nav" onClick={onOpenLogin} style={{ borderRadius: '20px', padding: '0.45rem 1.1rem', fontSize: '0.82rem' }}>
              <LogIn size={15} />
              <span>Login / Sign Up</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Panel */}
      {menuOpen && (
        <div className="mobile-menu-dropdown">
          <Link to="/" className="mobile-nav-link" onClick={handleHomeClick}>Home</Link>
          <a href="/#about" className="mobile-nav-link" onClick={handleLinkClick}>About Us</a>
          <a href="/#departments" className="mobile-nav-link" onClick={handleLinkClick}>Departments</a>
          <a href="/#contact" className="mobile-nav-link" onClick={handleLinkClick}>Contact</a>

          {/* Mobile Account / Auth Section */}
          <div className="mobile-menu-auth">
            {currentUser ? (
              <>
                <div className="mobile-user-card">
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{userData?.name || 'User'}</span>
                    <span className="mobile-user-role-badge">
                      {userRole === 'admin' ? 'FACULTY ADMIN' : `USN: ${userData?.usn || 'Student'}`}
                    </span>
                  </div>
                </div>

                {userRole === 'admin' && (
                  <Link to="/admin" className="mobile-nav-link mobile-admin-link" onClick={handleLinkClick}>
                    <LayoutDashboard size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <button
                  className="btn btn-danger w-full mobile-auth-btn"
                  onClick={() => { handleLogout(); handleLinkClick(); }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary w-full mobile-auth-btn"
                onClick={() => { onOpenLogin(); handleLinkClick(); }}
              >
                <LogIn size={16} />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
