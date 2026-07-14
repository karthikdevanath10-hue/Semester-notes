import React, { useState, useEffect } from 'react';
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={handleLinkClick}>
          <Notebook size={24} className="brand-icon" style={{ color: 'var(--accent-color)' }} />
          <span>AcademiX</span>
        </Link>

        {/* Center Navigation Links for Desktop */}
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <a href="#about" className="nav-link">About Us</a>
          <a href="#departments" className="nav-link">Departments</a>
          <a href="#announcements" className="nav-link">Announcements</a>
          <a href="#contact" className="nav-link">Contact</a>
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
                <Link to="/admin" className="nav-text-link" onClick={handleLinkClick}>
                  <LayoutDashboard size={15} />
                  <span>Admin Panel</span>
                </Link>
              )}
              
              <div className="user-nav-badge">
                <span className="user-nav-badge-name">{userData?.name || 'User'}</span>
                <span className="user-nav-badge-role">
                  {userRole === 'admin' ? 'Faculty' : userData?.usn || 'Student'}
                </span>
              </div>

              <button className="btn btn-outline btn-sm-nav" onClick={handleLogout} style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '20px' }}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onOpenLogin} style={{ borderRadius: '20px', padding: '0.45rem 1.1rem', fontSize: '0.82rem' }}>
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
          <Link to="/" className="mobile-nav-link" onClick={handleLinkClick}>Home</Link>
          <a href="#about" className="mobile-nav-link" onClick={handleLinkClick}>About Us</a>
          <a href="#departments" className="mobile-nav-link" onClick={handleLinkClick}>Departments</a>
          <a href="#announcements" className="mobile-nav-link" onClick={handleLinkClick}>Announcements</a>
          <a href="#contact" className="mobile-nav-link" onClick={handleLinkClick}>Contact</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
