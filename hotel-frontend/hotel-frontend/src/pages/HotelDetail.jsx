import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getHotelById, getRoomsByHotel, createBooking } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR } from '../utils/currency.js'

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Booking form state for internal hotels
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' })
  const [guestsCount, setGuestsCount] = useState(2)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await getHotelById(id)
        const hotelData = res.data
        setHotel(hotelData)

        // If internal hotel and rooms were not populated on HotelDTO, fetch from /api/rooms/hotel/{id}
        if (hotelData.source === 'INTERNAL') {
          if (hotelData.rooms && hotelData.rooms.length > 0) {
            setRooms(hotelData.rooms)
            setSelectedRoom(hotelData.rooms[0])
          } else {
            try {
              const roomsRes = await getRoomsByHotel(id)
              setRooms(roomsRes.data || [])
              if (roomsRes.data && roomsRes.data.length > 0) {
                setSelectedRoom(roomsRes.data[0])
              }
            } catch (rErr) {
              console.warn('Could not fetch separate rooms list for hotel:', rErr)
            }
          }
        } else {
          // For external partner hotels, rooms can be displayed as inventory packages if available
          setRooms(hotelData.rooms || [])
          if (hotelData.rooms && hotelData.rooms.length > 0) {
            setSelectedRoom(hotelData.rooms[0])
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load hotel details. Please verify the backend connection.')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchHotelAndRooms()
  }, [id])

  const isExternal = hotel && hotel.source !== 'INTERNAL'
  const partnerName = hotel?.source === 'BOOKING' ? 'Booking.com' : (hotel?.source === 'EXPEDIA' ? 'Expedia' : hotel?.source)

  // Night and price calculations
  const nights = dates.checkIn && dates.checkOut
    ? Math.max(0, Math.ceil((new Date(dates.checkOut) - new Date(dates.checkIn)) / (1000 * 60 * 60 * 24)))
    : 0

  const currentPricePerNight = selectedRoom?.pricePerNight || hotel?.price?.amount || 0
  const roomSubtotal = nights * currentPricePerNight
  const taxAndFees = Math.round(roomSubtotal * 0.12)
  const grandTotal = roomSubtotal + taxAndFees

  const handleBookSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    if (!selectedRoom) {
      setBookingError('Please select a suite to reserve.')
      return
    }

    if (!dates.checkIn || !dates.checkOut || nights <= 0) {
      setBookingError('Please select valid check-in and check-out dates.')
      return
    }

    setBookingError('')
    setBookingSuccess('')
    setSubmitting(true)

    try {
      await createBooking({
        roomId: selectedRoom.id,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut
      })

      setBookingSuccess('Reservation confirmed! Redirecting to your reservations...')
      setTimeout(() => {
        navigate('/my-bookings')
      }, 1200)
    } catch (err) {
      setBookingError(err.response?.data?.message || err.response?.data?.error || 'Reservation failed. Room may not be available for selected dates.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
        <h3>Loading sanctuary details...</h3>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
          <h3>Hotel Details Unavailable</h3>
          <p>{error || 'The requested hotel could not be found.'}</p>
        </div>
        <Link to="/" className="btn btn-primary btn-pill">
          ← Return to Sanctuaries Search
        </Link>
      </div>
    )
  }

  const primaryImage = (hotel.images && hotel.images.length > 0)
    ? hotel.images[0]
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80'

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" className="btn btn-secondary btn-pill" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          ← Back to Sanctuaries
        </Link>
        <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
          {hotel.location?.city} / {hotel.name}
        </span>
      </div>

      <div className="detail-layout">
        {/* Main Information Column */}
        <div>
          {/* Gallery Hero */}
          <div className="detail-hero-gallery" style={{ position: 'relative' }}>
            <img src={primaryImage} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', gap: '0.6rem' }}>
              <span className="room-type-badge">
                {hotel.propertyType || 'Hotel'}
              </span>
              <span
                style={{
                  background: isExternal ? 'rgba(30, 64, 175, 0.9)' : 'rgba(71, 101, 0, 0.9)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0.35rem 0.9rem',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {hotel.providerLabel || (isExternal ? hotel.source : 'Direct Partner')}
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery if multiple images */}
          {hotel.images && hotel.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {hotel.images.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`${hotel.name} view ${idx + 1}`}
                  style={{
                    width: '120px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--outline-variant)'
                  }}
                />
              ))}
            </div>
          )}

          {/* Hotel Title & Rating */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '2.25rem', margin: 0 }}>{hotel.name}</h1>
            {hotel.rating && (
              <div className="status-pill status-confirmed" style={{ fontSize: '0.95rem', padding: '0.4rem 0.9rem' }}>
                ★ {hotel.rating} {hotel.reviewCount ? `(${hotel.reviewCount} reviews)` : ''}
              </div>
            )}
          </div>

          {/* Location details */}
          {hotel.location && (
            <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', fontWeight: '500', marginBottom: '1.5rem' }}>
              📍 {hotel.location.address ? `${hotel.location.address}, ` : ''}{hotel.location.city}, {hotel.location.state || hotel.location.country}
            </p>
          )}

          {/* Description */}
          <p style={{ fontSize: '1.05rem', color: 'var(--on-surface-variant)', lineHeight: '1.7', marginBottom: '2rem' }}>
            {hotel.description}
          </p>

          {/* Amenities Breakdown */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Sanctuary Amenities</h3>
              <div className="amenity-pills" style={{ gap: '0.6rem' }}>
                {hotel.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="amenity-pill"
                    style={{
                      padding: '0.45rem 1rem',
                      fontSize: '0.88rem',
                      background: 'var(--surface-container-lowest)',
                      border: '1px solid var(--outline-variant)'
                    }}
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Room Selection for Internal Hotels */}
          {!isExternal && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Available Suites & Rooms</h3>
              {rooms.length === 0 ? (
                <div style={{ padding: '2rem', background: 'var(--surface-container)', borderRadius: 'var(--radius-md)', color: 'var(--on-surface-variant)' }}>
                  No individual rooms currently configured for this hotel. Please contact concierge for direct booking.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {rooms.map((room) => {
                    const isSelected = selectedRoom?.id === room.id
                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.25rem',
                          background: isSelected ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                            <strong style={{ fontSize: '1.1rem' }}>
                              Room {room.roomNumber} — {room.roomType}
                            </strong>
                            <span className={`status-pill ${room.available ? 'status-confirmed' : 'status-cancelled'}`}>
                              {room.available ? 'Available' : 'Reserved'}
                            </span>
                          </div>
                          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem', color: 'var(--on-surface-variant)' }}>
                            {room.description || `Capacity: ${room.capacity || 2} Guests`}
                          </p>
                          {room.amenities && (
                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                              {room.amenities.slice(0, 3).map((a, i) => (
                                <span key={i} style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>• {a}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                            {formatINR(room.pricePerNight)}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>/ night</div>
                          <button
                            type="button"
                            className={`btn btn-pill ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
                          >
                            {isSelected ? 'Selected' : 'Select Suite'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sticky Column: Action Widget */}
        <div>
          <div className="sticky-booking-widget">
            {isExternal ? (
              /* EXTERNAL PARTNER INVENTORY FLOW */
              <div>
                <div className="price-header" style={{ marginBottom: '1.25rem' }}>
                  <div>
                    <span className="amount">{formatINR(hotel.price?.amount || 0)}</span>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}> / night</span>
                  </div>
                  <div className="status-pill status-confirmed" style={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1e40af', border: '1px solid rgba(30, 64, 175, 0.3)' }}>
                    {partnerName} Verified
                  </div>
                </div>

                <div style={{ background: 'var(--surface-container-low)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--on-surface)' }}>
                    Partner Network Listing
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--on-surface-variant)', lineHeight: '1.6' }}>
                    This luxury property is made available through our direct API integration with <strong>{partnerName}</strong>.
                    Reservations are confirmed directly on partner systems with full guarantee.
                  </p>
                </div>

                {hotel.bookingUrl ? (
                  <a
                    href={hotel.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-pill"
                    style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', textAlign: 'center', textDecoration: 'none' }}
                  >
                    Reserve on {partnerName} →
                  </a>
                ) : (
                  <button
                    disabled
                    className="btn btn-secondary btn-pill"
                    style={{ width: '100%', padding: '0.95rem', fontSize: '1rem' }}
                  >
                    Partner URL Currently Unavailable
                  </button>
                )}

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>
                  Official partner rate. No additional fees charged by StayEase.
                </p>
              </div>
            ) : (
              /* INTERNAL HOTEL DIRECT BOOKING FLOW */
              <div>
                <div className="price-header">
                  <div>
                    <span className="amount">{formatINR(currentPricePerNight)}</span>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}> / night</span>
                  </div>
                  <div className="status-pill status-confirmed">Direct StayEase Rate</div>
                </div>

                {bookingError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{bookingError}</div>}
                {bookingSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{bookingSuccess}</div>}

                <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {selectedRoom && (
                    <div style={{ fontSize: '0.88rem', color: 'var(--on-surface-variant)', background: 'var(--surface-container-low)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                      Selected: <strong>Room {selectedRoom.roomNumber} ({selectedRoom.roomType})</strong>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Check-In Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={dates.checkIn}
                      onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Check-Out Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={dates.checkOut}
                      onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Guests Count</label>
                    <select
                      className="form-control"
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                    >
                      <option value={1}>1 Adult Guest</option>
                      <option value={2}>2 Adult Guests</option>
                      <option value={3}>3 Adult Guests</option>
                      <option value={4}>4 Adult Guests</option>
                    </select>
                  </div>

                  {/* Price Calculation Summary */}
                  {nights > 0 && (
                    <div style={{ background: 'var(--surface-container-low)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-container-high)', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span>{formatINR(currentPricePerNight)} × {nights} night(s)</span>
                        <span>{formatINR(roomSubtotal)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: 'var(--on-surface-variant)' }}>
                        <span>Hospitality Fee & Taxes (12%)</span>
                        <span>{formatINR(taxAndFees)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem', paddingTop: '0.6rem', borderTop: '1px solid var(--outline-variant)' }}>
                        <span>Total Amount</span>
                        <span style={{ color: 'var(--primary)' }}>{formatINR(grandTotal)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !selectedRoom || !selectedRoom.available || (dates.checkIn && dates.checkOut && nights <= 0)}
                    className="btn btn-primary btn-pill"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
                  >
                    {submitting
                      ? 'Confirming Reservation...'
                      : user
                      ? 'Confirm Reservation'
                      : 'Sign In to Reserve'}
                  </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '1rem' }}>
                  Free cancellation up to 48 hours before check-in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
