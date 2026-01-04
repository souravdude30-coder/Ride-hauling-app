import React, { useState, useEffect } from 'react';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DriverLogin from './components/DriverLogin';
import DriverDashboard from './components/DriverDashboard';
import RideRequest from './components/RideRequest';
import ActiveRide from './components/ActiveRide';
import DriverProfile from './components/DriverProfile';
import Earnings from './components/Earnings';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

function App() {
  const { user, login, logout, loading, getAuthHeaders } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);

  // Simulate location tracking when user is logged in
  useEffect(() => {
    if (navigator.geolocation && user) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            heading: position.coords.heading
          };
          setCurrentLocation(newLocation);
          
          // Update location on server if online
          if (isOnline) {
            updateLocationOnServer(newLocation);
          }
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user, isOnline]);

  const updateLocationOnServer = async (location) => {
    try {
      await fetch(`${API}/drivers/${user.id}/location`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(location)
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    try {
      await fetch(`${API}/drivers/${user.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          is_online: newStatus,
          is_available: newStatus,
          status: newStatus ? 'online' : 'offline'
        })
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Driver App...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login
  if (!user) {
    return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<DriverLogin onLogin={login} />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    );
  }

  // Check if user has driver role
  if (user.role !== 'driver') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-xl font-bold mb-2">Access Denied</div>
          <p className="text-gray-600 mb-4">You don't have driver permissions to access this app.</p>
          <p className="text-sm text-gray-500 mb-4">Current role: {user.role}</p>
          <button 
            onClick={logout}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Logged in as driver - show app
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <DriverDashboard 
                driver={user}
                isOnline={isOnline}
                onToggleOnline={toggleOnlineStatus}
                currentLocation={currentLocation}
                activeRide={activeRide}
                rideRequest={rideRequest}
              />
            } 
          />
          <Route 
            path="/ride-request" 
            element={
              <RideRequest 
                request={rideRequest}
                onAccept={() => {
                  setActiveRide(rideRequest);
                  setRideRequest(null);
                }}
                onDecline={() => setRideRequest(null)}
              />
            } 
          />
          <Route 
            path="/active-ride" 
            element={
              <ActiveRide 
                ride={activeRide}
                driver={user}
                onComplete={() => {
                  setActiveRide(null);
                  setRideRequest(null);
                }}
              />
            } 
          />
          <Route 
            path="/profile" 
            element={
              <DriverProfile 
                driver={user}
                onLogout={logout}
              />
            } 
          />
          <Route 
            path="/earnings" 
            element={<Earnings driver={user} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
