import React, { useState } from 'react';
import { TroubleTicket, TroubleTicketActivity } from '../../types';
import { 
  ArrowLeft, Calendar, User, Clock, AlertTriangle, 
  MapPin, Activity, CheckCircle, MessageSquare, 
  Wrench, TestTube, UserPlus, TrendingUp, Edit3,
  Save, X, Plus, Settings, Car, Shield, Timer,
  Target, BarChart3, Zap, Signal, Trash2, Send,
  Mail, MessageCircle, FileText, Download
} from 'lucide-react';

interface TroubleTicketDetailProps {
  ticket: TroubleTicket;
  routes: Array<{ id: string; name: string }>;
  onBack: () => void;
  onUpdate?: (ticketId: string, updates: Partial<TroubleTicket>) => void;
}

export default function TroubleTicketDetail({ ticket, routes, onBack, onUpdate }: TroubleTicketDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<TroubleTicket>(ticket);
  const [newActivity, setNewActivity] = useState<Partial<TroubleTicketActivity> | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'whatsapp' | 'email'>('email');
  const [reportRecipient, setReportRecipient] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return AlertTriangle;
      case 'assigned':
        return UserPlus;
      case 'status-changed':
        return TrendingUp;
      case 'comment':
        return MessageSquare;
      case 'resolved':
        return CheckCircle;
      case 'escalated':
        return TrendingUp;
      case 'field-work':
        return Wrench;
      case 'testing':
        return TestTube;
      case 'prepare':
        return Settings;
      case 'initial-measurement':
        return Activity;
      case 'travel':
        return Car;
      case 'handling':
        return Wrench;
      case 'securing':
        return Shield;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'text-blue-600 bg-blue-50';
      case 'assigned':
        return 'text-purple-600 bg-purple-50';
      case 'status-changed':
        return 'text-orange-600 bg-orange-50';
      case 'comment':
        return 'text-gray-600 bg-gray-50';
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'escalated':
        return 'text-red-600 bg-red-50';
      case 'field-work':
        return 'text-yellow-600 bg-yellow-50';
      case 'testing':
        return 'text-indigo-600 bg-indigo-50';
      case 'prepare':
        return 'text-blue-600 bg-blue-50';
      case 'initial-measurement':
        return 'text-green-600 bg-green-50';
      case 'travel':
        return 'text-orange-600 bg-orange-50';
      case 'handling':
        return 'text-red-600 bg-red-50';
      case 'securing':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-green-700 bg-green-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'critical':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'closed':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateTotalDuration = () => {
    const start = new Date(editedTicket.createdAt);
    const end = editedTicket.closedAt ? new Date(editedTicket.closedAt) : new Date();
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // in minutes
  };

  const calculateActivityDuration = () => {
    return editedTicket.activities.reduce((total, activity) => {
      return total + (activity.duration || 0);
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSLAStatus = () => {
    if (!editedTicket.slaTarget) return null;
    
    const duration = calculateTotalDuration();
    const slaMinutes = editedTicket.slaTarget * 60;
    
    if (duration >= slaMinutes) return 'breached';
    if (duration >= slaMinutes * 0.8) return 'approaching';
    return 'within';
  };

  const getSLAColor = (status: string | null) => {
    switch (status) {
      case 'breached': return 'text-red-600 bg-red-100 border-red-200';
      case 'approaching': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'within': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleSave = () => {
    // Auto-update timestamps based on status
    const updates: Partial<TroubleTicket> = {
      ...editedTicket,
      updatedAt: new Date().toISOString()
    };

    if (editedTicket.status === 'resolved' && !editedTicket.resolvedAt) {
      updates.resolvedAt = new Date().toISOString();
    }

    if (editedTicket.status === 'closed' && !editedTicket.closedAt) {
      updates.closedAt = new Date().toISOString();
      updates.totalDuration = calculateTotalDuration();
    }

    if (onUpdate) {
      onUpdate(editedTicket.id, updates);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTicket(ticket);
    setIsEditing(false);
    setNewActivity(null);
    setEditingActivityId(null);
  };

  const addActivity = () => {
    setNewActivity({
      type: 'comment',
      description: '',
      performedBy: editedTicket.personHandling || '',
      duration: 0
    });
  };

  const saveActivity = () => {
    if (newActivity && newActivity.description && newActivity.description.trim() !== '') {
      const activity: TroubleTicketActivity = {
        id: `activity-${Date.now()}`,
        ticketId: editedTicket.id,
        type: newActivity.type || 'comment',
        description: newActivity.description.trim(),
        performedBy: newActivity.performedBy || '',
        timestamp: new Date().toISOString(),
        duration: newActivity.duration || 0
      };

      const updatedTicket = {
        ...editedTicket,
        activities: [...editedTicket.activities, activity],
        updatedAt: new Date().toISOString()
      };

      setEditedTicket(updatedTicket);
      if (onUpdate) {
        onUpdate(editedTicket.id, updatedTicket);
      }
      setNewActivity(null);
    }
  };

  const cancelNewActivity = () => {
    setNewActivity(null);
  };

  const startEditingActivity = (activityId: string) => {
    setEditingActivityId(activityId);
  };

  const saveEditingActivity = (activityId: string) => {
    const updatedTicket = {
      ...editedTicket,
      updatedAt: new Date().toISOString()
    };

    setEditedTicket(updatedTicket);
    if (onUpdate) {
      onUpdate(editedTicket.id, updatedTicket);
    }
    setEditingActivityId(null);
  };

  const cancelEditingActivity = () => {
    setEditedTicket(ticket);
    setEditingActivityId(null);
  };

  const generateOutageReport = () => {
    const routeName = getRouteName(editedTicket.routeId);
    const duration = formatDuration(calculateTotalDuration());
    const activityDuration = formatDuration(calculateActivityDuration());
    
    const activitiesWithResults = editedTicket.activities
      .filter(activity => activity.type !== 'created')
      .map(activity => {
        const activityResult = activity.details?.testResults || activity.details?.newValue || 'Completed successfully';
        return `${activity.type.replace('-', ' ').toUpperCase()}: ${activity.description}\nResult: ${activityResult}\nDuration: ${activity.duration || 0} minutes\nPerformed by: ${activity.performedBy}\n`;
      }).join('\n');

    return `REASON FOR OUTAGE REPORT

Ticket Number: ${editedTicket.ticketNumber}
Route: ${routeName}
Title: ${editedTicket.title}
Priority: ${editedTicket.priority.toUpperCase()}
Status: ${editedTicket.status.toUpperCase()}

INCIDENT DETAILS:
Description: ${editedTicket.description}
Root Cause: ${editedTicket.rootCause}
Traffic Impacted: ${editedTicket.trafficImpacted}
Location: ${editedTicket.location.address}
Coordinates: ${editedTicket.problemCoordinates.latitude}, ${editedTicket.problemCoordinates.longitude}

TIMELINE & ACTIVITIES:
Created: ${new Date(editedTicket.createdAt).toLocaleString()}
${editedTicket.resolvedAt ? `Resolved: ${new Date(editedTicket.resolvedAt).toLocaleString()}` : 'Status: In Progress'}
Total Duration: ${duration}
Work Duration: ${activityDuration}
Cores Spliced: ${editedTicket.coresSpliced}
Repair Type: ${editedTicket.repairType.toUpperCase()}

DETAILED ACTIVITIES:
${activitiesWithResults}

MATERIALS USED:
${editedTicket.materialUsage.map(material => 
  `- ${material.materialName} (${material.quantity} ${material.unit}) - ${material.location || 'N/A'}`
).join('\n') || 'No materials used'}

PERSONNEL:
Reported by: ${editedTicket.reportedBy}
Handled by: ${editedTicket.personHandling || 'N/A'}
Assigned to: ${editedTicket.assignedTo || 'N/A'}

SLA STATUS: ${editedTicket.slaStatus?.toUpperCase() || 'N/A'}
SLA Target: ${editedTicket.slaTarget || 'N/A'} hours

Report generated on: ${new Date().toLocaleString()}

---
FiberNet Network Operations Center
`;
  };

  const handleSendReport = () => {
    const report = generateOutageReport();
    
    if (reportType === 'whatsapp') {
      // Format phone number (remove non-digits and add country code if needed)
      let phoneNumber = reportRecipient.replace(/\D/g, '');
      if (!phoneNumber.startsWith('62') && phoneNumber.startsWith('0')) {
        phoneNumber = '62' + phoneNumber.substring(1);
      }
      
      const whatsappMessage = encodeURIComponent(reportMessage + '\n\n' + report);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      // Email
      const subject = encodeURIComponent(`Reason For Outage Report - ${editedTicket.ticketNumber}`);
      const body = encodeURIComponent(reportMessage + '\n\n' + report);
      const mailtoUrl = `mailto:${reportRecipient}?subject=${subject}&body=${body}`;
      window.open(mailtoUrl);
    }
    
    setShowReportModal(false);
    setReportRecipient('');
    setReportMessage('');
  };

  const downloadReport = () => {
    const report = generateOutageReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outage_report_${editedTicket.ticketNumber}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateActivity = (activityId: string, field: string, value: any) => {
    setEditedTicket({
      ...editedTicket,
      activities: editedTicket.activities.map(activity => 
        activity.id === activityId ? { ...activity, [field]: value } : activity
      )
    });
  };

  const deleteActivity = (activityId: string) => {
    const updatedTicket = {
      ...editedTicket,
      activities: editedTicket.activities.filter(activity => activity.id !== activityId),
      updatedAt: new Date().toISOString()
    };

    setEditedTicket(updatedTicket);
    if (onUpdate) {
      onUpdate(editedTicket.id, updatedTicket);
    }
  };

  const totalDuration = calculateTotalDuration();
  const activityDuration = calculateActivityDuration();
  const slaStatus = getSLAStatus();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Tickets</span>
          </button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{editedTicket.title}</h2>
              {!isEditing && onUpdate && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <textarea
                value={editedTicket.description}
                onChange={(e) => setEditedTicket({ ...editedTicket, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
            ) : (
              <p className="text-gray-600 mb-4">{editedTicket.description}</p>
            )}
            
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <>
                  <select
                    value={editedTicket.priority}
                    onChange={(e) => setEditedTicket({ ...editedTicket, priority: e.target.value as TroubleTicket['priority'] })}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                  <select
                    value={editedTicket.status}
                    onChange={(e) => setEditedTicket({ ...editedTicket, status: e.target.value as TroubleTicket['status'] })}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={editedTicket.category}
                    onChange={(e) => setEditedTicket({ ...editedTicket, category: e.target.value as TroubleTicket['category'] })}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="signal-loss">Signal Loss</option>
                    <option value="fiber-cut">Fiber Cut</option>
                    <option value="equipment-failure">Equipment Failure</option>
                    <option value="performance-degraded">Performance Degraded</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="power-outage">Power Outage</option>
                    <option value="environmental">Environmental</option>
                    <option value="other">Other</option>
                  </select>
                </>
              ) : (
                <>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(editedTicket.priority)}`}>
                    {editedTicket.priority} Priority
                  </span>
                  <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(editedTicket.status)}`}>
                    {editedTicket.status.replace('-', ' ')}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {editedTicket.category.replace('-', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Ticket Number</p>
            <p className="font-mono text-lg font-medium text-gray-900">{editedTicket.ticketNumber}</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Send Report</span>
              </button>
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Duration & SLA Summary */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Timer className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Duration</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(totalDuration)}</p>
            <p className="text-xs text-gray-500">From creation to now</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Activity Duration</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(activityDuration)}</p>
            <p className="text-xs text-gray-500">Total logged work time</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">SLA Target</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{editedTicket.slaTarget || 'N/A'}h</p>
            <p className="text-xs text-gray-500">Resolution target</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">SLA Status</span>
            </div>
            {slaStatus && (
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getSLAColor(slaStatus)}`}>
                {slaStatus.charAt(0).toUpperCase() + slaStatus.slice(1)}
              </span>
            )}
            <p className="text-xs text-gray-500 mt-1">Current compliance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Ticket Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium text-gray-900">{getRouteName(editedTicket.routeId)}</p>
                </div>
              </div>

              {editedTicket.linkId && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Affected Link</p>
                    <p className="font-medium text-gray-900">{editedTicket.linkId}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Reported By</p>
                  <p className="font-medium text-gray-900">{editedTicket.reportedBy}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTicket.assignedTo || ''}
                      onChange={(e) => setEditedTicket({ ...editedTicket, assignedTo: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Assign technician"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{editedTicket.assignedTo || 'Unassigned'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Wrench className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Person Handling</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTicket.personHandling || ''}
                      onChange={(e) => setEditedTicket({ ...editedTicket, personHandling: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Field technician"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{editedTicket.personHandling || 'Not assigned'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Impact Level</p>
                  <p className={`font-medium ${
                    editedTicket.impact === 'critical' ? 'text-red-600' :
                    editedTicket.impact === 'high' ? 'text-orange-600' :
                    editedTicket.impact === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {editedTicket.impact}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(editedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {editedTicket.estimatedResolution && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Resolution</p>
                    <p className="font-medium text-gray-900">
                      {new Date(editedTicket.estimatedResolution).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {editedTicket.resolvedAt && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Resolved</p>
                    <p className="font-medium text-gray-900">
                      {new Date(editedTicket.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {editedTicket.closedAt && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Closed</p>
                    <p className="font-medium text-gray-900">
                      {new Date(editedTicket.closedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{editedTicket.location.address}</p>
              </div>
              {editedTicket.location.landmark && (
                <div>
                  <p className="text-sm text-gray-500">Landmark</p>
                  <p className="font-medium text-gray-900">{editedTicket.location.landmark}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Longitude</p>
                  <p className="font-medium text-gray-900">{editedTicket.location.longitude}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Latitude</p>
                  <p className="font-medium text-gray-900">{editedTicket.location.latitude}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
            {!newActivity && (
              <button
                onClick={addActivity}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Activity</span>
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {/* New Activity Form */}
            {newActivity && (
              <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-blue-900">Add New Activity</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveActivity}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelNewActivity}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-blue-700 mb-1">Activity Type</label>
                    <select
                      value={newActivity.type || 'comment'}
                      onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as TroubleTicketActivity['type'] })}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="comment">Comment</option>
                      <option value="prepare">Prepare</option>
                      <option value="initial-measurement">Initial Measurement</option>
                      <option value="travel">Travel</option>
                      <option value="handling">Handling</option>
                      <option value="securing">Securing</option>
                      <option value="testing">Testing</option>
                      <option value="field-work">Field Work</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-blue-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      value={newActivity.duration || 0}
                      onChange={(e) => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-blue-700 mb-1">Performed By</label>
                    <input
                      type="text"
                      value={newActivity.performedBy || ''}
                      onChange={(e) => setNewActivity({ ...newActivity, performedBy: e.target.value })}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Technician name"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs text-blue-700 mb-1">Description</label>
                    <textarea
                      value={newActivity.description || ''}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      rows={2}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Describe the activity performed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-blue-700 mb-1">Activity Result</label>
                    <textarea
                      value={newActivity.details?.testResults || ''}
                      onChange={(e) => setNewActivity({ 
                        ...newActivity, 
                        details: { ...newActivity.details, testResults: e.target.value }
                      })}
                      rows={2}
                      className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder="Result or outcome of this activity"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Existing Activities */}
            {editedTicket.activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const activityColor = getActivityColor(activity.type);
              const isEditingActivity = editingActivityId === activity.id;
              const canEdit = activity.type !== 'created'; // Don't allow editing of 'created' activity
              
              return (
                <div key={activity.id} className="flex space-x-4 relative">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activityColor}`}>
                    <ActivityIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow ${
                      isEditingActivity ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {isEditingActivity ? (
                            <select
                              value={activity.type}
                              onChange={(e) => updateActivity(activity.id, 'type', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="comment">Comment</option>
                              <option value="prepare">Prepare</option>
                              <option value="initial-measurement">Initial Measurement</option>
                              <option value="travel">Travel</option>
                              <option value="handling">Handling</option>
                              <option value="securing">Securing</option>
                              <option value="testing">Testing</option>
                              <option value="field-work">Field Work</option>
                              <option value="status-changed">Status Changed</option>
                              <option value="assigned">Assigned</option>
                              <option value="escalated">Escalated</option>
                            </select>
                          ) : (
                            <h4 className="text-sm font-medium text-gray-900">
                              {activity.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                          )}
                          
                          {isEditingActivity ? (
                            <div className="flex items-center space-x-1">
                              <Timer className="h-3 w-3 text-gray-400" />
                              <input
                                type="number"
                                min="0"
                                value={activity.duration || 0}
                                onChange={(e) => updateActivity(activity.id, 'duration', parseInt(e.target.value) || 0)}
                                className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-500">m</span>
                            </div>
                          ) : (
                            activity.duration && activity.duration > 0 && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                <Timer className="h-3 w-3" />
                                <span>{activity.duration}m</span>
                              </span>
                            )
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                          
                          {/* Edit buttons - Show for all activities except 'created' */}
                          {canEdit && (
                            <div className="flex items-center space-x-1">
                              {isEditingActivity ? (
                                <>
                                  <button
                                    onClick={() => saveEditingActivity(activity.id)}
                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                    title="Save changes"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={cancelEditingActivity}
                                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                                    title="Cancel editing"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditingActivity(activity.id)}
                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit activity"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteActivity(activity.id)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                    title="Delete activity"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isEditingActivity ? (
                        <div className="space-y-2">
                          <textarea
                            value={activity.description}
                            onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          />
                          <textarea
                            value={activity.details?.testResults || ''}
                            onChange={(e) => updateActivity(activity.id, 'details', {
                              ...activity.details,
                              testResults: e.target.value
                            })}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="Activity result or outcome"
                          />
                          <input
                            type="text"
                            value={activity.performedBy}
                            onChange={(e) => updateActivity(activity.id, 'performedBy', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="Performed by"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                          {activity.details?.testResults && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                              <p className="text-xs font-medium text-green-800">Result:</p>
                              <p className="text-sm text-green-700">{activity.details.testResults}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">by {activity.performedBy}</span>
                          </div>
                        </>
                      )}

                      {activity.details && !isEditingActivity && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          {activity.details.location && (
                            <p className="text-xs text-gray-600">
                              <strong>Location:</strong> {activity.details.location}
                            </p>
                          )}
                          {activity.details.oldValue && activity.details.newValue && (
                            <p className="text-xs text-gray-600">
                              <strong>Changed:</strong> {activity.details.oldValue} → {activity.details.newValue}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Timeline connector */}
                  {index < editedTicket.activities.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-8 bg-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Send Outage Report</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Send Method
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setReportType('email')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      reportType === 'email'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() => setReportType('whatsapp')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      reportType === 'whatsapp'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reportType === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={reportType === 'email' ? 'email' : 'tel'}
                  value={reportRecipient}
                  onChange={(e) => setReportRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={reportType === 'email' ? 'recipient@company.com' : '+62812345678 or 0812345678'}
                  required
                />
                {reportType === 'whatsapp' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Format: +62812345678 or 0812345678 (will be converted to international format)
                  </p>
                )}
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any additional context or message..."
                />
              </div>

              {/* Report Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Preview
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {generateOutageReport().substring(0, 500)}...
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={downloadReport}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleSendReport}
                  disabled={!reportRecipient.trim()}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    reportRecipient.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>Send Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}