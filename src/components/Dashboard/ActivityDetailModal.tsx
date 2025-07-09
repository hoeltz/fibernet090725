import React, { useState } from 'react';
import { 
  X, Calendar, Clock, User, MapPin, Wrench, AlertTriangle,
  Settings, Car, Shield, Activity, Save, Edit3, Trash2,
  Plus, Minus, CheckCircle, PlayCircle, XCircle
} from 'lucide-react';

interface TimelineActivity {
  id: string;
  type: 'maintenance' | 'patrol' | 'trouble';
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'scheduled' | 'cancelled';
  date: Date;
  routeId: string;
  technician: string;
  duration: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  equipment?: string[];
  notes?: string;
}

interface ActivityDetailModalProps {
  activity: TimelineActivity | null;
  routes: Array<{ id: string; name: string }>;
  isCreate: boolean;
  onClose: () => void;
  onCreate: (activity: Omit<TimelineActivity, 'id'>) => void;
  onUpdate: (activityId: string, updates: Partial<TimelineActivity>) => void;
  onDelete: (activityId: string) => void;
}

export default function ActivityDetailModal({
  activity,
  routes,
  isCreate,
  onClose,
  onCreate,
  onUpdate,
  onDelete
}: ActivityDetailModalProps) {
  const [isEditing, setIsEditing] = useState(isCreate);
  const [formData, setFormData] = useState<Omit<TimelineActivity, 'id'>>({
    type: activity?.type || 'maintenance',
    title: activity?.title || '',
    description: activity?.description || '',
    status: activity?.status || 'scheduled',
    date: activity?.date || new Date(),
    routeId: activity?.routeId || '',
    technician: activity?.technician || '',
    duration: activity?.duration || 1,
    priority: activity?.priority || 'medium',
    location: activity?.location || '',
    equipment: activity?.equipment || [],
    notes: activity?.notes || ''
  });
  const [newEquipment, setNewEquipment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return Wrench;
      case 'patrol': return MapPin;
      case 'trouble': return AlertTriangle;
      default: return Activity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return PlayCircle;
      case 'scheduled': return Calendar;
      case 'cancelled': return XCircle;
      default: return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'text-blue-600 bg-blue-50';
      case 'patrol': return 'text-green-600 bg-green-50';
      case 'trouble': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'scheduled': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const validateForm = () => {
    return formData.title.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.routeId !== '' && 
           formData.technician.trim() !== '' &&
           formData.duration > 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    if (isCreate) {
      onCreate(formData);
      onClose();
    } else if (activity) {
      onUpdate(activity.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (isCreate) {
      onClose();
    } else {
      setIsEditing(false);
      if (activity) {
        setFormData({
          type: activity.type,
          title: activity.title,
          description: activity.description,
          status: activity.status,
          date: activity.date,
          routeId: activity.routeId,
          technician: activity.technician,
          duration: activity.duration,
          priority: activity.priority || 'medium',
          location: activity.location || '',
          equipment: activity.equipment || [],
          notes: activity.notes || ''
        });
      }
    }
  };

  const handleDelete = () => {
    if (activity) {
      onDelete(activity.id);
      onClose();
    }
  };

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setFormData({
        ...formData,
        equipment: [...(formData.equipment || []), newEquipment.trim()]
      });
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData({
      ...formData,
      equipment: formData.equipment?.filter((_, i) => i !== index) || []
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const TypeIcon = getTypeIcon(formData.type);
  const StatusIcon = getStatusIcon(formData.status);
  const typeColor = getTypeColor(formData.type);
  const statusColor = getStatusColor(formData.status);
  const priorityColor = getPriorityColor(formData.priority || 'medium');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${typeColor}`}>
              <TypeIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isCreate ? 'Create New Activity' : 'Activity Details'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isCreate ? 'Add a new maintenance, patrol, or trouble activity' : 'View and manage activity information'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isCreate && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="patrol">Patrol</option>
                    <option value="trouble">Trouble</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-900 capitalize">{formData.type}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border ${statusColor}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm font-medium capitalize">{formData.status.replace('-', ' ')}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                {isEditing ? (
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColor}`}>
                    {formData.priority}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
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
                ) : (
                  <span className="text-gray-900">
                    {routes.find(r => r.id === formData.routeId)?.name || 'Unknown Route'}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Activity title"
                  required
                />
              ) : (
                <p className="text-lg font-medium text-gray-900">{formData.title}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of the activity"
                  required
                />
              ) : (
                <p className="text-gray-700">{formData.description}</p>
              )}
            </div>
          </div>

          {/* Schedule & Personnel */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Personnel</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={formatDateForInput(formData.date)}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{formData.date.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours) <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{formData.duration} hours</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technician <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Assigned technician"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{formData.technician}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location & Equipment */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Equipment</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Specific location or address"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{formData.location || 'Not specified'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add equipment item"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                    />
                    <button
                      type="button"
                      onClick={addEquipment}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.equipment?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-gray-900">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeEquipment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.equipment && formData.equipment.length > 0 ? (
                    formData.equipment.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{item}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">No equipment specified</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes, observations, or special instructions..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.notes || 'No additional notes'}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!validateForm()}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  validateForm() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{isCreate ? 'Create Activity' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Activity</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this activity? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Activity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}