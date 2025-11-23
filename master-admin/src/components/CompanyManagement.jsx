import React from 'react';

function CompanyManagement({ user }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
        <p className="text-gray-600 mt-2">Manage corporate clients and their settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">All Companies</h2>
        </div>
        <p className="text-gray-500">Company management interface coming soon...</p>
      </div>
    </div>
  );
}

export default CompanyManagement;