import React from 'react';
import { Route } from '../../types';
import { MapPin, Calendar, Signal, AlertCircle, TrendingUp } from 'lucide-react';

interface RouteCardProps {
  route: Route;
  onClick: () => void;
}

export default function RouteCard({ route, onClick }: RouteCardProps) {
  const getStatusColor = (status: Route['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: Route['status']) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'warning':
        return 'Warning';
      case 'maintenance':
        return 'Under Maintenance';
      case 'critical':
        return 'Critical Issue';
      default:
        return 'Unknown';
    }
  };

  const getTroubleTicketColor = (count: number) => {
    if (count === 0) return 'text-green-600';
    if (count <= 3) return 'text-yellow-600';
    if (count <= 7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLossColor = (loss: number) => {
    if (loss <= 15) return 'text-green-600';
    if (loss <= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLossStatus = (loss: number) => {
    if (loss <= 15) return 'Good';
    if (loss <= 25) return 'Acceptable';
    return 'High';
  };

  const totalLength = route.links.reduce((sum, link) => sum + link.length, 0);
  const totalLoss = route.links.reduce((sum, link) => sum + link.totalLoss, 0);
  
  // Mock data for tickets this week vs last week
  const ticketsThisWeek = Math.floor(route.troubleTickets * 0.6); // 60% of total tickets are from this week
  const ticketsLastWeek = route.troubleTickets - ticketsThisWeek;
  
  // Mock Average SLA in hours (based on route status)
  const averageSLAHours = route.status === 'operational' ? 4.2 :
                         route.status === 'warning' ? 6.8 :
                         route.status === 'maintenance' ? 8.5 :
                         12.2; // critical

  const getSLAColor = (hours: number) => {
    if (hours < 6) return 'text-blue-600';
    if (hours >= 6 && hours <= 7) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
    >
      {/* Header with Route Name and Status */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate flex-1 mr-2">{route.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(route.status)} whitespace-nowrap`}>
          {getStatusText(route.status)}
        </span>
      </div>

      {/* Start - End Location */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
        <div className="flex items-center space-x-1 min-w-0 flex-1">
          <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{route.location.start}</span>
        </div>
        <span className="text-gray-400 text-xs mx-2 flex-shrink-0">→</span>
        <span className="text-xs text-gray-600 truncate min-w-0 flex-1 text-right">{route.location.end}</span>
      </div>

      {/* Total Length and Fiber */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Length</p>
          <p className="text-sm font-semibold text-gray-900">{totalLength.toFixed(1)} km</p>
        </div>
        <div className="text-center bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Fibers</p>
          <p className="text-sm font-semibold text-gray-900">{route.fiberCount}</p>
        </div>
      </div>

      {/* Assets Detail - Text Based */}
      <div className="mb-3">
        <div className="grid grid-cols-4 gap-1">
          <div className="text-center p-1.5 bg-blue-50 rounded">
            <p className="text-xs font-bold text-blue-700">{route.assets.handhole}</p>
            <p className="text-xs text-blue-600">HH</p>
          </div>
          <div className="text-center p-1.5 bg-green-50 rounded">
            <p className="text-xs font-bold text-green-700">{route.assets.odc}</p>
            <p className="text-xs text-green-600">ODC</p>
          </div>
          <div className="text-center p-1.5 bg-orange-50 rounded">
            <p className="text-xs font-bold text-orange-700">{route.assets.pole}</p>
            <p className="text-xs text-orange-600">Pole</p>
          </div>
          <div className="text-center p-1.5 bg-purple-50 rounded">
            <p className="text-xs font-bold text-purple-700">{route.assets.jc}</p>
            <p className="text-xs text-purple-600">JC</p>
          </div>
        </div>
      </div>

      {/* Metrics Row 1: Total Loss & Average SLA */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Signal className={`h-4 w-4 ${getLossColor(totalLoss)}`} />
            <p className="text-xs text-gray-600 font-medium">Total Loss</p>
          </div>
          <p className={`text-sm font-bold ${getLossColor(totalLoss)}`}>
            {totalLoss.toFixed(1)} dB
          </p>
          <p className={`text-xs ${getLossColor(totalLoss)}`}>
            {getLossStatus(totalLoss)}
          </p>
        </div>

        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className={`h-4 w-4 ${getSLAColor(averageSLAHours)}`} />
            <p className="text-xs text-gray-600 font-medium">Avg SLA</p>
          </div>
          <p className={`text-sm font-bold ${getSLAColor(averageSLAHours)}`}>
            {averageSLAHours.toFixed(1)}h
          </p>
          <p className={`text-xs ${getSLAColor(averageSLAHours)}`}>
            Response
          </p>
        </div>
      </div>

      {/* Metrics Row 2: Trouble Tickets */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-blue-600 font-medium">Last Week</p>
          </div>
          <p className="text-sm font-bold text-blue-700">{ticketsLastWeek}</p>
          <p className="text-xs text-blue-600">Tickets</p>
        </div>

        <div className="text-center p-2 bg-orange-50 rounded">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <AlertCircle className={`h-4 w-4 ${getTroubleTicketColor(ticketsThisWeek)}`} />
            <p className="text-xs text-orange-600 font-medium">This Week</p>
          </div>
          <p className={`text-sm font-bold ${getTroubleTicketColor(ticketsThisWeek)}`}>
            {ticketsThisWeek}
          </p>
          <p className={`text-xs ${getTroubleTicketColor(ticketsThisWeek)}`}>
            Tickets
          </p>
        </div>
      </div>
    </div>
  );
}