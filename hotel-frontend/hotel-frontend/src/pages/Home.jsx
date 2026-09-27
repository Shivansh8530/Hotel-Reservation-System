import { useEffect, useState } from 'react'
import { searchHotels, getHotels } from '../services/api.js'
import HotelCard from '../components/HotelCard.jsx'

export default function Home() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search filter states
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  })

  const [selectedSource, setSelectedSource] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedSort, setSelectedSort] = useState('default')

  // Load featured/all hotels on initial mount
  const loadInitialHotels = async () => {
    setLoading(true)
    setError('')
    try {
      // First try featured hotels, fallback to search with empty criteria
      const res = await getHotels(true)
      if (res.data && res.data.length > 0) {
        setHotels(res.data)
      } else {
        const searchRes = await searchHotels({})
        setHotels(searchRes.data || [])
      }
    } catch (err) {
      setError('Unable to load hotels. Please ensure the backend server is running at http://localhost:8082.')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialHotels()
  }, [])

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')

    const query = {}
    if (searchParams.destination.trim()) query.destination = searchParams.destination.trim()
    if (searchParams.checkIn) query.checkIn = searchParams.checkIn
    if (searchParams.checkOut) query.checkOut = searchParams.checkOut
    if (searchParams.guests) query.guests = Number(searchParams.guests)
    if (searchParams.rooms) query.rooms = Number(searchParams.rooms)
    if (selectedType !== 'ALL') query.propertyType = selectedType
    if (selectedSource !== 'ALL') query.source = selectedSource
    if (selectedSort !== 'default') query.sort = selectedSort

    try {
      const res = await searchHotels(query)
      setHotels(res.data || [])
    } catch (err) {
      setError('Search request failed. Please check backend connectivity.')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering when source or type buttons change if not re-querying backend
  const filteredHotels = hotels.filter((h) => {
    if (selectedSource !== 'ALL' && h.source?.toUpperCase() !== selectedSource.toUpperCase()) {
      return false
    }
    if (selectedType !== 'ALL' && h.propertyType?.toUpperCase() !== selectedType.toUpperCase()) {
      return false
    }
    return true
  })

  return (
    <div>
      <div className="container">
        {/* Luxury Hero Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-eyebrow">StayEase Unified Sanctuary Network</span>
            <h1>Find Your Personal Sanctuary</h1>
            <p>
              Discover premier coastal resorts, heritage havelis, and luxury partner sanctuaries across India with verified real-time rates.
            </p>
          </div>
        </section>

        {/* Floating Multi-Field Search Widget */}
        <div className="search-widget">
          <form onSubmit={handleSearchSubmit} className="search-form" role="search" aria-label="Search sanctuaries and luxury hotels">
            <div className="form-group form-group-destination">
              <label htmlFor="search-destination">Destination / Hotel</label>
              <input
                id="search-destination"
                type="text"
                className="form-control"
                placeholder="City (e.g. Goa, Mumbai, Jaipur)"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="search-checkin">Check-In Date</label>
              <input
                id="search-checkin"
                type="date"
                className="form-control"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="search-checkout">Check-Out Date</label>
              <input
                id="search-checkout"
                type="date"
                className="form-control"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
              />
            </div>

            <div className="form-group form-group-compact">
              <label htmlFor="search-guests">Guests</label>
              <select
                id="search-guests"
                className="form-control"
                value={searchParams.guests}
                onChange={(e) => setSearchParams({ ...searchParams, guests: Number(e.target.value) })}
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4+ Guests</option>
              </select>
            </div>

            <div className="form-group form-group-compact">
              <label htmlFor="search-rooms">Rooms</label>
              <select
                id="search-rooms"
                className="form-control"
                value={searchParams.rooms}
                onChange={(e) => setSearchParams({ ...searchParams, rooms: Number(e.target.value) })}
              >
                <option value={1}>1 Room</option>
                <option value={2}>2 Rooms</option>
                <option value={3}>3+ Rooms</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-pill" style={{ padding: '0.85rem 2rem' }}>
              Search Sanctuaries
            </button>
          </form>
        </div>

        {/* Section Heading */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: '0.25rem' }}>Curated Sanctuaries & Hotels</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--fs-sm)', margin: 0 }}>
            {filteredHotels.length} luxury properties aggregated from direct and partner inventories
          </p>
        </div>

        {/* Unified Filter & Sort Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--outline-variant)',
            marginBottom: '2.5rem'
          }}
        >
          {/* Filter Pills Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Provider Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>
                Provider:
              </span>
              {[
                { id: 'ALL', label: 'All Providers' },
                { id: 'INTERNAL', label: 'StayEase Direct' },
                { id: 'BOOKING', label: 'Booking.com' },
                { id: 'EXPEDIA', label: 'Expedia' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedSource(p.id)}
                  className="btn btn-pill"
                  style={{
                    padding: '0.35rem 0.9rem',
                    fontSize: 'var(--fs-xs)',
                    background: selectedSource === p.id ? 'var(--primary)' : 'var(--surface-container)',
                    color: selectedSource === p.id ? 'white' : 'var(--on-surface-variant)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Property Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--on-surface-variant)', fontWeight: '600', textTransform: 'uppercase' }}>
                Type:
              </span>
              {['ALL', 'Resort', 'Hotel', 'Heritage', 'Villa'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className="btn btn-pill"
                  style={{
                    padding: '0.35rem 0.9rem',
                    fontSize: 'var(--fs-xs)',
                    background: selectedType === t ? 'var(--secondary)' : 'var(--surface-container)',
                    color: selectedType === t ? 'white' : 'var(--on-surface-variant)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {t === 'ALL' ? 'All Types' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Selector Aligned in Same Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <label htmlFor="hotel-sort-select" style={{ fontSize: 'var(--fs-sm)', color: 'var(--on-surface-variant)', fontWeight: '600' }}>
              Sort By:
            </label>
            <select
              id="hotel-sort-select"
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: 'var(--fs-sm)' }}
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
            >
              <option value="default">Featured & Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rating</option>
            </select>
          </div>
        </div>

        {/* Error State if Backend Offline */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <strong>Server Connectivity Notice:</strong> {error}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={loadInitialHotels}
                className="btn btn-secondary btn-pill"
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Hotels Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--on-surface-variant)' }}>
            <p style={{ fontSize: '1.1rem' }}>Aggregating premier hotel listings from live inventory...</p>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)' }}>
            <h3>No hotels matched your criteria</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
              Try adjusting your search destination, dates, or clearing provider filters.
            </p>
            <button
              onClick={() => {
                setSearchParams({ destination: '', checkIn: '', checkOut: '', guests: 2, rooms: 1 })
                setSelectedSource('ALL')
                setSelectedType('ALL')
                loadInitialHotels()
              }}
              className="btn btn-secondary btn-pill"
              style={{ marginTop: '1rem', padding: '0.5rem 1.25rem' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
