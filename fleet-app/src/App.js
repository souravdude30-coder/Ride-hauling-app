import React, { useState, useEffect } from 'react';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FleetLogin from './components/FleetLogin';
import FleetHeader from './components/FleetHeader';
import FleetDashboard from './components/FleetDashboard';
import DriversManagement from './components/DriversManagement';
import VehiclesManagement from './components/VehiclesManagement';
import ShuttleManagement from './components/ShuttleManagement';
import Analytics from './components/Analytics';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const { user, login, logout, loading, getAuthHeaders } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Fleet Manager...</p>
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
            <Route path="*" element={<FleetLogin onLogin={login} />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    );
  }

  // Check if user has fleet_manager role
  if (user.role !== 'fleet_manager' && user.role !== 'master_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-xl font-bold mb-2">Access Denied</div>
          <p className="text-gray-600 mb-4">You don't have fleet manager permissions to access this app.</p>
          <p className="text-sm text-gray-500 mb-4">Current role: {user.role}</p>
          <button 
            onClick={logout}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Logged in as fleet manager - show app
  return (
    <div className="App min-h-screen bg-gray-50">
      <BrowserRouter>
        <FleetHeader user={user} onLogout={logout} />
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={<FleetDashboard user={user} getAuthHeaders={getAuthHeaders} />} />
            <Route path="/drivers" element={<DriversManagement getAuthHeaders={getAuthHeaders} />} />
            <Route path="/vehicles" element={<VehiclesManagement getAuthHeaders={getAuthHeaders} />} />
            <Route path="/shuttles" element={<ShuttleManagement getAuthHeaders={getAuthHeaders} />} />
            <Route path="/analytics" element={<Analytics getAuthHeaders={getAuthHeaders} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
