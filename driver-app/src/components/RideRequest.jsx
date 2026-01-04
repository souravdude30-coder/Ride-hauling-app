import React from 'react';
import { MapPin, Navigation, Clock, DollarSign, User, Star, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const RideRequest = ({ request, onAccept, onDecline }) => {
  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <p className="text-gray-500">No ride request available</p>
            <a href="/" className="text-blue-600 hover:underline text-sm mt-2 block">Return to Dashboard</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-center">New Ride Request</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">{request.user?.name || 'Passenger'}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  {request.user?.rating || '4.5'}
                </div>
              </div>
            </div>
            <Badge variant="secondary">{request.rideType || 'Standard'}</Badge>
          </div>

          {/* Route Info */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pickup</p>
                <p className="font-medium">{request.pickup?.address || 'Pickup location'}</p>
              </div>
            </div>
            
            <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-6"></div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Drop-off</p>
                <p className="font-medium">{request.destination?.address || 'Destination'}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5 mx-auto text-green-600" />
              <p className="text-lg font-bold text-green-600">₹{request.fare || '0'}</p>
              <p className="text-xs text-gray-500">Fare</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Navigation className="w-5 h-5 mx-auto text-blue-600" />
              <p className="text-lg font-bold">{request.distance || '0'} km</p>
              <p className="text-xs text-gray-500">Distance</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 mx-auto text-orange-600" />
              <p className="text-lg font-bold">{request.eta || '5'} min</p>
              <p className="text-xs text-gray-500">Pickup ETA</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
              onClick={onDecline}
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onAccept}
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideRequest;
