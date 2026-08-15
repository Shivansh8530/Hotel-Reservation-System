# Hotel Reservation System — Frontend (React + Vite)

## Setup

```
npm install
npm run dev
```

App runs at `http://localhost:5173`. Make sure the backend is running at `http://localhost:8080` first (see the backend README).

## Project structure

```
src/
 ├── components/    Navbar, RoomCard, PrivateRoute/AdminRoute (route guards)
 ├── pages/         Rooms, RoomDetail, Login, Signup, MyBookings, AdminDashboard
 ├── services/      api.js — the ONLY file with the backend URL
 ├── context/       AuthContext.jsx — holds logged-in user + JWT in localStorage
 ├── App.jsx        all routes
 └── main.jsx       entry point
```

## Test flow

1. Start backend, then `npm run dev`.
2. Sign up a new user at `/signup` — you're logged in immediately.
3. Promote yourself to ADMIN in MongoDB Compass (see backend README), then log in again to get an admin-role token.
4. As admin, go to `/admin` and add a few rooms.
5. Log in as a normal user (or just browse), go to `/rooms`, pick dates, and book a room.
6. Check `/my-bookings` to see and cancel it.

## Before deploying

In `src/services/api.js`, change:
```js
const BASE_URL = 'http://localhost:8080'
```
to your deployed Render backend URL, e.g. `https://hotel-backend-xxxx.onrender.com`. Also add your deployed frontend's URL to `SecurityConfig.corsConfigurationSource()` on the backend so the browser doesn't block requests.
