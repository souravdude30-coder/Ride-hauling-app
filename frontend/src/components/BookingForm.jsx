import React, { useState } from 'react';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { mockLocations } from '../data/mock';

const BookingForm = ({ onBookRide }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('Today');
  const [time, setTime] = useState('Now');
  const [showSuggestions, setShowSuggestions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pickup && destination) {
      onBookRide({ pickup, destination, date, time });
    }
  };

  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/locations/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data.map(location => ({
          id: location.id,
          name: location.name,
          address: location.address
        })));
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      // Fallback to mock data
      const mockSuggestions = mockLocations.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(mockSuggestions);
    }
  };

  const handleLocationSelect = (location, type) => {
    if (type === 'pickup') {
      setPickup(location.name);
    } else {
      setDestination(location.name);
    }
    setShowSuggestions('');
    setSuggestions([]);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Go anywhere with<br />Uber
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg focus-within:border-black transition-colors">
            <MapPin className="w-5 h-5 text-gray-600" />
            <Input
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                setShowSuggestions('pickup');
                fetchSuggestions(e.target.value);
              }}
              className="border-0 p-0 focus:ring-0 bg-transparent"
            />
          </div>
          
          {showSuggestions === 'pickup' && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleLocationSelect(location, 'pickup')}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-gray-600">{location.address}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg focus-within:border-black transition-colors">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <Input
              placeholder="Destination"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowSuggestions('destination');
                fetchSuggestions(e.target.value);
              }}
              className="border-0 p-0 focus:ring-0 bg-transparent"
            />
          </div>
          
          {showSuggestions === 'destination' && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((location) => (
                <button
                  key={location.id}
                  type="button" 
                  onClick={() => handleLocationSelect(location, 'destination')}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-gray-600">{location.address}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-600" />
            <select 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-0 bg-transparent focus:outline-none w-full"
            >
              <option>Today</option>
              <option>Tomorrow</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border-0 bg-transparent focus:outline-none w-full"
            >
              <option>Now</option>
              <option>In 15 min</option>
              <option>In 30 min</option>
              <option>In 1 hour</option>
            </select>
          </div>
        </div>

        <Button 
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 py-3 rounded-lg font-medium transition-colors"
          disabled={!pickup || !destination}
        >
          See prices
        </Button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <a href="#" className="hover:underline">Log in to see your recent activity</a>
      </div>
    </div>
  );
};

export default BookingForm;