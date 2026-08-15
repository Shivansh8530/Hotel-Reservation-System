import { Link } from 'react-router-dom'

const ROOM_IMAGES = {
  DELUXE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  SUITE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  EXECUTIVE: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
  STANDARD: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  VILLA: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  DEFAULT: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
}

export default function RoomCard({ room }) {
  const imageSrc = room.imageUrl || ROOM_IMAGES[room.roomType?.toUpperCase()] || ROOM_IMAGES.DEFAULT

  return (
    <div className="room-card-container">
      <div className="room-card-media">
        <img src={imageSrc} alt={room.name || `Room ${room.roomNumber}`} />
        <span className="room-type-badge">{room.roomType || 'Boutique Room'}</span>
        <div className="room-price-badge">
          ${room.pricePerNight || room.price} <span>/ night</span>
        </div>
      </div>

      <div className="room-card-body">
        <h3>{room.title || room.name || `Sanctuary Suite ${room.roomNumber}`}</h3>
        <p>
          {room.description || 'Designed with organic linen, floor-to-ceiling windows, and custom timber furniture for ultimate relaxation.'}
        </p>

        <div className="amenity-pills">
          {(room.amenities || ['King Bed', 'Ocean View', 'Free Wi-Fi', 'Private Balcony']).slice(0, 4).map((amenity, i) => (
            <span key={i} className="amenity-pill">
              {amenity}
            </span>
          ))}
        </div>

        <div className="room-card-footer">
          <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: '500' }}>
            Capacity: {room.capacity || 2} Guests
          </span>
          <Link to={`/rooms/${room.id}`} className="btn btn-primary btn-pill" style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}>
            Reserve Suite
          </Link>
        </div>
      </div>
    </div>
  )
}
