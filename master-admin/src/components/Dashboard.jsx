import React, { useState, useEffect } from 'react';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalDrivers: 0,
    totalVehicles: 0,
    activeRides: 0,
    totalRevenue: 0,
    systemHealth: 'good'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data - replace with real API calls
    setStats({
      totalUsers: 2847,
      totalCompanies: 156,
      totalDrivers: 1243,
      totalVehicles: 1089,
      activeRides: 234,
      totalRevenue: 1247500,
      systemHealth: 'good'
    });

    setRecentActivity([
      { id: 1, action: 'New company registered', user: 'Tech Corp Ltd.', time: '2 minutes ago', type: 'company' },
      { id: 2, action: 'Driver verification completed', user: 'John Smith', time: '5 minutes ago', type: 'driver' },
      { id: 3, action: 'System maintenance completed', user: 'System', time: '15 minutes ago', type: 'system' },
      { id: 4, action: 'Emergency alert triggered', user: 'Route 45B', time: '23 minutes ago', type: 'emergency' },
      { id: 5, action: 'Fleet manager promoted', user: 'Sarah Johnson', time: '1 hour ago', type: 'role' }
    ]);

    setAlerts([
      { id: 1, message: 'Vehicle maintenance due for 15 vehicles', severity: 'warning', time: '1 hour ago' },
      { id: 2, message: 'High demand detected in Zone A', severity: 'info', time: '2 hours ago' },
      { id: 3, message: 'Driver shortage in North region', severity: 'error', time: '3 hours ago' }
    ]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'company': return '🏢';
      case 'driver': return '👨‍✈️';
      case 'system': return '⚙️';
      case 'emergency': return '🚨';
      case 'role': return '👥';
      default: return '📋';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Master Admin Dashboard</h1>
        <p className="text-gray-600">System overview and control center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <div className="mt-2 text-sm text-green-600">↗ +12% from last month</div>
        </Card>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-3xl font-bold">{stats.totalCompanies}</p>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
          <div className="mt-2 text-sm text-green-600">↗ +8% from last month</div>
        </Card>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Drivers</p>
              <p className="text-3xl font-bold">{stats.totalDrivers.toLocaleString()}</p>
            </div>
            <div className="text-4xl">🚗</div>
          </div>
          <div className="mt-2 text-sm text-blue-600">→ Stable</div>
        </Card>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <div className="mt-2 text-sm text-green-600">↗ +15% from last month</div>
        </Card>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response Time</span>
              <Badge className="bg-green-100 text-green-800">45ms</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Performance</span>
              <Badge className="bg-green-100 text-green-800">Optimal</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Server Uptime</span>
              <Badge className="bg-green-100 text-green-800">99.98%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Connections</span>
              <Badge className="bg-blue-100 text-blue-800">2,847</Badge>
            </div>
          </div>
        </Card>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Live Operations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Rides</span>
              <span className="text-2xl font-bold text-blue-600">{stats.activeRides}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Available Drivers</span>
              <span className="text-lg font-semibold text-green-600">456</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Requests</span>
              <span className="text-lg font-semibold text-orange-600">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Emergency Alerts</span>
              <span className="text-lg font-semibold text-red-600">2</span>
            </div>
          </div>
        </Card>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              🚨 View Emergency Alerts
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              📊 Generate System Report
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              👥 Manage User Roles
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
              ⚙️ System Maintenance
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div className="text-xs text-gray-600">{activity.user} • {activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="text-sm font-medium">{alert.message}</div>
                <div className="text-xs mt-1">{alert.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;