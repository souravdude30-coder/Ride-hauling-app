import React, { useState, useEffect } from 'react';
import { Users, Building2, Truck, DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Shield, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Dashboard = ({ user, getAuthHeaders }) => {
  const [stats, setStats] = useState({
    totalUsers: 15420,
    totalCompanies: 124,
    totalVehicles: 856,
    totalRevenue: 2450000,
    activeRides: 342,
    onlineDrivers: 567
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'user_created', message: 'New user registered: john@company.com', time: '2 min ago' },
    { id: 2, type: 'company_created', message: 'New company onboarded: Tech Solutions Ltd', time: '15 min ago' },
    { id: 3, type: 'alert', message: 'High CPU usage detected on Server-2', time: '30 min ago' },
    { id: 4, type: 'payment', message: 'Payment of ₹25,000 processed for ABC Corp', time: '1 hour ago' },
    { id: 5, type: 'user_created', message: 'Driver approved: Rajesh Kumar', time: '2 hours ago' },
  ]);

  const [systemHealth, setSystemHealth] = useState([
    { name: 'API Server', status: 'healthy', uptime: '99.98%' },
    { name: 'Database', status: 'healthy', uptime: '99.99%' },
    { name: 'Payment Gateway', status: 'healthy', uptime: '99.95%' },
    { name: 'Notification Service', status: 'warning', uptime: '98.50%' },
  ]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_created': return <Users className="w-5 h-5 text-blue-600" />;
      case 'company_created': return <Building2 className="w-5 h-5 text-green-600" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'payment': return <DollarSign className="w-5 h-5 text-purple-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-green-500 flex items-center mt-2">
              <TrendingUp className="w-3 h-3 mr-1" /> +234 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Companies</p>
                <p className="text-2xl font-bold">{stats.totalCompanies}</p>
              </div>
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-green-500 flex items-center mt-2">
              <TrendingUp className="w-3 h-3 mr-1" /> +8 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Vehicles</p>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-green-500 flex items-center mt-2">
              <TrendingUp className="w-3 h-3 mr-1" /> +45 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Revenue (MTD)</p>
                <p className="text-2xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-xs text-green-500 flex items-center mt-2">
              <TrendingUp className="w-3 h-3 mr-1" /> +18% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active Rides</p>
                <p className="text-2xl font-bold">{stats.activeRides}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Live now</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Online Drivers</p>
                <p className="text-2xl font-bold">{stats.onlineDrivers}</p>
              </div>
              <Users className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Available now</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((system) => (
                <div key={system.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {system.status === 'healthy' ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                    <span className="font-medium">{system.name}</span>
                  </div>
                  <div className="text-right">
                    <Badge className={system.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {system.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">Uptime: {system.uptime}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Add User</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Add Company</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Add Vehicle</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="font-medium">View Alerts</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
