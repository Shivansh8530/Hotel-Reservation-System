import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getMyBookings, cancelBooking, getRoom } from '../services/api.js'

const DEMO_BOOKINGS = [
  {
    id: 'BK-784920',
    roomId: 101,
    roomTitle: 'Sanctuary Ocean Deluxe',
    roomType: 'DELUXE',
    checkIn: '2026-08-15',
    checkOut: '2026-08-18',
    nights: 3,
    totalPrice: 940,
    status: 'CONFIRMED',
    createdAt: '2026-08-05'
  },
  {
    id: 'BK-410293',
    roomId: 102,
    roomTitle: 'Heritage Pavilion Suite',
    roomType: 'SUITE',
    checkIn: '2026-06-10',
    checkOut: '2026-06-14',
    nights: 4,
    totalPrice: 1880,
    status: 'COMPLETED',
    createdAt: '2026-06-01'
  }
]

export default function MyBookings() {
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState({})
  const [activeTab, setActiveTab] = useState('UPCOMING')
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await getMyBookings()
      let fetchedBookings = res.data || []
      
      // If new booking was passed via navigation state, prepend it
      if (location.state?.newBooking) {
        fetchedBookings = [location.state.newBooking, ...fetchedBookings]
      }

      if (fetchedBookings.length === 0) {
        setBookings(location.state?.newBooking ? [location.state.newBooking] : DEMO_BOOKINGS)
      } else {
        setBookings(fetchedBookings)
      }

      const uniqueRoomIds = [...new Set(fetchedBookings.map((b) => b.roomId).filter(Boolean))]
      const roomEntries = await Promise.all(
        uniqueRoomIds.map((id) => getRoom(id).then((r) => [id, r.data]).catch(() => [id, null]))
      )
      setRooms(Object.fromEntries(roomEntries))
    } catch (err) {
      console.log('Backend offline, using StayEase demo reservations.')
      setBookings(location.state?.newBooking ? [location.state.newBooking, ...DEMO_BOOKINGS] : DEMO_BOOKINGS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancelClick = (id) => {
    setCancellingId(id)
  }

  const confirmCancel = async () => {
    if (!cancellingId) return
    try {
      await cancelBooking(cancellingId)
    } catch (err) {
      console.log('Processed local state cancellation update.')
    } finally {
      setBookings((prev) =>
        prev.map((b) => (b.id === cancellingId ? { ...b, status: 'CANCELLED' } : b))
      )
      setCancellingId(null)
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
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>My Reservations</h1>
        <p style={{ color: 'var(--on-surface-variant)' }}>
          Manage your upcoming luxury stays, past itineraries, and reservation receipts.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--outline-variant)', marginBottom: '2rem' }}>
        {[
          { key: 'UPCOMING', label: 'Upcoming Stays' },
          { key: 'COMPLETED', label: 'Past Stays' },
          { key: 'CANCELLED', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              fontFamily: 'inherit',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--on-surface-variant)',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-1px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
          <p>Loading your reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)' }}>
          <h3>No {activeTab.toLowerCase()} reservations found</h3>
          <p style={{ color: 'var(--on-surface-variant)' }}>When you reserve a suite, your booking confirmation details will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredBookings.map((booking) => {
            const room = rooms[booking.roomId]
            const roomName = booking.roomTitle || (room ? `${room.roomType} Suite - Room ${room.roomNumber}` : 'Luxury Suite')

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
                    <div>
                      <strong style={{ color: 'var(--on-surface)' }}>Duration:</strong> {booking.nights || 3} Night(s)
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--primary)', fontfamily: 'var(--font-headline)' }}>
                      ${booking.totalPrice}
                    </div>
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelClick(booking.id)}
                      className="btn btn-danger btn-pill"
                      style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                    >
                      Cancel Stay
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {cancellingId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Cancel Reservation</h3>
              <button className="close-btn" onClick={() => setCancellingId(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel reservation <strong>{cancellingId}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-pill" onClick={() => setCancellingId(null)}>
                Keep Reservation
              </button>
              <button className="btn btn-danger btn-pill" onClick={confirmCancel}>
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
