import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password })
      setMessage(res.data.message || 'Password successfully reset!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create New Password</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.92rem' }}>
            Please enter your new password below.
          </p>
        </div>

        {message && <div className="alert alert-success" style={{ backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{message}<br/>Redirecting to login...</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-pill" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
            {loading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
