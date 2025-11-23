import React, { useState } from 'react';
import { ChevronLeft, MapPin, Clock, Star, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

const BikeBooking = ({ onBack }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedBike, setSelectedBike] = useState(null);

  const bikeOptions = [
    {
      id: 'moto',
      name: 'Uber Moto',
      description: 'Affordable bike rides',
      price: 45,
      eta: '2 min',
      icon: '🏍️',
      discount: 20
    },
    {
      id: 'bike_lite',
      name: 'Bike Lite',
      description: 'Budget-friendly option',
      price: 35,
      eta: '3 min', 
      icon: '🛵',
      discount: 15
    }
  ];

  const handleBookBike = () => {
    if (pickup && destination && selectedBike) {
      alert(`Bike booked!\nType: ${selectedBike.name}\nFrom: ${pickup}\nTo: ${destination}\nFare: ₹${selectedBike.price}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Book a Bike</h1>
      </div>

      <div className="px-4 py-6">
        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-2">🏍️ Beat the Traffic</h2>
          <p className="text-sm opacity-90 mb-3">Fast, affordable bike rides. Perfect for short distances.</p>
          <Badge className="bg-white text-orange-600 font-bold">Up to 50% cheaper</Badge>
        </div>

        {/* Location Inputs */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 bg-gray-100 rounded-2xl px-4 py-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <Input
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="border-0 p-0 focus:ring-0 bg-transparent text-lg"
            />
          </div>
          
          <div className="flex items-center space-x-3 bg-gray-100 rounded-2xl px-4 py-4">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <Input
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="border-0 p-0 focus:ring-0 bg-transparent text-lg"
            />
          </div>
        </div>

        {/* Bike Options */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Choose your ride</h3>
          {bikeOptions.map((bike) => (
            <Card 
              key={bike.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedBike?.id === bike.id ? 'border-2 border-orange-500 bg-orange-50' : 'border hover:shadow-md'
              }`}
              onClick={() => setSelectedBike(bike)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{bike.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-lg">{bike.name}</h4>
                      {bike.discount && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {bike.discount}% off
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{bike.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {bike.eta}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        4.8
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">₹{bike.price}</div>
                  <div className="text-xs text-gray-500">~15 min</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Safety Info */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">🛡️ Safety First</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verified drivers with valid licenses</li>
            <li>• Helmet provided for your safety</li>
            <li>• Live GPS tracking throughout your ride</li>
            <li>• 24/7 support available</li>
          </ul>
        </Card>

        {/* Book Button */}
        <Button 
          onClick={handleBookBike}
          disabled={!pickup || !destination || !selectedBike}
          className="w-full bg-orange-500 text-white hover:bg-orange-600 py-4 text-lg font-semibold rounded-2xl"
        >
          Book {selectedBike?.name || 'Bike'} • ₹{selectedBike?.price || 0}
        </Button>

        {/* Benefits */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm font-medium">Fast</div>
            <div className="text-xs text-gray-500">Beat traffic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium">Affordable</div>
            <div className="text-xs text-gray-500">Best rates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="text-sm font-medium">Safe</div>
            <div className="text-xs text-gray-500">Verified drivers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeBooking;