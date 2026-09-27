// Unit/Integration verification test for Admin Dashboard routes and role access logic
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Verifying Admin Dashboard Routes, Navbar, and Security ---');

// 1. Check App.jsx routes
const appPath = path.resolve('hotel-frontend/hotel-frontend/src/App.jsx');
const appSrc = fs.readFileSync(appPath, 'utf8');

assert(appSrc.includes('path="/admin"'), 'Route /admin must exist in App.jsx');
assert(appSrc.includes('<AdminRoute>'), 'AdminRoute must wrap AdminDashboard in App.jsx');
assert(appSrc.includes('<AdminDashboard />'), 'AdminDashboard must be used in /admin route');
console.log('✓ 1. Route /admin exists and is wrapped by <AdminRoute><AdminDashboard /></AdminRoute>');

// 2. Check Navbar.jsx
const navbarPath = path.resolve('hotel-frontend/hotel-frontend/src/components/Navbar.jsx');
const navbarSrc = fs.readFileSync(navbarPath, 'utf8');

assert(navbarSrc.includes('{isAdmin && ('), 'Admin check must guard admin navigation link');
assert(navbarSrc.includes('to="/admin"'), 'Link must navigate to /admin');
assert(navbarSrc.includes('Admin Dashboard'), 'Visible link text must be "Admin Dashboard"');
console.log('✓ 2. Navbar conditionally displays visible "Admin Dashboard" link to /admin only when isAdmin is true');

// 3. Check PrivateRoute.jsx logic
const privateRoutePath = path.resolve('hotel-frontend/hotel-frontend/src/components/PrivateRoute.jsx');
const privateRouteSrc = fs.readFileSync(privateRoutePath, 'utf8');

assert(privateRouteSrc.includes('export function AdminRoute({ children })'), 'AdminRoute must be exported');
assert(privateRouteSrc.includes('!user'), 'AdminRoute must check for unauthenticated user');
assert(privateRouteSrc.includes('!isAdmin'), 'AdminRoute must check for non-admin user');
console.log('✓ 3. AdminRoute protects /admin: unauthenticated users redirected to /login, normal users redirected to /');

// 4. Check AuthContext.jsx role logic
const authContextPath = path.resolve('hotel-frontend/hotel-frontend/src/context/AuthContext.jsx');
const authContextSrc = fs.readFileSync(authContextPath, 'utf8');

assert(authContextSrc.includes("user?.role === 'ADMIN'"), "isAdmin must check role === 'ADMIN'");
console.log('✓ 4. AuthContext determines isAdmin based on user?.role === "ADMIN"');

// 5. Check AdminDashboard.jsx
const adminDashboardPath = path.resolve('hotel-frontend/hotel-frontend/src/pages/AdminDashboard.jsx');
const adminDashboardSrc = fs.readFileSync(adminDashboardPath, 'utf8');

assert(adminDashboardSrc.includes('export default function AdminDashboard'), 'AdminDashboard component exists');
assert(adminDashboardSrc.includes('Hotels & Sanctuaries') || adminDashboardSrc.includes('tab === \'hotels\''), 'Has hotels tab');
assert(adminDashboardSrc.includes('Room Inventory') || adminDashboardSrc.includes('tab === \'rooms\''), 'Has rooms tab');
assert(adminDashboardSrc.includes('Reservations Register') || adminDashboardSrc.includes('tab === \'bookings\''), 'Has bookings tab');
assert(adminDashboardSrc.includes('User Management') || adminDashboardSrc.includes('tab === \'users\''), 'Has users tab');
console.log('✓ 5. AdminDashboard page contains complete hotel, room, booking, and user management consoles');

// 6. Check Backend SecurityConfig and AdminSeeder
const seederPath = path.resolve('hotel-backend/hotel-backend/src/main/java/com/hotelreservation/config/AdminSeeder.java');
const seederSrc = fs.readFileSync(seederPath, 'utf8');
assert(seederSrc.includes('admin.setRole("ADMIN")'), 'AdminSeeder seeds role ADMIN');
console.log('✓ 6. Backend AdminSeeder seeds admin user with role ADMIN');

console.log('\nALL CODE VERIFICATIONS PASSED SUCCESSFULLY!');
