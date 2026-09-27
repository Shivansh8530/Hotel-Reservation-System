# Hotel Reservation System

A full-stack hotel reservation platform built with React and Spring Boot, allowing users to browse rooms, make reservations, and leave reviews. Includes a comprehensive admin dashboard for managing users, rooms, and bookings.

---

## 📌 About the Project

The **Hotel Reservation System** is a college group project that demonstrates a complete full-stack web application with modern authentication, real-time availability checking, and role-based access control. Users can:

- Browse available hotel rooms
- Search for rooms by check-in/check-out dates
- View detailed room information with reviews
- Create and manage reservations
- Leave reviews for rooms
- Reset passwords via email
- Access a dedicated admin dashboard for managing the system

The system enforces security through JWT-based authentication and Spring Security, with MongoDB for persistent data storage.

---

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration** – Sign up with email, name, phone, and password
- **Login/Logout** – JWT-based stateless authentication
- **Password Recovery** – Forgot password and reset token flow
- **Role-Based Access Control** – USER and ADMIN roles with distinct permissions

### 🏨 Room Management
- **Browse Rooms** – View all available rooms with details and images
- **Search by Dates** – Filter rooms by check-in and check-out availability
- **Room Details** – View full room information including amenities, pricing, and reviews
- **Admin Room Management** – Create, update, and delete rooms (admin-only)

### 📋 Reservations
- **Create Bookings** – Make reservations for selected dates (authenticated users only)
- **View My Bookings** – Track all personal bookings with status
- **Cancel Bookings** – Cancel reservations (users can cancel their own, admins can cancel any)
- **Booking Status** – Track booking states (CONFIRMED, CANCELLED, COMPLETED)

### ⭐ Reviews & Ratings
- **Leave Reviews** – Submit ratings and comments for booked rooms (authenticated users only)
- **View Reviews** – Read public reviews for any room
- **Delete Reviews** – Users can delete their own, admins can delete any review

### 👨‍💼 Admin Dashboard
- **User Management** – View all users and manage roles (promote/demote between USER and ADMIN)
- **Create Admin Users** – Directly create new admin accounts
- **Room Management** – Full CRUD operations on rooms
- **Booking Management** – View all bookings across the system
- **Access Control** – Role-based UI and endpoint restrictions

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI library for dynamic user interfaces |
| **Build Tool (Frontend)** | Vite 5 | Fast ES module bundler and dev server |
| **HTTP Client** | Axios | Promise-based HTTP client with interceptors |
| **Frontend Routing** | React Router DOM 6 | Client-side navigation and route protection |
| **Backend Framework** | Spring Boot 3.3.4 | Java framework for REST APIs and business logic |
| **Backend Language** | Java 21 | Backend server implementation |
| **Build Tool (Backend)** | Maven 3 | Java project building and dependency management |
| **Security** | Spring Security | Authentication, authorization, and CORS management |
| **Authentication** | JWT (JJWT 0.12.6) | Stateless token-based authentication |
| **Database** | MongoDB | NoSQL document database |
| **Data Mapping** | Spring Data MongoDB | ORM layer for MongoDB operations |
| **Input Validation** | Spring Validation | Server-side request validation |
| **Code Generation** | Lombok 1.18 | Reduce boilerplate with annotations |
| **Version Control** | Git | Source code management |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│            (Runs on http://localhost:5173)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Components: Navbar, RoomCard, ReviewSection, etc.   │   │
│  │ Pages: Rooms, RoomDetail, Login, AdminDashboard     │   │
│  │ Services: API calls via axios with JWT interceptor  │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                 HTTP / REST API
           (Bearer Token Authorization)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                Backend (Spring Boot + Maven)                │
│            (Runs on http://localhost:8080)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Controllers: Auth, Room, Booking, Review, Admin     │   │
│  │ Services: Business logic layer                      │   │
│  │ Repositories: MongoDB data access                   │   │
│  │ Security: JWT Filter, Spring Security Config       │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                 MongoDB Driver
                       │
┌──────────────────────▼──────────────────────────────────────┐
│           Database (MongoDB / MongoDB Atlas)                │
│       (hotelReservationDB with collections)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Collections: users, rooms, bookings, reviews        │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
Hotel-Reservation-System/
│
├── hotel-backend/
│   └── hotel-backend/
│       ├── src/main/java/com/hotelreservation/
│       │   ├── controller/              # REST API endpoints
│       │   │   ├── AuthController.java
│       │   │   ├── RoomController.java
│       │   │   ├── BookingController.java
│       │   │   ├── ReviewController.java
│       │   │   └── AdminController.java
│       │   ├── service/                 # Business logic
│       │   │   ├── AuthService.java
│       │   │   ├── RoomService.java
│       │   │   ├── BookingService.java
│       │   │   └── ReviewService.java
│       │   ├── model/                   # Entity classes (MongoDB documents)
│       │   │   ├── User.java
│       │   │   ├── Room.java
│       │   │   ├── Booking.java
│       │   │   └── Review.java
│       │   ├── repository/              # Data access layer
│       │   │   ├── UserRepository.java
│       │   │   ├── RoomRepository.java
│       │   │   ├── BookingRepository.java
│       │   │   └── ReviewRepository.java
│       │   ├── dto/                     # Data transfer objects
│       │   │   ├── LoginRequest.java
│       │   │   ├── SignupRequest.java
│       │   │   ├── BookingRequest.java
│       │   │   ├── ReviewRequest.java
│       │   │   └── AuthResponse.java
│       │   ├── config/                  # Configuration classes
│       │   │   ├── SecurityConfig.java
│       │   │   └── AdminSeeder.java
│       │   ├── security/                # Security utilities
│       │   │   └── JwtAuthFilter.java
│       │   ├── exception/               # Custom exceptions & handlers
│       │   │   ├── ApiException.java
│       │   │   └── GlobalExceptionHandler.java
│       │   └── HotelReservationApplication.java  # Main entry point
│       ├── src/main/resources/
│       │   └── application-example.properties    # Config template
│       ├── pom.xml                      # Maven dependencies
│       └── README.md
│
├── hotel-frontend/
│   └── hotel-frontend/
│       ├── src/
│       │   ├── pages/                   # Page components
│       │   │   ├── Rooms.jsx
│       │   │   ├── RoomDetail.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Signup.jsx
│       │   │   ├── MyBookings.jsx
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── ForgotPassword.jsx
│       │   │   └── ResetPassword.jsx
│       │   ├── components/              # Reusable components
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── RoomCard.jsx
│       │   │   ├── ReviewSection.jsx
│       │   │   └── PrivateRoute.jsx     # Route guards
│       │   ├── context/                 # React context providers
│       │   │   ├── AuthContext.jsx      # Authentication state
│       │   │   └── ThemeContext.jsx     # Theme state
│       │   ├── services/
│       │   │   └── api.js               # Axios instance and API calls
│       │   ├── App.jsx                  # Main app component with routes
│       │   ├── main.jsx                 # React DOM entry point
│       │   └── index.css                # Global styles
│       ├── index.html                   # HTML template
│       ├── package.json                 # npm dependencies
│       ├── vite.config.js               # Vite configuration
│       ├── dist/                        # Build output (generated)
│       └── README.md
│
├── .gitignore                           # Git ignore rules
└── README.md                            # This file
```

---

## ⚙️ Requirements

Before running the project, ensure you have the following installed:

### Backend Requirements
- **Java 21** – Required for Spring Boot 3.3.4
- **Maven 3.6+** – For building and running the backend
- **MongoDB** – Local instance (MongoDB Community Edition) or MongoDB Atlas account for cloud database

### Frontend Requirements
- **Node.js 18+** – JavaScript runtime
- **npm 9+** – Node package manager (comes with Node.js)

### Optional Tools
- **Git** – For version control
- **MongoDB Compass** – GUI for MongoDB (helpful for development)
- **Postman** – API testing tool

---

## 🔍 Check Installed Versions

Run these commands in your terminal to verify your setup:

```bash
# Java version (should be 21)
java -version

# Maven version (should be 3.6 or higher)
mvn -version

# Node.js version (should be 18+)
node -v

# npm version (should be 9+)
npm -v

# Git version (optional)
git --version
```

---

## 🚀 Installation & Setup

### Prerequisites
Ensure MongoDB is running on your system. If using MongoDB locally:

```bash
# macOS (via Homebrew)
brew services start mongodb-community

# Linux (Ubuntu/Debian)
sudo systemctl start mongod

# Windows
# Start MongoDB from Services or run mongod.exe directly
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/Shivansh8530/Hotel-Reservation-System.git
cd Hotel-Reservation-System
```

### Step 2: Backend Setup

Navigate to the backend directory and configure MongoDB connection:

```bash
cd hotel-backend/hotel-backend
```

Create `src/main/resources/application.properties` with the following configuration:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/

# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/hotelReservationDB
# OR for MongoDB Atlas (cloud):
# spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/hotelReservationDB?retryWrites=true&w=majority

# JWT Configuration
jwt.secret=your-secret-key-here-make-it-long-and-random-at-least-32-characters
jwt.expiration=86400000

# Logging
logging.level.root=INFO
logging.level.com.hotelreservation=DEBUG
```

**⚠️ Important:**
- Replace `your-secret-key-here` with a strong, random secret (at least 32 characters)
- For MongoDB Atlas, replace `username`, `password`, and `cluster` with your credentials
- Never commit `application.properties` to version control (it's in `.gitignore`)

### Step 3: Build and Run the Backend

```bash
# Build the project
mvn clean install

# Run the Spring Boot application
mvn spring-boot:run

# Backend will start at http://localhost:8080
```

**Expected output:**
```
Started HotelReservationApplication in X seconds (JVM running for Y seconds)
```

### Step 4: Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd hotel-frontend/hotel-frontend

# Install dependencies
npm install
```

### Step 5: Frontend Configuration

The frontend is pre-configured to connect to the backend at `http://localhost:8080` (see `src/services/api.js`).

When deploying to production, update the `BASE_URL` in `src/services/api.js`:

```javascript
// For local development:
const BASE_URL = 'http://localhost:8080'

// For production (example):
// const BASE_URL = 'https://hotel-backend-xxxxx.onrender.com'
```

### Step 6: Run the Frontend

```bash
# Start the Vite dev server
npm run dev

# Frontend will start at http://localhost:5173
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
```

### Step 7: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔐 Configuration & Environment Variables

### Backend Configuration

The backend requires the following environment variables/configuration in `src/main/resources/application.properties`:

| Variable | Description | Example |
|----------|-------------|---------|
| `server.port` | Backend server port | `8080` |
| `spring.data.mongodb.uri` | MongoDB connection string | `mongodb://localhost:27017/hotelReservationDB` |
| `jwt.secret` | JWT signing secret (keep secure!) | `your-long-random-secret-key` |
| `jwt.expiration` | JWT token expiration in milliseconds | `86400000` (24 hours) |

### Frontend Configuration

The frontend uses `src/services/api.js` to configure the backend URL:

```javascript
const BASE_URL = 'http://localhost:8080'  // Update for production
```

### Security Notes

- **Never commit secrets** – Use `.gitignore` to exclude `application.properties`
- **Rotate JWT secrets** – Generate a strong secret using:
  ```bash
  openssl rand -base64 32
  ```
- **Use environment variables** – Inject secrets at deployment time, not in code
- **MongoDB Atlas** – Use a strong password and restrict IP access

---

## 🔗 API Endpoints

All endpoints except auth and public room/review endpoints require JWT authentication via header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `POST` | `/api/auth/signup` | Register a new user account | ❌ No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | ❌ No |
| `POST` | `/api/auth/forgot-password` | Request password reset link | ❌ No |
| `POST` | `/api/auth/reset-password` | Reset password with token | ❌ No |

**Signup Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "9876543210"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

### Room Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---|---|
| `GET` | `/api/rooms` | Get all rooms | ❌ No | ❌ No |
| `GET` | `/api/rooms?checkIn=2026-12-15&checkOut=2026-12-18` | Search available rooms by dates | ❌ No | ❌ No |
| `GET` | `/api/rooms/{id}` | Get room details | ❌ No | ❌ No |
| `POST` | `/api/rooms` | Create a new room | ✅ Yes | ✅ Yes |
| `PUT` | `/api/rooms/{id}` | Update room details | ✅ Yes | ✅ Yes |
| `DELETE` | `/api/rooms/{id}` | Delete a room | ✅ Yes | ✅ Yes |

**Room Request Body (POST/PUT):**
```json
{
  "roomNumber": "101",
  "roomType": "Deluxe",
  "pricePerNight": 2500.00,
  "capacity": 2,
  "amenities": ["WiFi", "AC", "TV", "Mini Bar"],
  "description": "Spacious deluxe room with city view",
  "imageUrl": "https://example.com/image.jpg",
  "available": true
}
```

### Booking Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---|---|
| `POST` | `/api/bookings` | Create a new booking | ✅ Yes | ❌ No |
| `GET` | `/api/bookings/me` | Get my bookings | ✅ Yes | ❌ No |
| `GET` | `/api/bookings/all` | Get all bookings | ✅ Yes | ✅ Yes |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel a booking | ✅ Yes | ❌ No* |

*Users can cancel their own bookings; admins can cancel any booking.

**Booking Request Body:**
```json
{
  "roomId": "507f1f77bcf86cd799439011",
  "checkIn": "2026-12-15",
  "checkOut": "2026-12-18"
}
```

**Booking Response:**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "roomId": "507f1f77bcf86cd799439010",
  "checkIn": "2026-12-15",
  "checkOut": "2026-12-18",
  "totalPrice": 7500.00,
  "status": "CONFIRMED",
  "createdAt": "2026-09-27T10:30:00"
}
```

### Review Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---|---|
| `GET` | `/api/reviews/room/{roomId}` | Get reviews for a room | ❌ No | ❌ No |
| `POST` | `/api/reviews` | Create a review | ✅ Yes | ❌ No |
| `DELETE` | `/api/reviews/{id}` | Delete a review | ✅ Yes | ❌ No* |

*Users can delete their own reviews; admins can delete any review.

**Review Request Body:**
```json
{
  "roomId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "title": "Excellent Room!",
  "comment": "Very comfortable and clean. Highly recommend."
}
```

### Admin Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---|---|
| `GET` | `/api/admin/users` | Get all users | ✅ Yes | ✅ Yes |
| `POST` | `/api/admin/users` | Create an admin user | ✅ Yes | ✅ Yes |
| `PUT` | `/api/admin/users/{id}/role` | Update user role | ✅ Yes | ✅ Yes |

**Create Admin User Request:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "phone": "9999999999"
}
```

**Update User Role Request:**
```json
{
  "role": "ADMIN"
}
```

---

## 🔐 Authentication

### JWT (JSON Web Token) Flow

The application uses **JWT for stateless authentication**:

1. **Signup/Login** – User sends credentials to `/api/auth/signup` or `/api/auth/login`
2. **Token Issued** – Backend validates credentials and returns a JWT token
3. **Token Storage** – Frontend stores token in `localStorage` with key `"token"`
4. **Authenticated Requests** – Frontend automatically attaches token to every request:
   ```
   Authorization: Bearer <token>
   ```
5. **Token Validation** – Backend validates token signature and expiration on every request
6. **Token Refresh** – When token expires, user must log in again to get a new one

### Token Structure

A JWT token consists of three parts separated by dots (`.`):
- **Header** – Algorithm (HS256) and token type (JWT)
- **Payload** – User ID, email, role, and expiration time
- **Signature** – Cryptographic signature using the backend's secret

Example token:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2OTYwMDAwMDAsImV4cCI6MTY5NjA4NjQwMH0.xc0_5x8z9Q...
```

### Security Features

- **Password Hashing** – Passwords are hashed using BCrypt, never stored in plain text
- **CORS Protection** – Backend only allows requests from `http://localhost:5173` (dev) and `http://localhost:3000`
- **Session Stateless** – No server-side sessions; all auth info is in the JWT
- **Token Expiration** – Tokens expire after 24 hours (configurable)
- **Role-Based Access Control** – Endpoints check user role (USER, ADMIN) before processing

---

## 👨‍💼 Admin Dashboard

The admin dashboard is accessible at `/admin` (requires admin login).

### Features

- **User Management**
  - View all system users
  - View user details: name, email, phone, role
  - Promote users to ADMIN or demote to USER
  - Create new admin accounts directly

- **Room Management**
  - View all rooms
  - Add new rooms with details, pricing, amenities, and images
  - Edit existing room information
  - Delete rooms from the system

- **Booking Management**
  - View all bookings across all users
  - See booking status (CONFIRMED, CANCELLED, COMPLETED)
  - Cancel any user's booking if needed

- **System Overview**
  - Dashboard displays key statistics
  - Manage users, rooms, and bookings from a single interface

### Accessing Admin Dashboard

1. Create an admin account (see "Creating Admin Users" below)
2. Log in with admin credentials
3. Navigate to `/admin` from the navbar or directly: `http://localhost:5173/admin`

### Creating Admin Users

#### Method 1: Via Admin API (Recommended)

Use the admin endpoint to create a new admin:

```bash
curl -X POST http://localhost:8080/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "New Admin",
    "email": "admin2@example.com",
    "password": "AdminPassword123",
    "phone": "8888888888"
  }'
```

#### Method 2: Via MongoDB Compass (Development Only)

1. Open **MongoDB Compass** and connect to `localhost:27017`
2. Navigate to `hotelReservationDB` → `users` collection
3. Find your user and change `role` from `"USER"` to `"ADMIN"`
4. Log in again to receive a fresh token with admin privileges

---

## 🧪 Testing the Application

### Test User Accounts

After starting the backend, create test accounts via signup:

```bash
# User account
POST http://localhost:8080/api/auth/signup
{
  "name": "John User",
  "email": "user@example.com",
  "password": "Password123",
  "phone": "9876543210"
}

# Admin account (after creating via admin API)
{
  "name": "Jane Admin",
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "phone": "9999999999"
}
```

### Testing Workflow

1. **Sign up** → Create a new user account
2. **Search rooms** → View all rooms or search by dates on `/rooms`
3. **View room details** → Click a room card to see full details and reviews
4. **Book a room** → Click "Book Now" and confirm your reservation
5. **View bookings** → Navigate to `/my-bookings` to see your reservations
6. **Leave a review** → Post a rating and comment on a room you booked
7. **Admin features** → Log in as admin and navigate to `/admin` to manage rooms, bookings, and users

### API Testing with Postman

1. **Import the API** – Use endpoints from the [API Endpoints](#-api-endpoints) section
2. **Authenticate** – Log in to get a JWT token
3. **Add Authorization** – In Postman, set `Authorization` header to `Bearer <token>`
4. **Test endpoints** – Try CRUD operations on rooms, bookings, and reviews

---

## 🛠️ Development Guide

### Project Structure Overview

- **Backend** – Spring Boot microservices architecture with clear separation of concerns
- **Frontend** – React SPA with client-side routing, context API for state management, and axios for API calls
- **Database** – MongoDB document store with collections for users, rooms, bookings, and reviews

### Key Technologies Explained

- **Spring Boot** – Simplifies Spring application development with auto-configuration and embedded servers
- **JWT** – Secure, stateless authentication without server-side session storage
- **MongoDB** – Flexible, scalable NoSQL database ideal for document-based data
- **React Router** – Client-side navigation with protected routes for authenticated users
- **Axios Interceptors** – Automatically attach JWT to every HTTP request

### Common Tasks

#### Add a New API Endpoint

1. Create a controller method in a `*Controller.java` class
2. Annotate with `@GetMapping`, `@PostMapping`, `@PutMapping`, or `@DeleteMapping`
3. Add security rules in `SecurityConfig.java` if needed
4. Test with Postman or curl

#### Add a New React Page

1. Create a new component in `src/pages/`
2. Add a route in `App.jsx` under the `<Routes>` component
3. Link to the page from navigation components
4. Use `PrivateRoute` wrapper if authentication is required

#### Modify Database Schema

1. Update the corresponding model class (e.g., `User.java`)
2. Add new fields with getter/setter methods or Lombok annotations
3. MongoDB will automatically handle schema evolution (no migration needed)

---

## 📝 Building & Deployment

### Build the Backend

```bash
cd hotel-backend/hotel-backend
mvn clean package
```

This generates a JAR file in the `target/` directory.

### Build the Frontend

```bash
cd hotel-frontend/hotel-frontend
npm run build
```

This generates a production-ready build in the `dist/` directory.

### Deploy Backend

Deploy the JAR file to a hosting platform like:
- **Render** – Free tier available
- **Railway** – Easy deployment with MongoDB integration
- **AWS EC2** – Elastic Cloud Compute
- **Heroku** – (free tier discontinued, but alternatives exist)

Update the `BASE_URL` in the frontend's `src/services/api.js` to point to your deployed backend.

### Deploy Frontend

Deploy the `dist/` directory to a static hosting service:
- **Vercel** – Optimized for React and Next.js
- **Netlify** – Simple drag-and-drop deployment
- **GitHub Pages** – Free static hosting
- **AWS S3 + CloudFront** – Scalable CDN-backed hosting

---

## 🐛 Troubleshooting

### Backend Won't Start

**Problem:** `java.net.ConnectException: Connection refused`

**Solution:** Ensure MongoDB is running:
```bash
# Check MongoDB status
brew services list
# Or manually start:
brew services start mongodb-community
```

**Problem:** `Failed to auto-configure a DataSource` 

**Solution:** Check your `application.properties` MongoDB URI:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/hotelReservationDB
```

### Frontend Can't Connect to Backend

**Problem:** `Failed to connect to http://localhost:8080`

**Solution:**
1. Verify backend is running on port 8080
2. Check CORS configuration in `SecurityConfig.java`
3. Verify `BASE_URL` in `src/services/api.js` is correct
4. Check browser console for exact error message

### JWT Token Expired

**Problem:** `401 Unauthorized` after some time

**Solution:** Log out and log back in to get a fresh token.

### MongoDB Connection String Error

**Problem:** `Invalid MongoDB connection string`

**Solution:**
- Local: `mongodb://localhost:27017/hotelReservationDB`
- Atlas: `mongodb+srv://username:password@cluster.mongodb.net/hotelReservationDB?retryWrites=true&w=majority`
- Ensure password doesn't contain special characters or URL-encode them

### Port Already in Use

**Problem:** `Address already in use: :8080` or `:5173`

**Solution:**
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
# OR change port in application.properties or vite.config.js
```

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Introduction](https://jwt.io)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)

---

## 📄 License

This project is a college group project. No specific license is currently assigned.

---

## 👥 Contributors

- [Shivansh8530](https://github.com/Shivansh8530)

---

## 📧 Questions or Issues?

If you encounter issues or have questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the code comments for implementation details
3. Check the backend console and browser DevTools for error messages
4. Open a GitHub issue with a detailed description

---

**Happy coding! 🎉**
