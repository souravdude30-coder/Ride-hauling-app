import React, { useState, useEffect } from 'react';
import { Bus, Users, DollarSign, TrendingUp, Calendar, Clock, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Dashboard = ({ user, getAuthHeaders }) => {
  const [stats, setStats] = useState({
    totalEmployees: 450,
    activeShuttles: 12,
    todayBookings: 234,
    monthlySpend: 125000
  });

  const [shuttles, setShuttles] = useState([
    { id: 1, route: 'Gurgaon - Office', status: 'in_transit', passengers: 32, capacity: 45, eta: 15 },
    { id: 2, route: 'Noida - Office', status: 'boarding', passengers: 18, capacity: 45, eta: 5 },
    { id: 3, route: 'Delhi - Office', status: 'in_transit', passengers: 40, capacity: 45, eta: 25 },
  ]);

  const [recentBookings, setRecentBookings] = useState([
    { id: 1, employee: 'Rahul Sharma', route: 'Gurgaon - Office', time: '08:30 AM', status: 'confirmed' },
    { id: 2, employee: 'Priya Singh', route: 'Noida - Office', time: '08:15 AM', status: 'in_transit' },
    { id: 3, employee: 'Amit Kumar', route: 'Delhi - Office', time: '08:00 AM', status: 'completed' },
    { id: 4, employee: 'Neha Gupta', route: 'Gurgaon - Office', time: '08:30 AM', status: 'confirmed' },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_transit': return <Badge className="bg-blue-100 text-blue-700">In Transit</Badge>;
      case 'boarding': return <Badge className="bg-yellow-100 text-yellow-700">Boarding</Badge>;
      case 'confirmed': return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>;
      case 'completed': return <Badge className="bg-gray-100 text-gray-700">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12 this month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Shuttles</p>
                <p className="text-3xl font-bold">{stats.activeShuttles}</p>
                <p className="text-xs text-gray-500">Across 5 routes</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Bookings</p>
                <p className="text-3xl font-bold">{stats.todayBookings}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" /> +8% vs yesterday
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Spend</p>
                <p className="text-3xl font-bold">₹{(stats.monthlySpend / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500">Budget: ₹150K</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shuttle Status & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Shuttles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bus className="w-5 h-5 mr-2 text-green-600" />
              Active Shuttles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shuttles.map((shuttle) => (
                <div key={shuttle.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{shuttle.route}</h4>
                    {getStatusBadge(shuttle.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {shuttle.passengers}/{shuttle.capacity}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      ETA: {shuttle.eta} min
                    </span>
                  </div>
                  <Progress value={(shuttle.passengers / shuttle.capacity) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      {booking.employee[0]}
                    </div>
                    <div>
                      <p className="font-medium">{booking.employee}</p>
                      <p className="text-sm text-gray-500">{booking.route}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(booking.status)}
                    <p className="text-xs text-gray-500 mt-1">{booking.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700">All shuttles on time</span>
              </div>
              <p className="text-sm text-green-600 mt-1">No delays reported today</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-700">High demand alert</span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">Gurgaon route near capacity</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-700">Scheduled maintenance</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">Bus #12 on Sunday</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
