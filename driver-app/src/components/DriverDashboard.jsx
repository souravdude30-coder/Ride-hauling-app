import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, Clock, Star, Menu, Power, History, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

const DriverDashboard = ({ 
  driver, 
  isOnline, 
  onToggleOnline, 
  currentLocation, 
  activeRide, 
  rideRequest 
}) => {
  const [todayStats, setTodayStats] = useState({
    earnings: 0,
    rides: 0,
    hours: 0,
    rating: 4.8
  });

  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate fetching today's stats
    setTodayStats({
      earnings: 245.50,
      rides: 12,
      hours: 6.5,
      rating: 4.8
    });

    // Simulate fetching ride history
    setRideHistory([
      {
        id: 'ride_1',
        date: '2024-01-02',
        pickup: '123 Main St',
        destination: '456 Oak Ave',
        fare: 25.50,
      },
      {
        id: 'ride_2',
        date: '2024-01-01',
        pickup: '789 Pine Ln',
        destination: '101 Elm Rd',
        fare: 15.00,
      },
    ]);

    // Simulate fetching notifications
    setNotifications([
      {
        id: 'notif_1',
        type: 'payment',
        message: 'Your weekly earnings have been processed.',
        timestamp: '2 hours ago',
      },
      {
        id: 'notif_2',
        type: 'update',
        message: 'App update available. New features added!',
        timestamp: '1 day ago',
      },
    ]);

    // Simulate nearby ride requests when online
    if (isOnline && !activeRide) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance of new request
          const mockRequest = {
            id: `req_${Date.now()}`,
            pickup: {
              address: '123 Main St, Downtown',
              lat: 37.7749 + Math.random() * 0.01,
              lon: -122.4194 + Math.random() * 0.01
            },
            destination: {
              address: '456 Oak Ave, Uptown',
              lat: 37.7849 + Math.random() * 0.01,
              lon: -122.4094 + Math.random() * 0.01
            },
            fare: Math.round((Math.random() * 20 + 10) * 100) / 100,
            distance: Math.round((Math.random() * 5 + 1) * 100) / 100,
            rideType: 'UberX',
            user: {
              name: 'John D.',
              rating: 4.7
            }
          };
          setNearbyRequests(prev => [mockRequest, ...prev.slice(0, 2)]);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isOnline, activeRide]);

  const handleAcceptRequest = (request) => {
    setNearbyRequests(prev => prev.filter(r => r.id !== request.id));
    // Navigate to active ride
    window.location.href = '/active-ride';
  };

  const handleDeclineRequest = (requestId) => {
    setNearbyRequests(prev => prev.filter(r => r.id !== requestId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{driver.name[0]}</span>
          </div>
          <div>
            <h1 className="font-semibold">Welcome, {driver.name}</h1>
            <p className="text-sm text-gray-300">{driver.vehicle.make} {driver.vehicle.model}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-white">
          <Menu className="w-5 h-5" />
        </Button>
      </header>

      {/* Online Status Toggle */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <Power className={`w-5 h-5 ${isOnline ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="font-medium">
              You're {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <Switch
            checked={isOnline}
            onCheckedChange={onToggleOnline}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
        {isOnline && (
          <p className="text-center text-sm text-gray-600 mt-2">
            Ready to receive ride requests
          </p>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Today's Stats */}
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-2xl font-bold text-green-600">${todayStats.earnings}</span>
              </div>
              <p className="text-sm text-gray-600">Earnings</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Navigation className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-2xl font-bold text-blue-600">{todayStats.rides}</span>
              </div>
              <p className="text-sm text-gray-600">Rides</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-purple-600 mr-1" />
                <span className="text-2xl font-bold text-purple-600">{todayStats.hours}h</span>
              </div>
              <p className="text-sm text-gray-600">Online</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-2xl font-bold text-yellow-600">{todayStats.rating}</span>
              </div>
              <p className="text-sm text-gray-600">Rating</p>
            </div>
          </div>
        </Card>

        {/* Current Location */}
        {currentLocation && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-green-600" />
              Current Location
            </h3>
            <p className="text-sm text-gray-600">
              Lat: {currentLocation.lat.toFixed(6)}, Lon: {currentLocation.lon.toFixed(6)}
            </p>
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
              Location Tracking Active
            </Badge>
          </Card>
        )}

        {/* Active Ride */}
        {activeRide && (
          <Card className="p-4 border-l-4 border-l-blue-500">
            <h3 className="font-semibold mb-2 text-blue-700">Active Ride</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pickup:</span>
                <span className="text-sm font-medium">{activeRide.pickup.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Destination:</span>
                <span className="text-sm font-medium">{activeRide.destination.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fare:</span>
                <span className="text-sm font-bold text-green-600">${activeRide.fare}</span>
              </div>
            </div>
            <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
              View Ride Details
            </Button>
          </Card>
        )}

        {/* Ride History */}
        {rideHistory.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <History className="w-4 h-4 mr-2 text-gray-600" />
              Ride History
            </h3>
            <div className="space-y-3">
              {rideHistory.map((ride) => (
                <div key={ride.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{ride.pickup} to {ride.destination}</p>
                    <p className="text-xs text-gray-500">{ride.date}</p>
                  </div>
                  <p className="font-bold text-sm text-green-600">${ride.fare}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Nearby Ride Requests */}
        {isOnline && !activeRide && nearbyRequests.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Nearby Ride Requests</h3>
            <div className="space-y-3">
              {nearbyRequests.map((request) => (
                <Card key={request.id} className="p-4 border-l-4 border-l-orange-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Badge className="bg-orange-100 text-orange-800 mb-2">
                        {request.rideType}
                      </Badge>
                      <p className="text-sm text-gray-600">From: {request.pickup.address}</p>
                      <p className="text-sm text-gray-600">To: {request.destination.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${request.fare}</p>
                      <p className="text-xs text-gray-500">{request.distance} km</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleAcceptRequest(request)}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Bell className="w-4 h-4 mr-2 text-gray-600" />
              Notifications
            </h3>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                  <p className="text-sm font-medium">{notif.message}</p>
                  <p className="text-xs text-gray-500">{notif.timestamp}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* No Requests Message */}
        {isOnline && !activeRide && nearbyRequests.length === 0 && (
          <Card className="p-6 text-center">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">Looking for rides...</h3>
            <p className="text-sm text-gray-500">
              Stay online to receive ride requests in your area
            </p>
          </Card>
        )}

        {/* Offline Message */}
        {!isOnline && (
          <Card className="p-6 text-center">
            <Power className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">You're offline</h3>
            <p className="text-sm text-gray-500 mb-4">
              Go online to start receiving ride requests
            </p>
            <Button onClick={onToggleOnline} className="bg-green-600 hover:bg-green-700">
              Go Online
            </Button>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-16" onClick={() => alert('Navigate to Earnings')}>
            <div className="text-center">
              <DollarSign className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Earnings</span>
            </div>
          </Button>
          <Button variant="outline" className="h-16" onClick={() => alert('Navigate to Ride History')}>
            <div className="text-center">
              <History className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">History</span>
            </div>
          </Button>
          <Button variant="outline" className="h-16" onClick={() => alert('Navigate to Notifications')}>
            <div className="text-center">
              <Bell className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Notifications</span>
            </div>
          </Button>
          <Button variant="outline" className="h-16" onClick={() => alert('Navigate to Profile')}>
            <div className="text-center">
              <Star className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Profile</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;