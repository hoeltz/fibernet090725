import React from 'react';
import { Alert } from '../../types';
import { AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';

interface RecentAlertsProps {
  alerts: Alert[];
}

export default function RecentAlerts({ alerts }: RecentAlertsProps) {
  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info':
        return Info;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertCircle;
      case 'critical':
        return XCircle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
      
      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent alerts</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = getSeverityIcon(alert.severity);
            const colorClasses = getSeverityColor(alert.severity);
            
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${colorClasses} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                      {alert.acknowledged && (
                        <span className="text-xs text-green-600 font-medium">
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}