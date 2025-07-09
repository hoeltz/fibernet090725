import React from 'react';
import { SLATarget } from '../../types';
import { Target, TrendingUp, TrendingDown, Minus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface SLAKanbanProps {
  targets: SLATarget[];
}

export default function SLAKanban({ targets }: SLAKanbanProps) {
  const getStatusConfig = (status: SLATarget['status']) => {
    switch (status) {
      case 'achieve':
        return {
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          title: 'Achieve (< 6h)',
          description: 'Fast Response Time'
        };
      case 'standard':
        return {
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          icon: Clock,
          iconColor: 'text-yellow-600',
          title: 'Standard (6h)',
          description: 'Meeting Standard'
        };
      case 'exceed':
        return {
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          title: 'Exceed (> 6h)',
          description: 'Needs Improvement'
        };
      default:
        return {
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          icon: Target,
          iconColor: 'text-gray-600',
          title: 'Unknown',
          description: 'Status Unknown'
        };
    }
  };

  const getTrendIcon = (trend: SLATarget['trend']) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: SLATarget['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const groupedTargets = {
    achieve: targets.filter(t => t.status === 'achieve'),
    standard: targets.filter(t => t.status === 'standard'),
    exceed: targets.filter(t => t.status === 'exceed')
  };

  const columns = [
    { key: 'achieve', config: getStatusConfig('achieve') },
    { key: 'standard', config: getStatusConfig('standard') },
    { key: 'exceed', config: getStatusConfig('exceed') }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">SLA Response Time Status</h3>
          <p className="text-sm text-gray-600">Maintenance response time performance</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-gray-700">
              {groupedTargets.achieve.length} Achieving
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-gray-700">
              {groupedTargets.standard.length} Standard
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-gray-700">
              {groupedTargets.exceed.length} Exceeding
            </span>
          </div>
        </div>
      </div>

      {/* Single Row Layout */}
      <div className="flex space-x-4 overflow-x-auto">
        {columns.map((column) => {
          const columnTargets = groupedTargets[column.key as keyof typeof groupedTargets];
          const StatusIcon = column.config.icon;
          
          return (
            <div key={column.key} className={`flex-1 min-w-80 rounded-lg border-2 ${column.config.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-5 w-5 ${column.config.iconColor}`} />
                  <div>
                    <h4 className={`font-semibold ${column.config.textColor}`}>
                      {column.config.title}
                    </h4>
                    <p className="text-xs text-gray-600">{column.config.description}</p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${column.config.textColor}`}>
                  {columnTargets.length}
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {columnTargets.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-xs text-gray-500">No routes</p>
                  </div>
                ) : (
                  columnTargets.map((target) => {
                    const TrendIcon = getTrendIcon(target.trend);
                    const trendColor = getTrendColor(target.trend);

                    return (
                      <div
                        key={target.routeId}
                        className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">{target.routeName}</span>
                          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">SLA:</span>
                            <span className="font-medium text-gray-900">{target.current}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Response:</span>
                            <span className={`font-medium ${
                              target.maintenanceTime < 6 ? 'text-green-600' :
                              target.maintenanceTime === 6 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {target.maintenanceTime}h
                            </span>
                          </div>
                          
                          {/* Simple progress indicator */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                target.current >= target.target
                                  ? 'bg-green-500'
                                  : target.current >= target.target * 0.95
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{
                                width: `${Math.min((target.current / target.target) * 100, 100)}%`
                              }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-xs pt-1">
                            <span className={`font-medium ${
                              target.current >= target.target ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {target.current >= target.target ? 'Target Met' : 'Below Target'}
                            </span>
                            <span className={`font-medium ${trendColor}`}>
                              {target.trend === 'up' ? '↗' : 
                               target.trend === 'down' ? '↘' : '→'}
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
        })}
      </div>
    </div>
  );
}