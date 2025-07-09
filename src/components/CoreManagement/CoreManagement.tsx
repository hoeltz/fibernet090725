import React, { useState } from 'react';
import { Route } from '../../types';
import { 
  Network, Edit3, Save, X, Plus, Trash2, Eye, 
  ArrowRight, ArrowLeft, Settings, Activity,
  Signal, MapPin, Zap, Cable, Monitor,
  RotateCcw, Download, Upload, RefreshCw, BarChart3
} from 'lucide-react';
import RouteConfigurationDiagram from './RouteConfigurationDiagram';
import TrafficTable from './TrafficTable';
import ExportImportModal from '../Common/ExportImportModal';

interface CoreManagementProps {
  routes: Route[];
  onRouteUpdate: (updatedRoute: Route) => void;
}

interface TrafficData {
  id: string;
  routeId: string;
  trafficName: string;
  rsl: number; // Received Signal Level in dBm
  otdrDistance: number; // in km
  portNumber: string;
  linkPointA: string; // Source point
  linkPointB: string; // Destination point
  selectedRoute: string; // Single route selection (A, B, C, D, E, F)
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  totalLoss: number; // in dB
  lossPerKm: number; // in dB/km
  length: number; // in km
  protocol: string;
  lastUpdate: string;
}

// Mock traffic data
const mockTrafficData: TrafficData[] = [
  {
    id: 'traffic-001',
    routeId: 'route-a',
    trafficName: 'Enterprise-Data-01',
    rsl: -15.2,
    otdrDistance: 12.5,
    portNumber: 'P1-01',
    linkPointA: 'HUB-A',
    linkPointB: 'TERM-B',
    selectedRoute: 'A',
    status: 'active',
    totalLoss: 2.3,
    lossPerKm: 0.18,
    length: 12.5,
    protocol: 'Ethernet',
    lastUpdate: '2024-02-20T10:30:00Z'
  },
  {
    id: 'traffic-002',
    routeId: 'route-a',
    trafficName: 'Voice-Service-01',
    rsl: -18.7,
    otdrDistance: 12.5,
    portNumber: 'P1-02',
    linkPointA: 'HUB-A',
    linkPointB: 'TERM-C',
    selectedRoute: 'C',
    status: 'active',
    totalLoss: 3.1,
    lossPerKm: 0.25,
    length: 12.5,
    protocol: 'TDM',
    lastUpdate: '2024-02-20T10:25:00Z'
  },
  {
    id: 'traffic-003',
    routeId: 'route-a',
    trafficName: 'Backup-Link-01',
    rsl: -22.1,
    otdrDistance: 12.5,
    portNumber: 'P1-03',
    linkPointA: 'HUB-A',
    linkPointB: 'TERM-D',
    selectedRoute: 'D',
    status: 'maintenance',
    totalLoss: 4.2,
    lossPerKm: 0.34,
    length: 12.5,
    protocol: 'SDH',
    lastUpdate: '2024-02-20T09:15:00Z'
  },
  {
    id: 'traffic-004',
    routeId: 'route-b',
    trafficName: 'Metro-Network-01',
    rsl: -16.8,
    otdrDistance: 16.1,
    portNumber: 'P2-01',
    linkPointA: 'HUB-B',
    linkPointB: 'TERM-A',
    selectedRoute: 'B',
    status: 'active',
    totalLoss: 3.8,
    lossPerKm: 0.24,
    length: 16.1,
    protocol: 'Ethernet',
    lastUpdate: '2024-02-20T10:35:00Z'
  },
  {
    id: 'traffic-005',
    routeId: 'route-b',
    trafficName: 'Internet-Gateway-01',
    rsl: -19.3,
    otdrDistance: 16.1,
    portNumber: 'P2-02',
    linkPointA: 'HUB-B',
    linkPointB: 'TERM-F',
    selectedRoute: 'F',
    status: 'active',
    totalLoss: 4.1,
    lossPerKm: 0.25,
    length: 16.1,
    protocol: 'Ethernet',
    lastUpdate: '2024-02-20T10:40:00Z'
  },
  {
    id: 'traffic-006',
    routeId: 'route-c',
    trafficName: 'Corporate-VPN-01',
    rsl: -20.5,
    otdrDistance: 9.2,
    portNumber: 'P3-01',
    linkPointA: 'HUB-C',
    linkPointB: 'TERM-A',
    selectedRoute: 'C',
    status: 'error',
    totalLoss: 5.2,
    lossPerKm: 0.57,
    length: 9.2,
    protocol: 'MPLS',
    lastUpdate: '2024-02-20T08:20:00Z'
  },
  {
    id: 'traffic-007',
    routeId: 'route-d',
    trafficName: 'Data-Center-Link-01',
    rsl: -14.1,
    otdrDistance: 13.8,
    portNumber: 'P4-01',
    linkPointA: 'HUB-D',
    linkPointB: 'TERM-E',
    selectedRoute: 'D',
    status: 'active',
    totalLoss: 1.9,
    lossPerKm: 0.14,
    length: 13.8,
    protocol: 'Ethernet',
    lastUpdate: '2024-02-20T10:45:00Z'
  },
  {
    id: 'traffic-008',
    routeId: 'route-e',
    trafficName: 'Emergency-Service-01',
    rsl: -25.8,
    otdrDistance: 14.5,
    portNumber: 'P5-01',
    linkPointA: 'HUB-E',
    linkPointB: 'TERM-D',
    selectedRoute: 'E',
    status: 'error',
    totalLoss: 6.7,
    lossPerKm: 0.46,
    length: 14.5,
    protocol: 'Ethernet',
    lastUpdate: '2024-02-20T07:30:00Z'
  },
  {
    id: 'traffic-009',
    routeId: 'route-f',
    trafficName: 'Residential-Service-01',
    rsl: -17.6,
    otdrDistance: 17.6,
    portNumber: 'P6-01',
    linkPointA: 'HUB-F',
    linkPointB: 'TERM-B',
    selectedRoute: 'F',
    status: 'active',
    totalLoss: 2.8,
    lossPerKm: 0.16,
    length: 17.6,
    protocol: 'GPON',
    lastUpdate: '2024-02-20T10:50:00Z'
  }
];

export default function CoreManagement({ routes, onRouteUpdate }: CoreManagementProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(routes[0] || null);
  const [trafficData, setTrafficData] = useState<TrafficData[]>(mockTrafficData);
  const [isEditingDiagram, setIsEditingDiagram] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagram' | 'traffic' | 'analysis'>('diagram');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setIsEditingDiagram(false);
  };

  const handleTrafficUpdate = (updatedTraffic: TrafficData[]) => {
    setTrafficData(updatedTraffic);
  };

  const getRouteTraffic = (routeId: string) => {
    return trafficData.filter(traffic => traffic.routeId === routeId);
  };

  const getRouteStats = (routeId: string) => {
    const routeTraffic = getRouteTraffic(routeId);
    const activeTraffic = routeTraffic.filter(t => t.status === 'active');
    const totalLoss = routeTraffic.reduce((sum, traffic) => sum + traffic.totalLoss, 0);
    const avgRSL = routeTraffic.length > 0 
      ? routeTraffic.reduce((sum, traffic) => sum + traffic.rsl, 0) / routeTraffic.length 
      : 0;

    return {
      totalTraffic: routeTraffic.length,
      activeTraffic: activeTraffic.length,
      totalLoss: totalLoss,
      avgRSL: avgRSL
    };
  };

  const refreshData = () => {
    // Simulate data refresh
    const updatedTraffic = trafficData.map(traffic => ({
      ...traffic,
      lastUpdate: new Date().toISOString(),
      rsl: traffic.rsl + (Math.random() - 0.5) * 0.5 // Small random variation
    }));
    setTrafficData(updatedTraffic);
  };

  const tabs = [
    { id: 'diagram', label: 'Route Configuration', icon: Network },
    { id: 'traffic', label: 'Traffic Management', icon: Activity },
    { id: 'analysis', label: 'Performance Analysis', icon: BarChart3 }
  ];

  const renderDiagramTab = () => (
    <div className="space-y-6">
      {/* Diagram Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Network Configuration Diagram</h3>
            <p className="text-sm text-gray-600">Visual representation of route connections and traffic flow</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsEditingDiagram(!isEditingDiagram)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isEditingDiagram 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditingDiagram ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Diagram</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Route Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus Route
          </label>
          <div className="flex flex-wrap gap-2">
            {routes.map((route) => {
              const stats = getRouteStats(route.id);
              return (
                <button
                  key={route.id}
                  onClick={() => handleRouteSelect(route)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedRoute?.id === route.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{route.name}</div>
                    <div className="text-xs opacity-75">
                      {stats.activeTraffic}/{stats.totalTraffic} active
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagram Component */}
        {selectedRoute && (
          <RouteConfigurationDiagram
            selectedRoute={selectedRoute}
            routes={routes}
            trafficData={getRouteTraffic(selectedRoute.id)}
            isEditing={isEditingDiagram}
            onRouteUpdate={onRouteUpdate}
          />
        )}
      </div>
    </div>
  );

  const renderTrafficTab = () => (
    <div className="space-y-6">
      {selectedRoute && (
        <TrafficTable
          route={selectedRoute}
          trafficData={getRouteTraffic(selectedRoute.id)}
          allRoutes={routes}
          onTrafficUpdate={handleTrafficUpdate}
        />
      )}
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Network Performance Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => {
            const stats = getRouteStats(route.id);
            const routeTraffic = getRouteTraffic(route.id);
            
            return (
              <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{route.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    route.status === 'operational' ? 'bg-green-100 text-green-800' :
                    route.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    route.status === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {route.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Traffic:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.totalTraffic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active:</span>
                    <span className="text-sm font-medium text-green-600">{stats.activeTraffic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Loss:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.totalLoss.toFixed(1)} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg RSL:</span>
                    <span className={`text-sm font-medium ${
                      stats.avgRSL > -20 ? 'text-green-600' :
                      stats.avgRSL > -25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stats.avgRSL.toFixed(1)} dBm
                    </span>
                  </div>
                </div>

                {/* Traffic Status Distribution */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600 mb-2">Traffic Status:</div>
                  <div className="flex space-x-1">
                    {['active', 'inactive', 'maintenance', 'error'].map((status) => {
                      const count = routeTraffic.filter(t => t.status === status).length;
                      const percentage = routeTraffic.length > 0 ? (count / routeTraffic.length) * 100 : 0;
                      const color = status === 'active' ? 'bg-green-500' :
                                   status === 'inactive' ? 'bg-gray-500' :
                                   status === 'maintenance' ? 'bg-blue-500' : 'bg-red-500';
                      
                      return (
                        <div
                          key={status}
                          className={`h-2 rounded ${color}`}
                          style={{ width: `${percentage}%` }}
                          title={`${status}: ${count}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RSL Analysis Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">RSL Distribution Analysis</h3>
        
        <div className="space-y-4">
          {routes.map((route) => {
            const routeTraffic = getRouteTraffic(route.id);
            if (routeTraffic.length === 0) return null;

            const maxRSL = Math.max(...routeTraffic.map(t => t.rsl));
            const minRSL = Math.min(...routeTraffic.map(t => t.rsl));
            const avgRSL = routeTraffic.reduce((sum, t) => sum + t.rsl, 0) / routeTraffic.length;

            return (
              <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{route.name}</h4>
                  <span className="text-sm text-gray-600">{routeTraffic.length} traffic flows</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Min RSL</div>
                    <div className={`text-lg font-bold ${
                      minRSL > -20 ? 'text-green-600' :
                      minRSL > -25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {minRSL.toFixed(1)} dBm
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Avg RSL</div>
                    <div className={`text-lg font-bold ${
                      avgRSL > -20 ? 'text-green-600' :
                      avgRSL > -25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {avgRSL.toFixed(1)} dBm
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Max RSL</div>
                    <div className={`text-lg font-bold ${
                      maxRSL > -20 ? 'text-green-600' :
                      maxRSL > -25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {maxRSL.toFixed(1)} dBm
                    </div>
                  </div>
                </div>

                {/* RSL Bar Chart */}
                <div className="space-y-2">
                  {routeTraffic.map((traffic) => {
                    const percentage = Math.abs(traffic.rsl) / 30 * 100; // Normalize to 30 dBm range
                    const color = traffic.rsl > -20 ? 'bg-green-500' :
                                 traffic.rsl > -25 ? 'bg-yellow-500' : 'bg-red-500';
                    
                    return (
                      <div key={traffic.id} className="flex items-center space-x-3">
                        <div className="w-32 text-xs text-gray-600 truncate">
                          {traffic.trafficName}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-xs text-gray-900 text-right">
                          {traffic.rsl.toFixed(1)} dBm
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Core Management</h2>
            <p className="text-gray-600">Manage network core configurations, traffic routing, and performance monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Config</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import Config</span>
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
      {activeTab === 'diagram' && renderDiagramTab()}
      {activeTab === 'traffic' && renderTrafficTab()}
      {activeTab === 'analysis' && renderAnalysisTab()}

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
        onImportComplete={(importedRoutes) => {
          console.log('Imported routes:', importedRoutes);
        }}
      />
    </div>
  );
}