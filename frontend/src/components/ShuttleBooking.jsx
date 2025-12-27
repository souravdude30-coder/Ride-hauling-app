import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, MapPin, Clock, Users, Wifi, Zap, Calendar, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { mockShuttleTimeSlots } from '../data/mock';

const ShuttleBooking = ({ onBack }) => {
  // --- State Management ---
  const [bookingStep, setBookingStep] = useState('route'); 
  const [shuttleRoutes, setShuttleRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection State
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [selectedDateObj, setSelectedDateObj] = useState(new Date()); // Store actual Date object
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  const [bookingData, setBookingData] = useState(null);
  const [userToken, setUserToken] = useState(localStorage.getItem('passenger_token'));

  // --- Helper: Date Generator ---
  const getNextSevenDays = useCallback(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  // --- API: Fetch Routes ---
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/shuttles/routes`);
        if (!response.ok) throw new Error('Failed to load shuttle routes');
        const data = await response.json();
        if (data.success) setShuttleRoutes(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  // --- Navigation Handlers ---
  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    // Reset downstream selections if user changes route
    setSelectedPickup(null);
    setSelectedDrop(null);
    setBookingStep('pickup-drop');
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      let currentToken = userToken;

      // 1. Production-ready Auth Check
      if (!currentToken) {
        const loginResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'passenger@gmail.com', password: 'Pass@123' })
        });
        const loginData = await loginResponse.json();
        if (loginData.access_token) {
          currentToken = loginData.access_token;
          localStorage.setItem('passenger_token', currentToken);
          setUserToken(currentToken);
        } else {
          throw new Error('Please login to continue');
        }
      }

      // 2. Precise Date/Time Construction
      const journeyDate = new Date(selectedDateObj);
      const [hours, minutes] = selectedTimeSlot.time.split(':');
      journeyDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // 3. Booking Request
      const bookingPayload = {
        pickup_location: selectedPickup.name,
        dropoff_location: selectedDrop.name,
        journey_date: journeyDate.toISOString(),
        shuttle_id: selectedRoute.shuttle_id,
        route_id: selectedRoute.id
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setBookingData(data.booking);
        setBookingStep('ticket');
      } else {
        throw new Error(data.detail || 'Booking failed');
      }
    } catch (err) {
      alert(err.message);
      setBookingStep('time');
    } finally {
      setLoading(false);
    }
  };

  // --- Sub-Views ---

  if (loading && bookingStep === 'route') {
    return <div className="p-10 text-center animate-pulse">Searching for available shuttles...</div>;
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h3 className="text-red-800 font-bold">Connection Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Card>
    );
  }

  // View: Route List
  if (bookingStep === 'route') {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack}><ChevronLeft className="mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold ml-4">Select Route</h2>
        </div>
        
        {shuttleRoutes.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No routes active right now.</div>
        ) : (
          <div className="space-y-4">
            {shuttleRoutes.map(route => (
              <Card key={route.id} className="p-4 hover:border-blue-500 cursor-pointer" onClick={() => handleRouteSelect(route)}>
                <div className="flex justify-between">
                  <h3 className="font-bold text-lg">{route.name}</h3>
                  <span className="text-green-600 font-bold">₹{route.price}</span>
                </div>
                <div className="text-sm text-gray-500 flex gap-4 mt-2">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {route.duration_min}m</span>
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> {route.capacity} seats</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View: Pickup & Drop
  if (bookingStep === 'pickup-drop') {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <Button variant="ghost" onClick={() => setBookingStep('route')}><ChevronLeft /> Back</Button>
        <h2 className="text-xl font-bold mt-4 mb-6">Where are you heading?</h2>
        
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Pickup Point</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {selectedRoute.pickup_hotspots.map(p => (
                <div 
                  key={p.id} 
                  className={`p-3 border rounded-lg cursor-pointer ${selectedPickup?.id === p.id ? 'bg-blue-50 border-blue-500' : ''}`}
                  onClick={() => setSelectedPickup(p)}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400">Drop Point</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {selectedRoute.drop_hotspots.map(d => (
                <div 
                  key={d.id} 
                  className={`p-3 border rounded-lg cursor-pointer ${selectedDrop?.id === d.id ? 'bg-blue-50 border-blue-500' : ''}`}
                  onClick={() => setSelectedDrop(d)}
                >
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button 
          className="w-full mt-8" 
          disabled={!selectedPickup || !selectedDrop}
          onClick={() => setBookingStep('time')}
        >
          Confirm Locations
        </Button>
      </div>
    );
  }

  // View: Date & Time Selection
  if (bookingStep === 'time') {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <Button variant="ghost" onClick={() => setBookingStep('pickup-drop')}><ChevronLeft /> Back</Button>
        <h2 className="text-xl font-bold mt-4 mb-6">Select Schedule</h2>

        <div className="mb-8">
           <div className="flex gap-2 overflow-x-auto pb-2">
            {getNextSevenDays().map((date, i) => (
              <button
                key={i}
                onClick={() => setSelectedDateObj(date)}
                className={`flex-shrink-0 p-3 rounded-lg border text-center min-w-[80px] ${
                  selectedDateObj.toDateString() === date.toDateString() ? 'bg-blue-600 text-white' : 'bg-gray-50'
                }`}
              >
                <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="font-bold">{date.getDate()}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {mockShuttleTimeSlots.map(slot => (
            <div 
              key={slot.id}
              className={`p-4 border rounded-lg cursor-pointer ${selectedTimeSlot?.id === slot.id ? 'border-blue-500 bg-blue-50' : ''}`}
              onClick={() => setSelectedTimeSlot(slot)}
            >
              <div className="font-bold">{slot.time}</div>
              <div className="text-xs text-gray-500">{slot.availableSeats} seats left</div>
            </div>
          ))}
        </div>

        <Button 
          className="w-full mt-8 bg-black text-white" 
          disabled={!selectedTimeSlot || loading}
          onClick={handleConfirmBooking}
        >
          {loading ? 'Processing...' : 'Book Now'}
        </Button>
      </div>
    );
  }

  // View: Success Ticket
  if (bookingStep === 'ticket' && bookingData) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border">
        <div className="bg-green-600 p-4 text-center text-white">
          <h2 className="text-xl font-bold">Booking Confirmed!</h2>
          <p className="text-sm opacity-90">Ticket ID: {bookingData.id.slice(0,8)}</p>
        </div>
        
        <div className="p-6 text-center">
          <div className="bg-white p-4 border-2 border-dashed rounded-lg inline-block mb-4">
             <img src={`data:image/png;base64,${bookingData.qr_code}`} alt="QR" className="w-48 h-48" />
          </div>
          
          <div className="mb-6">
            <span className="text-gray-400 text-xs uppercase font-bold">Driver Verification OTP</span>
            <div className="text-4xl font-mono font-black tracking-widest text-blue-700">{bookingData.otp}</div>
          </div>

          <div className="text-left space-y-3 border-t pt-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Pick-up</span><strong>{selectedPickup.name}</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">Time</span><strong>{selectedTimeSlot.time}</strong></div>
          </div>

          <Button className="w-full mt-6" variant="outline" onClick={onBack}>Done</Button>
        </div>
      </div>
    );
  }

  return null;
};

export default ShuttleBooking;
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        id: i === 0 ? 'today' : `day_${i}`,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        date: date
      });
    }
    return days;
  };

  if (bookingStep === 'route') {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold">Choose your shuttle route</h2>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-900 mb-2">🚌 Uber Shuttle India</h3>
          <p className="text-blue-800 text-sm">Book your daily commute up to 7 days in advance. Fixed routes with comfortable AC buses, live tracking, and affordable pricing.</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading routes...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {shuttleRoutes.map((route) => (
            <Card key={route.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
                  onClick={() => handleRouteSelect(route)}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                  <p className="text-gray-600 text-sm">{route.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₹{route.price}</div>
                  <div className="text-xs text-gray-500">per ride</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{route.duration_min}-{route.duration_max} min</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{route.distance_km} km</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{route.capacity} seats</span>
                </div>
                <div className="text-gray-600">
                  <span>Every {route.frequency_minutes} min</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(route.amenities || []).map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity === 'WiFi' && <Wifi className="w-3 h-3 mr-1" />}
                    {amenity === 'USB Charging' && <Zap className="w-3 h-3 mr-1" />}
                    {amenity}
                  </Badge>
                ))}
              </div>

              <div className="text-xs text-gray-500">
                <span className="font-medium">Operating hours:</span> {route.operating_start} - {route.operating_end}
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    );
  }

  if (bookingStep === 'pickup-drop') {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setBookingStep('route')} className="mr-3 p-1">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold">Select pickup & drop points</h2>
        </div>

        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="font-semibold text-gray-900">{selectedRoute.name}</div>
          <div className="text-sm text-gray-600">₹{selectedRoute.price} • {selectedRoute.duration_min}-{selectedRoute.duration_max} min</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-green-600">📍 Pickup Points</h3>
            <div className="space-y-3">
              {(selectedRoute.pickup_hotspots || []).map((pickup) => (
                <div key={pickup.id} 
                     className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                       selectedPickup?.id === pickup.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                     }`}
                     onClick={() => setSelectedPickup(pickup)}>
                  <div className="font-medium text-gray-900">{pickup.name}</div>
                  <div className="text-sm text-gray-600">{pickup.address}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">First bus: {pickup.pickup_time}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-red-600">📍 Drop Points</h3>
            <div className="space-y-3">
              {(selectedRoute.drop_hotspots || []).map((drop) => (
                <div key={drop.id}
                     className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                       selectedDrop?.id === drop.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                     }`}
                     onClick={() => setSelectedDrop(drop)}>
                  <div className="font-medium text-gray-900">{drop.name}</div>
                  <div className="text-sm text-gray-600">{drop.address}</div>
                  <div className="text-xs text-red-600 font-medium mt-1">Arrival: {drop.drop_time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedPickup && selectedDrop && (
          <div className="mt-6">
            <Button 
              onClick={() => handleLocationSelect(selectedPickup, selectedDrop)}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Continue to time selection
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (bookingStep === 'time') {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setBookingStep('pickup-drop')} className="mr-3 p-1">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold">Choose date & time</h2>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">From:</span>
              <div className="font-medium">{selectedPickup.name}</div>
            </div>
            <div>
              <span className="text-gray-600">To:</span>
              <div className="font-medium">{selectedDrop.name}</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Select Date
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {getNextSevenDays().map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDate(day.id)}
                className={`p-3 text-sm rounded-lg border-2 transition-all ${
                  selectedDate === day.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Available Time Slots
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {mockShuttleTimeSlots.map((slot) => (
              <div
                key={slot.id}
                onClick={() => handleTimeSelect(slot)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTimeSlot?.id === slot.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${slot.availableSeats < 5 ? 'border-orange-200 bg-orange-50' : ''}`}
              >
                <div className="font-semibold text-lg">{slot.time}</div>
                <div className="text-sm text-gray-600">
                  {slot.availableSeats} of {slot.totalSeats} seats available
                </div>
                {slot.availableSeats < 5 && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    Filling fast!
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedTimeSlot && (
          <div className="mt-6">
            <Button 
              onClick={handleConfirmBooking}
              disabled={loading}
              className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Creating booking...' : `Confirm booking for ₹${selectedRoute.price}`}
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Show processing screen
  if (bookingStep === 'confirm' || loading) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Processing...</h2>
          <p className="text-gray-600 mb-6">Please wait while we create your booking</p>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Ticket display with QR code and OTP
  if (bookingStep === 'ticket' && bookingData) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Digital Ticket</h2>
          <p className="text-gray-600">Show this to the driver</p>
        </div>

        {/* QR Code Display */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
          <div className="text-center mb-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Scan QR Code</h3>
            <p className="text-sm text-gray-600">Driver will scan this code to verify your ticket</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg inline-block mx-auto">
            <img 
              src={`data:image/png;base64,${bookingData.qr_code}`}
              alt="Booking QR Code"
              className="w-64 h-64 mx-auto"
            />
          </div>
        </div>

        {/* OTP Display */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg mb-6 border-2 border-green-200">
          <div className="text-center">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Verification OTP</h3>
            <p className="text-sm text-gray-600 mb-4">Or share this 6-digit code with driver</p>
            
            <div className="bg-white px-8 py-6 rounded-xl shadow-inner inline-block">
              <div className="text-5xl font-bold text-green-600 tracking-widest font-mono">
                {bookingData.otp}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold mb-4 text-gray-900">Booking Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Route:</span>
              <div className="font-medium text-gray-900">{selectedRoute.name}</div>
            </div>
            <div>
              <span className="text-gray-600">Time:</span>
              <div className="font-medium text-gray-900">{selectedTimeSlot.time}</div>
            </div>
            <div>
              <span className="text-gray-600">From:</span>
              <div className="font-medium text-gray-900">{selectedPickup.name}</div>
            </div>
            <div>
              <span className="text-gray-600">To:</span>
              <div className="font-medium text-gray-900">{selectedDrop.name}</div>
            </div>
            <div>
              <span className="text-gray-600">Booking ID:</span>
              <div className="font-medium text-gray-900 text-xs">{bookingData.id.substring(0, 12)}...</div>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <div className="font-medium text-green-600 capitalize">{bookingData.status}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
            📍 Track Live Bus
          </Button>
          <Button className="w-full bg-gray-600 text-white hover:bg-gray-700">
            💾 Save Ticket
          </Button>
          <Button variant="outline" className="w-full" onClick={onBack}>
            ← Book Another Shuttle
          </Button>
        </div>

        {/* Important Notes */}
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> This QR code is single-use and will expire after verification. 
            Please arrive 5 minutes before departure time.
          </p>
        </div>
      </div>
    );
  }

  // Fallback for old confirmation screen
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Processing...</h2>
        <p className="text-gray-600 mb-6">Please wait while we create your booking</p>
      </div>
    </div>
  );
};

export default ShuttleBooking;
