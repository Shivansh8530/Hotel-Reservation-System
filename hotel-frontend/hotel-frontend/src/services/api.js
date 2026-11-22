import axios from 'axios'

// Centralized API configuration:
// Automatically uses http://localhost:8082 when browsing on localhost,
// and the active Cloudflare tunnel when browsing on production Firebase hosting.
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8082'
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://patient-subscriber-freelance-verification.trycloudflare.com'
}

const api = axios.create({
  baseURL: getBaseUrl(),
})

// Attach the JWT token (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Auth ---
export const signup = (data) => api.post('/api/auth/signup', data)
export const login = (data) => api.post('/api/auth/login', data)
export const googleLogin = (data) => api.post('/api/auth/google', data)
export const forgotPassword = (data) => api.post('/api/auth/forgot-password', data)
export const resetPassword = (data) => api.post('/api/auth/reset-password', data)

// --- Hotels (Unified Aggregator) ---
export const getHotels = (featured = false) => api.get('/api/hotels', { params: { featured } })
export const searchHotels = (params = {}) => api.get('/api/hotels/search', { params })
export const getHotelById = (id) => api.get(`/api/hotels/${id}`)
export const createHotel = (data) => api.post('/api/hotels', data)
export const updateHotel = (id, data) => api.put(`/api/hotels/${id}`, data)
export const deleteHotel = (id) => api.delete(`/api/hotels/${id}`)

// --- Rooms ---
export const getRooms = (checkIn, checkOut) => {
  const params = {}
  if (checkIn && checkOut) {
    params.checkIn = checkIn
    params.checkOut = checkOut
  }
  return api.get('/api/rooms', { params })
}
export const getRoom = (id) => api.get(`/api/rooms/${id}`)
export const getRoomsByHotel = (hotelId) => api.get(`/api/rooms/hotel/${hotelId}`)
export const createRoom = (data) => api.post('/api/rooms', data)
export const updateRoom = (id, data) => api.put(`/api/rooms/${id}`, data)
export const deleteRoom = (id) => api.delete(`/api/rooms/${id}`)

// --- Bookings ---
export const createBooking = (data) => api.post('/api/bookings', data)
export const getMyBookings = () => api.get('/api/bookings/me')
export const getAllBookings = () => api.get('/api/bookings/all')
export const cancelBooking = (id) => api.put(`/api/bookings/${id}/cancel`)
export const rescheduleBooking = (id, data) => api.put(`/api/bookings/${id}/reschedule`, data)

// --- Reviews ---
export const getReviewsForRoom = (roomId) => api.get(`/api/reviews/room/${roomId}`)
export const createReview = (data) => api.post('/api/reviews', data)
export const deleteReview = (id) => api.delete(`/api/reviews/${id}`)

// --- Admin Users & Audit Logs ---
export const getAllUsers = () => api.get('/api/admin/users')
export const updateUserRole = (id, data) => api.put(`/api/admin/users/${id}/role`, data)
export const createAdminUser = (data) => api.post('/api/admin/users', data)
export const getAdminLogs = () => api.get('/api/admin/logs')

export default api
