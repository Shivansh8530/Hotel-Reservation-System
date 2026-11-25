import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getHotels } from '../services/api.js'
import HotelCard from '../components/HotelCard.jsx'

const COLLECTIONS = [
  {
    title: 'Coastal Sanctuaries',
    subtitle: 'Goa & Konkan Shores',
    type: 'Resort',
    destination: 'Goa',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80',
    tag: 'Oceanfront'
  },
  {
    title: 'Heritage Havelis',
    subtitle: 'Jaipur & Udaipur',
    type: 'Heritage',
    destination: 'Jaipur',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
    tag: 'Royal Estates'
  },
  {
    title: 'Private Villas',
    subtitle: 'Secluded Luxury Retreats',
    type: 'Villa',
    destination: '',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
    tag: 'Bespoke Stays'
  },
  {
    title: 'Metropolitan Suites',
    subtitle: 'Mumbai & New Delhi',
    type: 'Hotel',
    destination: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
    tag: 'City Icons'
  }
]

const PILLARS = [
  {
    number: '01',
    title: 'Unified Sanctuary Network',
    description: 'Compare StayEase Direct suites alongside curated Booking.com and Expedia partner estates in one serene interface.'
  },
  {
    number: '02',
    title: 'Verified Real-Time Availability',
    description: 'Live room inventory and transparent INR pricing with zero hidden fees—from instant booking to effortless rescheduling.'
  },
  {
    number: '03',
    title: '24/7 Bespoke Concierge',
    description: 'Personalized itineraries, private transfers, and dedicated guest support for every reservation.'
  }
]

const TESTIMONIALS = [
  {
    quote: 'The heritage suite in Jaipur felt like stepping into a private palace. Rescheduling our dates took less than thirty seconds.',
    author: 'Ananya Sharma',
    stay: 'StayEase Member • Jaipur'
  },
  {
    quote: 'Finally a booking platform that curates properties with real taste instead of overwhelming you with thousands of generic listings.',
    author: 'Rohan Malhotra',
    stay: 'Verified Guest • Goa'
  },
  {
    quote: 'Transparent pricing, serene design, and effortless check-in. StayEase is now our first stop for every weekend getaway.',
    author: 'Meera & Vikram Nair',
    stay: 'Direct Guests • Mumbai'
  }
]

export default function Landing() {
  const navigate = useNavigate()
  const [featuredHotels, setFeaturedHotels] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [search, setSearch] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  })

  useEffect(() => {
    let active = true
    getHotels(true)
      .then((res) => {
        if (active && Array.isArray(res.data)) {
          setFeaturedHotels(res.data.slice(0, 3))
        }
      })
      .catch(() => {
        if (active) setFeaturedHotels([])
      })
      .finally(() => {
        if (active) setLoadingFeatured(false)
      })
    return () => { active = false }
  }, [])

  const handleQuickSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.destination.trim()) params.set('destination', search.destination.trim())
    if (search.checkIn) params.set('checkIn', search.checkIn)
    if (search.checkOut) params.set('checkOut', search.checkOut)
    if (search.guests) params.set('guests', String(search.guests))
    const qs = params.toString()
    navigate(qs ? `/hotels?${qs}` : '/hotels')
  }

  const handleCollectionClick = (col) => {
    const params = new URLSearchParams()
    if (col.destination) params.set('destination', col.destination)
    if (col.type) params.set('propertyType', col.type)
    navigate(`/hotels?${params.toString()}`)
  }

  return (
    <main className="landing-page">
      {/* Editorial Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero-inner">
            <span className="hero-eyebrow">StayEase Hospitality Sanctuary</span>
            <h1 className="landing-hero-title">
              Where Quiet Luxury Meets Effortless Stays
            </h1>
            <p className="landing-hero-subtitle">
              Curated coastal villas, royal heritage havelis, and architectural sanctuaries across India—unified with real-time availability and bespoke concierge care.
            </p>

            <div className="landing-hero-actions">
              <Link to="/hotels" className="btn btn-primary btn-pill landing-cta-btn">
                Explore Sanctuaries
              </Link>
              <Link to="/rooms" className="btn btn-pill landing-cta-secondary">
                Browse Suites & Rooms
              </Link>
            </div>
          </div>

          {/* Floating Quick Search Bar */}
          <div className="search-widget landing-search-widget">
            <form onSubmit={handleQuickSearch} className="landing-search-form" role="search" aria-label="Quick sanctuary search">
              <div className="form-group">
                <label htmlFor="landing-destination">Destination</label>
                <input
                  id="landing-destination"
                  type="text"
                  className="form-control"
                  placeholder="Goa, Jaipur, Mumbai..."
                  value={search.destination}
                  onChange={(e) => setSearch({ ...search, destination: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="landing-checkin">Check-In</label>
                <input
                  id="landing-checkin"
                  type="date"
                  className="form-control"
                  value={search.checkIn}
                  onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="landing-checkout">Check-Out</label>
                <input
                  id="landing-checkout"
                  type="date"
                  className="form-control"
                  value={search.checkOut}
                  onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="landing-guests">Guests</label>
                <select
                  id="landing-guests"
                  className="form-control"
                  value={search.guests}
                  onChange={(e) => setSearch({ ...search, guests: Number(e.target.value) })}
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-pill landing-search-submit">
                Search Stays
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Editorial Stats Strip */}
      <section className="landing-stats-section">
        <div className="container">
          <div className="landing-stats-grid">
            <div className="landing-stat-item">
              <div className="landing-stat-value">50+</div>
              <div className="landing-stat-label">Curated Sanctuaries</div>
            </div>
            <div className="landing-stat-item">
              <div className="landing-stat-value">3</div>
              <div className="landing-stat-label">Integrated Networks</div>
            </div>
            <div className="landing-stat-item">
              <div className="landing-stat-value">4.9★</div>
              <div className="landing-stat-label">Average Guest Rating</div>
            </div>
            <div className="landing-stat-item">
              <div className="landing-stat-value">24/7</div>
              <div className="landing-stat-label">Concierge Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="landing-section">
        <div className="container">
          <div className="landing-section-header">
            <div>
              <span className="landing-eyebrow">Curated Escapes</span>
              <h2>Sanctuaries by Atmosphere</h2>
            </div>
            <Link to="/hotels" className="landing-text-link">
              View All Properties →
            </Link>
          </div>

          <div className="landing-collections-grid">
            {COLLECTIONS.map((col) => (
              <button
                key={col.title}
                type="button"
                className="collection-card"
                onClick={() => handleCollectionClick(col)}
              >
                <img src={col.image} alt={col.title} className="collection-card-img" loading="lazy" />
                <div className="collection-card-overlay">
                  <span className="collection-tag">{col.tag}</span>
                  <h3>{col.title}</h3>
                  <p>{col.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sanctuaries (Live from Backend when available) */}
      {(loadingFeatured || featuredHotels.length > 0) && (
        <section className="landing-section landing-section-alt">
          <div className="container">
            <div className="landing-section-header">
              <div>
                <span className="landing-eyebrow">Signature Selection</span>
                <h2>Featured Sanctuaries</h2>
              </div>
              <Link to="/hotels" className="landing-text-link">
                Explore Full Directory →
              </Link>
            </div>

            {loadingFeatured ? (
              <div className="landing-featured-loading">
                Curating signature properties...
              </div>
            ) : (
              <div className="hotel-grid">
                {featuredHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why StayEase Pillars */}
      <section className="landing-section">
        <div className="container">
          <div className="landing-section-header">
            <div>
              <span className="landing-eyebrow">The StayEase Standard</span>
              <h2>Crafted for Discerning Travelers</h2>
            </div>
          </div>

          <div className="landing-pillars-grid">
            {PILLARS.map((pillar) => (
              <div key={pillar.number} className="pillar-card">
                <span className="pillar-number">{pillar.number}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Testimonials */}
      <section className="landing-section landing-section-alt">
        <div className="container">
          <div className="landing-section-header">
            <div>
              <span className="landing-eyebrow">Guest Voices</span>
              <h2>Stories from Our Sanctuaries</h2>
            </div>
          </div>

          <div className="landing-testimonials-grid">
            {TESTIMONIALS.map((item) => (
              <blockquote key={item.author} className="testimonial-card">
                <p className="testimonial-quote">“{item.quote}”</p>
                <footer className="testimonial-author">
                  <strong>{item.author}</strong>
                  <span>{item.stay}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Final Editorial CTA Banner */}
      <section className="landing-section">
        <div className="container">
          <div className="landing-cta-banner">
            <div className="landing-cta-banner-content">
              <span className="hero-eyebrow">Begin Your Journey</span>
              <h2>Ready for Your Next Sanctuary?</h2>
              <p>
                Create a StayEase account to unlock instant reservations, real-time date rescheduling, and member-exclusive suites.
              </p>
              <div className="landing-hero-actions">
                <Link to="/hotels" className="btn btn-primary btn-pill landing-cta-btn">
                  Start Exploring
                </Link>
                <Link to="/signup" className="btn btn-pill landing-cta-secondary">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
