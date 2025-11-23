import React, { useState } from 'react';
import { ChevronLeft, MapPin, Users, DollarSign, Clock, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

const UberShare = ({ onBack }) => {
  const [shareDetails, setShareDetails] = useState({
    pickup: '',
    destination: ''
  });
  
  const [showMatches, setShowMatches] = useState(false);

  const mockShareMatches = [
    {
      id: 1,
      route: 'Downtown → Airport',
      riders: [
        { name: 'Sarah M.', rating: 4.9, pickup: 'Union Square', destination: 'Terminal 1' },
        { name: 'Mike R.', rating: 4.7, pickup: 'Financial District', destination: 'Terminal 3' }
      ],
      departureTime: '3:20 PM',
      savings: '$12.50',
      originalPrice: '$35.00',
      sharePrice: '$22.50',
      availableSeats: 2
    },
    {
      id: 2,
      route: 'Mission → SOMA',
      riders: [
        { name: 'Alex K.', rating: 4.8, pickup: 'Mission District', destination: 'Salesforce Tower' }
      ],
      departureTime: '4:15 PM',
      savings: '$8.75',
      originalPrice: '$25.00',
      sharePrice: '$16.25',
      availableSeats: 3
    }
  ];

  const handleFindRides = () => {
    if (shareDetails.pickup && shareDetails.destination) {
      setShowMatches(true);
    }
  };

  const handleJoinRide = (match) => {
    alert(`Joined shared ride!\nRoute: ${match.route}\nDeparture: ${match.departureTime}\nYou'll save: ${match.savings}`);
  };

  if (showMatches) {
    return (
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setShowMatches(false)} className="mr-3 p-1">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold">Available Shared Rides</h2>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {shareDetails.pickup} → {shareDetails.destination}
          </div>
        </div>

        <div className="space-y-4">
          {mockShareMatches.map((match) => (
            <Card key={match.id} className="p-4 border-2 hover:border-blue-500 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{match.route}</h3>
                  <p className="text-sm text-gray-600">Departure: {match.departureTime}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${match.sharePrice}</div>
                  <div className="text-xs text-gray-500 line-through">${match.originalPrice}</div>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    Save {match.savings}
                  </Badge>
                </div>
              </div>

              {/* Current Riders */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Riders:</h4>
                <div className="space-y-2">
                  {match.riders.map((rider, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {rider.name[0]}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{rider.name}</span>
                        <span className="ml-2 text-yellow-600">★ {rider.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {rider.pickup} → {rider.destination}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ride Details */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {match.availableSeats} seats available
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  ~35 min ride
                </span>
              </div>

              <Button 
                onClick={() => handleJoinRide(match)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Join This Ride
              </Button>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
          <h4 className="font-semibold text-blue-800 mb-2">🚐 How Uber Share Works</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Share rides with up to 2 other passengers</li>
            <li>• Save up to 40% compared to regular UberX</li>
            <li>• Short walks to pickup/dropoff points</li>
            <li>• All riders are rated and verified</li>
          </ul>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold">Share Your Ride</h2>
      </div>

      <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
        <h3 className="font-semibold text-green-900 mb-2">🚐 Save Money, Meet People</h3>
        <p className="text-green-800 text-sm">Share your ride with others going your way. Save up to 40% on every trip while meeting like-minded travelers.</p>
      </div>

      <div className="space-y-6">
        {/* Location Inputs */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-600" />
            <Input
              placeholder="Pickup location"
              value={shareDetails.pickup}
              onChange={(e) => setShareDetails({...shareDetails, pickup: e.target.value})}
              className="border-0 p-0 focus:ring-0 bg-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <Input
              placeholder="Destination"
              value={shareDetails.destination}
              onChange={(e) => setShareDetails({...shareDetails, destination: e.target.value})}
              className="border-0 p-0 focus:ring-0 bg-transparent"
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-bold text-green-600">Save 40%</div>
            <div className="text-xs text-gray-600">vs regular rides</div>
          </Card>
          
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-bold text-blue-600">Max 3 Riders</div>
            <div className="text-xs text-gray-600">including you</div>
          </Card>
        </div>

        {/* Popular Routes */}
        <div>
          <h3 className="font-semibold mb-3">Popular Shared Routes</h3>
          <div className="space-y-2">
            {[
              'Downtown → Airport',
              'Mission → SOMA', 
              'Financial District → Castro',
              'Union Square → Golden Gate Park'
            ].map((route) => (
              <button
                key={route}
                onClick={() => {
                  const [pickup, destination] = route.split(' → ');
                  setShareDetails({ pickup, destination });
                }}
                className="w-full text-left p-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {route}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleFindRides}
          disabled={!shareDetails.pickup || !shareDetails.destination}
          className="w-full bg-green-600 text-white hover:bg-green-700 py-3"
        >
          Find Shared Rides
        </Button>

        {/* Tips */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Share Tips</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Be flexible with pickup/drop locations</li>
            <li>• Popular routes have more matches</li>
            <li>• Peak hours offer better savings</li>
            <li>• Rate your co-riders to build community</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default UberShare;