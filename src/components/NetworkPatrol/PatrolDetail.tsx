import React, { useState } from 'react';
import { NetworkPatrol, PatrolFinding, CableMeasurement, Route, MaintenanceRecord } from '../../types';
import { 
  ArrowLeft, MapPin, Calendar, Users, Car, Cloud, 
  AlertTriangle, Camera, Activity, Edit3, Save, X,
  Plus, Trash2, Eye, Download, Share, Settings,
  Zap, Shield, Construction, Leaf, CheckCircle,
  Clock, XCircle, BarChart3, FileText, Send,
  Phone, Mail, MessageCircle
} from 'lucide-react';

interface PatrolDetailProps {
  patrol: NetworkPatrol;
  routes: Route[];
  onBack: () => void;
  onUpdate: (patrolId: string, updates: Partial<NetworkPatrol>) => void;
  onCreateMaintenance: (maintenance: Omit<MaintenanceRecord, 'id'>) => void;
  onEdit: (patrol: NetworkPatrol) => void;
}

export default function PatrolDetail({ 
  patrol, 
  routes, 
  onBack, 
  onUpdate, 
  onCreateMaintenance,
  onEdit 
}: PatrolDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'measurements' | 'report'>('overview');
  const [selectedFinding, setSelectedFinding] = useState<PatrolFinding | null>(null);
  const [showCreateMaintenanceModal, setShowCreateMaintenanceModal] = useState(false);
  const [selectedFindingForMaintenance, setSelectedFindingForMaintenance] = useState<PatrolFinding | null>(null);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const handleCreateMaintenance = (finding: PatrolFinding) => {
    const maintenanceData: Omit<MaintenanceRecord, 'id'> = {
      routeId: patrol.routeId,
      type: 'corrective',
      status: 'scheduled',
      title: `Repair: ${finding.title}`,
      description: `${finding.description}\n\nLocation: ${finding.location.address}\nSeverity: ${finding.severity}\nAction Required: ${finding.actionRequired}`,
      scheduledDate: new Date().toISOString().split('T')[0],
      technician: finding.assignedTo || '',
      priority: finding.severity === 'critical' ? 'critical' : 
                finding.severity === 'high' ? 'high' : 'medium',
      notes: `Created from patrol finding: ${finding.id}\nPatrol: ${patrol.patrolNumber}`
    };

    onCreateMaintenance(maintenanceData);
    
    // Update finding to link to maintenance
    const updatedFindings = patrol.findings.map(f => 
      f.id === finding.id 
        ? { ...f, maintenanceTicketId: `maint-${Date.now()}`, status: 'in-progress' as const }
        : f
    );
    
    onUpdate(patrol.id, { findings: updatedFindings });
  };

  const generateReport = () => {
    const reportData = {
      patrol: patrol,
      route: getRouteName(patrol.routeId),
      findings: patrol.findings,
      measurements: patrol.measurements,
      summary: patrol.summary,
      recommendations: patrol.recommendations
    };

    // Create a formatted report
    const report = `
NETWORK PATROL REPORT
=====================

Patrol Number: ${patrol.patrolNumber}
Route: ${getRouteName(patrol.routeId)}
Date: ${new Date(patrol.patrolDate).toLocaleDateString()}
Team: ${patrol.patrolTeam.join(', ')}
Status: ${patrol.status}

SUMMARY
-------
${patrol.summary}

FINDINGS (${patrol.findings.length})
--------
${patrol.findings.map((finding, index) => `
${index + 1}. ${finding.title} (${finding.severity.toUpperCase()})
   Type: ${finding.type.replace('-', ' ')}
   Location: ${finding.location.address}
   Description: ${finding.description}
   Action Required: ${finding.actionRequired}
   Status: ${finding.status}
   ${finding.thirdPartyDetails ? `
   Third Party: ${finding.thirdPartyDetails.company}
   Contact: ${finding.thirdPartyDetails.contactPerson}
   Activity: ${finding.thirdPartyDetails.activityType}
   ` : ''}
`).join('')}

MEASUREMENTS (${patrol.measurements.length})
------------
${patrol.measurements.map((measurement, index) => `
${index + 1}. ${measurement.measurementType.toUpperCase()}
   Location: ${measurement.location.address}
   Fiber Condition: ${measurement.results.fiberCondition}
   ${measurement.results.totalLoss ? `Total Loss: ${measurement.results.totalLoss} dB` : ''}
   ${measurement.results.length ? `Length: ${measurement.results.length} km` : ''}
   Performed by: ${measurement.performedBy}
`).join('')}

RECOMMENDATIONS
---------------
${patrol.recommendations}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    return report;
  };

  const sendWhatsAppReport = () => {
    const report = generateReport();
    const encodedReport = encodeURIComponent(report);
    const whatsappUrl = `https://wa.me/?text=${encodedReport}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendEmailReport = () => {
    const report = generateReport();
    const subject = `Network Patrol Report - ${patrol.patrolNumber}`;
    const body = encodeURIComponent(report);
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.open(mailtoUrl);
  };

  const StatusIcon = getStatusIcon(patrol.status);
  const statusColor = getStatusColor(patrol.status);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'findings', label: 'Findings', icon: AlertTriangle, count: patrol.findings.length },
    { id: 'measurements', label: 'Measurements', icon: BarChart3, count: patrol.measurements.length },
    { id: 'report', label: 'Report', icon: FileText }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Patrol Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patrol Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patrol Number</label>
            <p className="text-lg font-medium text-gray-900">{patrol.patrolNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <p className="text-lg font-medium text-gray-900">{getRouteName(patrol.routeId)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <p className="text-lg font-medium text-gray-900 capitalize">{patrol.type.replace('-', ' ')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              patrol.priority === 'critical' ? 'bg-red-100 text-red-800' :
              patrol.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              patrol.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {patrol.priority}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <p className="text-lg font-medium text-gray-900">
              {new Date(patrol.patrolDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <p className="text-lg font-medium text-gray-900">
              {patrol.startTime} - {patrol.endTime || 'In Progress'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <p className="text-gray-700">{patrol.description}</p>
        </div>
      </div>

      {/* Team & Vehicle Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Team & Vehicle Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patrol Team</label>
            <div className="space-y-2">
              {patrol.patrolTeam.map((member, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{member}</span>
                </div>
              ))}
            </div>
          </div>

          {patrol.vehicleInfo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Information</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{patrol.vehicleInfo.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Plate:</span>
                  <span className="text-gray-900 font-mono">{patrol.vehicleInfo.plateNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weather Conditions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Cloud className="h-5 w-5 mr-2 text-blue-600" />
          Weather Conditions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <p className="text-lg font-medium text-gray-900 capitalize">{patrol.weather.condition}</p>
          </div>

          {patrol.weather.temperature && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <p className="text-lg font-medium text-gray-900">{patrol.weather.temperature}°C</p>
            </div>
          )}

          {patrol.weather.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <p className="text-gray-700">{patrol.weather.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{patrol.summary}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{patrol.recommendations}</p>
        </div>
      </div>
    </div>
  );

  const renderFindings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Patrol Findings ({patrol.findings.length})
          </h3>
        </div>

        {patrol.findings.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No findings recorded</h3>
            <p className="text-gray-500">No issues or observations were found during this patrol</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patrol.findings.map((finding) => {
              const FindingIcon = getFindingTypeIcon(finding.type);
              const severityColor = getSeverityColor(finding.severity);
              
              return (
                <div key={finding.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <FindingIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{finding.title}</h4>
                        <p className="text-sm text-gray-600 capitalize">{finding.type.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full border text-sm font-medium ${severityColor}`}>
                        {finding.severity}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        finding.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        finding.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        finding.status === 'escalated' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {finding.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{finding.description}</p>

                  {/* Location */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Location</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{finding.location.address}</p>
                    {finding.location.landmark && (
                      <p className="text-sm text-gray-500 ml-6">Landmark: {finding.location.landmark}</p>
                    )}
                    {finding.location.kmPost && (
                      <p className="text-sm text-gray-500 ml-6">KM Post: {finding.location.kmPost}</p>
                    )}
                  </div>

                  {/* Third Party Details */}
                  {finding.thirdPartyDetails && (
                    <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Third Party Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Company:</span>
                          <span className="ml-2 text-gray-900">{finding.thirdPartyDetails.company}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Contact:</span>
                          <span className="ml-2 text-gray-900">{finding.thirdPartyDetails.contactPerson}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Activity:</span>
                          <span className="ml-2 text-gray-900">{finding.thirdPartyDetails.activityType}</span>
                        </div>
                        {finding.thirdPartyDetails.permitNumber && (
                          <div>
                            <span className="text-gray-500">Permit:</span>
                            <span className="ml-2 text-gray-900">{finding.thirdPartyDetails.permitNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Measurements */}
                  {finding.measurements && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Measurements</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {finding.measurements.cableDepth && (
                          <div>
                            <span className="text-gray-500">Cable Depth:</span>
                            <span className="ml-2 text-gray-900">{finding.measurements.cableDepth} cm</span>
                          </div>
                        )}
                        {finding.measurements.exposureLength && (
                          <div>
                            <span className="text-gray-500">Exposure Length:</span>
                            <span className="ml-2 text-gray-900">{finding.measurements.exposureLength} m</span>
                          </div>
                        )}
                        {finding.measurements.signalLoss && (
                          <div>
                            <span className="text-gray-500">Signal Loss:</span>
                            <span className="ml-2 text-gray-900">{finding.measurements.signalLoss} dB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Photos */}
                  {finding.photos.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Photos ({finding.photos.length})
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {finding.photos.map((photo) => (
                          <div key={photo.id} className="relative">
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                              {photo.caption}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Required */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">Action Required:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        finding.actionRequired === 'immediate' ? 'bg-red-100 text-red-800' :
                        finding.actionRequired === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        finding.actionRequired === 'monitoring' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {finding.actionRequired}
                      </span>
                    </div>
                    
                    {finding.actionRequired !== 'none' && !finding.maintenanceTicketId && (
                      <button
                        onClick={() => handleCreateMaintenance(finding)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Create Maintenance</span>
                      </button>
                    )}
                    
                    {finding.maintenanceTicketId && (
                      <span className="text-sm text-green-600 font-medium">
                        Maintenance Created: {finding.maintenanceTicketId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderMeasurements = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Cable Measurements ({patrol.measurements.length})
          </h3>
        </div>

        {patrol.measurements.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No measurements recorded</h3>
            <p className="text-gray-500">No cable measurements were taken during this patrol</p>
          </div>
        ) : (
          <div className="space-y-6">
            {patrol.measurements.map((measurement) => (
              <div key={measurement.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 uppercase">{measurement.measurementType}</h4>
                    <p className="text-sm text-gray-600">{measurement.location.address}</p>
                    {measurement.location.kmPost && (
                      <p className="text-sm text-gray-500">KM Post: {measurement.location.kmPost}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    measurement.results.fiberCondition === 'excellent' ? 'bg-green-100 text-green-800' :
                    measurement.results.fiberCondition === 'good' ? 'bg-blue-100 text-blue-800' :
                    measurement.results.fiberCondition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    measurement.results.fiberCondition === 'poor' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {measurement.results.fiberCondition}
                  </span>
                </div>

                {/* Measurement Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {measurement.results.totalLoss && (
                    <div>
                      <span className="text-sm text-gray-500">Total Loss:</span>
                      <span className="ml-2 font-medium text-gray-900">{measurement.results.totalLoss} dB</span>
                    </div>
                  )}
                  {measurement.results.reflectance && (
                    <div>
                      <span className="text-sm text-gray-500">Reflectance:</span>
                      <span className="ml-2 font-medium text-gray-900">{measurement.results.reflectance} dB</span>
                    </div>
                  )}
                  {measurement.results.length && (
                    <div>
                      <span className="text-sm text-gray-500">Length:</span>
                      <span className="ml-2 font-medium text-gray-900">{measurement.results.length} km</span>
                    </div>
                  )}
                </div>

                {/* Equipment Info */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Equipment Used</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Device:</span>
                      <span className="ml-2 text-gray-900">{measurement.equipment.deviceModel}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Serial:</span>
                      <span className="ml-2 text-gray-900 font-mono">{measurement.equipment.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Calibration:</span>
                      <span className="ml-2 text-gray-900">{measurement.equipment.calibrationDate}</span>
                    </div>
                  </div>
                </div>

                {/* Anomalies */}
                {measurement.results.anomalies && measurement.results.anomalies.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Anomalies Detected</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {measurement.results.anomalies.map((anomaly, index) => (
                        <li key={index} className="text-sm text-gray-700">{anomaly}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {measurement.results.recommendations && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
                    <p className="text-sm text-gray-700">{measurement.results.recommendations}</p>
                  </div>
                )}

                {/* Attachments */}
                {measurement.attachments.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Attachments</h5>
                    <div className="space-y-2">
                      {measurement.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            {attachment.filename}
                          </span>
                          <span className="text-gray-500">({attachment.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Performed by: <span className="text-gray-900">{measurement.performedBy}</span>
                    </span>
                    <span className="text-gray-500">
                      {new Date(measurement.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Patrol Report</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={sendWhatsAppReport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Send to WhatsApp</span>
            </button>
            <button
              onClick={sendEmailReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Send Email</span>
            </button>
            <button
              onClick={() => {
                const report = generateReport();
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${patrol.patrolNumber}_report.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
            {generateReport()}
          </pre>
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
            <span>Back to Patrols</span>
          </button>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patrol.title}</h2>
              <p className="text-gray-600">{patrol.patrolNumber}</p>
              <div className="flex items-center space-x-3 mt-2">
                <div className={`px-3 py-1 rounded-full border flex items-center space-x-1 ${statusColor}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">{patrol.status.replace('-', ' ')}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {getRouteName(patrol.routeId)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(patrol)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit</span>
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
                {tab.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'findings' && renderFindings()}
      {activeTab === 'measurements' && renderMeasurements()}
      {activeTab === 'report' && renderReport()}
    </div>
  );
}