import React, { useState } from 'react';
import { NetworkAsset, Route } from '../../types';
import { 
  X, MapPin, Calendar, User, Camera, Plus, 
  Building2, Boxes, Zap, Link as LinkIcon, 
  Settings, Save, ArrowLeft, Upload, Trash2
} from 'lucide-react';

interface AssetFormProps {
  routes: Route[];
  asset?: NetworkAsset | null;
  onSubmit: (asset: Omit<NetworkAsset, 'id'>) => void;
  onCancel: () => void;
}

export default function AssetForm({ routes, asset, onSubmit, onCancel }: AssetFormProps) {
  const [formData, setFormData] = useState({
    assetNumber: asset?.assetNumber || '',
    name: asset?.name || '',
    type: asset?.type || 'handhole' as NetworkAsset['type'],
    routeId: asset?.routeId || '',
    linkId: asset?.linkId || '',
    location: {
      longitude: asset?.location.longitude || 0,
      latitude: asset?.location.latitude || 0,
      address: asset?.location.address || '',
      landmark: asset?.location.landmark || '',
      elevation: asset?.location.elevation || 0
    },
    condition: asset?.condition || 'good' as NetworkAsset['condition'],
    status: asset?.status || 'active' as NetworkAsset['status'],
    installationDate: asset?.installationDate || '',
    lastInspection: asset?.lastInspection || '',
    nextInspection: asset?.nextInspection || '',
    specifications: {
      manufacturer: asset?.specifications.manufacturer || '',
      model: asset?.specifications.model || '',
      serialNumber: asset?.specifications.serialNumber || '',
      capacity: asset?.specifications.capacity || 0,
      material: asset?.specifications.material || '',
      dimensions: {
        length: asset?.specifications.dimensions?.length || 0,
        width: asset?.specifications.dimensions?.width || 0,
        height: asset?.specifications.dimensions?.height || 0,
        depth: asset?.specifications.dimensions?.depth || 0
      },
      powerRequirement: asset?.specifications.powerRequirement || '',
      operatingTemperature: asset?.specifications.operatingTemperature || '',
      ipRating: asset?.specifications.ipRating || ''
    },
    completeness: {
      cover: asset?.completeness.cover ?? true,
      lock: asset?.completeness.lock ?? true,
      label: asset?.completeness.label ?? true,
      grounding: asset?.completeness.grounding ?? true,
      drainage: asset?.completeness.drainage ?? true,
      accessories: asset?.completeness.accessories ?? true,
      documentation: asset?.completeness.documentation ?? true
    },
    notes: asset?.notes || ''
  });

  const [photos, setPhotos] = useState(asset?.photos || []);

  const assetTypes = [
    { value: 'handhole', label: 'Handhole', icon: Building2 },
    { value: 'odc', label: 'ODC (Optical Distribution Cabinet)', icon: Boxes },
    { value: 'pole', label: 'Pole', icon: Zap },
    { value: 'jc', label: 'Joint Closure', icon: LinkIcon },
    { value: 'otb', label: 'OTB (Optical Terminal Box)', icon: Settings },
    { value: 'splice-box', label: 'Splice Box', icon: Boxes },
    { value: 'repeater', label: 'Repeater', icon: Settings },
    { value: 'terminal', label: 'Terminal', icon: Settings },
    { value: 'cabinet', label: 'Cabinet', icon: Building2 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const assetData: Omit<NetworkAsset, 'id'> = {
      ...formData,
      photos,
      maintenanceHistory: asset?.maintenanceHistory || [],
      createdAt: asset?.createdAt || now,
      updatedAt: now,
      createdBy: asset?.createdBy || 'Current User',
      lastModifiedBy: 'Current User'
    };

    onSubmit(assetData);
  };

  const addPhoto = () => {
    const newPhoto = {
      id: `photo-${Date.now()}`,
      url: 'https://images.pexels.com/photos/159306/fiber-optic-cable-fiber-glass-fiber-159306.jpeg',
      caption: 'Asset photo',
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
      type: 'installation' as const
    };
    setPhotos([...photos, newPhoto]);
  };

  const removePhoto = (photoId: string) => {
    setPhotos(photos.filter(p => p.id !== photoId));
  };

  const calculateCompleteness = () => {
    const total = Object.keys(formData.completeness).length;
    const completed = Object.values(formData.completeness).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Assets</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {asset ? 'Edit Asset' : 'Create New Asset'}
            </h2>
            <p className="text-gray-600">
              {asset ? 'Update asset information and specifications' : 'Add a new network infrastructure asset'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Completeness</p>
            <p className="text-2xl font-bold text-blue-600">{calculateCompleteness()}%</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Number *
              </label>
              <input
                type="text"
                value={formData.assetNumber}
                onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., HH-CHA-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Handhole Central Hub 01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as NetworkAsset['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {assetTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route *
              </label>
              <select
                value={formData.routeId}
                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link ID (Optional)
              </label>
              <input
                type="text"
                value={formData.linkId}
                onChange={(e) => setFormData({ ...formData, linkId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., FO-LINK-CHA-01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Installation Date *
              </label>
              <input
                type="date"
                value={formData.installationDate}
                onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Location Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                value={formData.location.longitude}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, longitude: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="106.8456"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                value={formData.location.latitude}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, latitude: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="-6.2088"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, address: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Complete address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landmark
              </label>
              <input
                type="text"
                value={formData.location.landmark}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, landmark: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nearby landmark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elevation (meters)
              </label>
              <input
                type="number"
                value={formData.location.elevation}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, elevation: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Status & Condition */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status & Condition</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as NetworkAsset['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="decommissioned">Decommissioned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as NetworkAsset['condition'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Inspection
              </label>
              <input
                type="date"
                value={formData.nextInspection}
                onChange={(e) => setFormData({ ...formData, nextInspection: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Technical Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.specifications.manufacturer}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, manufacturer: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Corning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                value={formData.specifications.model}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, model: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., HH-24F"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.specifications.serialNumber}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, serialNumber: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., SN123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={formData.specifications.capacity}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, capacity: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 24 (fibers)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                value={formData.specifications.material}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, material: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Concrete, Steel, Plastic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Rating
              </label>
              <input
                type="text"
                value={formData.specifications.ipRating}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specifications: { ...formData.specifications, ipRating: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., IP65"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Dimensions (cm)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                <input
                  type="number"
                  value={formData.specifications.dimensions.length}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { 
                      ...formData.specifications, 
                      dimensions: { ...formData.specifications.dimensions, length: parseFloat(e.target.value) || 0 }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  value={formData.specifications.dimensions.width}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { 
                      ...formData.specifications, 
                      dimensions: { ...formData.specifications.dimensions, width: parseFloat(e.target.value) || 0 }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  value={formData.specifications.dimensions.height}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { 
                      ...formData.specifications, 
                      dimensions: { ...formData.specifications.dimensions, height: parseFloat(e.target.value) || 0 }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Depth</label>
                <input
                  type="number"
                  value={formData.specifications.dimensions.depth}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specifications: { 
                      ...formData.specifications, 
                      dimensions: { ...formData.specifications.dimensions, depth: parseFloat(e.target.value) || 0 }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Completeness Checklist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Completeness Checklist</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(formData.completeness).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFormData({
                    ...formData,
                    completeness: { ...formData.completeness, [key]: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-blue-600" />
              Photos ({photos.length})
            </h3>
            <button
              type="button"
              onClick={addPhoto}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">{photo.caption}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Additional Notes</h3>
          
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes, observations, or special instructions..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{asset ? 'Update Asset' : 'Create Asset'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}