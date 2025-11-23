import React from 'react';

function UserManagement({ user }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage all platform users and their roles</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">All Users</h2>
        </div>
        <p className="text-gray-500">User management interface coming soon...</p>
      </div>
    </div>
  );
}

export default UserManagement;