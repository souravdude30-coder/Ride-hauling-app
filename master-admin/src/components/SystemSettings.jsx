import React from 'react';

function SystemSettings({ user }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform-wide settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Settings</h2>
        </div>
        <p className="text-gray-500">System settings interface coming soon...</p>
      </div>
    </div>
  );
}

export default SystemSettings;