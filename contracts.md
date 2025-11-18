# Uber Clone API Contracts & Integration Plan

## Overview
This document outlines the API contracts, backend integration points, and how the frontend will connect with the OpenStreetMap-powered backend services.

## API Base URL
- Development: `http://localhost:8001/api`
- Production: `${REACT_APP_BACKEND_URL}/api`

## 1. Location Services API

### Search Locations
```
GET /api/locations/search?q={query}&lat={lat}&lon={lon}&limit={limit}
```
**Purpose**: Replace mock location suggestions with real OpenStreetMap data
**Frontend Integration**: 
- `BookingForm.jsx` - pickup/destination autocomplete
- `ShuttleBooking.jsx` - hotspot search

### Geocode Address
```
GET /api/locations/geocode?address={address}&country={country}
```
**Purpose**: Convert addresses to coordinates for ride calculations

### Calculate Route
```
GET /api/locations/route?start_lat={lat}&start_lon={lon}&end_lat={lat}&end_lon={lon}
```
**Purpose**: Get real distances, durations, and route geometry using OSRM

## 2. Ride Services API

### Get Ride Estimates
```
POST /api/rides/estimate
{
  "pickup_address": string,
  "pickup_lat": float,
  "pickup_lon": float,
  "destination_address": string,
  "destination_lat": float,
  "destination_lon": float,
  "ride_type": "uberx" | "ubershare" | "comfort" | "xl"
}
```
**Frontend Integration**: `RideOptions.jsx` - replace mockRideTypes with real estimates

### Book Ride
```
POST /api/rides/book
{
  "pickup_address": string,
  "pickup_lat": float,
  "pickup_lon": float,
  "destination_address": string,
  "destination_lat": float,
  "destination_lon": float,
  "ride_type": string,
  "payment_method_id": string,
  "scheduled_time": datetime (optional)
}
```
**Frontend Integration**: `RideOptions.jsx` - actual ride booking

### Get Ride Status
```
GET /api/rides/{ride_id}
```
**Frontend Integration**: `RideTracking.jsx` - replace mockCurrentRide with real data

## 3. Driver Services API

### Update Driver Location
```
PUT /api/drivers/{driver_id}/location
{
  "lat": float,
  "lon": float,
  "heading": float (optional)
}
```
**Driver App Integration**: Real-time location updates

### Get Nearby Drivers
```
GET /api/drivers/nearby?lat={lat}&lon={lon}&radius_km={radius}&ride_type={type}
```
**Purpose**: Find available drivers for ride requests

### Update Driver Status
```
PUT /api/drivers/{driver_id}/status
{
  "is_online": boolean,
  "is_available": boolean,
  "status": "online" | "offline" | "busy" | "break"
}
```

## 4. Shuttle Services API

### Get Shuttle Routes
```
GET /api/shuttles/routes
```
**Frontend Integration**: `ShuttleBooking.jsx` - replace mockShuttleRoutes

### Get Route Schedules
```
GET /api/shuttles/routes/{route_id}/schedules?date={YYYY-MM-DD}
```
**Frontend Integration**: Time slot selection with real availability

### Book Shuttle
```
POST /api/shuttles/book
{
  "route_id": string,
  "pickup_hotspot_id": string,
  "drop_hotspot_id": string,
  "booking_date": "YYYY-MM-DD",
  "departure_time": "HH:MM",
  "payment_method_id": string
}
```

### Track Shuttle
```
GET /api/shuttles/bookings/{booking_id}/track
```
**Frontend Integration**: `ShuttleTracking.jsx` - real bus tracking

## 5. Data Migration from Mock to Real

### Frontend Mock Data to Replace:
1. **Location Data** (`mock.js` - mockLocations)
   - Replace with `/api/locations/search` results
   - Real addresses with coordinates from OpenStreetMap

2. **Ride Types & Pricing** (`mock.js` - mockRideTypes)
   - Replace with `/api/rides/estimate` for dynamic pricing
   - Real distance/time calculations from OSRM

3. **Driver Data** (`mock.js` - mockDrivers, mockCurrentRide)
   - Replace with `/api/drivers/nearby` for available drivers
   - Real driver profiles and locations

4. **Shuttle Routes** (`mock.js` - mockShuttleRoutes)
   - Replace with `/api/shuttles/routes` for Indian routes
   - Real hotspots and schedules

### Backend Implementation Status:
- ✅ OpenStreetMap Service (Nominatim + Overpass + OSRM)
- ✅ Location API endpoints
- ✅ Ride booking and estimation logic
- ✅ Driver management APIs
- ✅ Shuttle booking system
- ✅ Database models and schemas

## 6. Frontend Integration Steps:

### Phase 1: Location Services
1. Update `BookingForm.jsx` to use real location search
2. Replace autocomplete with OpenStreetMap results
3. Add coordinate storage for route calculations

### Phase 2: Ride Services  
1. Modify `RideOptions.jsx` to call estimate API
2. Update `RideTracking.jsx` with real ride status
3. Implement ride booking with backend persistence

### Phase 3: Driver Integration
1. Connect Driver App to backend APIs
2. Real-time location tracking
3. Ride request/acceptance flow

### Phase 4: Shuttle System
1. Replace shuttle mock data with API calls
2. Implement real booking and tracking
3. Add payment integration

### Phase 5: Fleet Management
1. Connect Fleet App to monitoring APIs
2. Real-time dashboard updates
3. Analytics and reporting

## 7. Environment Variables Required:

```env
# Frontend (.env)
REACT_APP_BACKEND_URL=http://localhost:8001

# Backend (.env)  
MONGO_URL=mongodb://localhost:27017/uber_clone
DB_NAME=uber_clone_db
```

## 8. Testing Strategy:

1. **API Testing**: Each endpoint tested with curl/Postman
2. **Integration Testing**: Frontend-backend data flow
3. **Real-world Testing**: OpenStreetMap API responses
4. **Performance Testing**: Response times and error handling

## 9. Error Handling:

- Network failures: Graceful fallback to cached data
- API rate limits: Queue requests and retry logic  
- Invalid coordinates: User-friendly error messages
- Service unavailable: Alternative routing options

This contract ensures seamless transition from mock data to fully functional OpenStreetMap-powered backend services.