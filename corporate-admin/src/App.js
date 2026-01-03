import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ShuttleManagement from './components/ShuttleManagement';
import EmployeeManagement from './components/EmployeeManagement';
import RouteManagement from './components/RouteManagement';
import SafetyCenter from './components/SafetyCenter';
import Analytics from './components/Analytics';
import BulkBooking from './components/BulkBooking';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Corporate Shuttle Admin</div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-700">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login onLogin={login} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    );
  }

  // Check if user is corporate admin
  if (!['corporate_admin', 'fleet_manager'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-xl font-bold mb-2">Access Denied</div>
          <div className="text-gray-600 mb-4">You don't have permission to access Corporate Admin Portal</div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BrowserRouter>
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-green-900 text-white min-h-screen">
            <div className="p-6">
              <h1 className="text-xl font-bold">Corporate Shuttle</h1>
              <p className="text-green-200 text-sm">{user.company_name || 'Admin Panel'}</p>
            </div>
            
            <nav className="mt-6">
              <a href="/dashboard" className="block px-6 py-3 hover:bg-green-800 border-l-4 border-green-400">
                📊 Dashboard
              </a>
              <a href="/shuttles" className="block px-6 py-3 hover:bg-green-800">
                🚌 Shuttle Management
              </a>
              <a href="/employees" className="block px-6 py-3 hover:bg-green-800">
                👥 Employee Management
              </a>
              <a href="/routes" className="block px-6 py-3 hover:bg-green-800">
                🗺️ Route Management
              </a>
              <a href="/safety" className="block px-6 py-3 hover:bg-green-800">
                🛡️ Safety Center
              </a>
              <a href="/analytics" className="block px-6 py-3 hover:bg-green-800">
                📈 Analytics
              </a>
              <a href="/bulk-booking" className="block px-6 py-3 hover:bg-green-800">
                📦 Bulk Booking
              </a>
            </nav>

            {/* Company Info */}
            <div className="mt-8 mx-6 p-4 bg-green-800 rounded-lg">
              <div className="text-sm text-green-200 mb-1">Company</div>
              <div className="font-semibold">{user.company_name || 'Tech Corp'}</div>
              <div className="text-xs text-green-200 mt-2">
                {user.permissions?.length || 0} permissions
              </div>
            </div>

            <div className="absolute bottom-0 w-64 p-6 border-t border-green-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  {user.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-green-200">{user.role}</div>
                </div>
                <button 
                  onClick={logout}
                  className="text-green-200 hover:text-white"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/shuttles" element={<ShuttleManagement user={user} />} />
              <Route path="/employees" element={<EmployeeManagement user={user} />} />
              <Route path="/routes" element={<RouteManagement user={user} />} />
              <Route path="/safety" element={<SafetyCenter user={user} />} />
              <Route path="/analytics" element={<Analytics user={user} />} />
              <Route path="/bulk-booking" element={<BulkBooking />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;