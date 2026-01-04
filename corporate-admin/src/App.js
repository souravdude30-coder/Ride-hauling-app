import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
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
import { Building2, LayoutDashboard, Bus, Users, Route as RouteIcon, Shield, BarChart3, Package, LogOut, Bell } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Sidebar = ({ user, logout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/shuttles', icon: Bus, label: 'Shuttle Management' },
    { path: '/employees', icon: Users, label: 'Employee Management' },
    { path: '/routes', icon: RouteIcon, label: 'Route Management' },
    { path: '/safety', icon: Shield, label: 'Safety Center' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/bulk-booking', icon: Package, label: 'Bulk Booking' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-green-800 to-green-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Corporate Shuttle</h1>
            <p className="text-xs text-green-300">{user?.company_name || 'Admin Panel'}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-6 py-3 transition-colors ${
              location.pathname === item.path
                ? 'bg-green-700 border-l-4 border-green-300'
                : 'hover:bg-green-700/50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Company Info Card */}
      <div className="mx-4 mb-4 p-4 bg-green-700/50 rounded-lg">
        <div className="text-xs text-green-300 mb-1">Company</div>
        <div className="font-semibold">{user?.company_name || 'Tech Corp'}</div>
        <div className="text-xs text-green-300 mt-2">
          {user?.permissions?.length || 0} permissions
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-green-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-green-300">{user?.role}</div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-green-300 hover:text-white hover:bg-green-700"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Header = ({ user }) => {
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</h2>
        <p className="text-sm text-gray-500">Manage your corporate shuttle operations</p>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-red-500">
            3
          </Badge>
        </Button>
        <Badge className="bg-green-100 text-green-700">
          {user?.role?.replace('_', ' ')}
        </Badge>
      </div>
    </header>
  );
};

function App() {
  const { user, login, logout, loading, getAuthHeaders } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Corporate Admin...</p>
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

  // Check if user is corporate admin or fleet manager
  if (!['corporate_admin', 'fleet_manager'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-xl font-bold mb-2">Access Denied</div>
          <p className="text-gray-600 mb-4">You don't have permission to access Corporate Admin Portal</p>
          <p className="text-sm text-gray-500 mb-4">Current role: {user.role}</p>
          <Button onClick={logout} className="bg-green-600 hover:bg-green-700">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BrowserRouter>
        <div className="flex">
          <Sidebar user={user} logout={logout} />
          <div className="flex-1 flex flex-col">
            <Header user={user} />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/shuttles" element={<ShuttleManagement user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/employees" element={<EmployeeManagement user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/routes" element={<RouteManagement user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/safety" element={<SafetyCenter user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/analytics" element={<Analytics user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/bulk-booking" element={<BulkBooking user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
