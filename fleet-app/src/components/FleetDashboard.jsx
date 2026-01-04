import React, { useState, useEffect } from 'react';
import { Car, Users, DollarSign, TrendingUp, AlertTriangle, Clock, MapPin, Bus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FleetDashboard = ({ user, getAuthHeaders }) => {
  const [stats, setStats] = useState({
    totalVehicles: 156,
    activeVehicles: 124,
    totalDrivers: 245,
    onlineDrivers: 189,
    activeRides: 78,
    todayRevenue: 125450,
    shuttleRoutes: 12,
    activeShuttles: 8
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'ride_completed', driver: 'Rajesh Kumar', amount: 450, time: '2 min ago' },
    { id: 2, type: 'driver_online', driver: 'Amit Singh', time: '5 min ago' },
    { id: 3, type: 'maintenance', vehicle: 'DL1C AB1234', time: '10 min ago' },
    { id: 4, type: 'ride_started', driver: 'Priya Sharma', time: '12 min ago' },
    { id: 5, type: 'shuttle_arrived', route: 'Gurgaon-Delhi', time: '15 min ago' },
  ]);

  const [topDrivers, setTopDrivers] = useState([
    { id: 1, name: 'Rajesh Kumar', rides: 15, earnings: 2450, rating: 4.9 },
    { id: 2, name: 'Amit Singh', rides: 13, earnings: 2180, rating: 4.8 },
    { id: 3, name: 'Priya Sharma', rides: 12, earnings: 1950, rating: 4.9 },
    { id: 4, name: 'Vikram Patel', rides: 11, earnings: 1820, rating: 4.7 },
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Manager'}!</h1>
          <p className="text-gray-500">Here's what's happening with your fleet today.</p>
        </div>
        <Badge className="bg-green-100 text-green-700">
          All Systems Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Vehicles</p>
                <p className="text-3xl font-bold">{stats.activeVehicles}</p>
                <p className="text-xs text-gray-400">of {stats.totalVehicles} total</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress value={(stats.activeVehicles / stats.totalVehicles) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Online Drivers</p>
                <p className="text-3xl font-bold">{stats.onlineDrivers}</p>
                <p className="text-xs text-gray-400">of {stats.totalDrivers} total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={(stats.onlineDrivers / stats.totalDrivers) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Rides</p>
                <p className="text-3xl font-bold">{stats.activeRides}</p>
                <p className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12% from yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Revenue</p>
                <p className="text-3xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +8% from yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shuttle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bus className="w-5 h-5 mr-2 text-purple-600" />
              Shuttle Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.activeShuttles}</p>
                <p className="text-sm text-gray-500">Active Shuttles</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.shuttleRoutes}</p>
                <p className="text-sm text-gray-500">Total Routes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">2 vehicles need maintenance</span>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">5 drivers with low ratings</span>
                </div>
                <Badge variant="outline">Review</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Top Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'ride_completed' ? 'bg-green-100' :
                      activity.type === 'driver_online' ? 'bg-blue-100' :
                      activity.type === 'maintenance' ? 'bg-red-100' :
                      activity.type === 'shuttle_arrived' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {activity.type === 'ride_completed' && <DollarSign className="w-5 h-5 text-green-600" />}
                      {activity.type === 'driver_online' && <Users className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'maintenance' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                      {activity.type === 'ride_started' && <Car className="w-5 h-5 text-gray-600" />}
                      {activity.type === 'shuttle_arrived' && <Bus className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.driver || activity.vehicle || activity.route}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.type.replace('_', ' ')}
                        {activity.amount && ` - ₹${activity.amount}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Drivers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDrivers.map((driver, index) => (
                <div key={driver.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-xs text-gray-500">{driver.rides} rides • ★ {driver.rating}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">₹{driver.earnings}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetDashboard;
