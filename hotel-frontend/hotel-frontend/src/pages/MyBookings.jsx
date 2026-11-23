import { useEffect, useState } from 'react'
import { getMyBookings, cancelBooking, rescheduleBooking, getRoom } from '../services/api.js'
import { formatINR } from '../utils/currency.js'
import { Link } from 'react-router-dom'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState({})
  const [activeTab, setActiveTab] = useState('UPCOMING')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Reschedule state
  const [reschedulingBooking, setReschedulingBooking] = useState(null)
  const [rescheduleForm, setRescheduleForm] = useState({ checkIn: '', checkOut: '' })
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [rescheduleError, setRescheduleError] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getMyBookings()
      const fetchedBookings = res.data || []
      setBookings(fetchedBookings)

      const uniqueRoomIds = [...new Set(fetchedBookings.map((b) => b.roomId).filter(Boolean))]
      const roomEntries = await Promise.all(
        uniqueRoomIds.map((id) => getRoom(id).then((r) => [id, r.data]).catch(() => [id, null]))
      )
      setRooms(Object.fromEntries(roomEntries))
    } catch (err) {
      setError('Unable to load your reservations. Please ensure you are logged in and the server is running.')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancelClick = (id) => {
    setCancellingId(id)
    setActionError('')
  }

  const confirmCancel = async () => {
    if (!cancellingId) return
    setActionError('')
    try {
      await cancelBooking(cancellingId)
      setBookings((prev) =>
        prev.map((b) => (b.id === cancellingId ? { ...b, status: 'CANCELLED' } : b))
      )
      setCancellingId(null)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to cancel this reservation. Please try again.')
    }
  }

  const handleOpenReschedule = (booking) => {
    setReschedulingBooking(booking)
    setRescheduleForm({
      checkIn: booking.checkIn || '',
      checkOut: booking.checkOut || ''
    })
    setRescheduleError('')
    setActionError('')
    setSuccessMessage('')
  }

  const handleCloseReschedule = () => {
    setReschedulingBooking(null)
    setRescheduleError('')
  }

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault()
    if (!reschedulingBooking) return

    if (!rescheduleForm.checkIn || !rescheduleForm.checkOut) {
      setRescheduleError('Please choose both check-in and check-out dates.')
      return
    }

    if (rescheduleForm.checkOut <= rescheduleForm.checkIn) {
      setRescheduleError('Check-out date must be strictly after check-in date.')
      return
    }

    setRescheduleLoading(true)
    setRescheduleError('')

    try {
      const res = await rescheduleBooking(reschedulingBooking.id, {
        checkIn: rescheduleForm.checkIn,
        checkOut: rescheduleForm.checkOut
      })
      const updated = res.data
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
      )
      setSuccessMessage(`Reservation ${reschedulingBooking.id} successfully rescheduled to ${updated.checkIn} – ${updated.checkOut}.`)
      setReschedulingBooking(null)
    } catch (err) {
      setRescheduleError(
        err.response?.data?.message ||
        'Unable to reschedule for the requested dates. The room may already be reserved during this period.'
      )
    } finally {
      setRescheduleLoading(false)
    }
  }

  // Calculate estimated nights and price for the reschedule modal
  let estimatedNights = 0
  let estimatedPrice = 0
  if (
    reschedulingBooking &&
    rescheduleForm.checkIn &&
    rescheduleForm.checkOut &&
    rescheduleForm.checkOut > rescheduleForm.checkIn
  ) {
    const d1 = new Date(rescheduleForm.checkIn)
    const d2 = new Date(rescheduleForm.checkOut)
    estimatedNights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
    const room = rooms[reschedulingBooking.roomId]
    if (room?.pricePerNight && estimatedNights > 0) {
      estimatedPrice = estimatedNights * room.pricePerNight
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED'
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED'
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED'
    return true
  })

  return (
    <div className="container reservations-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="reservations-title">My Reservations</h1>
        <p className="reservations-subtitle">
          Manage your bespoke stays, upcoming sanctuary bookings, and reservation archives.
        </p>
      </div>

      {actionError && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{actionError}</div>}
      {successMessage && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{successMessage}</div>}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          {error}
          <div style={{ marginTop: '0.5rem' }}>
            <button onClick={loadBookings} className="btn btn-secondary btn-pill" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="reservation-tabs">
        {[
          { key: 'UPCOMING', label: 'Upcoming Stays' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled' },
          { key: 'ALL', label: 'All Records' }
        ].map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-pill reservation-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface-container)',
              color: activeTab === tab.key ? 'white' : 'var(--on-surface-variant)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--on-surface-variant)' }}>
          <p>Retrieving your sanctuary bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)' }}>
          <h3>No {activeTab.toLowerCase()} reservations found</h3>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            When you reserve a suite or sanctuary, your booking confirmation details will appear here.
          </p>
          <Link to="/" className="btn btn-primary btn-pill">
            Explore Sanctuaries
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredBookings.map((booking) => {
            const room = rooms[booking.roomId]
            const roomName = booking.roomTitle || (room ? `${room.roomType} Suite - Room ${room.roomNumber}` : `Sanctuary Room (${booking.roomId})`)

            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-main">
                  <div className="booking-card-header">
                    <span className={`status-pill ${booking.status === 'CANCELLED' ? 'status-cancelled' : 'status-confirmed'}`}>
                      {booking.status}
                    </span>
                    <span className="booking-ref">
                      REF: {booking.id}
                    </span>
                  </div>

                  <h3 className="booking-card-title">{roomName}</h3>
                  
                  <div className="booking-card-meta">
                    <div>
                      <strong>Check-In:</strong> {booking.checkIn}
                    </div>
                    <div>
                      <strong>Check-Out:</strong> {booking.checkOut}
                    </div>
                    {booking.createdAt && (
                      <div>
                        <strong>Booked On:</strong> {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-card-actions">
                  <div className="booking-card-price-block">
                    <div className="booking-card-price-label">Total Amount</div>
                    <div className="booking-card-price-val">
                      {formatINR(booking.totalPrice)}
                    </div>
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <div className="booking-action-buttons">
                      <button
                        onClick={() => handleOpenReschedule(booking)}
                        className="btn btn-primary btn-pill booking-btn"
                      >
                        Reschedule
                      </button>

                      {cancellingId === booking.id ? (
                        <div className="booking-cancel-confirm">
                          <span className="booking-cancel-text">Cancel stay?</span>
                          <div className="booking-cancel-actions">
                            <button onClick={confirmCancel} className="btn btn-danger btn-pill booking-btn-sm">
                              Yes, Cancel
                            </button>
                            <button onClick={() => setCancellingId(null)} className="btn btn-secondary btn-pill booking-btn-sm">
                              Keep
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          className="btn btn-outline btn-pill booking-btn"
                        >
                          Cancel Reservation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="modal-overlay" onClick={handleCloseReschedule} role="dialog" aria-modal="true" aria-labelledby="reschedule-dialog-title">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '100%', boxSizing: 'border-box' }}>
            <div className="modal-header">
              <div>
                <h3 id="reschedule-dialog-title" style={{ margin: 0, fontSize: '1.4rem' }}>Reschedule Reservation</h3>
                <span className="booking-ref">
                  REF: {reschedulingBooking.id}
                </span>
              </div>
              <button className="close-btn" onClick={handleCloseReschedule} aria-label="Close modal">
                &times;
              </button>
            </div>

            {rescheduleError && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                {rescheduleError}
              </div>
            )}

            <div style={{ background: 'var(--surface-container)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.88rem', overflowWrap: 'break-word' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>
                {reschedulingBooking.roomTitle || (rooms[reschedulingBooking.roomId] ? `${rooms[reschedulingBooking.roomId].roomType} Suite - Room ${rooms[reschedulingBooking.roomId].roomNumber}` : 'Room')}
              </div>
              <div style={{ color: 'var(--on-surface-variant)' }}>
                Current dates: <strong>{reschedulingBooking.checkIn}</strong> to <strong>{reschedulingBooking.checkOut}</strong> ({formatINR(reschedulingBooking.totalPrice)})
              </div>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="reschedule-form-grid">
                <div className="form-group">
                  <label htmlFor="reschedule-checkin" style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem', display: 'block' }}>
                    New Check-In
                  </label>
                  <input
                    id="reschedule-checkin"
                    type="date"
                    className="form-control"
                    min={todayStr}
                    value={rescheduleForm.checkIn}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, checkIn: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reschedule-checkout" style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem', display: 'block' }}>
                    New Check-Out
                  </label>
                  <input
                    id="reschedule-checkout"
                    type="date"
                    className="form-control"
                    min={rescheduleForm.checkIn || todayStr}
                    value={rescheduleForm.checkOut}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, checkOut: e.target.value })}
                    required
                  />
                </div>
              </div>

              {estimatedNights > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>New Duration:</span>
                    <strong style={{ marginLeft: '0.4rem', fontSize: '0.9rem' }}>{estimatedNights} {estimatedNights === 1 ? 'Night' : 'Nights'}</strong>
                  </div>
                  {estimatedPrice > 0 && (
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Updated Total:</span>
                      <strong style={{ marginLeft: '0.4rem', fontSize: '1.1rem', color: 'var(--primary)' }}>{formatINR(estimatedPrice)}</strong>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-pill"
                  onClick={handleCloseReschedule}
                  disabled={rescheduleLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-pill"
                  disabled={rescheduleLoading}
                >
                  {rescheduleLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
