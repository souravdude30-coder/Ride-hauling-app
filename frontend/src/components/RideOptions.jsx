import React, { useState, useEffect } from 'react';
import { ChevronLeft, Users, Clock, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { mockRideTypes } from '../data/mock';
import MapView from './MapView';

const RideOptions = ({ bookingDetails, onSelectRide, onBack }) => {
  const [selectedRide, setSelectedRide] = useState(null);
  const [rideEstimates, setRideEstimates] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real ride estimates from backend
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/rides/estimate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pickup_address: bookingDetails.pickup,
            pickup_lat: 37.7749, // Mock coordinates - should come from geocoding
            pickup_lon: -122.4194,
            destination_address: bookingDetails.destination,
            destination_lat: 37.7849,
            destination_lon: -122.4094
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setRideEstimates(data.data.estimates);
          setRouteData(data.data.route);
        }
      } catch (error) {
        console.error('Failed to fetch estimates:', error);
        // Fallback to mock data
        setRideEstimates(mockRideTypes);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, [bookingDetails]);

  const handleRideSelect = (rideType) => {
    setSelectedRide(rideType);
    onSelectRide(rideType);
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold">Choose a ride</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Map */}
        <div>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">
              {bookingDetails.pickup} → {bookingDetails.destination}
            </div>
            <div className="text-xs text-gray-500">
              {bookingDetails.date} • {bookingDetails.time}
            </div>
            {routeData && (
              <div className="text-xs text-blue-600 mt-1">
                Distance: {routeData.distance_km} km • Duration: ~{routeData.duration_minutes} min
              </div>
            )}
          </div>
          
          <MapView
            pickup={{
              lat: 37.7749,
              lon: -122.4194, 
              address: bookingDetails.pickup
            }}
            destination={{
              lat: 37.7849,
              lon: -122.4094,
              address: bookingDetails.destination
            }}
            route={routeData}
            className="h-80 w-full rounded-lg border"
          />
        </div>

        {/* Ride Options */}
        <div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading ride options...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {(rideEstimates.length > 0 ? rideEstimates : mockRideTypes).map((rideType) => (
          <div 
            key={rideType.id}
            onClick={() => handleRideSelect(rideType)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
              selectedRide?.id === rideType.id 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{rideType.icon}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{rideType.name}</h3>
                    {rideType.savings && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        {rideType.savings}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center space-x-3">
                    <span>{rideType.description}</span>
                    {rideType.id === 'ubershare' && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        Shared
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {rideType.eta}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {rideType.capacity} seats
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">
                  ${rideType.estimated_fare || rideType.price}
                  {(rideType.surge || rideType.surge_multiplier > 1) && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {rideType.surge_multiplier || rideType.surgeMultiplier}x
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  ETA: {rideType.eta} min
                </div>
              </div>
            </div>
            
            {rideType.id === 'ubershare' && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                <div className="font-medium">🚐 Uber Share Info:</div>
                <div>Share your ride with other passengers going your way. Pickup spots may be a short walk from your location.</div>
              </div>
            )}
          </div>
        ))}
            </div>
          )}

          {selectedRide && (
            <Button 
              className="w-full mt-6 bg-black text-white hover:bg-gray-800 py-3"
              onClick={() => handleRideSelect(selectedRide)}
            >
              Confirm {selectedRide.name || selectedRide.ride_type}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideOptions;