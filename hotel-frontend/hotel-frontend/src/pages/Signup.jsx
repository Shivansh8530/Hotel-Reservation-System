import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup, googleLogin } from '../services/api.js'
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

// Lucide check-circle icon for satisfied conditions
function CheckCircleIcon({ size = 16 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

// Lucide subtle grey circle icon for unsatisfied conditions
function CircleIcon({ size = 16 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

function PasswordRequirements({ requirements }) {
  return (
    <div className="password-requirements-compact" aria-label="Password requirements checklist">
      {requirements.map((req) => (
        <div
          key={req.id}
          className={`password-requirement-item ${req.satisfied ? 'is-satisfied' : ''}`}
        >
          <span className="req-icon" aria-hidden="true">
            {req.satisfied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8" />
              </svg>
            )}
          </span>
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

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
        setError(err.message || 'Failed to sign up with Google.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Derived real-time validation for each of the 5 requirements (compact labels)
  const passwordRequirements = [
    {
      id: 'length',
      label: '8+ characters',
      satisfied: form.password.length >= 8,
    },
    {
      id: 'number',
      label: 'Number (0–9)',
      satisfied: /\d/.test(form.password),
    },
    {
      id: 'uppercase',
      label: 'Uppercase (A–Z)',
      satisfied: /[A-Z]/.test(form.password),
    },
    {
      id: 'lowercase',
      label: 'Lowercase (a–z)',
      satisfied: /[a-z]/.test(form.password),
    },
    {
      id: 'special',
      label: 'Special character',
      satisfied: /[^A-Za-z0-9]/.test(form.password),
    },
  ]

  const allRequirementsSatisfied = passwordRequirements.every((r) => r.satisfied)
  const isMatch = Boolean(confirmPassword && form.password === confirmPassword)
  const isMismatch = Boolean(confirmPassword && form.password !== confirmPassword)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!allRequirementsSatisfied) {
      setError('Please satisfy all 5 password requirements before continuing.')
      return
    }

    if (form.password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.')
      return
    }

    setLoading(true)

    try {
      const res = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone ? form.phone.trim() : '',
      })
      loginUser(res.data)
      navigate('/')
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || err.response.data?.error || 'Registration failed. Please check your details.')
      } else {
        setError('Unable to connect to the server. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="brand-logo-icon" style={{ margin: '0 auto 1rem', width: 44, height: 44 }}>S</div>
          <h2>Join StayEase</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.92rem' }}>
            Register to unlock bespoke reservations, member rates, and luxury concierge services.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-phone">Phone Number (Optional)</label>
            <input
              id="signup-phone"
              type="tel"
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
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

            {/* Real-time Interactive Password Requirements Component */}
            <PasswordRequirements requirements={passwordRequirements} />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              name="confirmPassword"
              className={`form-control ${
                confirmPassword ? (isMatch ? 'is-valid' : isMismatch ? 'is-invalid' : '') : ''
              }`}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            {confirmPassword && (
              <div
                className={`password-match-status ${
                  isMatch ? 'match-success' : 'match-error'
                }`}
              >
                <span className="match-icon" aria-hidden="true">
                  {isMatch ? <CheckCircleIcon size={14} /> : '✕'}
                </span>
                <span>{isMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-pill"
            disabled={loading || googleLoading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : 'Register to StayEase'}
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
          Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Log In</Link>
        </p>
      </div>
    </div>
  )
}
