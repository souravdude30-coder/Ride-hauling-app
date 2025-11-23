import React, { useState } from 'react';
import { ChevronLeft, MapPin, Package, Clock, Star, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const DeliveryBooking = ({ onBack }) => {
  const [pickup, setPickup] = useState('');
  const [delivery, setDelivery] = useState('');
  const [itemType, setItemType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  const deliveryOptions = [
    {
      id: 'connect',
      name: 'Uber Connect',
      description: 'Send packages & items',
      price: 89,
      eta: '30-45 min',
      weight: 'Up to 13kg',
      icon: '📦'
    },
    {
      id: 'direct',
      name: 'Uber Direct',
      description: 'Same-day delivery',
      price: 149,
      eta: '60-90 min', 
      weight: 'Up to 30kg',
      icon: '🚚'
    }
  ];

  const itemTypes = [
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'food', name: 'Food', icon: '🍔' },
    { id: 'clothes', name: 'Clothes', icon: '👕' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'medicines', name: 'Medicines', icon: '💊' },
    { id: 'other', name: 'Other', icon: '📦' }
  ];

  const handleBookDelivery = () => {
    if (pickup && delivery && itemType && selectedOption) {
      alert(`Delivery booked!\nType: ${selectedOption.name}\nFrom: ${pickup}\nTo: ${delivery}\nItem: ${itemType}\nFare: ₹${selectedOption.price}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Send Items</h1>
      </div>

      <div className="px-4 py-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-2">📦 Send Anything, Anywhere</h2>
          <p className="text-sm opacity-90 mb-3">Fast, reliable delivery service for your packages and items.</p>
          <Badge className="bg-white text-blue-600 font-bold">Same-day delivery</Badge>
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
              placeholder="Delivery location"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              className="border-0 p-0 focus:ring-0 bg-transparent text-lg"
            />
          </div>
        </div>

        {/* Item Type Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">What are you sending?</h3>
          <div className="grid grid-cols-3 gap-3">
            {itemTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setItemType(type.name)}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  itemType === type.name 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium">{type.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Item Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Package details</h3>
          <Textarea
            placeholder="Describe your item (size, weight, special instructions...)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-0"
            rows={3}
          />
        </div>

        {/* Photo Option */}
        <Card className="p-4 mb-6 border-dashed border-2 border-gray-300">
          <div className="text-center">
            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Take a photo of your item</p>
            <Button variant="outline" className="text-sm">
              Add Photo (Optional)
            </Button>
          </div>
        </Card>

        {/* Delivery Options */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Choose delivery option</h3>
          {deliveryOptions.map((option) => (
            <Card 
              key={option.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedOption?.id === option.id ? 'border-2 border-blue-500 bg-blue-50' : 'border hover:shadow-md'
              }`}
              onClick={() => setSelectedOption(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{option.icon}</div>
                  <div>
                    <h4 className="font-semibold text-lg">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {option.eta}
                      </span>
                      <span className="flex items-center">
                        <Package className="w-3 h-3 mr-1" />
                        {option.weight}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">₹{option.price}</div>
                  <div className="text-xs text-gray-500">Est. delivery</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Delivery Guidelines */}
        <Card className="p-4 bg-gray-50 border-gray-200 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">📋 Delivery Guidelines</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• No illegal, hazardous, or fragile items</li>
            <li>• Package must fit in a regular bag</li>
            <li>• Provide accurate pickup & delivery details</li>
            <li>• Recipient should be available for delivery</li>
          </ul>
        </Card>

        {/* Book Button */}
        <Button 
          onClick={handleBookDelivery}
          disabled={!pickup || !delivery || !itemType || !selectedOption}
          className="w-full bg-blue-500 text-white hover:bg-blue-600 py-4 text-lg font-semibold rounded-2xl"
        >
          Book {selectedOption?.name || 'Delivery'} • ₹{selectedOption?.price || 0}
        </Button>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm font-medium">Track Live</div>
            <div className="text-xs text-gray-500">Real-time updates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="text-sm font-medium">Secure</div>
            <div className="text-xs text-gray-500">Safe delivery</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm font-medium">Fast</div>
            <div className="text-xs text-gray-500">Same day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBooking;