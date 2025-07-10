import React, { useState } from 'react';
import { NetworkPatrol, PatrolFinding, CableMeasurement, Route } from '../../types';
import { 
  X, MapPin, Calendar, Users, Car, Cloud, Plus, 
  Trash2, Save, AlertTriangle, Camera, BarChart3,
  Construction, Zap, Shield, Leaf, Settings
} from 'lucide-react';

interface CreatePatrolModalProps {
  routes: Route[];
  patrol?: NetworkPatrol | null;
  onClose: () => void;
  onSubmit: (patrol: Omit<NetworkPatrol, 'id'>) => void;
}

export default function CreatePatrolModal({ routes, patrol, onClose, onSubmit }: CreatePatrolModalProps) {
  const isEditing = !!patrol;
  
  const [formData, setFormData] = useState({
    patrolNumber: patrol?.patrolNumber || `PATROL-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-`,
    routeId: patrol?.routeId || '',
    type: patrol?.type || 'routine' as NetworkPatrol['type'],
    status: patrol?.status || 'planned' as NetworkPatrol['status'],
    priority: patrol?.priority || 'medium' as NetworkPatrol['priority'],
    title: patrol?.title || '',
    description: patrol?.description || '',
    patrolDate: patrol?.patrolDate || new Date().toISOString().split('T')[0],
    startTime: patrol?.startTime || '08:00',
    endTime: patrol?.endTime || '',
    patrolTeam: patrol?.patrolTeam || [''],
    vehicleInfo: {
      plateNumber: patrol?.vehicleInfo?.plateNumber || '',
      type: patrol?.vehicleInfo?.type || ''
    },
    weather: {
      condition: patrol?.weather.condition || 'sunny' as const,
      temperature: patrol?.weather.temperature || 25,
      notes: patrol?.weather.notes || ''
    },
    summary: patrol?.summary || '',
    recommendations: patrol?.recommendations || '',
    nextPatrolDate: patrol?.nextPatrolDate || ''
  });

  const [findings, setFindings] = useState<Omit<PatrolFinding, 'id' | 'patrolId'>[]>(
    patrol?.findings.map(f => ({
      type: f.type,
      severity: f.severity,
      title: f.title,
      description: f.description,
      location: f.location,
      photos: f.photos,
      measurements: f.measurements,
      thirdPartyDetails: f.thirdPartyDetails,
      actionRequired: f.actionRequired,
      status: f.status,
      assignedTo: f.assignedTo,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      resolvedAt: f.resolvedAt,
      maintenanceTicketId: f.maintenanceTicketId
    })) || []
  );

  const [measurements, setMeasurements] = useState<Omit<CableMeasurement, 'id' | 'patrolId'>[]>(
    patrol?.measurements.map(m => ({
      routeId: m.routeId,
      linkId: m.linkId,
      measurementType: m.measurementType,
      location: m.location,
      results: m.results,
      equipment: m.equipment,
      performedBy: m.performedBy,
      timestamp: m.timestamp,
      attachments: m.attachments
    })) || []
  );

  const addTeamMember = () => {
    setFormData({
      ...formData,
      patrolTeam: [...formData.patrolTeam, '']
    });
  };

  const updateTeamMember = (index: number, value: string) => {
    const updatedTeam = [...formData.patrolTeam];
    updatedTeam[index] = value;
    setFormData({
      ...formData,
      patrolTeam: updatedTeam
    });
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      patrolTeam: formData.patrolTeam.filter((_, i) => i !== index)
    });
  };

  const addFinding = () => {
    const newFinding: Omit<PatrolFinding, 'id' | 'patrolId'> = {
      type: 'other',
      severity: 'medium',
      title: '',
      description: '',
      location: {
        longitude: 0,
        latitude: 0,
        address: ''
      },
      photos: [],
      actionRequired: 'monitoring',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFindings([...findings, newFinding]);
  };

  const updateFinding = (index: number, field: string, value: any) => {
    const updatedFindings = [...findings];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedFindings[index] = {
        ...updatedFindings[index],
        [parent]: {
          ...updatedFindings[index][parent as keyof typeof updatedFindings[index]],
          [child]: value
        }
      };
    } else {
      updatedFindings[index] = {
        ...updatedFindings[index],
        [field]: value
      };
    }
    setFindings(updatedFindings);
  };

  const removeFinding = (index: number) => {
    setFindings(findings.filter((_, i) => i !== index));
  };

  const addMeasurement = () => {
    const newMeasurement: Omit<CableMeasurement, 'id' | 'patrolId'> = {
      routeId: formData.routeId,
      measurementType: 'otdr',
      location: {
        longitude: 0,
        latitude: 0,
        address: ''
      },
      results: {
        fiberCondition: 'good'
      },
      equipment: {
        deviceModel: '',
        serialNumber: '',
        calibrationDate: ''
      },
      performedBy: '',
      timestamp: new Date().toISOString(),
      attachments: []
    };
    setMeasurements([...measurements, newMeasurement]);
  };

  const updateMeasurement = (index: number, field: string, value: any) => {
    const updatedMeasurements = [...measurements];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedMeasurements[index] = {
        ...updatedMeasurements[index],
        [parent]: {
          ...updatedMeasurements[index][parent as keyof typeof updatedMeasurements[index]],
          [child]: value
        }
      };
    } else {
      updatedMeasurements[index] = {
        ...updatedMeasurements[index],
        [field]: value
      };
    }
    setMeasurements(updatedMeasurements);
  };

  const removeMeasurement = (index: number) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    const patrolData: Omit<NetworkPatrol, 'id'> = {
      ...formData,
      patrolTeam: formData.patrolTeam.filter(member => member.trim() !== ''),
      findings: findings.map((finding, index) => ({
        ...finding,
        id: `finding-${Date.now()}-${index}`,
        patrolId: '', // Will be set when patrol is created
        updatedAt: now
      })),
      measurements: measurements.map((measurement, index) => ({
        ...measurement,
        id: `measurement-${Date.now()}-${index}`,
        patrolId: '' // Will be set when patrol is created
      })),
      createdBy: 'Current User',
      createdAt: patrol?.createdAt || now,
      updatedAt: now,
      completedAt: formData.status === 'completed' ? now : patrol?.completedAt
    };

    onSubmit(patrolData);
  };

  const validateForm = () => {
    return formData.title.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.routeId !== '' &&
           formData.patrolTeam.some(member => member.trim() !== '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Network Patrol' : 'Create New Network Patrol'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing 
                ? 'Update patrol information and findings' 
                : 'Plan and document network patrol activities'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patrol Number *
                </label>
                <input
                  type="text"
                  value={formData.patrolNumber}
                  onChange={(e) => setFormData({ ...formData, patrolNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PATROL-YYYYMMDD-XXX"
                  disabled={isEditing}
                  required
                />
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
                  Patrol Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as NetworkPatrol['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="routine">Routine</option>
                  <option value="emergency">Emergency</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="third-party-coordination">Third-party Coordination</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as NetworkPatrol['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as NetworkPatrol['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patrol Date *
                </label>
                <input
                  type="date"
                  value={formData.patrolDate}
                  onChange={(e) => setFormData({ ...formData, patrolDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Patrol title"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed description of patrol objectives"
                required
              />
            </div>
          </div>

          {/* Team & Vehicle Information */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Team & Vehicle Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Patrol Team *
                  </label>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Member</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.patrolTeam.map((member, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => updateTeamMember(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Team member name"
                      />
                      {formData.patrolTeam.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Information
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.vehicleInfo.plateNumber}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      vehicleInfo: { ...formData.vehicleInfo, plateNumber: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Vehicle plate number"
                  />
                  <input
                    type="text"
                    value={formData.vehicleInfo.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      vehicleInfo: { ...formData.vehicleInfo, type: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Vehicle type (e.g., Pickup, Van)"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Cloud className="h-5 w-5 mr-2 text-green-600" />
              Weather Conditions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weather Condition *
                </label>
                <select
                  value={formData.weather.condition}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    weather: { ...formData.weather, condition: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="sunny">Sunny</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="rainy">Rainy</option>
                  <option value="stormy">Stormy</option>
                  <option value="foggy">Foggy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  value={formData.weather.temperature}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    weather: { ...formData.weather, temperature: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weather Notes
                </label>
                <input
                  type="text"
                  value={formData.weather.notes}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    weather: { ...formData.weather, notes: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional weather notes"
                />
              </div>
            </div>
          </div>

          {/* Summary & Recommendations */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary & Recommendations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patrol Summary
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Summary of patrol activities and observations"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Recommendations for future actions"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Patrol Date
              </label>
              <input
                type="date"
                value={formData.nextPatrolDate}
                onChange={(e) => setFormData({ ...formData, nextPatrolDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validateForm()}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                validateForm() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Update Patrol' : 'Create Patrol'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}