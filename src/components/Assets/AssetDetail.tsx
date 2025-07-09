import React, { useState } from 'react';
import { NetworkAsset, Route } from '../../types';
import { 
  ArrowLeft, MapPin, Calendar, User, Camera, 
  Building2, Boxes, Zap, Link as LinkIcon, 
  Settings, Edit3, Trash2, Plus, CheckCircle,
  XCircle, AlertTriangle, Clock, Activity,
  Download, Share, Eye, EyeOff
} from 'lucide-react';

interface AssetDetailProps {
  asset: NetworkAsset;
  routes: Route[];
  onBack: () => void;
  onEdit: (asset: NetworkAsset) => void;
  onUpdate: (assetId: string, updates: Partial<NetworkAsset>) => void;
  onDelete: (assetId: string) => void;
}

export default function AssetDetail({ 
  asset, 
  routes, 
  onBack, 
  onEdit, 
  onUpdate, 
  onDelete 
}: AssetDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'maintenance' | 'specifications'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const calculateCompleteness = () => {
    const total = Object.keys(asset.completeness).length;
    const completed = Object.values(asset.completeness).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const AssetIcon = getAssetIcon(asset.type);
  const completeness = calculateCompleteness();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'maintenance', label: 'Maintenance', icon: Settings },
    { id: 'specifications', label: 'Specifications', icon: Building2 }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Asset Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Number</label>
            <p className="text-lg font-medium text-gray-900">{asset.assetNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
            <p className="text-lg font-medium text-gray-900 capitalize">
              {asset.type.replace('-', ' ')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <p className="text-lg font-medium text-gray-900">{getRouteName(asset.routeId)}</p>
          </div>

          {asset.linkId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link ID</label>
              <p className="text-lg font-medium text-gray-900">{asset.linkId}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Installation Date</label>
            <p className="text-lg font-medium text-gray-900">
              {new Date(asset.installationDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Inspection</label>
            <p className="text-lg font-medium text-gray-900">
              {asset.lastInspection ? 
                new Date(asset.lastInspection).toLocaleDateString() : 
                'No inspection recorded'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          Location Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <p className="text-gray-900">{asset.location.address}</p>
          </div>

          {asset.location.landmark && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
              <p className="text-gray-900">{asset.location.landmark}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <p className="text-gray-900 font-mono">{asset.location.longitude}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <p className="text-gray-900 font-mono">{asset.location.latitude}</p>
            </div>
            {asset.location.elevation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Elevation</label>
                <p className="text-gray-900">{asset.location.elevation}m</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completeness Checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Completeness Checklist</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{completeness}%</p>
            <p className="text-sm text-gray-500">Complete</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(asset.completeness).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3">
              {value ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${value ? 'text-green-700' : 'text-red-700'}`}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                completeness >= 90 ? 'bg-green-500' :
                completeness >= 70 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      {asset.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
        </div>
      )}
    </div>
  );

  const renderPhotos = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Asset Photos ({asset.photos.length})
        </h3>
        <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Photo</span>
        </button>
      </div>

      {asset.photos.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No photos available</h3>
          <p className="text-gray-500">Add photos to document this asset</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asset.photos.map((photo) => (
            <div key={photo.id} className="group">
              <div className="relative">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-all">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <p className="font-medium text-gray-900">{photo.caption}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                  <span>{photo.uploadedBy}</span>
                  <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  photo.type === 'installation' ? 'bg-blue-100 text-blue-800' :
                  photo.type === 'maintenance' ? 'bg-green-100 text-green-800' :
                  photo.type === 'inspection' ? 'bg-yellow-100 text-yellow-800' :
                  photo.type === 'damage' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {photo.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMaintenance = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Maintenance History ({asset.maintenanceHistory.length})
        </h3>
        <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Record</span>
        </button>
      </div>

      {asset.maintenanceHistory.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records</h3>
          <p className="text-gray-500">Add maintenance records to track asset history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {asset.maintenanceHistory.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {record.type.replace('-', ' ')}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{record.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Performed by:</span>
                      <span className="ml-1 font-medium text-gray-900">{record.performedBy}</span>
                    </div>
                    {record.cost && (
                      <div>
                        <span className="text-gray-500">Cost:</span>
                        <span className="ml-1 font-medium text-gray-900">${record.cost}</span>
                      </div>
                    )}
                  </div>

                  {record.findings && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Findings:</strong> {record.findings}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSpecifications = () => (
    <div className="space-y-6">
      {/* Technical Specifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {asset.specifications.manufacturer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <p className="text-gray-900">{asset.specifications.manufacturer}</p>
            </div>
          )}

          {asset.specifications.model && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <p className="text-gray-900">{asset.specifications.model}</p>
            </div>
          )}

          {asset.specifications.serialNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <p className="text-gray-900 font-mono">{asset.specifications.serialNumber}</p>
            </div>
          )}

          {asset.specifications.capacity && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <p className="text-gray-900">{asset.specifications.capacity}</p>
            </div>
          )}

          {asset.specifications.material && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <p className="text-gray-900">{asset.specifications.material}</p>
            </div>
          )}

          {asset.specifications.ipRating && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Rating</label>
              <p className="text-gray-900">{asset.specifications.ipRating}</p>
            </div>
          )}

          {asset.specifications.powerRequirement && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Power Requirement</label>
              <p className="text-gray-900">{asset.specifications.powerRequirement}</p>
            </div>
          )}

          {asset.specifications.operatingTemperature && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operating Temperature</label>
              <p className="text-gray-900">{asset.specifications.operatingTemperature}</p>
            </div>
          )}
        </div>

        {/* Dimensions */}
        {(asset.specifications.dimensions?.length || 
          asset.specifications.dimensions?.width || 
          asset.specifications.dimensions?.height || 
          asset.specifications.dimensions?.depth) && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Dimensions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {asset.specifications.dimensions?.length && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                  <p className="text-gray-900">{asset.specifications.dimensions.length} cm</p>
                </div>
              )}
              {asset.specifications.dimensions?.width && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                  <p className="text-gray-900">{asset.specifications.dimensions.width} cm</p>
                </div>
              )}
              {asset.specifications.dimensions?.height && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <p className="text-gray-900">{asset.specifications.dimensions.height} cm</p>
                </div>
              )}
              {asset.specifications.dimensions?.depth && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depth</label>
                  <p className="text-gray-900">{asset.specifications.dimensions.depth} cm</p>
                </div>
              )}
            </div>
          </div>
        )}
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
            <span>Back to Assets</span>
          </button>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <AssetIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
              <p className="text-gray-600">{asset.assetNumber}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
                <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getConditionColor(asset.condition)}`}>
                  {asset.condition}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              onClick={() => onEdit(asset)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
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
      {activeTab === 'photos' && renderPhotos()}
      {activeTab === 'maintenance' && renderMaintenance()}
      {activeTab === 'specifications' && renderSpecifications()}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Asset</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{asset.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(asset.id);
                  setShowDeleteConfirm(false);
                  onBack();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}