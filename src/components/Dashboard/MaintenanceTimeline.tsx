import React, { useState } from 'react';
import { MaintenanceRecord, TroubleTicket } from '../../types';
import { 
  Calendar, Clock, User, Wrench, AlertTriangle, 
  CheckCircle, PlayCircle, XCircle, MapPin,
  Activity, Settings, Car, Shield, Eye, Plus
} from 'lucide-react';
import ActivityDetailModal from './ActivityDetailModal';

interface MaintenanceTimelineProps {
  maintenanceRecords: MaintenanceRecord[];
  troubleTickets: TroubleTicket[];
  routes: Array<{ id: string; name: string }>;
}

interface TimelineActivity {
  id: string;
  type: 'maintenance' | 'patrol' | 'trouble';
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'scheduled' | 'cancelled';
  date: Date;
  routeId: string;
  technician: string;
  duration: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  equipment?: string[];
  notes?: string;
}

export default function MaintenanceTimeline({ 
  maintenanceRecords, 
  troubleTickets, 
  routes 
}: MaintenanceTimelineProps) {
  const [selectedActivity, setSelectedActivity] = useState<TimelineActivity | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activities, setActivities] = useState<TimelineActivity[]>([]);

  // Get current date and calculate week ranges
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());
  
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  
  const nextWeekStart = new Date(currentWeekStart);
  nextWeekStart.setDate(currentWeekStart.getDate() + 7);

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in-progress':
        return PlayCircle;
      case 'scheduled':
        return Calendar;
      case 'cancelled':
        return XCircle;
      default:
        return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'scheduled':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Mock timeline data for demonstration
  const timelineData = [
    // Last Week
    {
      week: 'Last Week',
      weekStart: lastWeekStart,
      items: [
        {
          id: 'timeline-1',
          type: 'maintenance' as const,
          title: 'Preventive Maintenance Route A',
          description: 'Quarterly fiber inspection and cleaning',
          status: 'completed' as const,
          date: new Date(lastWeekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
          routeId: 'route-a',
          technician: 'John Smith',
          duration: 4,
          priority: 'medium' as const,
          location: 'Central Hub - Equipment Room',
          equipment: ['OTDR', 'Cleaning Kit', 'Connector Tester'],
          notes: 'All connections tested and cleaned successfully'
        },
        {
          id: 'timeline-2',
          type: 'patrol' as const,
          title: 'Route Patrol - District B',
          description: 'Visual inspection of overhead cables',
          status: 'completed' as const,
          date: new Date(lastWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
          routeId: 'route-b',
          technician: 'Sarah Johnson',
          duration: 6,
          priority: 'low' as const,
          location: 'Jl. Gatot Subroto corridor',
          equipment: ['Binoculars', 'Camera', 'Measurement Tools'],
          notes: 'Minor cable sag detected at pole 15, scheduled for adjustment'
        },
        {
          id: 'timeline-3',
          type: 'trouble' as const,
          title: 'Signal Loss Investigation',
          description: 'Emergency repair on Route E',
          status: 'completed' as const,
          date: new Date(lastWeekStart.getTime() + 5 * 24 * 60 * 60 * 1000),
          routeId: 'route-e',
          technician: 'Mike Wilson',
          duration: 8,
          priority: 'critical' as const,
          location: 'Joint Closure CHE-008',
          equipment: ['Fusion Splicer', 'OTDR', 'Spare Fiber'],
          notes: 'Water ingress repaired, seal replaced, service restored'
        }
      ]
    },
    // This Week
    {
      week: 'This Week',
      weekStart: currentWeekStart,
      items: [
        {
          id: 'timeline-4',
          type: 'maintenance' as const,
          title: 'Connector Cleaning Route C',
          description: 'Scheduled connector maintenance',
          status: 'in-progress' as const,
          date: new Date(currentWeekStart.getTime() + 1 * 24 * 60 * 60 * 1000),
          routeId: 'route-c',
          technician: 'Tom Anderson',
          duration: 5,
          priority: 'medium' as const,
          location: 'ODC Central Hub Charlie',
          equipment: ['Cleaning Kit', 'Inspection Scope'],
          notes: 'Progress: 60% complete, connectors 1-12 cleaned'
        },
        {
          id: 'timeline-5',
          type: 'patrol' as const,
          title: 'Weekly Patrol Route F',
          description: 'Regular infrastructure inspection',
          status: 'scheduled' as const,
          date: new Date(currentWeekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
          routeId: 'route-f',
          technician: 'Lisa Chen',
          duration: 4,
          priority: 'low' as const,
          location: 'Jl. Casablanca corridor',
          equipment: ['Camera', 'GPS Device', 'Checklist'],
          notes: 'Scheduled weekly infrastructure inspection'
        }
      ]
    },
    // Next Week
    {
      week: 'Next Week',
      weekStart: nextWeekStart,
      items: [
        {
          id: 'timeline-6',
          type: 'maintenance' as const,
          title: 'Quarterly Inspection Route D',
          description: 'Comprehensive route inspection',
          status: 'scheduled' as const,
          date: new Date(nextWeekStart.getTime() + 2 * 24 * 60 * 60 * 1000),
          routeId: 'route-d',
          technician: 'John Smith',
          duration: 6,
          priority: 'medium' as const,
          location: 'Full Route D inspection',
          equipment: ['OTDR', 'Power Meter', 'Visual Fault Locator'],
          notes: 'Quarterly comprehensive inspection scheduled'
        },
        {
          id: 'timeline-7',
          type: 'patrol' as const,
          title: 'Infrastructure Audit Route B',
          description: 'Monthly infrastructure audit',
          status: 'scheduled' as const,
          date: new Date(nextWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
          routeId: 'route-b',
          technician: 'Sarah Johnson',
          duration: 8,
          priority: 'high' as const,
          location: 'Route B full corridor',
          equipment: ['Audit Checklist', 'Camera', 'Measurement Tools'],
          notes: 'Monthly infrastructure audit and documentation'
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return Wrench;
      case 'patrol':
        return MapPin;
      case 'trouble':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'text-blue-600 bg-blue-50';
      case 'patrol':
        return 'text-green-600 bg-green-50';
      case 'trouble':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCreateActivity = (activityData: Omit<TimelineActivity, 'id'>) => {
    const newActivity: TimelineActivity = {
      ...activityData,
      id: `activity-${Date.now()}`
    };
    setActivities([...activities, newActivity]);
    setShowCreateModal(false);
  };

  const handleUpdateActivity = (activityId: string, updates: Partial<TimelineActivity>) => {
    setActivities(activities.map(activity => 
      activity.id === activityId ? { ...activity, ...updates } : activity
    ));
    
    // Also update the selected activity if it's being viewed
    if (selectedActivity && selectedActivity.id === activityId) {
      setSelectedActivity({ ...selectedActivity, ...updates });
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities(activities.filter(activity => activity.id !== activityId));
    if (selectedActivity && selectedActivity.id === activityId) {
      setSelectedActivity(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Activity Timeline</h3>
            <p className="text-xs text-gray-600">Recent maintenance, patrol, and trouble activities</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <Wrench className="h-3 w-3 text-blue-600" />
                <span className="text-gray-700">Maintenance</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-green-600" />
                <span className="text-gray-700">Patrol</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3 text-red-600" />
                <span className="text-gray-700">Trouble</span>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {timelineData.map((weekData) => (
            <div key={weekData.week}>
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">{weekData.week}</h4>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-500">
                  {weekData.weekStart.toLocaleDateString()} - {new Date(weekData.weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-2">
                {weekData.items.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  const StatusIcon = getStatusIcon(item.status);
                  const typeColor = getTypeColor(item.type);
                  const statusColor = getStatusColor(item.status);

                  return (
                    <div key={item.id} className="flex space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${typeColor}`}>
                        <TypeIcon className="h-3 w-3" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate">{item.title}</h5>
                              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              <div className={`px-2 py-1 rounded border flex items-center space-x-1 ${statusColor} whitespace-nowrap`}>
                                <StatusIcon className="h-3 w-3" />
                                <span className="text-xs font-medium capitalize">
                                  {item.status.replace('-', ' ')}
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedActivity(item)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">
                                {item.date.toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500 truncate">
                                {getRouteName(item.routeId)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500 truncate">{item.technician}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">{item.duration}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom Activities */}
          {activities.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">Custom Activities</h4>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <div className="space-y-2">
                {activities.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  const StatusIcon = getStatusIcon(item.status);
                  const typeColor = getTypeColor(item.type);
                  const statusColor = getStatusColor(item.status);

                  return (
                    <div key={item.id} className="flex space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${typeColor}`}>
                        <TypeIcon className="h-3 w-3" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded p-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate">{item.title}</h5>
                              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              <div className={`px-2 py-1 rounded border flex items-center space-x-1 ${statusColor} whitespace-nowrap`}>
                                <StatusIcon className="h-3 w-3" />
                                <span className="text-xs font-medium capitalize">
                                  {item.status.replace('-', ' ')}
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedActivity(item)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">
                                {item.date.toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500 truncate">
                                {getRouteName(item.routeId)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500 truncate">{item.technician}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-500">{item.duration}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {(selectedActivity || showCreateModal) && (
        <ActivityDetailModal
          activity={selectedActivity}
          routes={routes}
          isCreate={showCreateModal}
          onClose={() => {
            setSelectedActivity(null);
            setShowCreateModal(false);
          }}
          onCreate={handleCreateActivity}
          onUpdate={handleUpdateActivity}
          onDelete={handleDeleteActivity}
        />
      )}
    </>
  );
}