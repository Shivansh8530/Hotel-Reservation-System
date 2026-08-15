# Hotel Reservation System — Backend (Spring Boot + MongoDB)

## Run locally

1. Make sure MongoDB is running locally on `localhost:27017` (see the main beginner guide for install steps).
2. From this folder:
   ```
   mvn spring-boot:run
   ```
3. Backend runs at `http://localhost:8080`.

## Create your first admin user

Every signup via `/api/auth/signup` creates a `USER` role by default. To create an admin for testing:
1. Sign up normally through the API/frontend.
2. Open MongoDB Compass, connect to `localhost:27017`, open the `hotelReservationDB` database, `users` collection.
3. Find your user document and change `"role": "USER"` to `"role": "ADMIN"`. Save.
4. Log in again to get a fresh token with the ADMIN role (the token is issued from the role at login time).

## API reference

### Auth (public)
| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password, phone }` |
| POST | `/api/auth/login` | `{ email, password }` |

Both return `{ token, userId, name, email, role }`. Send the token on every other request as header:
`Authorization: Bearer <token>`

### Rooms
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/rooms` | Public | All rooms |
| GET | `/api/rooms?checkIn=2026-08-10&checkOut=2026-08-12` | Public | Only rooms free for those dates |
| GET | `/api/rooms/{id}` | Public | Single room |
| POST | `/api/rooms` | Admin | Create room |
| PUT | `/api/rooms/{id}` | Admin | Update room |
| DELETE | `/api/rooms/{id}` | Admin | Delete room |

Room request body:
```json
{
  "roomNumber": "101",
  "roomType": "Deluxe",
  "pricePerNight": 2500,
  "capacity": 2,
  "amenities": ["WiFi", "AC", "TV"],
  "description": "Spacious deluxe room with city view",
  "imageUrl": "",
  "available": true
}
```

### Bookings (require login)
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/bookings` | User | `{ roomId, checkIn, checkOut }` (dates as `YYYY-MM-DD`) |
| GET | `/api/bookings/me` | User | Your own bookings |
| PUT | `/api/bookings/{id}/cancel` | User/Admin | Cancel a booking |
| GET | `/api/bookings/all` | Admin | All bookings in the system |

## Testing with Postman before touching the frontend

1. `POST /api/auth/signup` → copy the returned `token`.
2. In Postman, set an environment variable `token` to that value.
3. On every protected request, add header `Authorization: Bearer {{token}}`.
4. Try `POST /api/rooms` as an ADMIN user, then `GET /api/rooms` to confirm it saved, then `POST /api/bookings` as a normal USER.

## Notes for your project report

- Passwords are hashed with BCrypt, never stored in plain text.
- Authentication is stateless — a JWT is issued on login/signup and verified on every request via `JwtAuthFilter`, no server-side session.
- Booking overlap is checked at the service layer (`BookingService.createBooking`) to prevent double-booking the same room for overlapping dates.
