import { useEffect, useState } from 'react'
import { getRooms, createRoom, updateRoom, deleteRoom, getAllBookings, getAllUsers, updateUserRole, createAdminUser } from '../services/api.js'

const emptyRoom = {
  roomNumber: '',
  roomType: 'DELUXE',
  pricePerNight: '',
  capacity: 2,
  amenities: '',
  description: '',
  imageUrl: '',
  available: true
}

const DEMO_ADMIN_ROOMS = [
  { id: 101, roomNumber: '101', roomType: 'DELUXE', pricePerNight: 280, capacity: 2, available: true, description: 'Ocean View Sanctuary' },
  { id: 102, roomNumber: '102', roomType: 'SUITE', pricePerNight: 420, capacity: 3, available: true, description: 'Heritage Suite' },
  { id: 103, roomNumber: '103', roomType: 'VILLA', pricePerNight: 650, capacity: 4, available: false, description: 'Alpine Forest Villa' }
]

const DEMO_ADMIN_BOOKINGS = [
  { id: 'BK-99182', userId: 'usr_88', roomId: 101, checkIn: '2026-08-10', checkOut: '2026-08-14', totalPrice: 1120, status: 'CONFIRMED' },
  { id: 'BK-99183', userId: 'usr_42', roomId: 103, checkIn: '2026-08-12', checkOut: '2026-08-16', totalPrice: 2600, status: 'CONFIRMED' },
  { id: 'BK-99175', userId: 'usr_19', roomId: 102, checkIn: '2026-07-01', checkOut: '2026-07-05', totalPrice: 1680, status: 'CANCELLED' }
]

const DEMO_USERS = []

export default function AdminDashboard() {
  const [tab, setTab] = useState('rooms')
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', phone: '' })

  const [form, setForm] = useState(emptyRoom)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    try {
      const resR = await getRooms()
      setRooms(resR.data?.length > 0 ? resR.data : DEMO_ADMIN_ROOMS)
    } catch (err) {
      setRooms(DEMO_ADMIN_ROOMS)
    }

    try {
      const resB = await getAllBookings()
      setBookings(resB.data?.length > 0 ? resB.data : DEMO_ADMIN_BOOKINGS)
    } catch (err) {
      setBookings(DEMO_ADMIN_BOOKINGS)
    }

    try {
      const resU = await getAllUsers()
      setUsers(resU.data?.length > 0 ? resU.data : DEMO_USERS)
    } catch (err) {
      setUsers(DEMO_USERS)
    }
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
    setForm({ ...room, amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || '') })
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
      loadData()
    } catch (err) {
      console.log('Using local state update for admin operations in showcase mode.')
      if (editingId) {
        setRooms((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...payload } : r)))
        setSuccess(`Updated Room ${form.roomNumber} locally.`)
      } else {
        const newR = { ...payload, id: Date.now() }
        setRooms((prev) => [...prev, newR])
        setSuccess(`Added Room ${form.roomNumber} locally.`)
      }
      resetForm()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this room from inventory?')) return
    try {
      await deleteRoom(id)
      loadData()
    } catch (err) {
      setRooms((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Change this user's role to ${newRole}?`)) return
    
    try {
      await updateUserRole(userId, { role: newRole })
      setSuccess(`User role updated to ${newRole}.`)
      loadData()
    } catch (err) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setSuccess(`User role updated to ${newRole} (local mode).`)
    }
  }

  const handleAdminFormChange = (e) => setAdminForm({ ...adminForm, [e.target.name]: e.target.value })

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await createAdminUser(adminForm)
      setSuccess('Admin account created successfully.')
      setAdminForm({ name: '', email: '', password: '', phone: '' })
      setShowAdminForm(false)
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create admin account.')
    }
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>StayEase Admin Console</h1>
        <p style={{ color: 'var(--on-surface-variant)' }}>
          Manage hotel room inventory, reservations, pricing schedules, and availability states.
        </p>
      </div>

      {/* Stats Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Rooms</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--on-surface)', marginTop: '0.2rem' }}>{rooms.length}</div>
        </div>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Reservations</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.2rem' }}>
            {bookings.filter((b) => b.status === 'CONFIRMED').length}
          </div>
        </div>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Units</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--tertiary)', marginTop: '0.2rem' }}>
            {rooms.filter((r) => r.available).length}
          </div>
        </div>
        <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--on-surface)', marginTop: '0.2rem' }}>
            {users.length}
          </div>
        </div>
      </div>

      {/* Console Tab Switches */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`btn btn-pill ${tab === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('rooms')}
        >
          Manage Room Inventory
        </button>
        <button
          className={`btn btn-pill ${tab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('bookings')}
        >
          Master Reservations Register
        </button>
        <button
          className={`btn btn-pill ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('users')}
        >
          User Management
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {tab === 'rooms' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2.5rem' }}>
          {/* Room Form */}
          <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-soft)' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>{editingId ? 'Edit Room Specification' : 'Add New Room Unit'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label>Room Number / Code</label>
                <input
                  name="roomNumber"
                  className="form-control"
                  placeholder="e.g. 104"
                  value={form.roomNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Accommodation Category</label>
                <select name="roomType" className="form-control" value={form.roomType} onChange={handleChange}>
                  <option value="DELUXE">DELUXE</option>
                  <option value="SUITE">SUITE</option>
                  <option value="VILLA">VILLA</option>
                  <option value="EXECUTIVE">EXECUTIVE</option>
                  <option value="STANDARD">STANDARD</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Price / Night ($)</label>
                  <input
                    type="number"
                    name="pricePerNight"
                    className="form-control"
                    placeholder="280"
                    value={form.pricePerNight}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Max Guests</label>
                  <input
                    type="number"
                    name="capacity"
                    className="form-control"
                    placeholder="2"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Amenities (Comma-separated)</label>
                <input
                  name="amenities"
                  className="form-control"
                  placeholder="Wi-Fi, Balcony, Tub"
                  value={form.amenities}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
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
                Make unit available for public reservation
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
                  <th>Nightly Rate</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td><strong>Room {r.roomNumber}</strong></td>
                    <td><span className="amenity-pill">{r.roomType}</span></td>
                    <td style={{ color: 'var(--primary)', fontWeight: '600' }}>${r.pricePerNight}</td>
                    <td>{r.capacity} Guests</td>
                    <td>
                      <span className={`status-pill ${r.available ? 'status-confirmed' : 'status-cancelled'}`}>
                        {r.available ? 'AVAILABLE' : 'MAINTENANCE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-pill"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-pill"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Guest ID</th>
                <th>Room ID</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Total Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.id}</strong></td>
                  <td>{b.userId}</td>
                  <td>Room {b.roomId}</td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: '600' }}>${b.totalPrice}</td>
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

      {tab === 'users' && (
        <div className="table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--outline-variant)' }}>
            <h3 style={{ margin: 0 }}>Registered Users</h3>
            <button className="btn btn-primary btn-pill" onClick={() => setShowAdminForm(!showAdminForm)}>
              {showAdminForm ? 'Cancel' : '+ Invite New Admin'}
            </button>
          </div>

          {showAdminForm && (
            <div style={{ padding: '1.5rem', background: 'var(--surface-container)', borderBottom: '1px solid var(--outline-variant)' }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Create Admin Account</h4>
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
                  <button type="submit" className="btn btn-primary btn-pill">Create Account</button>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>
                    <span className={`status-pill ${u.role === 'ADMIN' ? 'status-confirmed' : 'status-cancelled'}`} style={u.role === 'USER' ? { background: 'var(--surface-container-high)', color: 'var(--on-surface)', borderColor: 'var(--outline-variant)' } : {}}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-pill ${u.role === 'ADMIN' ? 'btn-secondary' : 'btn-outline'}`}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => handleRoleToggle(u.id, u.role)}
                    >
                      {u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '1rem', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: '0.9rem', borderTop: '1px solid var(--outline-variant)' }}>
            <strong>Note:</strong> To add an admin from outside this dashboard, run <code>db.users.updateOne({`{ email: "user@example.com" }`}, {`{ $set: { role: "ADMIN" } }`})</code> in MongoDB.
          </div>
        </div>
      )}
    </div>
  )
}
