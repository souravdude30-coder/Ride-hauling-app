import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FleetDashboard from './components/FleetDashboard';
import DriversManagement from './components/DriversManagement';
import RidesMonitoring from './components/RidesMonitoring';
import ShuttleManagement from './components/ShuttleManagement';
import Analytics from './components/Analytics';
import FleetHeader from './components/FleetHeader';
import { Toaster } from './components/ui/toaster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

function App() {
  const [fleetData, setFleetData] = useState({
    totalDrivers: 0,
    onlineDrivers: 0,
    activeRides: 0,
    totalRevenue: 0,
    shuttleRoutes: 0,
    activeShuttles: 0
  });

  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [shuttles, setShuttles] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFleetData = async () => {
    try {
      // Simulate API calls - in production, these would be real API endpoints
      setFleetData({
        totalDrivers: 245,
        onlineDrivers: 156,
        activeRides: 78,
        totalRevenue: 12450.75,
        shuttleRoutes: 8,
        activeShuttles: 24
      });

      // Mock drivers data
      setDrivers([
        {
          id: 'driver_1',
          name: 'John Smith',
          status: 'online',
          currentRide: 'ride_123',
          location: { lat: 37.7749, lon: -122.4194 },
          rating: 4.8,
          todayEarnings: 185.50,
          todayRides: 8
        },
        {
          id: 'driver_2',
          name: 'Maria Garcia',
          status: 'busy',
          currentRide: 'ride_124',
          location: { lat: 37.7849, lon: -122.4094 },
          rating: 4.9,
          todayEarnings: 210.25,
          todayRides: 9
        },
        {
          id: 'driver_3',
          name: 'David Chen',
          status: 'offline',
          currentRide: null,
          location: null,
          rating: 4.7,
          todayEarnings: 0,
          todayRides: 0
        }
      ]);

      // Mock rides data
      setRides([
        {
          id: 'ride_123',
          driver: 'John Smith',
          user: 'Alice Johnson',
          status: 'in_progress',
          pickup: 'Downtown Plaza',
          destination: 'Airport Terminal 1',
          fare: 24.50,
          startTime: new Date(Date.now() - 1200000), // 20 minutes ago
          estimatedEnd: new Date(Date.now() + 900000) // 15 minutes from now
        },
        {
          id: 'ride_124',
          driver: 'Maria Garcia',
          user: 'Bob Wilson',
          status: 'driver_arriving',
          pickup: 'Union Square',
          destination: 'Golden Gate Bridge',
          fare: 18.75,
          startTime: new Date(Date.now() - 300000), // 5 minutes ago
          estimatedEnd: new Date(Date.now() + 1800000) // 30 minutes from now
        }
      ]);

      // Mock shuttle data
      setShuttles([
        {
          id: 'shuttle_1',
          route: 'Gurgaon - Delhi Route',
          busNumber: 'HR26AB1234',
          driver: 'Rajesh Kumar',
          status: 'in_transit',
          passengers: 32,
          capacity: 45,
          nextStop: 'Cyber Hub',
          eta: 8
        },
        {
          id: 'shuttle_2', 
          route: 'Noida - CP Route',
          busNumber: 'UP14CD5678',
          driver: 'Amit Singh',
          status: 'boarding',
          passengers: 18,
          capacity: 45,
          nextStop: 'Sector 18 Metro',
          eta: 2
        }
      ]);

      // Mock vehicles data
      setVehicles([
        {
          id: 'vehicle_1',
          licensePlate: 'DL1C AB1234',
          model: 'Maruti Dzire',
          status: 'active',
          driverId: 'driver_1',
          currentLocation: { lat: 37.7749, lon: -122.4194 }
        },
        {
          id: 'vehicle_2',
          licensePlate: 'HR26 CD5678',
          model: 'Hyundai Creta',
          status: 'maintenance',
          driverId: null,
          currentLocation: null
        },
        {
          id: 'vehicle_3',
          licensePlate: 'UP16 EF9012',
          model: 'Toyota Innova',
          status: 'active',
          driverId: 'driver_2',
          currentLocation: { lat: 37.7849, lon: -122.4094 }
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch fleet data:', error);
    }
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <BrowserRouter>
        <FleetHeader fleetData={fleetData} />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route 
              path="/" 
              element={
                <FleetDashboard 
                  fleetData={fleetData}
                  drivers={drivers}
                  rides={rides}
                  shuttles={shuttles}
                  vehicles={vehicles}
                />
              } 
            />
            <Route 
              path="/drivers" 
              element={<DriversManagement drivers={drivers} />} 
            />
            <Route 
              path="/rides" 
              element={<RidesMonitoring rides={rides} />} 
            />
            <Route 
              path="/shuttles" 
              element={<ShuttleManagement shuttles={shuttles} />} 
            />
            <Route 
              path="/analytics" 
              element={<Analytics fleetData={fleetData} />} 
            />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;