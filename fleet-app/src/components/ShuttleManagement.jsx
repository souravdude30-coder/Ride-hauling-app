import React, { useState } from 'react';
import { Search, Plus, Bus, MapPin, Clock, Users, Route, Play, Pause, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const ShuttleManagement = ({ getAuthHeaders }) => {
  const [shuttles, setShuttles] = useState([
    { id: 1, route: 'Gurgaon - Delhi', busNumber: 'HR26AB1234', driver: 'Suresh Kumar', status: 'in_transit', passengers: 32, capacity: 45, nextStop: 'Cyber Hub', eta: 8, stops: ['DLF Phase 3', 'Cyber Hub', 'MG Road', 'Connaught Place'] },
    { id: 2, route: 'Noida - CP Route', busNumber: 'UP14CD5678', driver: 'Ramesh Singh', status: 'boarding', passengers: 18, capacity: 45, nextStop: 'Sector 18', eta: 2, stops: ['Sector 62', 'Sector 18', 'Botanical Garden', 'Rajiv Chowk'] },
    { id: 3, route: 'Faridabad - Nehru Place', busNumber: 'HR55EF9012', driver: 'Mohan Lal', status: 'idle', passengers: 0, capacity: 40, nextStop: 'Starting Point', eta: 15, stops: ['NIT Faridabad', 'Badarpur', 'Nehru Place', 'Central Secretariat'] },
    { id: 4, route: 'Greater Noida - Delhi', busNumber: 'UP16GH3456', driver: 'Ajay Verma', status: 'in_transit', passengers: 38, capacity: 45, nextStop: 'Pari Chowk', eta: 12, stops: ['Alpha 1', 'Pari Chowk', 'Botanical Garden', 'Mandi House'] },
  ]);

  const [routes, setRoutes] = useState([
    { id: 1, name: 'Gurgaon - Delhi Express', distance: 32, duration: 75, stops: 4, activeShuttles: 3, dailyPassengers: 450 },
    { id: 2, name: 'Noida - Central Delhi', distance: 28, duration: 65, stops: 4, activeShuttles: 2, dailyPassengers: 320 },
    { id: 3, name: 'Faridabad Corporate', distance: 25, duration: 55, stops: 4, activeShuttles: 1, dailyPassengers: 180 },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_transit': return <Badge className="bg-green-100 text-green-700"><Play className="w-3 h-3 mr-1" />In Transit</Badge>;
      case 'boarding': return <Badge className="bg-blue-100 text-blue-700"><Users className="w-3 h-3 mr-1" />Boarding</Badge>;
      case 'idle': return <Badge className="bg-gray-100 text-gray-700"><Pause className="w-3 h-3 mr-1" />Idle</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shuttle Management</h1>
          <p className="text-gray-500">Monitor and manage shuttle services</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <Route className="w-4 h-4 mr-2" />
            Manage Routes
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Shuttle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Shuttles</p>
                <p className="text-2xl font-bold">{shuttles.length}</p>
              </div>
              <Bus className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Routes</p>
                <p className="text-2xl font-bold">{routes.length}</p>
              </div>
              <Route className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Transit</p>
                <p className="text-2xl font-bold">{shuttles.filter(s => s.status === 'in_transit').length}</p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Passengers</p>
                <p className="text-2xl font-bold">{shuttles.reduce((acc, s) => acc + s.passengers, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Shuttles */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shuttles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shuttles.map((shuttle) => (
              <div key={shuttle.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bus className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{shuttle.route}</h3>
                      <p className="text-sm text-gray-500">{shuttle.busNumber} • {shuttle.driver}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(shuttle.status)}
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Next Stop</p>
                    <p className="font-medium flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-red-500" />
                      {shuttle.nextStop}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ETA</p>
                    <p className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-blue-500" />
                      {shuttle.eta} min
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Occupancy</p>
                    <p className="font-medium">{shuttle.passengers}/{shuttle.capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fill Rate</p>
                    <Progress value={(shuttle.passengers / shuttle.capacity) * 100} className="h-2 mt-1" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  {shuttle.stops.map((stop, index) => (
                    <React.Fragment key={stop}>
                      <span className={`px-2 py-1 rounded ${
                        stop === shuttle.nextStop ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-500'
                      }`}>
                        {stop}
                      </span>
                      {index < shuttle.stops.length - 1 && (
                        <span className="text-gray-300">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Routes Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Routes Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {routes.map((route) => (
              <div key={route.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{route.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Distance</p>
                    <p className="font-medium">{route.distance} km</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium">{route.duration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Active Shuttles</p>
                    <p className="font-medium">{route.activeShuttles}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Daily Passengers</p>
                    <p className="font-medium">{route.dailyPassengers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShuttleManagement;
