import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data.message || 'Password reset link sent (check console)')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to request reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.92rem' }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {message && <div className="alert alert-success" style={{ backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-pill" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
