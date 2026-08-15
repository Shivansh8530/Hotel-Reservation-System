import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">StayEase Sanctuary</div>
            <p style={{ maxWidth: '340px', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Experience serene luxury, modern minimalist comfort, and bespoke hospitality across our boutique hotel locations worldwide.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--on-surface)', fontSize: '1rem', marginBottom: '1rem' }}>Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <Link to="/rooms" style={{ color: 'inherit' }}>Explore Rooms</Link>
              <Link to="/my-bookings" style={{ color: 'inherit' }}>My Reservations</Link>
              <Link to="/login" style={{ color: 'inherit' }}>Guest Portal</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--on-surface)', fontSize: '1rem', marginBottom: '1rem' }}>Sanctuaries</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <span>Alpine Chalet Suite</span>
              <span>Oceanfront Villa</span>
              <span>Boutique Heritage Suite</span>
              <span>Penthouse Horizon</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--on-surface)', fontSize: '1rem', marginBottom: '1rem' }}>Concierge</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Direct Line: +1 (800) 555-STAY</p>
            <p style={{ fontSize: '0.9rem' }}>concierge@stayease.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} StayEase Premium Hospitality Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
