import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, AlertCircle, Eye, EyeOff } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  const { login, signUp, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'admin'
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [id, setId] = useState(''); // USN or Admin ID
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [adminSecret, setAdminSecret] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setIsSignUp(false);
    clearForm();
  };

  const handleModeChange = () => {
    setIsSignUp(!isSignUp);
    setError('');
    clearForm();
  };

  const clearForm = () => {
    setId('');
    setPassword('');
    setName('');
    setEmail('');
    setAdminSecret('');
    setShowPassword(false);
    setShowAdminSecret(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!id || !password || (isSignUp && (!name || !email))) {
      setError('Please fill in all required fields.');
      return;
    }

    if (activeTab === 'student' && id.trim().length < 5) {
      setError('Please enter a valid USN.');
      return;
    }

    if (activeTab === 'admin' && isSignUp && !adminSecret) {
      setError('Faculty Verification Key is required for admin accounts.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(id, password, activeTab, name, email, adminSecret);
      } else {
        await login(id, password, activeTab);
      }
      onClose();
      clearForm();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!id) {
      setError(`Please enter your ${activeTab === 'student' ? 'USN' : 'Faculty Admin ID'} first to reset your password.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const sentEmail = await resetPassword(id, activeTab);
      alert(`A password reset link has been sent to your registered email: ${sentEmail}. Please check your inbox!`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h3>

        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => handleTabChange('student')}
            disabled={loading}
          >
            Student
          </button>
          <button 
            className={`modal-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabChange('admin')}
            disabled={loading}
          >
            Faculty
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    id="name"
                    placeholder="Enter your full name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    id="email"
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="userId">
              {activeTab === 'student' ? 'USN (University Seat Number)' : 'Username'}
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                id="userId"
                placeholder={activeTab === 'student' ? 'e.g., 1MS23CS001' : 'e.g., admin'} 
                value={id}
                onChange={(e) => setId(e.target.value)}
                style={activeTab === 'student' ? { textTransform: 'uppercase' } : {}}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password"
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isSignUp && activeTab !== 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-1rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-color)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {activeTab === 'admin' && isSignUp && (
            <div className="form-group">
              <label htmlFor="adminSecret">Faculty Verification Key</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showAdminSecret ? 'text' : 'password'} 
                  id="adminSecret"
                  placeholder="Enter secret key (e.g. ADMIN_SECRET_2026)" 
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminSecret(!showAdminSecret)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem',
                  }}
                  title={showAdminSecret ? 'Hide secret key' : 'Show secret key'}
                >
                  {showAdminSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        {activeTab !== 'admin' && (
          <div className="form-footer">
            <span>
              {isSignUp ? 'Already have an account? ' : "Don't have an account yet? "}
            </span>
            <button onClick={handleModeChange} disabled={loading}>
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
