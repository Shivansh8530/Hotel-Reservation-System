# 🏨 Hotel Reservation System

> A comprehensive full-stack hotel management and reservation application built as a college project. This system enables users to browse, search, and book hotel rooms while providing administrators with tools to manage properties, reservations, and guest information.

**Status:** College Project | **License:** MIT | **Last Updated:** 2026

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Usage Guide](#usage-guide)
- [Screenshots](#screenshots)
- [Project Details](#project-details)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Contact & Support](#contact--support)

---

## Overview

The **Hotel Reservation System** is a full-stack web application designed to streamline the hotel booking process. It provides an intuitive interface for customers to search and book rooms while offering administrators comprehensive management capabilities.

### Key Highlights
- ✨ Modern, responsive user interface
- 🔐 Secure authentication and authorization
- 📱 Mobile-friendly design
- ⚡ Real-time availability checking
- 💳 Integrated payment processing
- 📊 Admin analytics dashboard
- 🔍 Advanced room search and filtering

---

## Features

### Customer Features
- 🔑 User registration and authentication
- 🏠 Browse available hotels and rooms
- 🔎 Advanced search with filters (date, price, room type, amenities)
- 🛏️ View detailed room information with images and reviews
- 📅 Real-time availability checking
- 🎯 Book rooms with instant confirmation
- 💳 Secure payment processing
- 📧 Email notifications for bookings
- 👤 Personal profile and booking history
- ⭐ Rate and review rooms/hotels
- ❤️ Wishlist/favorites management

### Administrator Features
- 🏢 Hotel and room management (CRUD operations)
- 📝 Manage room details, pricing, and availability
- 👥 Guest management and communication
- 📊 Reservation tracking and analytics
- 💰 Revenue reports and insights
- 📈 Occupancy rate monitoring
- 🎟️ Discount and promotional code management
- 📞 Customer support ticketing system
- 🔧 System configuration and settings

---

## Tech Stack

### Frontend
- **Framework:** React.js
- **Styling:** CSS3, Bootstrap 5, Tailwind CSS
- **State Management:** Redux / Context API
- **HTTP Client:** Axios
- **Routing:** React Router
- **Form Validation:** React Hook Form
- **UI Components:** Material-UI / Custom Components

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB / SQL (depending on configuration)
- **Authentication:** JWT (JSON Web Tokens)
- **Authorization:** Role-based Access Control (RBAC)
- **API:** RESTful API
- **Payment Integration:** Stripe/Razorpay
- **Email Service:** Nodemailer

### Development Tools
- **Version Control:** Git
- **Package Manager:** npm / yarn
- **Build Tools:** Webpack / Vite
- **Code Formatter:** Prettier
- **Linter:** ESLint
- **Testing:** Jest, React Testing Library
- **API Testing:** Postman / Insomnia

---

## Project Structure

```
Hotel-Reservation-System/
│
├── hotel-frontend/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable React components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API service calls
│   │   ├── redux/                 # Redux state management
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── utils/                 # Utility functions
│   │   ├── styles/                # Global and component styles
│   │   ├── App.js                 # Main App component
│   │   └── index.js               # Entry point
│   ├── package.json
│   └── .env.example
│
├── hotel-backend/                  # Express.js backend application
│   ├── hotel-backend/
│   │   ├── routes/                # API routes
│   │   ├── controllers/           # Route handlers and business logic
│   │   ├── models/                # Database models/schemas
│   │   ├── middleware/            # Custom middleware
│   │   ├── services/              # Business logic services
│   │   ├── config/                # Configuration files
│   │   ├── utils/                 # Utility functions
│   │   ├── validators/            # Input validation
│   │   ├── app.js                 # Express app setup
│   │   └── server.js              # Server entry point
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── README.md                       # Project documentation
└── LICENSE

```

---

## Getting Started

### Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v6.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **MongoDB** or **SQL Database** (MongoDB recommended)
- **Code Editor** - VS Code, WebStorm, etc.

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Shivansh8530/Hotel-Reservation-System.git
cd Hotel-Reservation-System
```

#### 2. Install Backend Dependencies

```bash
cd hotel-backend/hotel-backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../../hotel-frontend
npm install
```

### Configuration

#### Backend Configuration

Create a `.env` file in `hotel-backend/hotel-backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hotel-reservation
# OR for SQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_reservation

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment Gateway (Stripe/Razorpay)
STRIPE_API_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# File Upload
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Configuration

Create a `.env` file in `hotel-frontend/` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000

# Environment
REACT_APP_ENV=development

# Payment Gateway
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Running the Application

#### Start the Backend Server

```bash
cd hotel-backend/hotel-backend
npm start

# For development with auto-reload
npm run dev
```

The backend server will be running on `http://localhost:5000`

#### Start the Frontend Development Server

In a new terminal:

```bash
cd hotel-frontend
npm start
```

The frontend will be accessible at `http://localhost:3000`

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### User Registration
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+91XXXXXXXXXX"
}
```

#### User Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "guest"
  }
}
```

### Hotel Endpoints

#### Get All Hotels
```
GET /hotels
Query Parameters: ?page=1&limit=10&city=Delhi&rating=4
```

#### Get Hotel Details
```
GET /hotels/:hotelId
```

#### Create Hotel (Admin Only)
```
POST /hotels
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Luxury Hotel",
  "city": "Delhi",
  "address": "123 Main St",
  "rating": 4.5
}
```

### Room Endpoints

#### Get Available Rooms
```
GET /rooms
Query Parameters: ?checkIn=2026-01-15&checkOut=2026-01-20&guests=2
```

#### Get Room Details
```
GET /rooms/:roomId
```

#### Create Room (Admin Only)
```
POST /rooms
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "hotelId": "hotelId",
  "type": "Deluxe",
  "price": 5000,
  "capacity": 2,
  "amenities": ["WiFi", "AC", "TV"]
}
```

### Booking Endpoints

#### Create Booking
```
POST /bookings
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "roomId": "roomId",
  "hotelId": "hotelId",
  "checkInDate": "2026-01-15",
  "checkOutDate": "2026-01-20",
  "guests": 2,
  "totalPrice": 25000
}
```

#### Get User Bookings
```
GET /bookings/user
Headers: Authorization: Bearer {token}
```

#### Cancel Booking
```
DELETE /bookings/:bookingId
Headers: Authorization: Bearer {token}
```

For complete API documentation, see [API_DOCS.md](./API_DOCS.md) (if available)

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  role: String (guest/admin), // Default: guest
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Hotels Collection
```javascript
{
  _id: ObjectId,
  name: String,
  city: String,
  state: String,
  address: String,
  latitude: Number,
  longitude: Number,
  description: String,
  rating: Number (0-5),
  images: [String],
  amenities: [String],
  contactPhone: String,
  email: String,
  adminId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Rooms Collection
```javascript
{
  _id: ObjectId,
  hotelId: ObjectId (ref: Hotels),
  roomNumber: String,
  type: String (Single/Double/Suite),
  price: Number,
  capacity: Number,
  amenities: [String],
  images: [String],
  description: String,
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  roomId: ObjectId (ref: Rooms),
  hotelId: ObjectId (ref: Hotels),
  checkInDate: Date,
  checkOutDate: Date,
  numberOfGuests: Number,
  totalPrice: Number,
  status: String (confirmed/cancelled/completed),
  paymentStatus: String (pending/completed/failed),
  specialRequests: String,
  cancellationReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Usage Guide

### For Customers

1. **Create an Account**
   - Navigate to the registration page
   - Fill in your details and create a password
   - Verify your email address

2. **Search Hotels**
   - Enter check-in and check-out dates
   - Select number of guests
   - Browse available hotels and rooms
   - Use filters to narrow down options

3. **Book a Room**
   - Click on a room to view details
   - Add special requests if needed
   - Proceed to checkout
   - Complete payment
   - Receive booking confirmation

4. **Manage Bookings**
   - Go to "My Bookings" in your profile
   - View booking details
   - Cancel bookings (if policy allows)
   - Download invoices

### For Administrators

1. **Login as Admin**
   - Use admin credentials to login
   - Access the admin dashboard

2. **Manage Hotels**
   - Add new hotels with details and images
   - Edit hotel information
   - Delete hotels if needed

3. **Manage Rooms**
   - Add rooms to hotels
   - Set pricing and capacity
   - Add amenities and images
   - Update availability

4. **Monitor Bookings**
   - View all bookings in the system
   - Check occupancy rates
   - Process cancellations
   - Generate reports

---

## Screenshots

### Landing Page
![Hotel Reservation System - Landing Page](./screenshots/landing.png)

### Search Results
![Search Results](./screenshots/search-results.png)

### Room Details
![Room Details](./screenshots/room-details.png)

### Booking Confirmation
![Booking Confirmation](./screenshots/booking-confirmation.png)

### Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)

---

## Project Details

### Academic Information
- **Project Type:** Full-Stack Web Application
- **Purpose:** College Academic Project
- **Year:** 2025-2026
- **Duration:** Semester Project
- **Team Size:** Individual / Group (specify if applicable)

### Learning Outcomes
This project demonstrates proficiency in:
- Full-stack web development (MERN/MEAN stack)
- RESTful API design and implementation
- Database modeling and management
- Authentication and authorization
- Frontend UI/UX development
- Backend server architecture
- Software engineering best practices
- Version control and Git workflow
- Responsive web design

### Project Requirements Met
- ✅ User Authentication and Authorization
- ✅ CRUD Operations for Hotels and Rooms
- ✅ Room Booking and Reservation System
- ✅ Payment Integration
- ✅ Admin Dashboard
- ✅ Data Validation and Error Handling
- ✅ Responsive Design
- ✅ Database Integration

---

## Future Enhancements

- [ ] Advanced search with multiple filters
- [ ] Real-time notifications using WebSockets
- [ ] Email reminders for upcoming bookings
- [ ] Guest reviews and ratings system
- [ ] Loyalty program and rewards
- [ ] Multi-currency support
- [ ] Mobile application (React Native/Flutter)
- [ ] AI-based room recommendations
- [ ] Integration with Google Maps API
- [ ] Advanced analytics and reporting
- [ ] Two-factor authentication
- [ ] Social login (Google, Facebook)
- [ ] Invoice and receipt generation (PDF)
- [ ] Automated cancellation policy
- [ ] Room inventory management

---

## Contributing

This is a college project. Contributions, suggestions, and feedback are welcome!

### To Contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Guidelines:
- Follow the existing code style
- Add meaningful commit messages
- Update documentation as needed
- Test your changes before submitting PR

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
You are free to use, modify, and distribute this software, provided you include the original license notice.

---

## Contact & Support

### Author
- **Name:** Shivansh
- **GitHub:** [@Shivansh8530](https://github.com/Shivansh8530)
- **Email:** chauhanshivansh85@gmail.com

### Get Help
- 📖 Check the [FAQ](#faq) section
- 🐛 Report bugs by opening an [Issue](https://github.com/Shivansh8530/Hotel-Reservation-System/issues)
- 💬 Discuss features in [Discussions](https://github.com/Shivansh8530/Hotel-Reservation-System/discussions)
- 📧 Email for other inquiries

### Troubleshooting

#### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### Database Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database credentials

#### Module Not Found Error
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### CORS Error
- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches the configured origin

---

## FAQ

**Q: Can I use this project as a reference for my own project?**
A: Yes! This project is open-source. Please provide attribution when using code or ideas.

**Q: How do I reset the admin password?**
A: Please refer to the documentation or contact the project administrator.

**Q: Is this production-ready?**
A: This is a college project and may need additional security hardening before production use.

**Q: How often is this project updated?**
A: Updates are made as needed for academic purposes and feature enhancements.

---

## Acknowledgments

- Thanks to all contributors and supporters
- Special thanks to instructors and professors for guidance
- Open-source communities for libraries and tools used

---

**Made with ❤️ as a College Project**

⭐ If this project helped you, please consider giving it a star on GitHub!

Last Updated: August 2026
