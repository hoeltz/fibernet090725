import React, { useState } from 'react';
import { NetworkPatrol, PatrolFinding, CableMeasurement, Route, MaintenanceRecord } from '../../types';
import { 
  Plus, Search, Filter, Eye, Edit3, MapPin, Calendar, 
  Users, Car, Cloud, AlertTriangle, Camera, Activity,
  Download, Upload, BarChart3, Settings, CheckCircle,
  Clock, XCircle, Zap, Shield, Construction, Leaf
} from 'lucide-react';
import PatrolDetail from './PatrolDetail';
import CreatePatrolModal from './CreatePatrolModal';
import ExportImportModal from '../Common/ExportImportModal';

interface NetworkPatrolManagementProps {
  routes: Route[];
  patrols: NetworkPatrol[];
  onCreatePatrol: (patrol: Omit<NetworkPatrol, 'id'>) => void;
  onUpdatePatrol: (patrolId: string, updates: Partial<NetworkPatrol>) => void;
  onCreateMaintenance: (maintenance: Omit<MaintenanceRecord, 'id'>) => void;
}

export default function NetworkPatrolManagement({ 
  routes, 
  patrols, 
  onCreatePatrol,
  onUpdatePatrol,
  onCreateMaintenance
}: NetworkPatrolManagementProps) {
  const [selectedPatrol, setSelectedPatrol] = useState<NetworkPatrol | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPatrol, setEditingPatrol] = useState<NetworkPatrol | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return Calendar;
      case 'in-progress': return Activity;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in-progress': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const getFindingTypeIcon = (type: string) => {
    switch (type) {
      case 'third-party-activity': return Construction;
      case 'cable-exposure': return Zap;
      case 'infrastructure-damage': return AlertTriangle;
      case 'unauthorized-access': return Shield;
      case 'environmental-hazard': return Cloud;
      case 'vegetation-growth': return Leaf;
      default: return AlertTriangle;
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const filteredPatrols = patrols.filter(patrol => {
    const matchesSearch = searchTerm === '' || 
      patrol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patrol.patrolNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRouteName(patrol.routeId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patrol.status === statusFilter;
    const matchesType = typeFilter === 'all' || patrol.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const patrolStats = {
    total: patrols.length,
    planned: patrols.filter(p => p.status === 'planned').length,
    inProgress: patrols.filter(p => p.status === 'in-progress').length,
    completed: patrols.filter(p => p.status === 'completed').length,
    totalFindings: patrols.reduce((sum, p) => sum + p.findings.length, 0),
    criticalFindings: patrols.reduce((sum, p) => sum + p.findings.filter(f => f.severity === 'critical').length, 0)
  };

  if (selectedPatrol) {
    return (
      <PatrolDetail
        patrol={selectedPatrol}
        routes={routes}
        onBack={() => setSelectedPatrol(null)}
        onUpdate={onUpdatePatrol}
        onCreateMaintenance={onCreateMaintenance}
        onEdit={(patrol) => {
          setEditingPatrol(patrol);
          setSelectedPatrol(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Network Patrol Management</h2>
            <p className="text-gray-600">Monitor field activities, third-party work, and cable conditions</p>
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Patrol</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Patrols</p>
              <p className="text-2xl font-bold text-gray-900">{patrolStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Planned</p>
              <p className="text-2xl font-bold text-blue-600">{patrolStats.planned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{patrolStats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{patrolStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-500">Total Findings</p>
              <p className="text-2xl font-bold text-yellow-600">{patrolStats.totalFindings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{patrolStats.criticalFindings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patrols..."
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
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="routine">Routine</option>
            <option value="emergency">Emergency</option>
            <option value="follow-up">Follow-up</option>
            <option value="third-party-coordination">Third-party Coordination</option>
          </select>

          <div className="ml-auto text-sm text-gray-500">
            {filteredPatrols.length} of {patrols.length} patrols
          </div>
        </div>
      </div>

      {/* Patrol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatrols.map((patrol) => {
          const StatusIcon = getStatusIcon(patrol.status);
          const statusColor = getStatusColor(patrol.status);
          const priorityColor = getPriorityColor(patrol.priority);
          
          const criticalFindings = patrol.findings.filter(f => f.severity === 'critical').length;
          const highFindings = patrol.findings.filter(f => f.severity === 'high').length;
          
          return (
            <div
              key={patrol.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
              onClick={() => setSelectedPatrol(patrol)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{patrol.title}</h3>
                    <p className="text-sm text-gray-500">{patrol.patrolNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPatrol(patrol);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatrol(patrol);
                    }}
                    className="p-1 text-gray-400 hover:text-green-600 rounded"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Route & Type */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Route:</span>
                  <span className="font-medium text-gray-900">{getRouteName(patrol.routeId)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{patrol.type.replace('-', ' ')}</span>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${statusColor}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">{patrol.status.replace('-', ' ')}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
                  {patrol.priority}
                </span>
              </div>

              {/* Team & Date */}
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{patrol.patrolTeam.length} team members</span>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date(patrol.patrolDate).toLocaleDateString()}
                </span>
              </div>

              {/* Findings Summary */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Findings:</span>
                  <span className="font-medium text-gray-900">{patrol.findings.length}</span>
                </div>
                
                {patrol.findings.length > 0 && (
                  <div className="space-y-1">
                    {criticalFindings > 0 && (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-red-600">{criticalFindings} Critical</span>
                      </div>
                    )}
                    {highFindings > 0 && (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 text-orange-600" />
                        <span className="text-xs text-orange-600">{highFindings} High</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Measurements */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Measurements:</span>
                  <span className="font-medium text-gray-900">{patrol.measurements.length}</span>
                </div>
              </div>

              {/* Weather */}
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 capitalize">{patrol.weather.condition}</span>
                {patrol.weather.temperature && (
                  <span className="text-sm text-gray-500">({patrol.weather.temperature}°C)</span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {patrol.completedAt ? 
                      `Completed: ${new Date(patrol.completedAt).toLocaleDateString()}` :
                      `Created: ${new Date(patrol.createdAt).toLocaleDateString()}`
                    }
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

      {filteredPatrols.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patrols found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Create/Edit Patrol Modal */}
      {(showCreateModal || editingPatrol) && (
        <CreatePatrolModal
          routes={routes}
          patrol={editingPatrol}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPatrol(null);
          }}
          onSubmit={(patrolData) => {
            if (editingPatrol) {
              onUpdatePatrol(editingPatrol.id, patrolData);
            } else {
              onCreatePatrol(patrolData);
            }
            setShowCreateModal(false);
            setEditingPatrol(null);
          }}
        />
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
        onImportComplete={(importedData) => {
          console.log('Imported patrol data:', importedData);
        }}
      />
    </div>
  );
}