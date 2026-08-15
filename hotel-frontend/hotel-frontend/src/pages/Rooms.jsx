import { useEffect, useState } from 'react'
import { getRooms } from '../services/api.js'
import RoomCard from '../components/RoomCard.jsx'

const DEMO_ROOMS = [
  {
    id: 101,
    roomNumber: '101',
    name: 'Sanctuary Ocean Deluxe',
    roomType: 'DELUXE',
    description: 'Bespoke coastal suite featuring floor-to-ceiling panoramic views, private teak terrace, and rainfall marble shower.',
    pricePerNight: 280,
    capacity: 2,
    amenities: ['King Bed', 'Ocean View', 'Marble Bath', 'Espresso Bar', 'Free Wi-Fi'],
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 102,
    roomNumber: '102',
    name: 'Heritage Pavilion Suite',
    roomType: 'SUITE',
    description: 'Spacious editorial suite with dedicated living lounge, freestanding soak tub, and handcrafted rattan furnishings.',
    pricePerNight: 420,
    capacity: 3,
    amenities: ['King Bed', 'Separate Living Room', 'Soaking Tub', 'Private Bar', 'Butler Service'],
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 103,
    roomNumber: '103',
    name: 'Alpine Forest Villa',
    roomType: 'VILLA',
    description: 'Private multi-level villa with private infinity dip pool, fireplace lounge, and panoramic mountain woodland scenery.',
    pricePerNight: 650,
    capacity: 4,
    amenities: ['Private Pool', 'Fireplace', '2 King Beds', 'Full Kitchen', 'Mountain View'],
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 104,
    roomNumber: '104',
    name: 'Horizon Penthouse Suite',
    roomType: 'EXECUTIVE',
    description: 'Top-floor luxury penthouse offering 360-degree city views, private sauna, and curated modern art gallery space.',
    pricePerNight: 550,
    capacity: 2,
    amenities: ['Private Sauna', 'Skyline View', 'Plush Linens', 'Concierge Service'],
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 105,
    roomNumber: '105',
    name: 'Serenity Garden Loft',
    roomType: 'STANDARD',
    description: 'Tranquil garden retreat with private zen patio, natural clay finishes, and acoustic soundproofing.',
    pricePerNight: 195,
    capacity: 2,
    amenities: ['Queen Bed', 'Garden Patio', 'Yoga Kit', 'Organic Tea Bar'],
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 106,
    roomNumber: '106',
    name: 'Azure Coast Penthouse',
    roomType: 'SUITE',
    description: 'Sun-drenched Mediterranean style suite with rooftop daybeds, Jacuzzi, and private wine cellar.',
    pricePerNight: 490,
    capacity: 3,
    amenities: ['Rooftop Jacuzzi', 'Wine Cellar', 'Oceanfront', 'Daily Breakfast'],
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
  }
]

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' })
  const [selectedType, setSelectedType] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [isUsingDemo, setIsUsingDemo] = useState(false)

  const fetchRoomsData = async (checkIn, checkOut) => {
    setLoading(true)
    try {
      const res = await getRooms(checkIn, checkOut)
      if (res.data && res.data.length > 0) {
        setRooms(res.data)
        setIsUsingDemo(false)
      } else {
        setRooms(DEMO_ROOMS)
        setIsUsingDemo(true)
      }
    } catch (err) {
      console.log('Backend offline or empty, switching to StayEase demo room showcase.')
      setRooms(DEMO_ROOMS)
      setIsUsingDemo(true)
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
    return r.roomType?.toUpperCase() === selectedType
  })

  return (
    <div>
      <div className="container">
        {/* StayEase Hero Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-eyebrow">StayEase Sanctuary & Hotels</span>
            <h1>Find Your Personal Sanctuary</h1>
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
                <option selected>2 Guests</option>
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
            {['ALL', 'SUITE', 'DELUXE', 'VILLA', 'EXECUTIVE'].map((type) => (
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

        {/* Demo Mode Notification Badge if applicable */}
        {isUsingDemo && (
          <div className="alert alert-success" style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)' }}>
            <strong>StayEase Showcase Mode:</strong> Displaying curated luxury suites. Connect backend API at <code>http://localhost:8080</code> for live data.
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div style={{ textAlignment: 'center', padding: '4rem 0', color: 'var(--on-surface-variant)' }}>
            <p>Curating your luxury experience...</p>
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
