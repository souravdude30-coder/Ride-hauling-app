import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DriverLogin from './components/DriverLogin';
import DriverDashboard from './components/DriverDashboard';
import RideRequest from './components/RideRequest';
import ActiveRide from './components/ActiveRide';
import DriverProfile from './components/DriverProfile';
import Earnings from './components/Earnings';
import { Toaster } from './components/ui/toaster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

function App() {
  const [driverData, setDriverData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);

  // Simulate location tracking
  useEffect(() => {
    if (navigator.geolocation && driverData) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            heading: position.coords.heading
          };
          setCurrentLocation(newLocation);
          
          // Update location on server
          if (isOnline) {
            updateLocationOnServer(newLocation);
          }
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [driverData, isOnline]);

  const updateLocationOnServer = async (location) => {
    try {
      await fetch(`${API}/drivers/${driverData.id}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleLogin = (driver) => {
    setDriverData(driver);
    localStorage.setItem('driverData', JSON.stringify(driver));
  };

  const handleLogout = () => {
    setDriverData(null);
    setIsOnline(false);
    localStorage.removeItem('driverData');
  };

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    try {
      await fetch(`${API}/drivers/${driverData.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  // Check for stored driver data on app load
  useEffect(() => {
    const stored = localStorage.getItem('driverData');
    if (stored) {
      setDriverData(JSON.parse(stored));
    }
  }, []);

  if (!driverData) {
    return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<DriverLogin onLogin={handleLogin} />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <DriverDashboard 
                driver={driverData}
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
                onAccept={() => setActiveRide(rideRequest)}
                onDecline={() => setRideRequest(null)}
              />
            } 
          />
          <Route 
            path="/active-ride" 
            element={
              <ActiveRide 
                ride={activeRide}
                driver={driverData}
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
                driver={driverData}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/earnings" 
            element={<Earnings driver={driverData} />} 
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;