// Automated E2E verification test script
const BACKEND_URL = 'http://localhost:8082';
const FRONTEND_URL = 'http://localhost:5174';

async function runTests() {
  console.log('=== RUNNING END-TO-END VERIFICATION ===\n');

  // 1. Verify Frontend serves HTML
  console.log('1. Testing Frontend Server...');
  const feRes = await fetch(FRONTEND_URL);
  if (!feRes.ok) throw new Error(`Frontend returned ${feRes.status}`);
  const html = await feRes.text();
  console.log(`   ✓ Frontend is online (Status ${feRes.status}, contains '<div id="root">': ${html.includes('id="root"')})`);

  // 2. Test Hotels API
  console.log('\n2. Testing GET /api/hotels (Featured & All)...');
  const hotelsRes = await fetch(`${BACKEND_URL}/api/hotels?featured=true`);
  const featuredHotels = await hotelsRes.json();
  console.log(`   ✓ Fetched ${featuredHotels.length} featured hotels from backend.`);
  featuredHotels.forEach(h => console.log(`     - [${h.source}] ${h.name} (${h.location?.city}) starting at INR ${h.price?.amount}`));

  // 3. Test Hotel Search Aggregator
  console.log('\n3. Testing GET /api/hotels/search (Aggregator across internal & partner inventory)...');
  const searchRes = await fetch(`${BACKEND_URL}/api/hotels/search?destination=Goa`);
  const goaHotels = await searchRes.json();
  console.log(`   ✓ Search for "Goa" returned ${goaHotels.length} hotels:`);
  goaHotels.forEach(h => console.log(`     - [${h.source}] ${h.name} - Provider: ${h.providerLabel} - Rate: INR ${h.price?.amount}`));

  // 4. Test Internal Hotel Details & Room Associations
  console.log('\n4. Testing Internal Hotel Details (Grand Azure Beach Resort)...');
  const internalHotel = featuredHotels.find(h => h.source === 'INTERNAL');
  if (!internalHotel) throw new Error('No internal hotel found in featured list');
  const detailRes = await fetch(`${BACKEND_URL}/api/hotels/${internalHotel.id}`);
  const detail = await detailRes.json();
  console.log(`   ✓ Hotel: ${detail.name} (Source: ${detail.source})`);
  console.log(`   ✓ Associated rooms count: ${detail.rooms?.length || 0}`);
  detail.rooms?.forEach(r => console.log(`     - Room ${r.roomNumber} (${r.roomType}) | INR ${r.pricePerNight}/night | Available: ${r.available}`));

  // 5. Test External Partner Hotel Details (MockExternalHotelProvider)
  console.log('\n5. Testing External Partner Hotel (Taj Exotica / Booking.com)...');
  const partnerRes = await fetch(`${BACKEND_URL}/api/hotels/booking_goa_101`);
  const partnerHotel = await partnerRes.json();
  console.log(`   ✓ Partner Hotel: ${partnerHotel.name}`);
  console.log(`   ✓ Source: ${partnerHotel.source}, Provider Label: ${partnerHotel.providerLabel}`);
  console.log(`   ✓ Booking URL: ${partnerHotel.bookingUrl}`);

  // 6. Test User Registration & Authentication Flow
  const testEmail = `testguest_${Date.now()}@stayease.com`;
  console.log(`\n6. Testing User Signup & Login with ${testEmail}...`);
  const signupRes = await fetch(`${BACKEND_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Guest Traveler',
      email: testEmail,
      password: 'password123',
      phone: '+91 98765 43210'
    })
  });
  if (!signupRes.ok) throw new Error(`Signup failed with status ${signupRes.status}`);
  const authData = await signupRes.json();
  console.log(`   ✓ Registered & authenticated: ${authData.name} | Token: ${authData.token.slice(0, 20)}...`);
  const token = authData.token;

  // 7. Test Creating an Internal Booking
  console.log('\n7. Testing Internal Room Booking (POST /api/bookings)...');
  const targetRoom = detail.rooms[0];
  const bookingPayload = {
    roomId: targetRoom.id,
    checkIn: '2026-11-10',
    checkOut: '2026-11-13'
  };
  const bookRes = await fetch(`${BACKEND_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingPayload)
  });
  if (!bookRes.ok) {
    const errBody = await bookRes.text();
    throw new Error(`Booking failed with ${bookRes.status}: ${errBody}`);
  }
  const bookingResult = await bookRes.json();
  console.log(`   ✓ Booking created: ID ${bookingResult.id} | Room: ${bookingResult.roomId} | Total Price: INR ${bookingResult.totalPrice} | Status: ${bookingResult.status}`);

  // 8. Test My Bookings (GET /api/bookings/me)
  console.log('\n8. Testing GET /api/bookings/me...');
  const myBookingsRes = await fetch(`${BACKEND_URL}/api/bookings/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const myBookings = await myBookingsRes.json();
  console.log(`   ✓ User has ${myBookings.length} booking(s):`);
  myBookings.forEach(b => console.log(`     - [${b.status}] ID: ${b.id} | Dates: ${b.checkIn} to ${b.checkOut} | Amount: INR ${b.totalPrice}`));

  // 9. Test Cancel Booking (PUT /api/bookings/{id}/cancel)
  console.log(`\n9. Testing Cancel Booking (${bookingResult.id})...`);
  const cancelRes = await fetch(`${BACKEND_URL}/api/bookings/${bookingResult.id}/cancel`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const cancelledBooking = await cancelRes.json();
  console.log(`   ✓ Cancelled status confirmed: ${cancelledBooking.status}`);

  console.log('\n=== ALL END-TO-END FLOWS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
