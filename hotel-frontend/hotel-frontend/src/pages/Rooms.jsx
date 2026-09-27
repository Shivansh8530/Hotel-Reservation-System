import { useEffect, useState } from 'react'
import { getRooms } from '../services/api.js'
import RoomCard from '../components/RoomCard.jsx'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' })
  const [selectedType, setSelectedType] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRoomsData = async (checkIn, checkOut) => {
    setLoading(true)
    setError('')
    try {
      const res = await getRooms(checkIn, checkOut)
      setRooms(res.data || [])
    } catch (err) {
      setError('Unable to load rooms. Please check backend connectivity at http://localhost:8082.')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoomsData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchRoomsData(dates.checkIn, dates.checkOut)
  }

  const filteredRooms = rooms.filter((r) => {
    if (selectedType === 'ALL') return true
    return r.roomType?.toUpperCase() === selectedType.toUpperCase()
  })

  return (
    <div>
      <div className="container">
        {/* StayEase Hero Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-eyebrow">StayEase Sanctuary Accommodations</span>
            <h1>Individual Sanctuary Suites</h1>
            <p>
              Immerse yourself in editorial luxury, serene natural landscapes, and uncompromised comfort across our curated sanctuaries.
            </p>
          </div>
        </section>

        {/* Floating Search Widget */}
        <div className="search-widget">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label>Check-In Date</label>
              <input
                type="date"
                className="form-control"
                value={dates.checkIn}
                onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Check-Out Date</label>
              <input
                type="date"
                className="form-control"
                value={dates.checkOut}
                onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Guests</label>
              <select className="form-control">
                <option>1 Guest</option>
                <option defaultValue>2 Guests</option>
                <option>3 Guests</option>
                <option>4+ Guests</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-pill" style={{ padding: '0.85rem 2rem' }}>
              Check Availability
            </button>
          </form>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>Available Sanctuaries</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.92rem' }}>
              {filteredRooms.length} luxury rooms ready for reservation
            </p>
          </div>

          <div className="amenity-pills">
            {['ALL', 'SUITE', 'DELUXE', 'VILLA', 'EXECUTIVE', 'STANDARD'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="btn btn-pill"
                style={{
                  padding: '0.45rem 1.1rem',
                  fontSize: '0.85rem',
                  background: selectedType === type ? 'var(--primary)' : 'var(--surface-container)',
                  color: selectedType === type ? 'white' : 'var(--on-surface-variant)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {type === 'ALL' ? 'All Accommodations' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Server Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <strong>Connection Notice:</strong> {error}
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => fetchRoomsData(dates.checkIn, dates.checkOut)} className="btn btn-secondary btn-pill" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--on-surface-variant)' }}>
            <p>Loading available suites from backend...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h3>No rooms matched your criteria</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>Try clearing your filters or selecting alternate dates.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
