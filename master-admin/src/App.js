import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';
import FleetOverview from './components/FleetOverview';
import AuditLogs from './components/AuditLogs';
import SystemSettings from './components/SystemSettings';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './hooks/useAuth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Master Admin Portal</div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
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

  // Check if user is master admin
  if (user.role !== 'master_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-xl font-bold mb-2">Access Denied</div>
          <div className="text-gray-600 mb-4">You don't have permission to access Master Admin Portal</div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
          <div className="w-64 bg-gray-900 text-white min-h-screen">
            <div className="p-6">
              <h1 className="text-xl font-bold">Master Admin</h1>
              <p className="text-gray-400 text-sm">System Control Panel</p>
            </div>
            
            <nav className="mt-6">
              <a href="/dashboard" className="block px-6 py-3 hover:bg-gray-800 border-l-4 border-blue-500">
                📊 Dashboard
              </a>
              <a href="/users" className="block px-6 py-3 hover:bg-gray-800">
                👥 User Management
              </a>
              <a href="/companies" className="block px-6 py-3 hover:bg-gray-800">
                🏢 Companies
              </a>
              <a href="/fleet" className="block px-6 py-3 hover:bg-gray-800">
                🚐 Fleet Overview
              </a>
              <a href="/audit" className="block px-6 py-3 hover:bg-gray-800">
                📋 Audit Logs
              </a>
              <a href="/settings" className="block px-6 py-3 hover:bg-gray-800">
                ⚙️ System Settings
              </a>
            </nav>

            <div className="absolute bottom-0 w-64 p-6 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  {user.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.role}</div>
                </div>
                <button 
                  onClick={logout}
                  className="text-gray-400 hover:text-white"
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
              <Route path="/users" element={<UserManagement user={user} />} />
              <Route path="/companies" element={<CompanyManagement user={user} />} />
              <Route path="/fleet" element={<FleetOverview user={user} />} />
              <Route path="/audit" element={<AuditLogs user={user} />} />
              <Route path="/settings" element={<SystemSettings user={user} />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;