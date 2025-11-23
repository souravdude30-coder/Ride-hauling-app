import React, { useState } from 'react';
import { ChevronLeft, MapPin, Calendar, Clock, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

const ReserveRide = ({ onBack }) => {
  const [reserveDetails, setReserveDetails] = useState({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    rideType: 'uberx'
  });

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  const timeSlots = [
    '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM',
    '9:30 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'
  ];

  const handleReserve = () => {
    if (reserveDetails.pickup && reserveDetails.destination && reserveDetails.date && reserveDetails.time) {
      alert(`Ride reserved!\nFrom: ${reserveDetails.pickup}\nTo: ${reserveDetails.destination}\nDate: ${reserveDetails.date}\nTime: ${reserveDetails.time}`);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold">Reserve a Ride</h2>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <h3 className="font-semibold text-blue-900 mb-2">🕒 Reserve in Advance</h3>
        <p className="text-blue-800 text-sm">Book your ride up to 7 days in advance. Perfect for airport trips, important meetings, or planned outings.</p>
      </div>

      <div className="space-y-6">
        {/* Location Inputs */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-600" />
            <Input
              placeholder="Pickup location"
              value={reserveDetails.pickup}
              onChange={(e) => setReserveDetails({...reserveDetails, pickup: e.target.value})}
              className="border-0 p-0 focus:ring-0 bg-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <Input
              placeholder="Destination"
              value={reserveDetails.destination}
              onChange={(e) => setReserveDetails({...reserveDetails, destination: e.target.value})}
              className="border-0 p-0 focus:ring-0 bg-transparent"
            />
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Select Date
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getNextDays().map((day) => (
              <button
                key={day.date}
                onClick={() => setReserveDetails({...reserveDetails, date: day.date})}
                className={`p-3 text-sm rounded-lg border-2 transition-all ${
                  reserveDetails.date === day.date
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Select Time
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setReserveDetails({...reserveDetails, time})}
                className={`p-2 text-sm rounded-lg border-2 transition-all ${
                  reserveDetails.time === time
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Ride Type Selection */}
        <div>
          <h3 className="font-semibold mb-3">Choose Ride Type</h3>
          <div className="space-y-3">
            {[
              { id: 'uberx', name: 'UberX', price: '$25-35', desc: 'Affordable rides' },
              { id: 'comfort', name: 'Comfort', price: '$30-40', desc: 'Extra legroom' },
              { id: 'xl', name: 'UberXL', price: '$35-50', desc: '6 seats' }
            ].map((type) => (
              <Card 
                key={type.id}
                className={`p-4 cursor-pointer transition-all ${
                  reserveDetails.rideType === type.id ? 'border-2 border-blue-500 bg-blue-50' : 'border hover:shadow-md'
                }`}
                onClick={() => setReserveDetails({...reserveDetails, rideType: type.id})}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{type.name}</h4>
                    <p className="text-sm text-gray-600">{type.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{type.price}</div>
                    <div className="text-xs text-gray-500">estimated</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Reserve Button */}
        <Button 
          onClick={handleReserve}
          disabled={!reserveDetails.pickup || !reserveDetails.destination || !reserveDetails.date || !reserveDetails.time}
          className="w-full bg-black text-white hover:bg-gray-800 py-3"
        >
          Reserve Ride
        </Button>

        {/* Benefits */}
        <Card className="p-4 bg-green-50 border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">✅ Reserve Benefits</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Guaranteed pickup at your scheduled time</li>
            <li>• No surge pricing - locked-in rates</li>
            <li>• Driver assigned 30 minutes before pickup</li>
            <li>• Free cancellation up to 1 hour before</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ReserveRide;