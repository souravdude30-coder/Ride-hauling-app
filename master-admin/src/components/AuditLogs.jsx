import React from 'react';

function AuditLogs({ user }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-2">View all system activities and changes</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Recent Activities</h2>
        </div>
        <p className="text-gray-500">Audit logs interface coming soon...</p>
      </div>
    </div>
  );
}

export default AuditLogs;