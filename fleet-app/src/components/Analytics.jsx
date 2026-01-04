import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Car, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const Analytics = ({ getAuthHeaders }) => {
  const [period, setPeriod] = useState('week');

  const stats = {
    revenue: { value: 845000, change: 12.5, trend: 'up' },
    rides: { value: 3420, change: 8.2, trend: 'up' },
    avgRating: { value: 4.7, change: 0.1, trend: 'up' },
    avgWaitTime: { value: 4.2, change: -0.8, trend: 'down' },
  };

  const revenueByDay = [
    { day: 'Mon', revenue: 125000, rides: 480 },
    { day: 'Tue', revenue: 118000, rides: 456 },
    { day: 'Wed', revenue: 132000, rides: 512 },
    { day: 'Thu', revenue: 128000, rides: 498 },
    { day: 'Fri', revenue: 145000, rides: 562 },
    { day: 'Sat', revenue: 165000, rides: 634 },
    { day: 'Sun', revenue: 132000, rides: 478 },
  ];

  const topRoutes = [
    { route: 'Airport - City Center', rides: 456, revenue: 125000 },
    { route: 'Tech Park - Residential', rides: 389, revenue: 68000 },
    { route: 'Mall - Metro Station', rides: 312, revenue: 45000 },
    { route: 'Hospital - Main Market', rides: 278, revenue: 52000 },
  ];

  const vehicleUtilization = [
    { type: 'Sedan', total: 80, active: 68, utilization: 85 },
    { type: 'SUV', total: 45, active: 38, utilization: 84 },
    { type: 'Shuttle', total: 20, active: 18, utilization: 90 },
    { type: 'Premium', total: 15, active: 11, utilization: 73 },
  ];

  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Track your fleet performance metrics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">₹{(stats.revenue.value / 1000).toFixed(0)}K</p>
                <div className={`flex items-center text-sm ${
                  stats.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.revenue.trend === 'up' ? 
                    <TrendingUp className="w-4 h-4 mr-1" /> : 
                    <TrendingDown className="w-4 h-4 mr-1" />
                  }
                  {stats.revenue.change}% vs last {period}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rides</p>
                <p className="text-2xl font-bold">{stats.rides.value.toLocaleString()}</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stats.rides.change}% vs last {period}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating.value} ★</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{stats.avgRating.change} vs last {period}
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Wait Time</p>
                <p className="text-2xl font-bold">{stats.avgWaitTime.value} min</p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {stats.avgWaitTime.change} min vs last {period}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByDay.map((day) => (
                <div key={day.day} className="flex items-center space-x-4">
                  <span className="w-10 text-sm text-gray-500">{day.day}</span>
                  <div className="flex-1">
                    <div 
                      className="h-8 bg-purple-100 rounded-r-lg relative"
                      style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                    >
                      <div 
                        className="absolute inset-0 bg-purple-600 rounded-r-lg"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <span className="w-20 text-sm font-medium text-right">
                    ₹{(day.revenue / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicleUtilization.map((vehicle) => (
                <div key={vehicle.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{vehicle.type}</span>
                    <span className="text-sm text-gray-500">
                      {vehicle.active}/{vehicle.total} ({vehicle.utilization}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        vehicle.utilization >= 85 ? 'bg-green-500' :
                        vehicle.utilization >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${vehicle.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 font-medium text-gray-500">Route</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Rides</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Revenue</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">Avg/Ride</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.map((route, index) => (
                  <tr key={route.route} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium">{route.route}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">{route.rides}</td>
                    <td className="py-4 text-right font-medium text-green-600">
                      ₹{(route.revenue / 1000).toFixed(0)}K
                    </td>
                    <td className="py-4 text-right text-gray-500">
                      ₹{Math.round(route.revenue / route.rides)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
