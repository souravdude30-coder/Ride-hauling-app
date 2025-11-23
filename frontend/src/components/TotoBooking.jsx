import React, { useState } from 'react';
import { ChevronLeft, MapPin, Clock, Users, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

const TotoBooking = ({ onBack }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedToto, setSelectedToto] = useState(null);

  const totoOptions = [
    {
      id: 'toto_standard',
      name: 'Toto Auto',
      description: 'Shared auto-rickshaw rides',
      price: 25,
      eta: '3 min',
      capacity: 3,
      icon: '🛺'
    },
    {
      id: 'toto_premium',
      name: 'Toto Plus',
      description: 'Comfortable auto rides',
      price: 35,
      eta: '2 min',
      capacity: 3,
      icon: '🚕'
    }
  ];

  const popularRoutes = [
    'Salt Lake → Park Street',
    'Howrah → Sealdah',
    'Esplanade → New Market',
    'Gariahat → Jadavpur'
  ];

  const handleBookToto = () => {
    if (pickup && destination && selectedToto) {
      alert(`Toto booked!\nType: ${selectedToto.name}\nFrom: ${pickup}\nTo: ${destination}\nFare: ₹${selectedToto.price}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Book a Toto</h1>
      </div>

      <div className="px-4 py-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-2">🛺 Classic Kolkata Rides</h2>
          <p className="text-sm opacity-90 mb-3">Experience the iconic auto-rickshaw rides across the city.</p>
          <Badge className="bg-white text-yellow-600 font-bold">Local favorite</Badge>
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

        {/* Popular Routes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Popular Routes</h3>
          <div className="grid grid-cols-2 gap-2">
            {popularRoutes.map((route, index) => (
              <button
                key={index}
                onClick={() => {
                  const [pickup, destination] = route.split(' → ');
                  setPickup(pickup);
                  setDestination(destination);
                }}
                className="p-3 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                {route}
              </button>
            ))}
          </div>
        </div>

        {/* Toto Options */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Choose your Toto</h3>
          {totoOptions.map((toto) => (
            <Card 
              key={toto.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedToto?.id === toto.id ? 'border-2 border-yellow-500 bg-yellow-50' : 'border hover:shadow-md'
              }`}
              onClick={() => setSelectedToto(toto)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{toto.icon}</div>
                  <div>
                    <h4 className="font-semibold text-lg">{toto.name}</h4>
                    <p className="text-sm text-gray-600">{toto.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {toto.eta}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {toto.capacity} seats
                      </span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        4.6
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">₹{toto.price}</div>
                  <div className="text-xs text-gray-500">~20 min</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Toto Features */}
        <Card className="p-4 bg-yellow-50 border-yellow-200 mb-6">
          <h4 className="font-semibold text-yellow-800 mb-2">🚕 Toto Features</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Authentic Kolkata auto-rickshaw experience</li>
            <li>• Shared rides with other passengers</li>
            <li>• Perfect for short to medium distances</li>
            <li>• Experienced local drivers</li>
            <li>• Fixed meter rates</li>
          </ul>
        </Card>

        {/* Book Button */}
        <Button 
          onClick={handleBookToto}
          disabled={!pickup || !destination || !selectedToto}
          className="w-full bg-yellow-500 text-white hover:bg-yellow-600 py-4 text-lg font-semibold rounded-2xl"
        >
          Book {selectedToto?.name || 'Toto'} • ₹{selectedToto?.price || 0}
        </Button>

        {/* Benefits Grid */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🏛️</div>
            <div className="text-sm font-medium">Local</div>
            <div className="text-xs text-gray-500">Authentic experience</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">💸</div>
            <div className="text-sm font-medium">Cheap</div>
            <div className="text-xs text-gray-500">Budget friendly</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🚦</div>
            <div className="text-sm font-medium">Flexible</div>
            <div className="text-xs text-gray-500">Navigate traffic</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotoBooking;