import React, { useState } from 'react';
import { TroubleTicket } from '../../types';
import { 
  Calendar, User, Clock, CheckCircle, PlayCircle, XCircle, 
  AlertTriangle, Filter, Search, Eye 
} from 'lucide-react';
import TroubleTicketDetail from './TroubleTicketDetail';

interface TroubleTicketListProps {
  tickets: TroubleTicket[];
  routes: Array<{ id: string; name: string }>;
}

export default function TroubleTicketList({ tickets, routes }: TroubleTicketListProps) {
  const [selectedTicket, setSelectedTicket] = useState<TroubleTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status: TroubleTicket['status']) => {
    switch (status) {
      case 'open':
        return AlertTriangle;
      case 'in-progress':
        return PlayCircle;
      case 'resolved':
        return CheckCircle;
      case 'closed':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: TroubleTicket['status']) => {
    switch (status) {
      case 'open':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'closed':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: TroubleTicket['priority']) => {
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

  const getCategoryColor = (category: TroubleTicket['category']) => {
    switch (category) {
      case 'signal-loss':
        return 'bg-red-100 text-red-800';
      case 'fiber-cut':
        return 'bg-red-100 text-red-800';
      case 'equipment-failure':
        return 'bg-orange-100 text-orange-800';
      case 'performance-degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRouteName(ticket.routeId).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (selectedTicket) {
    return (
      <TroubleTicketDetail 
        ticket={selectedTicket} 
        routes={routes}
        onBack={() => setSelectedTicket(null)}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trouble Tickets</h3>
            <p className="text-sm text-gray-600 mt-1">Track and manage network issues</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredTickets.length} of {tickets.length} tickets
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredTickets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No trouble tickets found matching your criteria
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const StatusIcon = getStatusIcon(ticket.status);
            const statusColor = getStatusColor(ticket.status);
            const priorityColor = getPriorityColor(ticket.priority);
            const categoryColor = getCategoryColor(ticket.category);

            return (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{ticket.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
                        {ticket.category.replace('-', ' ')}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{ticket.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Route:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {getRouteName(ticket.routeId)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Assigned:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {ticket.assignedTo || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {new Date(ticket.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Impact:</span>
                          <span className={`ml-1 font-medium ${
                            ticket.impact === 'critical' ? 'text-red-600' :
                            ticket.impact === 'high' ? 'text-orange-600' :
                            ticket.impact === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {ticket.impact}
                          </span>
                        </div>
                      </div>
                    </div>

                    {ticket.linkId && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Affected Link:</strong> {ticket.linkId}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${statusColor}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">
                        {ticket.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
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