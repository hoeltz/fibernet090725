import React, { useState } from 'react';
import { TroubleTicket } from '../../types';
import { 
  Plus, Clock, User, MapPin, AlertTriangle, 
  Calendar, Activity, Eye, Edit3, MoreVertical,
  Signal, Zap, Settings, Wrench, Car, Shield
} from 'lucide-react';
import CreateTicketModal from './CreateTicketModal';
import TroubleTicketDetail from './TroubleTicketDetail';

interface TroubleTicketKanbanProps {
  tickets: TroubleTicket[];
  routes: Array<{ id: string; name: string }>;
  onCreateTicket: (ticket: Omit<TroubleTicket, 'id'>) => void;
  onUpdateTicket: (ticketId: string, updates: Partial<TroubleTicket>) => void;
}

export default function TroubleTicketKanban({ 
  tickets, 
  routes, 
  onCreateTicket,
  onUpdateTicket 
}: TroubleTicketKanbanProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TroubleTicket | null>(null);
  const [draggedTicket, setDraggedTicket] = useState<TroubleTicket | null>(null);

  const columns = [
    { 
      id: 'open', 
      title: 'Open', 
      color: 'bg-red-50 border-red-200',
      headerColor: 'bg-red-100 text-red-800',
      count: tickets.filter(t => t.status === 'open').length
    },
    { 
      id: 'in-progress', 
      title: 'In Progress', 
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-100 text-blue-800',
      count: tickets.filter(t => t.status === 'in-progress').length
    },
    { 
      id: 'resolved', 
      title: 'Resolved', 
      color: 'bg-yellow-50 border-yellow-200',
      headerColor: 'bg-yellow-100 text-yellow-800',
      count: tickets.filter(t => t.status === 'resolved').length
    },
    { 
      id: 'closed', 
      title: 'Closed', 
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-100 text-green-800',
      count: tickets.filter(t => t.status === 'closed').length
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'signal-loss': return Signal;
      case 'fiber-cut': return Zap;
      case 'equipment-failure': return Settings;
      case 'maintenance': return Wrench;
      case 'power-outage': return Zap;
      case 'environmental': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'prepare': return Settings;
      case 'initial-measurement': return Activity;
      case 'travel': return Car;
      case 'handling': return Wrench;
      case 'securing': return Shield;
      default: return Activity;
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const calculateDuration = (ticket: TroubleTicket) => {
    const start = new Date(ticket.createdAt);
    const end = ticket.closedAt ? new Date(ticket.closedAt) : new Date();
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // in minutes
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSLAStatus = (ticket: TroubleTicket) => {
    if (!ticket.slaTarget) return null;
    
    const duration = calculateDuration(ticket);
    const slaMinutes = ticket.slaTarget * 60;
    
    if (duration >= slaMinutes) return 'breached';
    if (duration >= slaMinutes * 0.8) return 'approaching';
    return 'within';
  };

  const getSLAColor = (status: string | null) => {
    switch (status) {
      case 'breached': return 'text-red-600 bg-red-100';
      case 'approaching': return 'text-orange-600 bg-orange-100';
      case 'within': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDragStart = (e: React.DragEvent, ticket: TroubleTicket) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTicket && draggedTicket.status !== newStatus) {
      const updates: Partial<TroubleTicket> = { 
        status: newStatus as TroubleTicket['status'],
        updatedAt: new Date().toISOString()
      };
      
      if (newStatus === 'resolved') {
        updates.resolvedAt = new Date().toISOString();
      } else if (newStatus === 'closed') {
        updates.closedAt = new Date().toISOString();
        updates.totalDuration = calculateDuration(draggedTicket);
      }
      
      onUpdateTicket(draggedTicket.id, updates);
    }
    setDraggedTicket(null);
  };

  if (selectedTicket) {
    return (
      <TroubleTicketDetail 
        ticket={selectedTicket} 
        routes={routes}
        onBack={() => setSelectedTicket(null)}
        onUpdate={onUpdateTicket}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trouble Ticket Management</h2>
            <p className="text-gray-600 mt-1">Track and manage network issues with kanban board</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {columns.map((column) => (
            <div key={column.id} className={`p-4 rounded-lg border-2 ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${column.headerColor.split(' ')[1]} ${column.headerColor.split(' ')[2]}`}>
                  {column.title}
                </h3>
                <span className={`text-2xl font-bold ${column.headerColor.split(' ')[1]} ${column.headerColor.split(' ')[2]}`}>
                  {column.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-4 gap-6 h-full">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`rounded-lg border-2 ${column.color} flex flex-col h-full`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`p-4 rounded-t-lg ${column.headerColor} border-b-2 ${column.color.split(' ')[1]}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.title}</h3>
                  <span className="text-sm font-medium">{column.count}</span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {tickets
                  .filter(ticket => ticket.status === column.id)
                  .map((ticket) => {
                    const CategoryIcon = getCategoryIcon(ticket.category);
                    const duration = calculateDuration(ticket);
                    const slaStatus = getSLAStatus(ticket);
                    
                    return (
                      <div
                        key={ticket.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ticket)}
                        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-move group"
                      >
                        {/* Ticket Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                            <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber}</span>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Ticket Title */}
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{ticket.title}</h4>

                        {/* Category & Route */}
                        <div className="flex items-center space-x-2 mb-3">
                          <CategoryIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-600">{ticket.category.replace('-', ' ')}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{getRouteName(ticket.routeId)}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate">{ticket.location.address}</span>
                        </div>

                        {/* Duration & SLA */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-600">{formatDuration(duration)}</span>
                          </div>
                          {slaStatus && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSLAColor(slaStatus)}`}>
                              SLA {slaStatus}
                            </span>
                          )}
                        </div>

                        {/* Assigned Person */}
                        {ticket.personHandling && (
                          <div className="flex items-center space-x-2 mb-3">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-600">{ticket.personHandling}</span>
                          </div>
                        )}

                        {/* Recent Activities */}
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {ticket.activities.length} activities
                            </span>
                          </div>
                          
                          {/* Latest Activity */}
                          {ticket.activities.length > 0 && (
                            <div className="mt-2">
                              {ticket.activities.slice(-2).map((activity) => {
                                const ActivityIcon = getActivityIcon(activity.type);
                                return (
                                  <div key={activity.id} className="flex items-center space-x-2 text-xs text-gray-500">
                                    <ActivityIcon className="h-3 w-3" />
                                    <span className="truncate">{activity.type.replace('-', ' ')}</span>
                                    {activity.duration && (
                                      <span className="text-gray-400">({activity.duration}m)</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="border-t border-gray-100 pt-2 mt-3">
                          <div className="text-xs text-gray-400">
                            Created: {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                          {ticket.resolvedAt && (
                            <div className="text-xs text-gray-400">
                              Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}
                            </div>
                          )}
                          {ticket.closedAt && (
                            <div className="text-xs text-gray-400">
                              Closed: {new Date(ticket.closedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                
                {tickets.filter(ticket => ticket.status === column.id).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tickets in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          routes={routes}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(ticketData) => {
            onCreateTicket(ticketData);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}