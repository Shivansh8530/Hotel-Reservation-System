import { useEffect, useState } from 'react'
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getAllBookings,
  getAllUsers,
  updateUserRole,
  createAdminUser,
  getHotels,
  createHotel,
  deleteHotel,
  getAdminLogs
} from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR } from '../utils/currency.js'

const emptyRoom = {
  roomNumber: '',
  roomType: 'DELUXE',
  pricePerNight: '',
  capacity: 2,
  amenities: '',
  description: '',
  hotelId: '',
  imageUrl: '',
  available: true
}

const emptyHotel = {
  name: '',
  description: '',
  propertyType: 'Hotel',
  city: '',
  state: '',
  address: '',
  startingPrice: 5000,
  rating: 4.8,
  featured: false
}

export default function AdminDashboard() {
  const { user: currentUser, isOwner } = useAuth()
  const [tab, setTab] = useState('rooms')
  const [rooms, setRooms] = useState([])
  const [hotels, setHotels] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logFilter, setLogFilter] = useState('other') // 'other' | 'all'
  const [logSearch, setLogSearch] = useState('')
  
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', phone: '' })

  const [form, setForm] = useState(emptyRoom)
  const [hotelForm, setHotelForm] = useState(emptyHotel)
  const [showHotelModal, setShowHotelModal] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const loadLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await getAdminLogs()
      setLogs(res.data || [])
    } catch (err) {
      console.error('Failed to load admin logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const resR = await getRooms()
      setRooms(resR.data || [])
    } catch (err) {
      console.error('Failed to load rooms:', err)
    }

    try {
      const resH = await getHotels()
      setHotels(resH.data || [])
    } catch (err) {
      console.error('Failed to load hotels:', err)
    }

    try {
      const resB = await getAllBookings()
      setBookings(resB.data || [])
    } catch (err) {
      console.error('Failed to load bookings:', err)
    }

    try {
      const resU = await getAllUsers()
      setUsers(resU.data || [])
    } catch (err) {
      console.error('Failed to load users:', err)
    }

    await loadLogs()
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleEdit = (room) => {
    setEditingId(room.id)
    setForm({
      ...room,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || ''),
      hotelId: room.hotelId || ''
    })
    setTab('rooms')
  }

  const resetForm = () => {
    setForm(emptyRoom)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      hotelId: form.hotelId || null,
      amenities: typeof form.amenities === 'string' ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean) : form.amenities
    }

    try {
      if (editingId) {
        await updateRoom(editingId, payload)
        setSuccess(`Room ${form.roomNumber} updated successfully.`)
      } else {
        await createRoom(payload)
        setSuccess(`New room ${form.roomNumber} added to inventory.`)
      }
      resetForm()
      const resR = await getRooms()
      setRooms(resR.data || [])
      loadLogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room. Check input values.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return
    try {
      await deleteRoom(id)
      setSuccess('Room deleted successfully.')
      setRooms(rooms.filter((r) => r.id !== id))
      loadLogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room.')
    }
  }

  const handleRoleToggle = async (userId, currentRole) => {
    if (!isOwner) {
      setError('Permission denied: Only the Owner / Super Admin can promote or demote users.')
      return
    }
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Change this user's role to ${newRole}?`)) return
    try {
      await updateUserRole(userId, { role: newRole })
      setSuccess(`User role updated to ${newRole}.`)
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      loadLogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.')
    }
  }

  const handleAdminFormChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value })
  }

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!isOwner) {
      setError('Permission denied: Only the Owner / Super Admin can create or invite new admins.')
      return
    }
    try {
      await createAdminUser(adminForm)
      setSuccess(`Admin ${adminForm.email} created successfully.`)
      setShowAdminForm(false)
      setAdminForm({ name: '', email: '', password: '', phone: '' })
      const resU = await getAllUsers()
      setUsers(resU.data || [])
      loadLogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin user.')
    }
  }

  const handleHotelSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const payload = {
        name: hotelForm.name,
        description: hotelForm.description,
        propertyType: hotelForm.propertyType,
        location: {
          city: hotelForm.city,
          state: hotelForm.state,
          country: 'India',
          address: hotelForm.address
        },
        price: {
          amount: Number(hotelForm.startingPrice),
          currency: 'INR',
          taxesIncluded: false
        },
        rating: Number(hotelForm.rating),
        featured: hotelForm.featured,
        amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Free Breakfast']
      }
      await createHotel(payload)
      setSuccess(`Hotel "${hotelForm.name}" created successfully.`)
      setShowHotelModal(false)
      setHotelForm(emptyHotel)
      const resH = await getHotels()
      setHotels(resH.data || [])
      loadLogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create hotel.')
    }
  }

  const handleDeleteHotel = async (hotelId) => {
    if (!confirm('Are you sure you want to remove this hotel?')) return
    try {
      await deleteHotel(hotelId)
      setSuccess('Hotel removed successfully.')
      setHotels(hotels.filter((h) => h.id !== hotelId))
      loadLogs()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete hotel.')
    }
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      {/* Dashboard Header with Quick Log Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.3rem' }}>Sanctuary Command & Admin Console</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.98rem' }}>
            Manage unified hotel properties, room inventory, reservations, user roles, and admin operational audits.
          </p>
        </div>
        <button
          className={`btn btn-pill ${tab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setTab('logs')
            loadLogs()
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          id="btn-quick-admin-logs"
        >
          <span>📜 View Admin Logs</span>
          {logs.length > 0 && (
            <span style={{ background: tab === 'logs' ? 'rgba(255,255,255,0.25)' : 'var(--primary)', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 700 }}>
              {logs.length}
            </span>
          )}
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hotels</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--on-surface)', marginTop: '0.2rem' }}>{hotels.length}</div>
        </div>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Rooms</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--on-surface)', marginTop: '0.2rem' }}>{rooms.length}</div>
        </div>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Bookings</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.2rem' }}>
            {bookings.filter((b) => b.status === 'CONFIRMED').length}
          </div>
        </div>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--on-surface)', marginTop: '0.2rem' }}>
            {users.length}
          </div>
        </div>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem', cursor: 'pointer' }} onClick={() => setTab('logs')}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Logs</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--tertiary)', marginTop: '0.2rem' }}>
            {logs.length}
          </div>
        </div>
      </div>

      {/* Console Tab Switches */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-pill ${tab === 'hotels' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('hotels')}
        >
          Hotels & Sanctuaries
        </button>
        <button
          className={`btn btn-pill ${tab === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('rooms')}
        >
          Room Inventory
        </button>
        <button
          className={`btn btn-pill ${tab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('bookings')}
        >
          Reservations Register
        </button>
        <button
          className={`btn btn-pill ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('users')}
        >
          User Management
        </button>
        <button
          className={`btn btn-pill ${tab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setTab('logs')
            loadLogs()
          }}
          id="tab-btn-admin-logs"
        >
          🛡️ Admin Audit Logs
        </button>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* TAB: HOTELS */}
      {tab === 'hotels' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Registered Hotel Properties</h3>
            <button className="btn btn-primary btn-pill" onClick={() => setShowHotelModal(!showHotelModal)}>
              {showHotelModal ? 'Close Form' : '+ Add New Hotel'}
            </button>
          </div>

          {showHotelModal && (
            <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '2rem' }}>
              <h4 style={{ marginTop: 0, marginBottom: '1.25rem' }}>Create New Sanctuary Property</h4>
              <form onSubmit={handleHotelSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label htmlFor="admin-hotel-name">Hotel Name</label>
                  <input id="admin-hotel-name" name="name" className="form-control" value={hotelForm.name} onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-hotel-type">Property Type</label>
                  <select id="admin-hotel-type" name="propertyType" className="form-control" value={hotelForm.propertyType} onChange={(e) => setHotelForm({ ...hotelForm, propertyType: e.target.value })}>
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="admin-hotel-city">City</label>
                  <input id="admin-hotel-city" name="city" className="form-control" value={hotelForm.city} onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-hotel-state">State</label>
                  <input id="admin-hotel-state" name="state" className="form-control" value={hotelForm.state} onChange={(e) => setHotelForm({ ...hotelForm, state: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-hotel-address">Address</label>
                  <input id="admin-hotel-address" name="address" className="form-control" value={hotelForm.address} onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-hotel-price">Starting Price (₹)</label>
                  <input id="admin-hotel-price" name="startingPrice" type="number" className="form-control" value={hotelForm.startingPrice} onChange={(e) => setHotelForm({ ...hotelForm, startingPrice: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="admin-hotel-desc">Description</label>
                  <textarea id="admin-hotel-desc" name="description" rows={2} className="form-control" value={hotelForm.description} onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })} required />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={hotelForm.featured} onChange={(e) => setHotelForm({ ...hotelForm, featured: e.target.checked })} />
                    Featured on Landing Page
                  </label>
                  <button type="submit" className="btn btn-primary btn-pill" style={{ marginLeft: 'auto' }}>
                    Save Hotel Property
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Hotel Name</th>
                  <th>Source / Provider</th>
                  <th>City</th>
                  <th>Property Type</th>
                  <th>Starting Rate</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h.id}>
                    <td><strong>{h.name}</strong></td>
                    <td>
                      <span className={`status-pill ${h.source === 'INTERNAL' ? 'status-confirmed' : 'status-completed'}`}>
                        {h.providerLabel || h.source}
                      </span>
                    </td>
                    <td>{h.location?.city || 'India'}</td>
                    <td><span className="amenity-pill">{h.propertyType}</span></td>
                    <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{formatINR(h.price?.amount || 0)}</td>
                    <td>★ {h.rating}</td>
                    <td>
                      {h.source === 'INTERNAL' && (
                        <button onClick={() => handleDeleteHotel(h.id)} className="btn btn-danger btn-pill" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ROOMS */}
      {tab === 'rooms' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2.5rem' }}>
          {/* Room Form */}
          <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-soft)' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>{editingId ? 'Edit Room Unit' : 'Add Room Unit'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label htmlFor="admin-room-hotel">Parent Hotel Sanctuary</label>
                <select
                  id="admin-room-hotel"
                  name="hotelId"
                  className="form-control"
                  value={form.hotelId}
                  onChange={handleChange}
                >
                  <option value="">-- Unassigned / Standalone --</option>
                  {hotels.filter(h => h.source === 'INTERNAL').map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.location?.city})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="admin-room-number">Room Number / Code</label>
                <input
                  id="admin-room-number"
                  name="roomNumber"
                  className="form-control"
                  placeholder="e.g. 104"
                  value={form.roomNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-room-type">Accommodation Category</label>
                <select id="admin-room-type" name="roomType" className="form-control" value={form.roomType} onChange={handleChange}>
                  <option value="DELUXE">DELUXE</option>
                  <option value="SUITE">SUITE</option>
                  <option value="VILLA">VILLA</option>
                  <option value="EXECUTIVE">EXECUTIVE</option>
                  <option value="STANDARD">STANDARD</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="admin-room-price">Price / Night (₹)</label>
                  <input
                    id="admin-room-price"
                    type="number"
                    name="pricePerNight"
                    className="form-control"
                    placeholder="6499"
                    value={form.pricePerNight}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-room-capacity">Guest Capacity</label>
                  <input
                    id="admin-room-capacity"
                    type="number"
                    name="capacity"
                    className="form-control"
                    min={1}
                    max={10}
                    value={form.capacity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="admin-room-image">Image URL</label>
                <input
                  id="admin-room-image"
                  name="imageUrl"
                  className="form-control"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-room-amenities">Amenities (Comma-separated)</label>
                <input
                  id="admin-room-amenities"
                  name="amenities"
                  className="form-control"
                  placeholder="Wi-Fi, Balcony, Tub"
                  value={form.amenities}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-room-desc">Description</label>
                <textarea
                  id="admin-room-desc"
                  name="description"
                  className="form-control"
                  rows={3}
                  placeholder="Editorial description of the suite..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--primary)', width: 18, height: 18 }}
                />
                Make unit available for reservation
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary btn-pill" style={{ flex: 1 }}>
                  {editingId ? 'Update Suite' : 'Add Room'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary btn-pill" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Rooms Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Room Code</th>
                  <th>Type</th>
                  <th>Hotel</th>
                  <th>Nightly Rate</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => {
                  const parentHotel = hotels.find(h => h.id === r.hotelId)
                  return (
                    <tr key={r.id}>
                      <td><strong>Room {r.roomNumber}</strong></td>
                      <td><span className="amenity-pill">{r.roomType}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{parentHotel ? parentHotel.name : 'Standalone'}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{formatINR(r.pricePerNight)}</td>
                      <td>{r.capacity} Guests</td>
                      <td>
                        <span className={`status-pill ${r.available ? 'status-confirmed' : 'status-cancelled'}`}>
                          {r.available ? 'AVAILABLE' : 'RESERVED'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(r)} className="btn btn-secondary btn-pill" style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="btn btn-danger btn-pill" style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BOOKINGS */}
      {tab === 'bookings' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>User ID</th>
                <th>Room ID</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><code>{b.id}</code></td>
                  <td>{b.userId}</td>
                  <td>{b.roomId}</td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{formatINR(b.totalPrice)}</td>
                  <td>
                    <span className={`status-pill ${b.status === 'CANCELLED' ? 'status-cancelled' : 'status-confirmed'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: USERS */}
      {tab === 'users' && (
        <div className="table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--outline-variant)', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Registered Users & Role Governance</h3>
              {!isOwner ? (
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--error)', fontWeight: 500 }}>
                  🔒 Role promotion and demotion is restricted to the <strong>Owner / Super Admin</strong>.
                </p>
              ) : (
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                  👑 You are logged in as the <strong>Owner / Super Admin</strong>. You have exclusive authority to promote or demote administrators.
                </p>
              )}
            </div>
            {isOwner && (
              <button className="btn btn-primary btn-pill" onClick={() => setShowAdminForm(!showAdminForm)}>
                {showAdminForm ? 'Cancel' : '+ Invite New Admin'}
              </button>
            )}
          </div>

          {showAdminForm && isOwner && (
            <div style={{ padding: '1.5rem', background: 'var(--surface-container)', borderBottom: '1px solid var(--outline-variant)' }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Create New Admin Account</h4>
              <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Full Name</label>
                  <input name="name" className="form-control" value={adminForm.name} onChange={handleAdminFormChange} required />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Email</label>
                  <input name="email" type="email" className="form-control" value={adminForm.email} onChange={handleAdminFormChange} required />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Password</label>
                  <input name="password" type="password" className="form-control" value={adminForm.password} onChange={handleAdminFormChange} required />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Phone (Optional)</label>
                  <input name="phone" className="form-control" value={adminForm.phone} onChange={handleAdminFormChange} />
                </div>
                <div style={{ flex: '1 1 100%', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary btn-pill">Create Admin Account</button>
                </div>
              </form>
            </div>
          )}

          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Governance Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const userIsOwner = u.isOwner || u.email === 'admin@gmail.com' || u.role === 'OWNER' || u.role === 'SUPER_ADMIN'

                return (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      {userIsOwner ? (
                        <span className="status-pill status-owner">
                          👑 OWNER / SUPER ADMIN
                        </span>
                      ) : (
                        <span
                          className={`status-pill ${u.role === 'ADMIN' ? 'status-confirmed' : 'status-cancelled'}`}
                          style={u.role === 'USER' ? { background: 'var(--surface-container-high)', color: 'var(--on-surface)', borderColor: 'var(--outline-variant)' } : {}}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td>
                      {userIsOwner ? (
                        <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
                          Primary System Owner
                        </span>
                      ) : isOwner ? (
                        <button
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          className={`btn btn-pill ${u.role === 'ADMIN' ? 'btn-secondary' : 'btn-outline'}`}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          {u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--on-surface-variant)',
                            background: 'var(--surface-container-high)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-block'
                          }}
                          title="Only Owner / Super Admin can change user roles"
                        >
                          🔒 Owner Permission Required
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: ADMIN AUDIT LOGS */}
      {tab === 'logs' && (
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Admin Operational Audit Logs</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
                Complete verifiable audit trail of all operational changes performed by administrators across rooms, hotels, reservations, and credentials.
              </p>
            </div>
            <button
              onClick={loadLogs}
              className="btn btn-secondary btn-pill"
              disabled={logsLoading}
              style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
            >
              {logsLoading ? 'Refreshing...' : '🔄 Refresh Logs'}
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginRight: '0.25rem' }}>View:</span>
              <button
                className={`btn btn-pill ${logFilter === 'other' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLogFilter('other')}
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}
                id="btn-filter-other-admins"
              >
                👥 Other Admins' Actions
              </button>
              <button
                className={`btn btn-pill ${logFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLogFilter('all')}
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}
                id="btn-filter-all-logs"
              >
                📋 All Admin Activity
              </button>
            </div>

            <div style={{ minWidth: '260px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by admin name, email, action..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Filtered Logs Rendering */}
          {(() => {
            const currentEmail = currentUser?.email?.toLowerCase() || ''
            const filteredLogs = logs.filter((l) => {
              // 1. Other Admins filter
              if (logFilter === 'other' && currentEmail) {
                if (l.adminEmail && l.adminEmail.toLowerCase() === currentEmail) {
                  return false
                }
              }
              // 2. Search query filter
              if (logSearch.trim()) {
                const query = logSearch.toLowerCase()
                const matchAdmin = (l.adminName && l.adminName.toLowerCase().includes(query)) ||
                                   (l.adminEmail && l.adminEmail.toLowerCase().includes(query))
                const matchAction = l.action && l.action.toLowerCase().includes(query)
                const matchDetails = l.details && l.details.toLowerCase().includes(query)
                const matchEntity = l.entityType && l.entityType.toLowerCase().includes(query)
                return matchAdmin || matchAction || matchDetails || matchEntity
              }
              return true
            })

            if (filteredLogs.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--on-surface-variant)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                  <h4 style={{ margin: '0 0 0.5rem' }}>No activity logs found</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    {logFilter === 'other'
                      ? 'No operational actions by other administrators recorded yet.'
                      : 'No admin activities recorded in the system yet.'}
                  </p>
                </div>
              )
            }

            return (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '170px' }}>Timestamp</th>
                      <th style={{ width: '220px' }}>Administrator</th>
                      <th style={{ width: '160px' }}>Action</th>
                      <th style={{ width: '110px' }}>Entity</th>
                      <th>Operational Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      let actionClass = 'status-confirmed'
                      if (log.action?.includes('DELETE') || log.action?.includes('DEMOTE')) {
                        actionClass = 'status-cancelled'
                      } else if (log.action?.includes('UPDATE') || log.action?.includes('CANCEL')) {
                        actionClass = 'status-pending'
                      }

                      const date = log.timestamp ? new Date(log.timestamp) : null
                      const formattedTime = date
                        ? date.toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'

                      const isSelf = currentEmail && log.adminEmail?.toLowerCase() === currentEmail

                      return (
                        <tr key={log.id || Math.random()}>
                          <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: 'var(--on-surface-variant)' }}>
                            {formattedTime}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <strong>
                                {log.adminName || 'Admin'}{' '}
                                {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>(You)</span>}
                              </strong>
                              <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                                {log.adminEmail}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${actionClass}`} style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                              {log.action}
                            </span>
                          </td>
                          <td>
                            <span className="amenity-pill" style={{ fontSize: '0.75rem' }}>
                              {log.entityType || 'SYSTEM'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.88rem', color: 'var(--on-surface)' }}>
                            {log.details}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
