import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, LayoutDashboard, Users, Car, Bus, BarChart3, Bell, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const FleetHeader = ({ user, onLogout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/drivers', icon: Users, label: 'Drivers' },
    { path: '/vehicles', icon: Car, label: 'Vehicles' },
    { path: '/shuttles', icon: Bus, label: 'Shuttles' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Fleet Manager</h1>
              <p className="text-xs text-gray-500">Control Center</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user?.name || 'Fleet Manager'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'fleet_manager'}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">
                  {user?.name?.[0] || 'F'}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FleetHeader;
