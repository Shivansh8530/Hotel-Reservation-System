import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, googleLogin } from '../services/api.js'
import { signInWithGoogle } from '../services/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const googleUser = await signInWithGoogle()
      const res = await googleLogin(googleUser)
      loginUser(res.data)
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(err.message || 'Failed to sign in with Google.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await login(form)
      loginUser(res.data)
      navigate('/')
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || err.response.data?.error || 'Invalid email or password.')
      } else {
        setError('Unable to connect to the server. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo-icon" style={{ margin: '0 auto 1rem', width: 44, height: 44 }}>S</div>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.92rem' }}>
            Sign in to access your StayEase sanctuary reservations
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot-password" className="auth-helper-link" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-pill" disabled={loading || googleLoading} style={{ width: '100%', padding: '0.85rem' }}>
            {loading ? 'Signing In...' : 'Log In to StayEase'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--outline-variant)' }} />
          <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--outline-variant)' }} />
        </div>

        <button
          type="button"
          className="btn btn-pill"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          style={{
            width: '100%',
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontWeight: '600',
            backgroundColor: 'var(--surface-container-high)',
            border: '1px solid var(--outline-variant)',
            color: 'var(--on-surface)'
          }}
        >
          <GoogleIcon />
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
          New to StayEase? <Link to="/signup" className="auth-helper-link" style={{ color: 'var(--primary)', fontWeight: '600' }}>Create an Account</Link>
        </p>
      </div>
    </div>
  )
}
