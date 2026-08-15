import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="brand-logo">
          <div className="brand-logo-icon">S</div>
          <div className="brand-title">
            Stay<span>Ease</span>
          </div>
        </Link>

        <nav className="nav-links">
          <Link to="/rooms" className={`nav-link ${isActive('/rooms') || isActive('/') ? 'active' : ''}`}>
            Explore Rooms
          </Link>
          
          {user && (
            <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}>
              My Reservations
            </Link>
          )}
          
          {isAdmin && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              Admin Control
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-pill"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {user ? (
            <div className="user-menu">
              <div className="user-badge">
                <span>{user.name}</span>
                {isAdmin ? (
                  <span className="user-role-tag">Admin</span>
                ) : (
                  <span className="user-role-tag" style={{ background: 'var(--secondary)' }}>Guest</span>
                )}
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-pill" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/login" className="btn btn-secondary btn-pill" style={{ padding: '0.5rem 1.2rem' }}>
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-pill" style={{ padding: '0.5rem 1.2rem' }}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
