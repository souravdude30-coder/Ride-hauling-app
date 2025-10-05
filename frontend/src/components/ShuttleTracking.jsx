import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Clock, Users, Phone, MessageSquare, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

const ShuttleTracking = ({ onBack }) => {
  const [busStatus, setBusStatus] = useState('approaching_pickup'); // approaching_pickup, at_pickup, en_route, approaching_drop, arrived
  const [eta, setEta] = useState(5); // minutes
  const [currentLocation, setCurrentLocation] = useState('Near DLF Phase 1');
  
  // Mock shuttle booking details
  const bookingDetails = {
    route: 'Gurgaon - Delhi Route',
    time: '8:00 AM',
    pickup: 'DLF Phase 1',
    drop: 'Connaught Place',
    busNumber: 'HR 26 AB 1234',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    seatNumber: 'A12',
    fare: 150
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) {
          // Simulate bus journey progression
          if (busStatus === 'approaching_pickup') {
            setBusStatus('at_pickup');
            setCurrentLocation('At DLF Phase 1');
            return 2; // 2 minutes at pickup
          } else if (busStatus === 'at_pickup') {
            setBusStatus('en_route');
            setCurrentLocation('On NH-8 Highway');
            return 45; // 45 minutes journey
          } else if (busStatus === 'en_route') {
            setBusStatus('approaching_drop');
            setCurrentLocation('Near Connaught Place');
            return 3; // 3 minutes to reach
          } else if (busStatus === 'approaching_drop') {
            setBusStatus('arrived');
            setCurrentLocation('Connaught Place');
            return 0;
          }
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [busStatus]);

  const getStatusInfo = () => {
    switch (busStatus) {
      case 'approaching_pickup':
        return {
          title: 'Bus is approaching your pickup point',
          message: 'Get ready to board',
          color: 'blue',
          icon: '🚌'
        };
      case 'at_pickup':
        return {
          title: 'Bus has arrived at pickup point',
          message: 'Please board the bus',
          color: 'green',
          icon: '🚏'
        };
      case 'en_route':
        return {
          title: 'Journey in progress',
          message: 'Enjoy your comfortable ride',
          color: 'purple',
          icon: '🛣️'
        };
      case 'approaching_drop':
        return {
          title: 'Approaching your destination',
          message: 'Get ready to alight',
          color: 'orange',
          icon: '🏁'
        };
      case 'arrived':
        return {
          title: 'Journey completed',
          message: 'Thank you for riding with Uber Shuttle',
          color: 'green',
          icon: '✅'
        };
      default:
        return {
          title: 'Preparing for departure',
          message: 'Please wait',
          color: 'gray',
          icon: '⏳'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center p-6 pb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold">Live Shuttle Tracking</h2>
      </div>

      {/* Live Map Placeholder */}
      <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 relative flex items-center justify-center mx-6 rounded-lg mb-6">
        <div className="text-center">
          <div className="text-5xl mb-2">🗺️</div>
          <div className="text-sm text-gray-600">Live route tracking</div>
          <div className="text-xs text-gray-500 mt-1">Current: {currentLocation}</div>
        </div>
        
        {/* Status overlay */}
        <div className="absolute top-4 left-4 right-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{statusInfo.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{statusInfo.title}</div>
                  <div className="text-xs text-gray-600">{statusInfo.message}</div>
                </div>
              </div>
              <div className="text-right">
                {busStatus !== 'arrived' && (
                  <div className="font-bold text-sm">{eta} min</div>
                )}
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                    statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    statusInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                    statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  Live
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Bus & Driver Info */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-lg">Uber Shuttle Bus</div>
              <div className="text-gray-600">{bookingDetails.busNumber}</div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="p-2">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Driver:</span>
              <div className="font-medium">{bookingDetails.driverName}</div>
            </div>
            <div>
              <span className="text-gray-600">Your seat:</span>
              <div className="font-medium">{bookingDetails.seatNumber}</div>
            </div>
          </div>
        </Card>

        {/* Journey Details */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Journey Details</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{bookingDetails.pickup}</div>
                    <div className="text-sm text-gray-600">{bookingDetails.time}</div>
                  </div>
                  {busStatus === 'at_pickup' && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Boarding now
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-1">
              <div className="w-1 h-8 bg-gray-300"></div>
              <div className="text-xs text-gray-500">
                {bookingDetails.route} • ₹{bookingDetails.fare}
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-2"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{bookingDetails.drop}</div>
                    <div className="text-sm text-gray-600">
                      {busStatus === 'arrived' ? 'Arrived' : `ETA: ${eta} min`}
                    </div>
                  </div>
                  {busStatus === 'approaching_drop' && (
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      Get ready
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Shuttle Features */}
        <Card className="p-4 mb-6 bg-blue-50">
          <h3 className="font-semibold mb-2 text-blue-900">🚌 Shuttle Amenities</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <div className="flex items-center">
              <span className="mr-2">❄️</span> Air Conditioned
            </div>
            <div className="flex items-center">
              <span className="mr-2">📶</span> Free WiFi
            </div>
            <div className="flex items-center">
              <span className="mr-2">🔌</span> USB Charging
            </div>
            <div className="flex items-center">
              <span className="mr-2">📱</span> Live Tracking
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {busStatus === 'arrived' ? (
            <>
              <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                Rate Your Journey
              </Button>
              <Button variant="outline" className="w-full">
                Book Return Journey
              </Button>
              <Button variant="ghost" onClick={onBack} className="w-full">
                Book Another Route
              </Button>
            </>
          ) : (
            <>
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                <Navigation className="w-4 h-4 mr-2" />
                Share Live Location
              </Button>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShuttleTracking;