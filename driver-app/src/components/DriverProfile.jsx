import React from 'react';
import { User, Mail, Phone, Car, Star, Shield, LogOut, ChevronRight, Settings, HelpCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const DriverProfile = ({ driver, onLogout }) => {
  const profileItems = [
    { icon: Car, label: 'Vehicle Details', description: driver?.vehicle?.model || 'Maruti Dzire' },
    { icon: FileText, label: 'Documents', description: 'All verified' },
    { icon: Settings, label: 'Settings', description: 'App preferences' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get assistance' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
            {driver?.name?.[0] || 'D'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{driver?.name || 'Driver'}</h1>
            <p className="text-blue-200">{driver?.email || 'driver@metrohail.com'}</p>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="font-semibold">{driver?.rating || '4.8'}</span>
              <span className="text-blue-200 ml-1">(1,234 rides)</span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-blue-700/50 rounded-lg">
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-xs text-blue-200">Total Rides</p>
          </div>
          <div className="text-center p-3 bg-blue-700/50 rounded-lg">
            <p className="text-2xl font-bold">98%</p>
            <p className="text-xs text-blue-200">Acceptance</p>
          </div>
          <div className="text-center p-3 bg-blue-700/50 rounded-lg">
            <p className="text-2xl font-bold">2yr</p>
            <p className="text-xs text-blue-200">Experience</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Verification Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Verified Driver</p>
                  <p className="text-sm text-gray-500">Background check passed</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Verified</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Role & Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Role</span>
              <Badge>{driver?.role || 'driver'}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {(driver?.permissions || ['ride:accept', 'ride:complete', 'earnings:view']).map((perm, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">{perm}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {profileItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                {index < profileItems.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full border-red-500 text-red-500 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex justify-around">
          <a href="/" className="flex flex-col items-center text-gray-500">
            <Car className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </a>
          <a href="/earnings" className="flex flex-col items-center text-gray-500">
            <span className="text-lg">💰</span>
            <span className="text-xs mt-1">Earnings</span>
          </a>
          <a href="/profile" className="flex flex-col items-center text-blue-600">
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
