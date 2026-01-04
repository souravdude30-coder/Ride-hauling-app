import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, MessageSquare, Clock, DollarSign, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ActiveRide = ({ ride, driver, onComplete }) => {
  const [rideStatus, setRideStatus] = useState('picking_up'); // picking_up, in_progress, completing
  const [otp, setOtp] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <p className="text-gray-500">No active ride</p>
            <a href="/" className="text-blue-600 hover:underline text-sm mt-2 block">Return to Dashboard</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleVerifyOTP = async () => {
    setVerifying(true);
    setVerificationError('');
    
    try {
      const token = localStorage.getItem('driver_token');
      const response = await fetch(`${BACKEND_URL}/api/bookings/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: ride.id,
          otp: otp
        })
      });

      if (response.ok) {
        setRideStatus('in_progress');
        setOtp('');
      } else {
        const error = await response.json();
        setVerificationError(error.detail || 'Invalid OTP');
      }
    } catch (error) {
      setVerificationError('Network error');
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteRide = async () => {
    try {
      const token = localStorage.getItem('driver_token');
      const response = await fetch(`${BACKEND_URL}/api/bookings/${ride.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing ride:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className={`text-white rounded-t-lg ${
          rideStatus === 'picking_up' ? 'bg-yellow-600' :
          rideStatus === 'in_progress' ? 'bg-green-600' : 'bg-blue-600'
        }`}>
          <div className="flex justify-between items-center">
            <CardTitle>Active Ride</CardTitle>
            <Badge variant="secondary">
              {rideStatus === 'picking_up' ? 'Picking Up' :
               rideStatus === 'in_progress' ? 'In Progress' : 'Completing'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Passenger Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">{ride.user?.name || 'Passenger'}</p>
                <p className="text-sm text-gray-500">{ride.rideType || 'Standard'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="icon" variant="outline">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Route Info */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className={`w-3 h-3 rounded-full ${rideStatus === 'picking_up' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Pickup</p>
                <p className="font-medium">{ride.pickup?.address || ride.pickup_location || 'Pickup location'}</p>
              </div>
              {rideStatus === 'picking_up' && (
                <Button size="sm" variant="outline">
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-6"></div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className={`w-3 h-3 rounded-full ${rideStatus === 'in_progress' ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Drop-off</p>
                <p className="font-medium">{ride.destination?.address || ride.dropoff_location || 'Destination'}</p>
              </div>
              {rideStatus === 'in_progress' && (
                <Button size="sm" variant="outline">
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Fare Info */}
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">Estimated Fare</span>
            </div>
            <span className="text-xl font-bold text-green-600">₹{ride.fare || ride.estimated_fare || '0'}</span>
          </div>

          {/* OTP Verification (when picking up) */}
          {rideStatus === 'picking_up' && (
            <div className="space-y-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">Enter passenger OTP to start ride</p>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="flex-1"
                />
                <Button 
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || verifying}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {verifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
              {verificationError && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {verificationError}
                </p>
              )}
            </div>
          )}

          {/* Complete Ride Button */}
          {rideStatus === 'in_progress' && (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleCompleteRide}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Ride
            </Button>
          )}

          {/* Back to Dashboard */}
          <a href="/" className="block text-center text-sm text-gray-500 hover:text-gray-700">
            Back to Dashboard
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveRide;
