import React from 'react';
import { Car, Users, Navigation, DollarSign, Bus, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const FleetDashboard = ({ fleetData, drivers, rides, shuttles }) => {
  const onlinePercentage = fleetData.totalDrivers > 0 
    ? Math.round((fleetData.onlineDrivers / fleetData.totalDrivers) * 100) 
    : 0;

  const activeRideDrivers = rides.filter(ride => 
    ride.status === 'in_progress' || ride.status === 'driver_arriving'
  ).length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold">{fleetData.totalDrivers}</p>
              <p className="text-xs text-green-600">{onlinePercentage}% online</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Rides</p>
              <p className="text-2xl font-bold">{fleetData.activeRides}</p>
              <p className="text-xs text-blue-600">{activeRideDrivers} drivers busy</p>
            </div>
            <Navigation className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold">${fleetData.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">+12% vs yesterday</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Shuttles</p>
              <p className="text-2xl font-bold">{fleetData.activeShuttles}</p>
              <p className="text-xs text-purple-600">{fleetData.shuttleRoutes} routes</p>
            </div>
            <Bus className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Real-time Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rides */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Rides</h3>
            <Badge variant="secondary">{rides.length} active</Badge>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {rides.map((ride) => (
              <div key={ride.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{ride.driver}</span>
                      <Badge 
                        variant={ride.status === 'in_progress' ? 'default' : 'secondary'}
                        className={ride.status === 'in_progress' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {ride.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Passenger: {ride.user}</p>
                  </div>
                  <span className="font-bold text-green-600">${ride.fare}</span>
                </div>
                <div className="text-xs text-gray-500">
                  <div>{ride.pickup} → {ride.destination}</div>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Started {Math.round((Date.now() - ride.startTime) / 60000)} min ago
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Rides
          </Button>
        </Card>

        {/* Driver Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Driver Status</h3>
            <Badge variant="secondary">{fleetData.onlineDrivers} online</Badge>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    driver.status === 'online' ? 'bg-green-500' :
                    driver.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <div className="font-medium">{driver.name}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <span>⭐ {driver.rating}</span>
                      <span>•</span>
                      <span>{driver.todayRides} rides today</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">${driver.todayEarnings}</div>
                  <Badge 
                    variant={driver.status === 'online' ? 'secondary' : 'outline'}
                    className={driver.status === 'online' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {driver.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Manage Drivers
          </Button>
        </Card>
      </div>

      {/* Shuttle Operations */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Bus className="w-5 h-5 mr-2" />
            Shuttle Operations
          </h3>
          <Badge variant="secondary">{shuttles.length} active</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shuttles.map((shuttle) => (
            <div key={shuttle.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{shuttle.route}</h4>
                  <p className="text-sm text-gray-600">Bus: {shuttle.busNumber}</p>
                  <p className="text-sm text-gray-600">Driver: {shuttle.driver}</p>
                </div>
                <Badge 
                  variant={shuttle.status === 'in_transit' ? 'default' : 'secondary'}
                  className={shuttle.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : ''}
                >
                  {shuttle.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Passengers:</span>
                  <span className="font-medium">{shuttle.passengers}/{shuttle.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(shuttle.passengers / shuttle.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Next Stop:</span>
                  <span className="font-medium">{shuttle.nextStop} ({shuttle.eta} min)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          Manage Shuttles
        </Button>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-16 bg-blue-600 hover:bg-blue-700">
          <div className="text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Analytics</span>
          </div>
        </Button>
        <Button variant="outline" className="h-16">
          <div className="text-center">
            <Users className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Add Driver</span>
          </div>
        </Button>
        <Button variant="outline" className="h-16">
          <div className="text-center">
            <Bus className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">New Route</span>
          </div>
        </Button>
        <Button variant="outline" className="h-16 border-red-200 text-red-600 hover:bg-red-50">
          <div className="text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">Alerts</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default FleetDashboard;