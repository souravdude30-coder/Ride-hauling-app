import React from 'react';

function FleetOverview({ user }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Fleet Overview</h1>
        <p className="text-gray-600 mt-2">Monitor all fleet operations across the platform</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Fleet Status</h2>
        </div>
        <p className="text-gray-500">Fleet overview interface coming soon...</p>
      </div>
    </div>
  );
}

export default FleetOverview;