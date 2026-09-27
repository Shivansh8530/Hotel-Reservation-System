import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getReviewsForRoom, createReview, deleteReview } from '../services/api'

export default function ReviewSection({ roomId }) {
  const { user, isAdmin } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await getReviewsForRoom(roomId)
      setReviews(res.data || [])
    } catch (err) {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (roomId) loadReviews()
  }, [roomId])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await createReview({ roomId, ...form, rating: Number(form.rating) })
      setSuccess('Your review has been published.')
      setForm({ rating: 5, title: '', comment: '' })
      loadReviews()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return
    try {
      await deleteReview(reviewId)
      loadReviews()
    } catch (err) {
      alert('Failed to delete review. Please try again.')
    }
  }

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--outline-variant)' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Guest Reviews</h3>
      
      {/* Review Submission Form */}
      {user ? (
        <div style={{ background: 'var(--surface-container)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Rating</label>
                <select name="rating" className="form-control" value={form.rating} onChange={handleChange} required>
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  name="title"
                  className="form-control"
                  placeholder="Summarize your stay"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Review</label>
              <textarea
                name="comment"
                className="form-control"
                rows={3}
                placeholder="What did you like or dislike?"
                value={form.comment}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-pill" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
              {submitting ? 'Publishing...' : 'Publish Review'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ background: 'var(--surface-container)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--on-surface-variant)' }}>Please sign in to write a review.</p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p style={{ color: 'var(--on-surface-variant)' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>No reviews yet for this sanctuary. Be the first to review!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ background: 'var(--surface-container-lowest)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ color: 'var(--primary)', letterSpacing: '0.1em', fontSize: '1.1rem' }}>
                  {renderStars(review.rating)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              {review.title && <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{review.title}</h5>}
              <p style={{ fontSize: '0.95rem', margin: '0 0 1rem 0' }}>{review.comment}</p>
              <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: '600' }}>
                — {review.userName}
              </div>
              
              {(isAdmin || (user && user.id === review.userId)) && (
                <button
                  onClick={() => handleDelete(review.id)}
                  className="btn btn-danger btn-pill"
                  style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
