import React, { useState } from 'react';
import { TroubleTicket, TroubleTicketActivity } from '../../types';
import { 
  X, MapPin, Clock, User, AlertTriangle, 
  Calendar, Activity, Settings, Wrench, Car, Shield,
  Phone, Mail, Building, Zap, Signal
} from 'lucide-react';

interface CreateTicketModalProps {
  routes: Array<{ id: string; name: string }>;
  ticket?: TroubleTicket | null;
  onClose: () => void;
  onSubmit: (ticket: Omit<TroubleTicket, 'id'>) => void;
}

export default function CreateTicketModal({ routes, ticket, onClose, onSubmit }: CreateTicketModalProps) {
  const isEditing = !!ticket;
  
  const [formData, setFormData] = useState({
    ticketNumber: ticket?.ticketNumber || 'NOC-CGK-',
    routeId: ticket?.routeId || '',
    linkId: ticket?.linkId || '',
    title: ticket?.title || '',
    description: ticket?.description || '',
    priority: ticket?.priority || 'medium' as TroubleTicket['priority'],
    category: ticket?.category || 'signal-loss' as TroubleTicket['category'],
    reportedBy: ticket?.reportedBy || '',
    reporterContact: '',
    reporterEmail: '',
    personHandling: ticket?.personHandling || '',
    customerAffected: '',
    serviceImpact: '',
    impact: ticket?.impact || 'medium' as TroubleTicket['impact'],
    location: {
      longitude: ticket?.location.longitude || 0,
      latitude: ticket?.location.latitude || 0,
      address: ticket?.location.address || '',
      landmark: ticket?.location.landmark || ''
    },
    slaTarget: ticket?.slaTarget || 4,
    estimatedResolution: ticket?.estimatedResolution || '',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    businessImpact: '',
    rootCause: ticket?.rootCause || '',
    temporaryWorkaround: '',
    repairType: ticket?.repairType || 'permanent' as 'permanent' | 'temporary',
    coresSpliced: ticket?.coresSpliced || 0,
    problemCoordinates: {
      longitude: ticket?.problemCoordinates?.longitude || 0,
      latitude: ticket?.problemCoordinates?.latitude || 0
    },
    trafficImpacted: ticket?.trafficImpacted || ''
  });

  const [activities, setActivities] = useState<Array<{
    type: TroubleTicketActivity['type'];
    description: string;
    duration: number;
    performedBy: string;
  }>>([]);

  // Initialize activities for editing
  React.useEffect(() => {
    if (ticket && ticket.activities) {
      const editableActivities = ticket.activities
        .filter(activity => activity.type !== 'created') // Exclude system-generated activities
        .map(activity => ({
          type: activity.type,
          description: activity.description,
          duration: activity.duration || 0,
          performedBy: activity.performedBy
        }));
      setActivities(editableActivities);
    }
  }, [ticket]);

  const activityTypes = [
    { value: 'prepare', label: 'Prepare', icon: Settings, description: 'Equipment preparation and briefing' },
    { value: 'initial-measurement', label: 'Initial Measurement', icon: Activity, description: 'Initial diagnostics and testing' },
    { value: 'travel', label: 'Travel', icon: Car, description: 'Travel to incident location' },
    { value: 'handling', label: 'Ticket Handling', icon: Wrench, description: 'Main troubleshooting and repair work' },
    { value: 'securing', label: 'Securing', icon: Shield, description: 'Site securing and final verification' }
  ];

  const addActivity = () => {
    setActivities([...activities, {
      type: 'prepare',
      description: '',
      duration: 0,
      performedBy: formData.personHandling || ''
    }]);
  };

  const updateActivity = (index: number, field: string, value: any) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    // Create activities array
    const ticketActivities: TroubleTicketActivity[] = [];
    
    // Add creation activity only for new tickets
    if (!isEditing) {
      ticketActivities.push({
        id: `activity-${Date.now()}`,
        ticketId: '', // Will be set when ticket is created
        type: 'created',
        description: isEditing ? 'Ticket updated' : 'Ticket created',
        performedBy: formData.reportedBy,
        timestamp: now
      });
    } else {
      // For editing, preserve existing activities and add new ones
      ticketActivities.push(...(ticket?.activities || []));
    }
    
    // Add new activities
    activities.forEach((activity, index) => {
      ticketActivities.push({
        id: `activity-${Date.now()}-${index}`,
        ticketId: '', // Will be set when ticket is created
        type: activity.type,
        description: activity.description,
        performedBy: activity.performedBy,
        timestamp: now,
        duration: activity.duration
      });
    });

    const ticketData: Omit<TroubleTicket, 'id'> = {
      ticketNumber: formData.ticketNumber,
      routeId: formData.routeId,
      linkId: formData.linkId || undefined,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: isEditing ? (ticket?.status || 'open') : 'open',
      category: formData.category,
      reportedBy: formData.reportedBy,
      personHandling: formData.personHandling,
      createdAt: isEditing ? (ticket?.createdAt || now) : now,
      updatedAt: now,
      resolvedAt: ticket?.resolvedAt,
      closedAt: ticket?.closedAt,
      estimatedResolution: formData.estimatedResolution,
      impact: formData.impact,
      location: formData.location,
      activities: ticketActivities,
      slaTarget: formData.slaTarget,
      slaStatus: ticket?.slaStatus || 'within',
      repairType: formData.repairType,
      coresSpliced: formData.coresSpliced,
      problemCoordinates: formData.problemCoordinates,
      rootCause: formData.rootCause,
      trafficImpacted: formData.trafficImpacted,
      photos: ticket?.photos || [],
      materialUsage: ticket?.materialUsage || [],
      totalDuration: ticket?.totalDuration
    };

    onSubmit(ticketData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Trouble Ticket' : 'Create New Trouble Ticket'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing 
                ? 'Update the ticket information and add new activities' 
                : 'Fill in the details to create a new network incident ticket'
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
          {/* Ticket Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
              Ticket Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Number *
                </label>
                <input
                  type="text"
                  value={formData.ticketNumber}
                  onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NOC-CGK-YYYYMMDD-XXX"
                  disabled={isEditing}
                  required
                />
                {!isEditing && (
                  <p className="text-xs text-gray-500 mt-1">Complete the ticket number after NOC-CGK- prefix</p>
                )}
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
                  Affected Link ID
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
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TroubleTicket['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="signal-loss">Signal Loss</option>
                  <option value="fiber-cut">Fiber Cut</option>
                  <option value="equipment-failure">Equipment Failure</option>
                  <option value="performance-degraded">Performance Degraded</option>
                  <option value="power-outage">Power Outage</option>
                  <option value="environmental">Environmental</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TroubleTicket['priority'] })}
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
                  Urgency Level *
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="low">Low - Can wait</option>
                  <option value="medium">Medium - Normal response</option>
                  <option value="high">High - Urgent response needed</option>
                  <option value="critical">Critical - Immediate response</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repair Type *
                </label>
                <select
                  value={formData.repairType}
                  onChange={(e) => setFormData({ ...formData, repairType: e.target.value as 'permanent' | 'temporary' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="permanent">Permanent</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cores Spliced
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.coresSpliced}
                  onChange={(e) => setFormData({ ...formData, coresSpliced: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief, clear description of the issue"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed description of the issue, symptoms, and any error messages"
                required
              />
            </div>
          </div>

          {/* Reporter & Contact Information */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Reporter & Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reported By *
                </label>
                <input
                  type="text"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full name of person reporting"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.reporterContact}
                  onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+62 xxx xxxx xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.reporterEmail}
                  onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="reporter@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Technician
                </label>
                <input
                  type="text"
                  value={formData.personHandling}
                  onChange={(e) => setFormData({ ...formData, personHandling: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Technician name"
                />
              </div>
            </div>
          </div>

          {/* Impact & Business Information */}
          <div className="bg-orange-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-orange-600" />
              Impact & Business Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer/Service Affected
                </label>
                <input
                  type="text"
                  value={formData.customerAffected}
                  onChange={(e) => setFormData({ ...formData, customerAffected: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Customer name or service affected"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact Level *
                </label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value as TroubleTicket['impact'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="low">Low - Minimal impact</option>
                  <option value="medium">Medium - Some services affected</option>
                  <option value="high">High - Major services affected</option>
                  <option value="critical">Critical - Complete service outage</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Impact Description
                </label>
                <textarea
                  value={formData.serviceImpact}
                  onChange={(e) => setFormData({ ...formData, serviceImpact: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe how services are affected (e.g., internet down, slow connection, etc.)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Impact
                </label>
                <textarea
                  value={formData.businessImpact}
                  onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe business impact (revenue loss, productivity impact, etc.)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traffic Impacted
                </label>
                <textarea
                  value={formData.trafficImpacted}
                  onChange={(e) => setFormData({ ...formData, trafficImpacted: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe which traffic/services are impacted"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.problemCoordinates.longitude}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    problemCoordinates: { ...formData.problemCoordinates, longitude: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="106.8456"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.problemCoordinates.latitude}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    problemCoordinates: { ...formData.problemCoordinates, latitude: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="-6.2088"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Complete address of the issue location"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark/Reference Point
                </label>
                <input
                  type="text"
                  value={formData.location.landmark}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, landmark: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nearby landmark, building, or reference point"
                />
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              Technical Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SLA Target (hours) *
                </label>
                <select
                  value={formData.slaTarget}
                  onChange={(e) => setFormData({ ...formData, slaTarget: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={1}>1 hour - Critical</option>
                  <option value={2}>2 hours - High Priority</option>
                  <option value={4}>4 hours - Standard</option>
                  <option value={8}>8 hours - Normal</option>
                  <option value={24}>24 hours - Low Priority</option>
                  <option value={72}>72 hours - Planned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Resolution
                </label>
                <input
                  type="datetime-local"
                  value={formData.estimatedResolution}
                  onChange={(e) => setFormData({ ...formData, estimatedResolution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suspected Root Cause
                </label>
                <textarea
                  value={formData.rootCause}
                  onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Initial assessment of what might be causing the issue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temporary Workaround
                </label>
                <textarea
                  value={formData.temporaryWorkaround}
                  onChange={(e) => setFormData({ ...formData, temporaryWorkaround: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any temporary solutions or workarounds implemented"
                />
              </div>
            </div>
          </div>

          {/* Planned Activities */}
          <div className="bg-indigo-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                {isEditing ? 'Add New Activities' : 'Planned Resolution Activities'}
              </h3>
              <button
                type="button"
                onClick={addActivity}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Add Activity</span>
              </button>
            </div>

            <div className="space-y-4">
              {activities.map((activity, index) => {
                const activityType = activityTypes.find(t => t.value === activity.type);
                return (
                  <div key={index} className="bg-white rounded-lg border border-indigo-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Activity Type</label>
                        <select
                          value={activity.type}
                          onChange={(e) => updateActivity(index, 'type', e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                        >
                          {activityTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={activity.description}
                          onChange={(e) => updateActivity(index, 'description', e.target.value)}
                          placeholder={activityType?.description || "Activity description"}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Duration (min)</label>
                        <input
                          type="number"
                          min="0"
                          value={activity.duration}
                          onChange={(e) => updateActivity(index, 'duration', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Performed By</label>
                        <input
                          type="text"
                          value={activity.performedBy}
                          onChange={(e) => updateActivity(index, 'performedBy', e.target.value)}
                          placeholder="Technician name"
                          className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeActivity(index)}
                          className="w-full px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {isEditing 
                      ? 'No new activities to add. Click "Add Activity" to add new resolution steps.' 
                      : 'No activities planned yet. Click "Add Activity" to start planning resolution steps.'
                    }
                  </p>
                </div>
              )}
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{isEditing ? 'Update Ticket' : 'Create Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}