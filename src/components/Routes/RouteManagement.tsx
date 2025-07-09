import React, { useState } from 'react';
import { Route } from '../../types';
import { MapPin, Search, Filter, Eye, Plus, Building, Activity, Download, Upload } from 'lucide-react';
import RouteDetails from './RouteDetails';
import ExportImportModal from '../Common/ExportImportModal';

interface RouteManagementProps {
  routes: Route[];
  onRouteUpdate: (updatedRoute: Route) => void;
  maintenanceRecords: any[];
  troubleTickets: any[];
}

export default function RouteManagement({ 
  routes, 
  onRouteUpdate, 
  maintenanceRecords, 
  troubleTickets 
}: RouteManagementProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = searchTerm === '' || 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.location.start.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.location.end.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (selectedRoute) {
    return (
      <RouteDetails
        route={selectedRoute}
        onRouteUpdate={(updatedRoute) => {
          onRouteUpdate(updatedRoute);
          setSelectedRoute(updatedRoute);
        }}
        onBack={() => setSelectedRoute(null)}
        maintenanceRecords={maintenanceRecords}
        troubleTickets={troubleTickets}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Route Management</h2>
            <p className="text-gray-600">Manage and monitor all fiber optic routes</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <span className="text-sm text-gray-500">
              {filteredRoutes.length} of {routes.length} routes
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="warning">Warning</option>
              <option value="maintenance">Maintenance</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Route Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutes.map((route) => {
          const totalLength = route.links.reduce((sum, link) => sum + link.length, 0);
          const averageLoss = route.links.length > 0 
            ? route.links.reduce((sum, link) => sum + link.totalLoss, 0) / route.links.length 
            : 0;
          const totalAssets = route.assets.handhole + route.assets.odc + route.assets.pole + route.assets.jc;

          return (
            <div
              key={route.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
              onClick={() => setSelectedRoute(route)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(route.status)}`}>
                  {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {route.location.start} → {route.location.end}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Links:</span>
                    <span className="ml-1 font-medium text-gray-900">{route.links.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Length:</span>
                    <span className="ml-1 font-medium text-gray-900">{totalLength.toFixed(1)} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fibers:</span>
                    <span className="ml-1 font-medium text-gray-900">{route.fiberCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Assets:</span>
                    <span className="ml-1 font-medium text-gray-900">{totalAssets}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-500 text-sm">Avg Loss:</span>
                    <span className={`ml-1 font-medium text-sm ${
                      averageLoss <= 3 ? 'text-green-600' :
                      averageLoss <= 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {averageLoss.toFixed(1)} dB
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Tickets:</span>
                    <span className={`ml-1 font-medium text-sm ${
                      route.troubleTickets === 0 ? 'text-green-600' :
                      route.troubleTickets <= 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {route.troubleTickets}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Next Maintenance: {new Date(route.nextMaintenance).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-1 text-blue-600 text-sm">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Export Modal */}
      <ExportImportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mode="export"
        dataType="routes"
        data={{ routes }}
      />

      {/* Import Modal */}
      <ExportImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        mode="import"
        dataType="routes"
        data={{ routes }}
        onImportComplete={(importedRoutes) => {
          // Handle imported routes - you might want to add them to the existing routes
          console.log('Imported routes:', importedRoutes);
          // You could call a parent function here to handle the imported data
        }}
      />
    </div>
  );
}