import React, { useState } from 'react';
import { Route, Link, MaintenanceRecord, TroubleTicket } from '../../types';
import { 
  MapPin, Calendar, Zap, Signal, AlertCircle, Settings, 
  Edit3, Save, X, Plus, Trash2, Activity, Clock, 
  CheckCircle, AlertTriangle, TrendingUp, TrendingDown,
  Wrench, TestTube, Eye, EyeOff, Filter, Building2, Download,
  Boxes, Zap as Pole, Link as JCIcon, ArrowLeft
} from 'lucide-react';
import ExportImportModal from '../Common/ExportImportModal';

interface RouteDetailsProps {
  route: Route;
  onRouteUpdate: (updatedRoute: Route) => void;
  onBack: () => void;
  maintenanceRecords: MaintenanceRecord[];
  troubleTickets: TroubleTicket[];
}

export default function RouteDetails({ 
  route, 
  onRouteUpdate, 
  onBack,
  maintenanceRecords, 
  troubleTickets 
}: RouteDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoute, setEditedRoute] = useState<Route>(route);
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'maintenance' | 'tickets' | 'analytics'>('overview');
  const [linkFilter, setLinkFilter] = useState<'all' | 'operational' | 'warning' | 'critical' | 'maintenance'>('all');
  const [newLink, setNewLink] = useState<Partial<Link> | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleSave = () => {
    onRouteUpdate(editedRoute);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRoute(route);
    setIsEditing(false);
    setNewLink(null);
    setEditingLinkId(null);
  };

  const addNewLink = () => {
    const newLinkData: Partial<Link> = {
      name: `FO-LINK-${editedRoute.name.replace(/\s+/g, '').toUpperCase()}-${String(editedRoute.links.length + 1).padStart(2, '0')}`,
      length: 0,
      totalLoss: 0,
      status: 'operational'
    };
    setNewLink(newLinkData);
  };

  const saveNewLink = () => {
    if (newLink && 
        newLink.name && 
        newLink.name.trim() !== '' &&
        newLink.length !== undefined && 
        newLink.totalLoss !== undefined &&
        newLink.status) {
      
      const linkToAdd: Link = {
        id: `link-${Date.now()}`,
        name: newLink.name.trim(),
        length: newLink.length,
        totalLoss: newLink.totalLoss,
        status: newLink.status
      };

      const updatedRoute = {
        ...editedRoute,
        links: [...editedRoute.links, linkToAdd]
      };
      
      setEditedRoute(updatedRoute);
      onRouteUpdate(updatedRoute);
      setNewLink(null);
    }
  };

  const cancelNewLink = () => {
    setNewLink(null);
  };

  const startEditingLink = (linkId: string) => {
    setEditingLinkId(linkId);
  };

  const saveEditingLink = (linkId: string) => {
    const updatedRoute = { ...editedRoute };
    onRouteUpdate(updatedRoute);
    setEditingLinkId(null);
  };

  const cancelEditingLink = () => {
    setEditedRoute(route);
    setEditingLinkId(null);
  };

  const updateLink = (linkId: string, updatedLink: Partial<Link>) => {
    setEditedRoute({
      ...editedRoute,
      links: editedRoute.links.map(link => 
        link.id === linkId ? { ...link, ...updatedLink } : link
      )
    });
  };

  const removeLink = (linkId: string) => {
    const updatedRoute = {
      ...editedRoute,
      links: editedRoute.links.filter(link => link.id !== linkId)
    };
    setEditedRoute(updatedRoute);
    onRouteUpdate(updatedRoute);
  };

  const updateAssets = (assetType: keyof typeof editedRoute.assets, value: number) => {
    setEditedRoute({
      ...editedRoute,
      assets: {
        ...editedRoute.assets,
        [assetType]: value
      }
    });
  };

  const getStatusColor = (status: Route['status'] | Link['status']) => {
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

  const getLossColor = (loss: number) => {
    if (loss <= 3) return 'text-green-600';
    if (loss <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLossStatus = (loss: number) => {
    if (loss <= 3) return 'Excellent';
    if (loss <= 5) return 'Good';
    return 'Poor';
  };

  const totalLength = editedRoute.links.reduce((sum, link) => sum + link.length, 0);
  const averageLoss = editedRoute.links.length > 0 
    ? editedRoute.links.reduce((sum, link) => sum + link.totalLoss, 0) / editedRoute.links.length 
    : 0;

  const routeMaintenanceRecords = maintenanceRecords.filter(record => record.routeId === route.id);
  const routeTroubleTickets = troubleTickets.filter(ticket => ticket.routeId === route.id);

  const filteredLinks = editedRoute.links.filter(link => 
    linkFilter === 'all' || link.status === linkFilter
  );

  const totalAssets = editedRoute.assets.handhole + editedRoute.assets.odc + editedRoute.assets.pole + editedRoute.assets.jc;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'links', label: 'Links', icon: MapPin },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'tickets', label: 'Tickets', icon: AlertCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  // Validation function for new link
  const isNewLinkValid = () => {
    return newLink && 
           newLink.name && 
           newLink.name.trim() !== '' &&
           newLink.length !== undefined && 
           newLink.length > 0 &&
           newLink.totalLoss !== undefined && 
           newLink.totalLoss >= 0;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Route Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Route Information</h3>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedRoute.name}
                onChange={(e) => setEditedRoute({ ...editedRoute, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editedRoute.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            {isEditing ? (
              <select
                value={editedRoute.status}
                onChange={(e) => setEditedRoute({ ...editedRoute, status: e.target.value as Route['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="operational">Operational</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(editedRoute.status)}`}>
                {editedRoute.status.charAt(0).toUpperCase() + editedRoute.status.slice(1)}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fiber Count</label>
            {isEditing ? (
              <input
                type="number"
                value={editedRoute.fiberCount}
                onChange={(e) => setEditedRoute({ ...editedRoute, fiberCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editedRoute.fiberCount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
            {isEditing ? (
              <input
                type="text"
                value={editedRoute.location.start}
                onChange={(e) => setEditedRoute({ 
                  ...editedRoute, 
                  location: { ...editedRoute.location, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editedRoute.location.start}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Location</label>
            {isEditing ? (
              <input
                type="text"
                value={editedRoute.location.end}
                onChange={(e) => setEditedRoute({ 
                  ...editedRoute, 
                  location: { ...editedRoute.location, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">{editedRoute.location.end}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Length</label>
            <p className="text-lg font-medium text-gray-900">{totalLength.toFixed(1)} km</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance</label>
            {isEditing ? (
              <input
                type="date"
                value={editedRoute.lastMaintenance}
                onChange={(e) => setEditedRoute({ ...editedRoute, lastMaintenance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">
                {new Date(editedRoute.lastMaintenance).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance</label>
            {isEditing ? (
              <input
                type="date"
                value={editedRoute.nextMaintenance}
                onChange={(e) => setEditedRoute({ ...editedRoute, nextMaintenance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900">
                {new Date(editedRoute.nextMaintenance).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Average Loss</label>
            <div className="flex items-center space-x-2">
              <p className={`text-lg font-medium ${getLossColor(averageLoss)}`}>
                {averageLoss.toFixed(1)} dB
              </p>
              <span className={`text-xs px-2 py-1 rounded ${
                averageLoss <= 3 ? 'bg-green-100 text-green-700' :
                averageLoss <= 5 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {getLossStatus(averageLoss)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Management Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Route Assets</h3>
            <p className="text-sm text-gray-600">Infrastructure components along the route</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
            <p className="text-sm text-gray-500">Total Assets</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Handhole</label>
            {isEditing ? (
              <input
                type="number"
                value={editedRoute.assets.handhole}
                onChange={(e) => updateAssets('handhole', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{editedRoute.assets.handhole}</p>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Boxes className="h-8 w-8 text-green-600" />
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ODC</label>
            {isEditing ? (
              <input
                type="number"
                value={editedRoute.assets.odc}
                onChange={(e) => updateAssets('odc', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{editedRoute.assets.odc}</p>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Pole className="h-8 w-8 text-orange-600" />
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pole</label>
            {isEditing ? (
              <input
                type="number"
                value={editedRoute.assets.pole}
                onChange={(e) => updateAssets('pole', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{editedRoute.assets.pole}</p>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <JCIcon className="h-8 w-8 text-purple-600" />
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">JC (Joint Closure)</label>
            {isEditing ? (
              <input
                type="number"
                value={editedRoute.assets.jc}
                onChange={(e) => updateAssets('jc', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{editedRoute.assets.jc}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Links</p>
              <p className="text-2xl font-bold text-gray-900">{editedRoute.links.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">Trouble Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{routeTroubleTickets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Wrench className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Maintenance Records</p>
              <p className="text-2xl font-bold text-gray-900">{routeMaintenanceRecords.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Signal className={`h-8 w-8 ${getLossColor(averageLoss)}`} />
            <div>
              <p className="text-sm text-gray-500">Signal Quality</p>
              <p className={`text-2xl font-bold ${getLossColor(averageLoss)}`}>
                {getLossStatus(averageLoss)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLinks = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Link Management</h3>
            <p className="text-sm text-gray-600">Manage individual fiber optic links</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={linkFilter}
                onChange={(e) => setLinkFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Links</option>
                <option value="operational">Operational</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            {!newLink && (
              <button
                onClick={addNewLink}
                className="flex items-center space-x-1 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Link</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* New Link Form */}
          {newLink && (
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-blue-900">Add New Link</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={saveNewLink}
                    disabled={!isNewLinkValid()}
                    className={`flex items-center space-x-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                      isNewLinkValid()
                        ? 'text-white bg-green-600 hover:bg-green-700 cursor-pointer'
                        : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={cancelNewLink}
                    className="flex items-center space-x-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs text-blue-700 mb-1">Link Name *</label>
                  <input
                    type="text"
                    value={newLink.name || ''}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter link name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-blue-700 mb-1">Length (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newLink.length || ''}
                    onChange={(e) => setNewLink({ ...newLink, length: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-blue-700 mb-1">OTDR Length (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newLink.otdrLength || ''}
                    onChange={(e) => setNewLink({ ...newLink, otdrLength: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-blue-700 mb-1">Total Loss (dB) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newLink.totalLoss || ''}
                    onChange={(e) => setNewLink({ ...newLink, totalLoss: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-blue-700 mb-1">Status</label>
                  <select
                    value={newLink.status || 'operational'}
                    onChange={(e) => setNewLink({ ...newLink, status: e.target.value as Link['status'] })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="operational">Operational</option>
                    <option value="warning">Warning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <span className="text-xs text-blue-700">Quality Preview</span>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (newLink.totalLoss || 0) <= 3 ? 'bg-green-100 text-green-700' :
                      (newLink.totalLoss || 0) <= 5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getLossStatus(newLink.totalLoss || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              {newLink && !isNewLinkValid() && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  <p>Please fill in all required fields:</p>
                  <ul className="list-disc list-inside mt-1">
                    {(!newLink.name || newLink.name.trim() === '') && <li>Link name is required</li>}
                    {(newLink.length === undefined || newLink.length <= 0) && <li>Length must be greater than 0</li>}
                    {(newLink.totalLoss === undefined || newLink.totalLoss < 0) && <li>Total loss must be 0 or greater</li>}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Existing Links */}
          {filteredLinks.map((link) => (
            <div key={link.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Link Name</label>
                  {editingLinkId === link.id ? (
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => updateLink(link.id, { name: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{link.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Length (km)</label>
                  {editingLinkId === link.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={link.length}
                      onChange={(e) => updateLink(link.id, { length: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{link.length}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">OTDR Length (km)</label>
                  {editingLinkId === link.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={link.otdrLength || 0}
                      onChange={(e) => updateLink(link.id, { otdrLength: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{link.otdrLength || 0}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Total Loss (dB)</label>
                  {editingLinkId === link.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={link.totalLoss}
                      onChange={(e) => updateLink(link.id, { totalLoss: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className={`font-medium ${getLossColor(link.totalLoss)}`}>{link.totalLoss}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  {editingLinkId === link.id ? (
                    <select
                      value={link.status}
                      onChange={(e) => updateLink(link.id, { status: e.target.value as Link['status'] })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="operational">Operational</option>
                      <option value="warning">Warning</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="critical">Critical</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(link.status)}`}>
                      {link.status}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Quality</label>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    link.totalLoss <= 3 ? 'bg-green-100 text-green-700' :
                    link.totalLoss <= 5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {getLossStatus(link.totalLoss)}
                  </span>
                </div>

                <div className="flex justify-end space-x-2">
                  {editingLinkId === link.id ? (
                    <>
                      <button
                        onClick={() => saveEditingLink(link.id)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEditingLink}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditingLink(link.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeLink(link.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance History</h3>
      {routeMaintenanceRecords.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No maintenance records found</p>
      ) : (
        <div className="space-y-4">
          {routeMaintenanceRecords.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{record.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Technician: {record.technician}</span>
                    <span>Date: {new Date(record.scheduledDate).toLocaleDateString()}</span>
                    <span>Priority: {record.priority}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTickets = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trouble Tickets</h3>
      {routeTroubleTickets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No trouble tickets found</p>
      ) : (
        <div className="space-y-4">
          {routeTroubleTickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Priority: {ticket.priority}</span>
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span>Assigned: {ticket.assignedTo || 'Unassigned'}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Signal Loss</span>
              <span className={`font-medium ${getLossColor(averageLoss)}`}>
                {averageLoss.toFixed(1)} dB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Route Length</span>
              <span className="font-medium text-gray-900">{totalLength.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Operational Links</span>
              <span className="font-medium text-green-600">
                {editedRoute.links.filter(l => l.status === 'operational').length}/{editedRoute.links.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Critical Issues</span>
              <span className="font-medium text-red-600">
                {editedRoute.links.filter(l => l.status === 'critical').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Assets</span>
              <span className="font-medium text-blue-600">{totalAssets}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last maintenance completed</p>
                <p className="text-xs text-gray-500">{new Date(editedRoute.lastMaintenance).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Next maintenance scheduled</p>
                <p className="text-xs text-gray-500">{new Date(editedRoute.nextMaintenance).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Open trouble tickets</p>
                <p className="text-xs text-gray-500">{routeTroubleTickets.filter(t => t.status === 'open').length} active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Routes</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{editedRoute.name}</h2>
            <p className="text-gray-600">{editedRoute.location.start} → {editedRoute.location.end}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(editedRoute.status)}`}>
            {editedRoute.status.charAt(0).toUpperCase() + editedRoute.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'links' && renderLinks()}
      {activeTab === 'maintenance' && renderMaintenance()}
      {activeTab === 'tickets' && renderTickets()}
      {activeTab === 'analytics' && renderAnalytics()}

      {/* Export Modal */}
      <ExportImportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mode="export"
        dataType="routes"
        data={{ routes: [editedRoute] }}
      />
    </div>
  );
}