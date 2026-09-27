import { useEffect, useState } from 'react'
import { getMyBookings, cancelBooking, getRoom } from '../services/api.js'
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

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED'
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED'
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED'
    return true
  })

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>My Reservations</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem' }}>
          Manage your bespoke stays, upcoming sanctuary bookings, and reservation archives.
        </p>
      </div>

      {actionError && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{actionError}</div>}
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
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '1rem' }}>
        {[
          { key: 'UPCOMING', label: 'Upcoming Stays' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled' },
          { key: 'ALL', label: 'All Records' }
        ].map((tab) => (
          <button
            key={tab.key}
            className="btn btn-pill"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.45rem 1.25rem',
              fontSize: '0.88rem',
              background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface-container)',
              color: activeTab === tab.key ? 'white' : 'var(--on-surface-variant)',
              border: 'none',
              cursor: 'pointer'
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
              <div
                key={booking.id}
                style={{
                  background: 'var(--surface-container-lowest)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-soft)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <span className={`status-pill ${booking.status === 'CANCELLED' ? 'status-cancelled' : 'status-confirmed'}`}>
                      {booking.status}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', fontFamily: 'monospace' }}>
                      REF: {booking.id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{roomName}</h3>
                  
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginTop: '1rem' }}>
                    <div>
                      <strong style={{ color: 'var(--on-surface)' }}>Check-In:</strong> {booking.checkIn}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--on-surface)' }}>Check-Out:</strong> {booking.checkOut}
                    </div>
                    {booking.createdAt && (
                      <div>
                        <strong style={{ color: 'var(--on-surface)' }}>Booked On:</strong> {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--primary)' }}>
                      {formatINR(booking.totalPrice)}
                    </div>
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <div>
                      {cancellingId === booking.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--error)' }}>Cancel stay?</span>
                          <button onClick={confirmCancel} className="btn btn-danger btn-pill" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                            Yes, Cancel
                          </button>
                          <button onClick={() => setCancellingId(null)} className="btn btn-secondary btn-pill" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                            Keep
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          className="btn btn-outline btn-pill"
                          style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}
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
    </div>
  )
}
