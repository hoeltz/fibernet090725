import React, { useState } from 'react';
import { TroubleTicket, Route, MaterialUsage } from '../../types';
import { 
  Calendar, Clock, User, MapPin, AlertTriangle, 
  CheckCircle, PlayCircle, XCircle, Eye, Filter,
  Search, Package, Cable, Wrench, Image, 
  FileText, ChevronDown, ChevronRight, Edit3,
  Save, X, Plus, Trash2, Navigation, Printer,
  Download
} from 'lucide-react';
import TroubleTicketDetail from './TroubleTicketDetail';
import ExportImportModal from '../Common/ExportImportModal';

interface TroubleTicketManagementProps {
  tickets: TroubleTicket[];
  routes: Route[];
  onUpdateTicket: (ticketId: string, updates: Partial<TroubleTicket>) => void;
}

export default function TroubleTicketManagement({ 
  tickets, 
  routes, 
  onUpdateTicket 
}: TroubleTicketManagementProps) {
  const [selectedTicket, setSelectedTicket] = useState<TroubleTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState<{ [ticketId: string]: Partial<MaterialUsage> }>({});
  const [editingMaterialData, setEditingMaterialData] = useState<MaterialUsage | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertTriangle;
      case 'in-progress': return PlayCircle;
      case 'resolved': return CheckCircle;
      case 'closed': return XCircle;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'critical': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRepairTypeColor = (repairType: string) => {
    return repairType === 'permanent' 
      ? 'text-green-700 bg-green-100' 
      : 'text-orange-700 bg-orange-100';
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesRoute = routeFilter === 'all' || ticket.routeId === routeFilter;
    
    return matchesSearch && matchesStatus && matchesRoute;
  });

  // Group tickets by route
  const ticketsByRoute = filteredTickets.reduce((acc, ticket) => {
    const routeId = ticket.routeId;
    if (!acc[routeId]) {
      acc[routeId] = [];
    }
    acc[routeId].push(ticket);
    return acc;
  }, {} as Record<string, TroubleTicket[]>);

  const toggleRouteExpansion = (routeId: string) => {
    const newExpanded = new Set(expandedRoutes);
    if (newExpanded.has(routeId)) {
      newExpanded.delete(routeId);
    } else {
      newExpanded.add(routeId);
    }
    setExpandedRoutes(newExpanded);
  };

  const startEditingMaterial = (material: MaterialUsage) => {
    setEditingMaterial(material.id);
    setEditingMaterialData({ ...material });
  };

  const saveEditingMaterial = (ticketId: string) => {
    if (editingMaterialData) {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        const updatedMaterials = ticket.materialUsage.map(m => 
          m.id === editingMaterialData.id ? editingMaterialData : m
        );
        onUpdateTicket(ticketId, { materialUsage: updatedMaterials });
      }
    }
    setEditingMaterial(null);
    setEditingMaterialData(null);
  };

  const cancelEditingMaterial = () => {
    setEditingMaterial(null);
    setEditingMaterialData(null);
  };

  const updateEditingMaterial = (field: string, value: any) => {
    if (editingMaterialData) {
      setEditingMaterialData({
        ...editingMaterialData,
        [field]: value
      });
    }
  };

  const deleteMaterial = (ticketId: string, materialId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const updatedMaterials = ticket.materialUsage.filter(m => m.id !== materialId);
      onUpdateTicket(ticketId, { materialUsage: updatedMaterials });
    }
  };

  const addNewMaterial = (ticketId: string) => {
    setNewMaterial({
      ...newMaterial,
      [ticketId]: {
        materialType: 'closure',
        materialName: '',
        quantity: 1,
        unit: 'piece',
        supplier: '',
        partNumber: '',
        usedDate: new Date().toISOString().split('T')[0],
        coordinates: { longitude: 0, latitude: 0 },
        location: ''
      }
    });
  };

  const saveNewMaterial = (ticketId: string) => {
    const material = newMaterial[ticketId];
    if (material && material.materialName) {
      const newMat: MaterialUsage = {
        id: `mat-${Date.now()}`,
        ticketId,
        materialType: material.materialType || 'closure',
        materialName: material.materialName,
        quantity: material.quantity || 1,
        unit: material.unit || 'piece',
        supplier: material.supplier || '',
        partNumber: material.partNumber || '',
        usedDate: material.usedDate || new Date().toISOString().split('T')[0],
        coordinates: material.coordinates,
        location: material.location || '',
        notes: material.notes || ''
      };

      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        const updatedMaterials = [...ticket.materialUsage, newMat];
        onUpdateTicket(ticketId, { materialUsage: updatedMaterials });
      }

      // Clear the new material form
      const updatedNewMaterial = { ...newMaterial };
      delete updatedNewMaterial[ticketId];
      setNewMaterial(updatedNewMaterial);
    }
  };

  const cancelNewMaterial = (ticketId: string) => {
    const updatedNewMaterial = { ...newMaterial };
    delete updatedNewMaterial[ticketId];
    setNewMaterial(updatedNewMaterial);
  };

  const updateNewMaterial = (ticketId: string, field: string, value: any) => {
    setNewMaterial({
      ...newMaterial,
      [ticketId]: {
        ...newMaterial[ticketId],
        [field]: value
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePDF = () => {
    // Create a new window with the content for PDF generation
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = document.getElementById('trouble-tickets-content');
      if (content) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Trouble Tickets Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .ticket { margin-bottom: 30px; border: 1px solid #ccc; padding: 15px; }
                .ticket-header { background: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                .priority { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Trouble Tickets Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
              </div>
              ${content.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (selectedTicket) {
    return (
      <TroubleTicketDetail 
        ticket={selectedTicket} 
        routes={routes.map(r => ({ id: r.id, name: r.name }))}
        onBack={() => setSelectedTicket(null)}
        onUpdate={onUpdateTicket}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trouble Ticket Management</h2>
            <p className="text-gray-600">Detailed tracking of network issues and material usage</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
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
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTickets.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 print:hidden">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
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
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>{route.name}</option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-500">
            {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>
      </div>

      {/* Tickets Content */}
      <div id="trouble-tickets-content" className="space-y-6">
        {Object.entries(ticketsByRoute).map(([routeId, routeTickets]) => {
          const isExpanded = expandedRoutes.has(routeId);
          const routeName = getRouteName(routeId);

          return (
            <div key={routeId} className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Route Header */}
              <div 
                className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors print:cursor-default print:hover:bg-white"
                onClick={() => toggleRouteExpansion(routeId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="print:hidden">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{routeName}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {routeTickets.length} tickets
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Tickets */}
              {(isExpanded || window.matchMedia('print').matches) && (
                <div className="divide-y divide-gray-100">
                  {routeTickets.map((ticket) => {
                    const StatusIcon = getStatusIcon(ticket.status);
                    const statusColor = getStatusColor(ticket.status);
                    const priorityColor = getPriorityColor(ticket.priority);
                    const repairTypeColor = getRepairTypeColor(ticket.repairType);

                    return (
                      <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors print:hover:bg-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">{ticket.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
                                {ticket.priority}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${repairTypeColor}`}>
                                {ticket.repairType}
                              </span>
                            </div>

                            <p className="text-gray-600 mb-3">{ticket.description}</p>

                            {/* Ticket Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-700">Ticket Info</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</p>
                                <p className="text-xs text-gray-600">
                                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                                </p>
                                {ticket.resolvedAt && (
                                  <p className="text-xs text-gray-600">
                                    Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>

                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-700">Duration & Cores</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDuration(ticket.totalDuration)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Cores Spliced: {ticket.coresSpliced}
                                </p>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-700">Location</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {ticket.location.address}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {ticket.problemCoordinates.latitude.toFixed(4)}, {ticket.problemCoordinates.longitude.toFixed(4)}
                                </p>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-700">Materials & Photos</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  {ticket.materialUsage.length} items
                                </p>
                                <p className="text-xs text-gray-600">
                                  {ticket.photos.length} photos
                                </p>
                              </div>
                            </div>

                            {/* Root Cause & Traffic Impact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-1">Root Cause</h5>
                                <p className="text-sm text-gray-900 bg-red-50 p-2 rounded">
                                  {ticket.rootCause}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-1">Traffic Impacted</h5>
                                <p className="text-sm text-gray-900 bg-orange-50 p-2 rounded">
                                  {ticket.trafficImpacted}
                                </p>
                              </div>
                            </div>

                            {/* Photos Preview */}
                            {ticket.photos.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <Image className="h-4 w-4 mr-1" />
                                  Photos ({ticket.photos.length})
                                </h5>
                                <div className="flex space-x-2 overflow-x-auto">
                                  {ticket.photos.slice(0, 4).map((photo) => (
                                    <div key={photo.id} className="flex-shrink-0">
                                      <img
                                        src={photo.url}
                                        alt={photo.caption}
                                        className="w-16 h-16 object-cover rounded border border-gray-200"
                                      />
                                    </div>
                                  ))}
                                  {ticket.photos.length > 4 && (
                                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                      <span className="text-xs text-gray-600">+{ticket.photos.length - 4}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="ml-4 flex flex-col items-end space-y-2 print:hidden">
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

                        {/* Material Usage Table */}
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-700 flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              Material Usage ({ticket.materialUsage.length})
                            </h5>
                            {!newMaterial[ticket.id] && (
                              <button
                                onClick={() => addNewMaterial(ticket.id)}
                                className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors print:hidden"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add Material</span>
                              </button>
                            )}
                          </div>

                          {/* New Material Form */}
                          {newMaterial[ticket.id] && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="text-sm font-medium text-blue-900">Add New Material</h6>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => saveNewMaterial(ticket.id)}
                                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                  >
                                    <Save className="h-3 w-3" />
                                    <span>Save</span>
                                  </button>
                                  <button
                                    onClick={() => cancelNewMaterial(ticket.id)}
                                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                    <span>Cancel</span>
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                                  <select
                                    value={newMaterial[ticket.id]?.materialType || 'closure'}
                                    onChange={(e) => updateNewMaterial(ticket.id, 'materialType', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="closure">Closure</option>
                                    <option value="fiber-cable">Fiber Cable</option>
                                    <option value="connector">Connector</option>
                                    <option value="splice-tray">Splice Tray</option>
                                    <option value="patch-cord">Patch Cord</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Material Name</label>
                                  <input
                                    type="text"
                                    value={newMaterial[ticket.id]?.materialName || ''}
                                    onChange={(e) => updateNewMaterial(ticket.id, 'materialName', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                    placeholder="Material name"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity & Unit</label>
                                  <div className="flex space-x-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={newMaterial[ticket.id]?.quantity || 1}
                                      onChange={(e) => updateNewMaterial(ticket.id, 'quantity', parseFloat(e.target.value) || 1)}
                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                    />
                                    <select
                                      value={newMaterial[ticket.id]?.unit || 'piece'}
                                      onChange={(e) => updateNewMaterial(ticket.id, 'unit', e.target.value)}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                    >
                                      <option value="piece">Piece</option>
                                      <option value="meter">Meter</option>
                                      <option value="roll">Roll</option>
                                      <option value="box">Box</option>
                                      <option value="set">Set</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Coordinates</label>
                                  <div className="flex space-x-1">
                                    <input
                                      type="number"
                                      step="any"
                                      value={newMaterial[ticket.id]?.coordinates?.longitude || 0}
                                      onChange={(e) => updateNewMaterial(ticket.id, 'coordinates', {
                                        ...newMaterial[ticket.id]?.coordinates,
                                        longitude: parseFloat(e.target.value) || 0
                                      })}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                      placeholder="Lon"
                                    />
                                    <input
                                      type="number"
                                      step="any"
                                      value={newMaterial[ticket.id]?.coordinates?.latitude || 0}
                                      onChange={(e) => updateNewMaterial(ticket.id, 'coordinates', {
                                        ...newMaterial[ticket.id]?.coordinates,
                                        latitude: parseFloat(e.target.value) || 0
                                      })}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                      placeholder="Lat"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                                  <input
                                    type="text"
                                    value={newMaterial[ticket.id]?.location || ''}
                                    onChange={(e) => updateNewMaterial(ticket.id, 'location', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                    placeholder="Location description"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                                  <input
                                    type="text"
                                    value={newMaterial[ticket.id]?.supplier || ''}
                                    onChange={(e) => updateNewMaterial(ticket.id, 'supplier', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                    placeholder="Supplier name"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {ticket.materialUsage.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Material
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Quantity
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Coordinates
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Location
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Supplier
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {ticket.materialUsage.map((material) => (
                                    <tr key={material.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        {editingMaterial === material.id ? (
                                          <div className="space-y-1">
                                            <input
                                              type="text"
                                              value={editingMaterialData?.materialName || ''}
                                              onChange={(e) => updateEditingMaterial('materialName', e.target.value)}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                            />
                                            <input
                                              type="text"
                                              value={editingMaterialData?.partNumber || ''}
                                              onChange={(e) => updateEditingMaterial('partNumber', e.target.value)}
                                              placeholder="Part number"
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                            />
                                          </div>
                                        ) : (
                                          <div>
                                            <div className="text-sm font-medium text-gray-900">
                                              {material.materialName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {material.partNumber}
                                            </div>
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {editingMaterial === material.id ? (
                                          <div className="flex space-x-1">
                                            <input
                                              type="number"
                                              step="0.1"
                                              value={editingMaterialData?.quantity || 1}
                                              onChange={(e) => updateEditingMaterial('quantity', parseFloat(e.target.value) || 1)}
                                              className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                            />
                                            <select
                                              value={editingMaterialData?.unit || 'piece'}
                                              onChange={(e) => updateEditingMaterial('unit', e.target.value)}
                                              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                            >
                                              <option value="piece">Piece</option>
                                              <option value="meter">Meter</option>
                                              <option value="roll">Roll</option>
                                              <option value="box">Box</option>
                                              <option value="set">Set</option>
                                            </select>
                                          </div>
                                        ) : (
                                          `${material.quantity} ${material.unit}`
                                        )}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {editingMaterial === material.id ? (
                                          <div className="space-y-1">
                                            <input
                                              type="number"
                                              step="any"
                                              value={editingMaterialData?.coordinates?.longitude || 0}
                                              onChange={(e) => updateEditingMaterial('coordinates', {
                                                ...editingMaterialData?.coordinates,
                                                longitude: parseFloat(e.target.value) || 0
                                              })}
                                              placeholder="Longitude"
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                            />
                                            <input
                                              type="number"
                                              step="any"
                                              value={editingMaterialData?.coordinates?.latitude || 0}
                                              onChange={(e) => updateEditingMaterial('coordinates', {
                                                ...editingMaterialData?.coordinates,
                                                latitude: parseFloat(e.target.value) || 0
                                              })}
                                              placeholder="Latitude"
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                            />
                                          </div>
                                        ) : (
                                          material.coordinates ? (
                                            <div className="flex items-center space-x-1">
                                              <Navigation className="h-3 w-3 text-gray-400" />
                                              <div className="text-xs">
                                                <div>{material.coordinates.longitude.toFixed(4)}</div>
                                                <div>{material.coordinates.latitude.toFixed(4)}</div>
                                              </div>
                                            </div>
                                          ) : (
                                            <span className="text-gray-400 text-xs">No coordinates</span>
                                          )
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-gray-900">
                                        {editingMaterial === material.id ? (
                                          <input
                                            type="text"
                                            value={editingMaterialData?.location || ''}
                                            onChange={(e) => updateEditingMaterial('location', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                          />
                                        ) : (
                                          <div className="max-w-xs truncate" title={material.location}>
                                            {material.location || 'No location specified'}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {editingMaterial === material.id ? (
                                          <input
                                            type="text"
                                            value={editingMaterialData?.supplier || ''}
                                            onChange={(e) => updateEditingMaterial('supplier', e.target.value)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                                          />
                                        ) : (
                                          material.supplier || 'N/A'
                                        )}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm print:hidden">
                                        <div className="flex items-center space-x-2">
                                          {editingMaterial === material.id ? (
                                            <>
                                              <button
                                                onClick={() => saveEditingMaterial(ticket.id)}
                                                className="text-green-600 hover:text-green-800"
                                              >
                                                <Save className="h-4 w-4" />
                                              </button>
                                              <button
                                                onClick={cancelEditingMaterial}
                                                className="text-gray-600 hover:text-gray-800"
                                              >
                                                <X className="h-4 w-4" />
                                              </button>
                                            </>
                                          ) : (
                                            <button
                                              onClick={() => startEditingMaterial(material)}
                                              className="text-blue-600 hover:text-blue-800"
                                            >
                                              <Edit3 className="h-4 w-4" />
                                            </button>
                                          )}
                                          <button
                                            onClick={() => deleteMaterial(ticket.id, material.id)}
                                            className="text-red-600 hover:text-red-800"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No materials used for this ticket
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trouble tickets found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Export Modal */}
      <ExportImportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mode="export"
        dataType="tickets"
        data={{ tickets, routes }}
      />

      {/* Import Modal */}
      <ExportImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        mode="import"
        dataType="tickets"
        data={{ tickets, routes }}
        onImportComplete={(importedTickets) => {
          console.log('Imported tickets:', importedTickets);
        }}
      />

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:cursor-default { cursor: default !important; }
          .print\\:hover\\:bg-white:hover { background-color: white !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}