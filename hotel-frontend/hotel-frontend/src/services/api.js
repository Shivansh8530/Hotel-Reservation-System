import axios from 'axios'

// The ONLY place that knows the backend URL.
// Local dev: Spring Boot on 8080. When you deploy to Render, change this
// one line to your deployed backend URL (e.g. https://hotel-backend-xxxx.onrender.com).
const BASE_URL = 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
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
export const createRoom = (data) => api.post('/api/rooms', data)
export const updateRoom = (id, data) => api.put(`/api/rooms/${id}`, data)
export const deleteRoom = (id) => api.delete(`/api/rooms/${id}`)

// --- Bookings ---
export const createBooking = (data) => api.post('/api/bookings', data)
export const getMyBookings = () => api.get('/api/bookings/me')
export const getAllBookings = () => api.get('/api/bookings/all')
export const cancelBooking = (id) => api.put(`/api/bookings/${id}/cancel`)

// --- Reviews ---
export const getReviewsForRoom = (roomId) => api.get(`/api/reviews/room/${roomId}`)
export const createReview = (data) => api.post('/api/reviews', data)
export const deleteReview = (id) => api.delete(`/api/reviews/${id}`)

// --- Admin Users ---
export const getAllUsers = () => api.get('/api/admin/users')
export const updateUserRole = (id, data) => api.put(`/api/admin/users/${id}/role`, data)
export const createAdminUser = (data) => api.post('/api/admin/users', data)

export default api
