import React, { useState } from 'react';
import { Search, Plus, Car, Wrench, AlertTriangle, CheckCircle, MoreVertical, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const VehiclesManagement = ({ getAuthHeaders }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [vehicles, setVehicles] = useState([
    { id: 1, number: 'DL1C AB1234', model: 'Maruti Dzire', type: 'sedan', status: 'active', driver: 'Rajesh Kumar', lastService: '2024-01-15', nextService: '2024-04-15', km: 45600 },
    { id: 2, number: 'DL1C CD5678', model: 'Hyundai Creta', type: 'suv', status: 'active', driver: 'Amit Singh', lastService: '2024-01-10', nextService: '2024-04-10', km: 32100 },
    { id: 3, number: 'DL1C EF9012', model: 'Toyota Innova', type: 'suv', status: 'maintenance', driver: null, lastService: '2024-01-20', nextService: '2024-01-25', km: 78900 },
    { id: 4, number: 'DL1C GH3456', model: 'Maruti Ertiga', type: 'mpv', status: 'active', driver: 'Priya Sharma', lastService: '2024-01-08', nextService: '2024-04-08', km: 56700 },
    { id: 5, number: 'DL1C IJ7890', model: 'Honda City', type: 'sedan', status: 'inactive', driver: null, lastService: '2023-12-01', nextService: '2024-03-01', km: 89200 },
  ]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'maintenance': return <Badge className="bg-yellow-100 text-yellow-700"><Wrench className="w-3 h-3 mr-1" />Maintenance</Badge>;
      case 'inactive': return <Badge className="bg-gray-100 text-gray-700"><AlertTriangle className="w-3 h-3 mr-1" />Inactive</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles Management</h1>
          <p className="text-gray-500">Track and manage your fleet vehicles</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search vehicles..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{vehicles.length}</p>
            <p className="text-sm text-gray-500">Total Vehicles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'active').length}</p>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
            <p className="text-sm text-gray-500">In Maintenance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{vehicles.filter(v => v.status === 'inactive').length}</p>
            <p className="text-sm text-gray-500">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{vehicle.number}</p>
                          <p className="text-sm text-gray-500">{vehicle.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{vehicle.type.toUpperCase()}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-6 py-4">
                      {vehicle.driver || <span className="text-gray-400">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      {vehicle.km.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {vehicle.nextService}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
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

export default VehiclesManagement;
