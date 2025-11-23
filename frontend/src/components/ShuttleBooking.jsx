import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Clock, Users, Wifi, Zap, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { mockShuttleTimeSlots } from '../data/mock';

const ShuttleBooking = ({ onBack }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingStep, setBookingStep] = useState('route'); // route, pickup-drop, time, confirm
  const [shuttleRoutes, setShuttleRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch shuttle routes on component mount
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/shuttles/routes`);
        const data = await response.json();
        if (data.success) {
          setShuttleRoutes(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch shuttle routes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setBookingStep('pickup-drop');
  };

  const handleLocationSelect = (pickup, drop) => {
    setSelectedPickup(pickup);
    setSelectedDrop(drop);
    setBookingStep('time');
  };

  const handleTimeSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setBookingStep('confirm');
  };

  const getNextSevenDays = () => {
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
                {route.amenities.map((amenity, index) => (
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
              onClick={() => handleTimeSelect(selectedTimeSlot)}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Confirm booking for ₹{selectedRoute.price}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your shuttle seat has been reserved</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Route:</span>
              <div className="font-medium">{selectedRoute.name}</div>
            </div>
            <div>
              <span className="text-gray-600">Time:</span>
              <div className="font-medium">{selectedTimeSlot.time}</div>
            </div>
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

        <div className="space-y-3">
          <Button className="w-full bg-green-600 text-white hover:bg-green-700">
            Track Live Bus
          </Button>
          <Button variant="outline" className="w-full">
            View Ticket Details
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full">
            Book Another Ride
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShuttleBooking;