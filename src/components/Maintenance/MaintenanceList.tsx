import React from 'react';
import { MaintenanceRecord } from '../../types';
import { Calendar, User, Clock, CheckCircle, PlayCircle, XCircle, Download, Upload } from 'lucide-react';

interface MaintenanceListProps {
  maintenanceRecords: MaintenanceRecord[];
  routes: Array<{ id: string; name: string }>;
  onExport?: () => void;
  onImport?: () => void;
}

export default function MaintenanceList({ maintenanceRecords, routes, onExport, onImport }: MaintenanceListProps) {
  const getStatusIcon = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'scheduled':
        return Calendar;
      case 'in-progress':
        return PlayCircle;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Calendar;
    }
  };

  const getStatusColor = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in-progress':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: MaintenanceRecord['priority']) => {
    switch (priority) {
      case 'low':
        return 'text-green-700 bg-green-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'critical':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Maintenance Schedule</h3>
            <p className="text-sm text-gray-600 mt-1">Manage all scheduled and ongoing maintenance tasks</p>
          </div>
          <div className="flex items-center space-x-3">
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            )}
            {onImport && (
              <button
                onClick={onImport}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {maintenanceRecords.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No maintenance records found
          </div>
        ) : (
          maintenanceRecords.map((record) => {
            const StatusIcon = getStatusIcon(record.status);
            const statusColor = getStatusColor(record.status);
            const priorityColor = getPriorityColor(record.priority);

            return (
              <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{record.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
                        {record.priority}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{record.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Route:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {getRouteName(record.routeId)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Technician:</span>
                          <span className="ml-1 font-medium text-gray-900">{record.technician}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Scheduled:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {new Date(record.scheduledDate).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {record.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={`ml-4 px-3 py-1 rounded-full border flex items-center space-x-1 ${statusColor}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm font-medium capitalize">
                      {record.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}