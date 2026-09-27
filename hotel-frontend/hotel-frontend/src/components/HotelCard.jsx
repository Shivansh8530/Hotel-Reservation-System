import { Link } from 'react-router-dom'
import { formatINR } from '../utils/currency.js'

const DEFAULT_HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'

export default function HotelCard({ hotel }) {
  const imageUrl = (hotel.images && hotel.images.length > 0) ? hotel.images[0] : DEFAULT_HOTEL_IMG
  const priceAmount = hotel.price?.amount || 0
  const isExternal = hotel.source && hotel.source !== 'INTERNAL'
  const providerLabel = hotel.providerLabel || (isExternal ? hotel.source : 'Direct Partner')

  return (
    <div className="room-card-container">
      <div className="room-card-media">
        <img src={imageUrl} alt={hotel.name} />
        
        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="room-type-badge">
            {hotel.propertyType || 'Hotel'}
          </span>
          <span
            style={{
              background: isExternal ? 'rgba(30, 64, 175, 0.85)' : 'rgba(71, 101, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              fontSize: '0.72rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            {providerLabel}
          </span>
        </div>

        <div className="room-price-badge">
          {formatINR(priceAmount)} <span>/ night</span>
        </div>
      </div>

      <div className="room-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{hotel.name}</h3>
          {hotel.rating && (
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
              ★ {hotel.rating} {hotel.reviewCount ? `(${hotel.reviewCount})` : ''}
            </span>
          )}
        </div>

        {hotel.location && (
          <p style={{ fontSize: '0.84rem', color: 'var(--on-surface-variant)', marginBottom: '0.75rem', fontWeight: '500' }}>
            📍 {hotel.location.city}{hotel.location.state ? `, ${hotel.location.state}` : ''}, {hotel.location.country || 'India'}
          </p>
        )}

        <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: '1.5', marginBottom: '1rem', flex: 1 }}>
          {hotel.description ? (hotel.description.length > 130 ? `${hotel.description.slice(0, 130)}...` : hotel.description) : 'Experience world-class hospitality, tranquil suites, and premier amenities.'}
        </p>

        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="amenity-pills" style={{ marginBottom: '1.25rem' }}>
            {hotel.amenities.slice(0, 4).map((amenity, i) => (
              <span key={i} className="amenity-pill">
                {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="room-card-footer">
          <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', fontWeight: '500' }}>
            {isExternal ? 'Partner Inventory' : `${hotel.rooms?.length || 'Multiple'} Suites Available`}
          </span>
          <Link
            to={`/hotels/${hotel.id}`}
            className="btn btn-primary btn-pill"
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
          >
            {isExternal ? 'View & Partner Booking' : 'View Hotel & Rooms'}
          </Link>
        </div>
      </div>
    </div>
  )
}
