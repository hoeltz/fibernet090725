import React, { useState } from 'react';
import { NetworkAsset, Route } from '../../types';
import { 
  Plus, Search, Filter, MapPin, Calendar, User, 
  Building2, Boxes, Zap, Link as LinkIcon, 
  Settings, Eye, Edit3, Trash2, Camera,
  CheckCircle, XCircle, AlertTriangle, Clock,
  Download, Upload, BarChart3
} from 'lucide-react';
import AssetForm from './AssetForm';
import AssetDetail from './AssetDetail';
import ExportImportModal from '../Common/ExportImportModal';

interface AssetManagementProps {
  routes: Route[];
  assets: NetworkAsset[];
  onCreateAsset: (asset: Omit<NetworkAsset, 'id'>) => void;
  onUpdateAsset: (assetId: string, updates: Partial<NetworkAsset>) => void;
  onDeleteAsset: (assetId: string) => void;
}

export default function AssetManagement({ 
  routes, 
  assets, 
  onCreateAsset, 
  onUpdateAsset, 
  onDeleteAsset 
}: AssetManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<NetworkAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<NetworkAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'handhole': return Building2;
      case 'odc': return Boxes;
      case 'pole': return Zap;
      case 'jc': return LinkIcon;
      case 'otb': return Settings;
      case 'splice-box': return Boxes;
      case 'repeater': return Settings;
      case 'terminal': return Settings;
      case 'cabinet': return Building2;
      default: return Settings;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-700 bg-green-100 border-green-200';
      case 'good': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'fair': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'poor': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'inactive': return 'text-gray-700 bg-gray-100';
      case 'maintenance': return 'text-blue-700 bg-blue-100';
      case 'decommissioned': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const calculateCompleteness = (completeness: NetworkAsset['completeness']) => {
    const total = Object.keys(completeness).length;
    const completed = Object.values(completeness).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm === '' || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesCondition = conditionFilter === 'all' || asset.condition === conditionFilter;
    const matchesRoute = routeFilter === 'all' || asset.routeId === routeFilter;
    
    return matchesSearch && matchesType && matchesCondition && matchesRoute;
  });

  const assetStats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    critical: assets.filter(a => a.condition === 'critical').length,
    needsInspection: assets.filter(a => {
      if (!a.nextInspection) return false;
      const nextDate = new Date(a.nextInspection);
      const today = new Date();
      const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 7;
    }).length
  };

  if (selectedAsset) {
    return (
      <AssetDetail
        asset={selectedAsset}
        routes={routes}
        onBack={() => setSelectedAsset(null)}
        onEdit={(asset) => {
          setEditingAsset(asset);
          setSelectedAsset(null);
        }}
        onUpdate={onUpdateAsset}
        onDelete={onDeleteAsset}
      />
    );
  }

  if (showCreateForm || editingAsset) {
    return (
      <AssetForm
        routes={routes}
        asset={editingAsset}
        onSubmit={(assetData) => {
          if (editingAsset) {
            onUpdateAsset(editingAsset.id, assetData);
          } else {
            onCreateAsset(assetData);
          }
          setShowCreateForm(false);
          setEditingAsset(null);
        }}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingAsset(null);
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
            <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
            <p className="text-gray-600">Manage network infrastructure assets and their conditions</p>
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
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Asset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{assetStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{assetStats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Maintenance</p>
              <p className="text-2xl font-bold text-blue-600">{assetStats.maintenance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Critical</p>
              <p className="text-2xl font-bold text-red-600">{assetStats.critical}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">Due Inspection</p>
              <p className="text-2xl font-bold text-orange-600">{assetStats.needsInspection}</p>
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
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="handhole">Handhole</option>
              <option value="odc">ODC</option>
              <option value="pole">Pole</option>
              <option value="jc">Joint Closure</option>
              <option value="otb">OTB</option>
              <option value="splice-box">Splice Box</option>
              <option value="repeater">Repeater</option>
              <option value="terminal">Terminal</option>
              <option value="cabinet">Cabinet</option>
            </select>
          </div>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
            <option value="critical">Critical</option>
          </select>

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

          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-gray-500">
              {filteredAssets.length} of {assets.length} assets
            </span>
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const AssetIcon = getAssetIcon(asset.type);
          const completeness = calculateCompleteness(asset.completeness);
          
          return (
            <div
              key={asset.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
              onClick={() => setSelectedAsset(asset)}
            >
              {/* Asset Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <AssetIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-500">{asset.assetNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAsset(asset);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAsset(asset);
                    }}
                    className="p-1 text-gray-400 hover:text-green-600 rounded"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Asset Type & Route */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {asset.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">Route:</span>
                  <span className="font-medium text-gray-900">
                    {getRouteName(asset.routeId)}
                  </span>
                </div>
              </div>

              {/* Status & Condition */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConditionColor(asset.condition)}`}>
                  {asset.condition}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 truncate">{asset.location.address}</span>
              </div>

              {/* Completeness Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Completeness</span>
                  <span className="font-medium text-gray-900">{completeness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      completeness >= 90 ? 'bg-green-500' :
                      completeness >= 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>

              {/* Photos Count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Camera className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {asset.photos.length} photo{asset.photos.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {asset.lastInspection ? 
                      new Date(asset.lastInspection).toLocaleDateString() : 
                      'No inspection'
                    }
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-100 pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Updated: {new Date(asset.updatedAt).toLocaleDateString()}
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

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Export Modal */}
      <ExportImportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mode="export"
        dataType="assets"
        data={{ assets, routes }}
      />

      {/* Import Modal */}
      <ExportImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        mode="import"
        dataType="assets"
        data={{ assets, routes }}
        onImportComplete={(importedAssets) => {
          console.log('Imported assets:', importedAssets);
        }}
      />
    </div>
  );
}