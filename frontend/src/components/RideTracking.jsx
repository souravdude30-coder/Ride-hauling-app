import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Navigation, Clock, Users, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { mockCurrentRide } from '../data/mock';

const RideTracking = ({ ride = mockCurrentRide, onRideComplete }) => {
  const [currentStatus, setCurrentStatus] = useState(ride.status);
  const [countdown, setCountdown] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Simulate ride progression
          if (currentStatus === 'driver_assigned') {
            setCurrentStatus('driver_arriving');
            return 300; // 5 minutes for arrival
          } else if (currentStatus === 'driver_arriving') {
            setCurrentStatus('in_progress');
            return 600; // 10 minutes for ride
          } else if (currentStatus === 'in_progress') {
            setCurrentStatus('completed');
            onRideComplete && onRideComplete();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStatus, onRideComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusInfo = () => {
    switch (currentStatus) {
      case 'driver_assigned':
        return {
          title: 'Driver found',
          message: 'Your driver is on the way',
          eta: `Arrives in ${formatTime(countdown)}`
        };
      case 'driver_arriving':
        return {
          title: 'Driver arriving',
          message: 'Your driver is almost here',
          eta: `${formatTime(countdown)} away`
        };
      case 'in_progress':
        return {
          title: 'On your way',
          message: 'Enjoy your ride',
          eta: `${formatTime(countdown)} remaining`
        };
      case 'completed':
        return {
          title: 'Trip completed',
          message: 'Thanks for riding with Uber',
          eta: 'Arrived'
        };
      default:
        return {
          title: 'Booking your ride',
          message: 'Finding a driver...',
          eta: 'Please wait'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Map placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 relative flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-sm text-gray-600">Live tracking map</div>
        </div>
        
        {/* Status overlay */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-lg p-3 shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{statusInfo.title}</div>
              <div className="text-xs text-gray-600">{statusInfo.message}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm">{statusInfo.eta}</div>
              {currentStatus !== 'completed' && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Live
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Driver info */}
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={ride.driver.profileImage} />
            <AvatarFallback>{ride.driver.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="font-semibold">{ride.driver.name}</div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{ride.driver.rating}</span>
              <span>•</span>
              <span>{ride.driver.vehicle.make} {ride.driver.vehicle.model}</span>
            </div>
            <div className="text-sm text-gray-500">{ride.driver.vehicle.plate}</div>
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

        {/* Ride details */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Trip</span>
            <span className="font-semibold">${ride.fare}</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-gray-400 mt-1"></div>
              <div>
                <div className="font-medium">Pickup</div>
                <div className="text-gray-600">{ride.pickup.address}</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-black mt-1"></div>
              <div>
                <div className="font-medium">Destination</div>
                <div className="text-gray-600">{ride.destination.address}</div>
              </div>
            </div>
          </div>

          {/* Shuttle specific info */}
          {ride.rideType.id === 'shuttle' && ride.passengers && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Shared ride passengers</span>
              </div>
              <div className="space-y-1 text-xs text-blue-700">
                {ride.passengers.map((passenger, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{passenger.name}</span>
                    <span>{passenger.pickup} → {passenger.destination}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {currentStatus === 'completed' && (
          <div className="mt-4 space-y-3">
            <Button className="w-full bg-black text-white">
              Rate your ride
            </Button>
            <Button variant="outline" className="w-full">
              Book another ride
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideTracking;