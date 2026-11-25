import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Navbar() {
  const { user, logout, isAdmin, isOwner } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Auto-close menu on route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    setIsMenuOpen(false)
    logout()
    navigate('/')
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="brand-logo" onClick={handleLinkClick}>
          <div className="brand-logo-icon">S</div>
          <div className="brand-title">
            Stay<span>Ease</span>
          </div>
        </Link>

        {/* Accessible mobile hamburger button */}
        <button
          type="button"
          className={`nav-hamburger ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="nav-menu"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        <nav
          id="nav-menu"
          className={`nav-links ${isMenuOpen ? 'open' : ''}`}
          aria-label="Main Navigation"
        >
          <Link
            to="/hotels"
            className={`nav-link ${isActive('/hotels') ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            Explore Hotels
          </Link>

          <Link
            to="/rooms"
            className={`nav-link ${isActive('/rooms') ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            Suites & Rooms
          </Link>

          {user && (
            <Link
              to="/my-bookings"
              className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              My Reservations
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              id="nav-admin-dashboard"
              onClick={handleLinkClick}
            >
              Admin Dashboard
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-secondary btn-pill nav-theme-toggle"
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
                  <span className="user-role-tag" style={isOwner ? { background: '#b45309', color: '#fff' } : {}}>
                    {isOwner ? '👑 Owner' : 'Admin'}
                  </span>
                ) : (
                  <span className="user-role-tag" style={{ background: 'var(--secondary)' }}>Guest</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-pill nav-signout-btn"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link
                to="/login"
                className="btn btn-secondary btn-pill"
                style={{ padding: '0.5rem 1.2rem' }}
                onClick={handleLinkClick}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary btn-pill"
                style={{ padding: '0.5rem 1.2rem' }}
                onClick={handleLinkClick}
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
