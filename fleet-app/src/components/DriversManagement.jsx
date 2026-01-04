import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Star, Phone, Mail, MapPin, Car } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const DriversManagement = ({ getAuthHeaders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [drivers, setDrivers] = useState([
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210', status: 'online', rating: 4.9, rides: 1234, vehicle: 'DL1C AB1234', earnings: 45600 },
    { id: 2, name: 'Amit Singh', email: 'amit@email.com', phone: '+91 98765 43211', status: 'busy', rating: 4.8, rides: 987, vehicle: 'DL1C CD5678', earnings: 38900 },
    { id: 3, name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43212', status: 'online', rating: 4.9, rides: 1567, vehicle: 'DL1C EF9012', earnings: 52300 },
    { id: 4, name: 'Vikram Patel', email: 'vikram@email.com', phone: '+91 98765 43213', status: 'offline', rating: 4.7, rides: 756, vehicle: 'DL1C GH3456', earnings: 28700 },
    { id: 5, name: 'Neha Gupta', email: 'neha@email.com', phone: '+91 98765 43214', status: 'online', rating: 4.8, rides: 1089, vehicle: 'DL1C IJ7890', earnings: 41200 },
  ]);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-yellow-100 text-yellow-700';
      case 'offline': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers Management</h1>
          <p className="text-gray-500">Manage and monitor all drivers in your fleet</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Enter driver name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="driver@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Number</Label>
                <Input placeholder="DL1C AB1234" />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Add Driver</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{drivers.length}</p>
            <p className="text-sm text-gray-500">Total Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{drivers.filter(d => d.status === 'online').length}</p>
            <p className="text-sm text-gray-500">Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{drivers.filter(d => d.status === 'busy').length}</p>
            <p className="text-sm text-gray-500">On Ride</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{drivers.filter(d => d.status === 'offline').length}</p>
            <p className="text-sm text-gray-500">Offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-lg">{driver.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{driver.name}</h3>
                    <Badge className={getStatusColor(driver.status)}>{driver.status}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  {driver.email}
                </div>
                <div className="flex items-center text-gray-500">
                  <Phone className="w-4 h-4 mr-2" />
                  {driver.phone}
                </div>
                <div className="flex items-center text-gray-500">
                  <Car className="w-4 h-4 mr-2" />
                  {driver.vehicle}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">{driver.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{driver.rides}</p>
                  <p className="text-xs text-gray-500">Rides</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">₹{(driver.earnings / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-gray-500">Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DriversManagement;
