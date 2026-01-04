import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';
import FleetOverview from './components/FleetOverview';
import AuditLogs from './components/AuditLogs';
import SystemSettings from './components/SystemSettings';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './hooks/useAuth';
import { Shield, LayoutDashboard, Users, Building2, Truck, FileText, Settings, LogOut, Bell } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Sidebar = ({ user, logout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'User Management' },
    { path: '/companies', icon: Building2, label: 'Companies' },
    { path: '/fleet', icon: Truck, label: 'Fleet Overview' },
    { path: '/audit', icon: FileText, label: 'Audit Logs' },
    { path: '/settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Master Admin</h1>
            <p className="text-xs text-gray-400">System Control Panel</p>
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
                ? 'bg-blue-600 border-l-4 border-blue-300'
                : 'hover:bg-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* System Status Card */}
      <div className="mx-4 mb-4 p-4 bg-gray-700/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">System Status</div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm">All Systems Operational</span>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-gray-400">{user?.role}</div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
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
        <p className="text-sm text-gray-500">Full system control and administration</p>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-red-500">
            5
          </Badge>
        </Button>
        <Badge className="bg-blue-100 text-blue-700">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Master Admin...</p>
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
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-xl font-bold mb-2">Access Denied</div>
          <p className="text-gray-600 mb-4">You don't have permission to access Master Admin Portal</p>
          <p className="text-sm text-gray-500 mb-4">Current role: {user.role}</p>
          <Button onClick={logout} className="bg-blue-600 hover:bg-blue-700">
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
                <Route path="/users" element={<UserManagement user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/companies" element={<CompanyManagement user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/fleet" element={<FleetOverview user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/audit" element={<AuditLogs user={user} getAuthHeaders={getAuthHeaders} />} />
                <Route path="/settings" element={<SystemSettings user={user} getAuthHeaders={getAuthHeaders} />} />
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
