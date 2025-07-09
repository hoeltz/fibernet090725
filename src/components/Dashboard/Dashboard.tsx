import React from 'react';
import { Route, Alert, SLAData, SLATarget, MaintenanceRecord, TroubleTicket } from '../../types';
import RouteCard from './RouteCard';
import StatsOverview from './StatsOverview';
import SLAChart from './SLAChart';
import MaintenanceTimeline from './MaintenanceTimeline';
import ExportImportModal from '../Common/ExportImportModal';
import { Download, Upload } from 'lucide-react';

interface DashboardProps {
  routes: Route[];
  alerts: Alert[];
  slaData: SLAData[];
  slaTargets: SLATarget[];
  maintenanceRecords: MaintenanceRecord[];
  troubleTickets: TroubleTicket[];
  onRouteSelect: (route: Route) => void;
  onNavigateToTroubleTickets?: () => void;
}

export default function Dashboard({ 
  routes, 
  alerts, 
  slaData, 
  slaTargets, 
  maintenanceRecords,
  troubleTickets,
  onRouteSelect,
  onNavigateToTroubleTickets
}: DashboardProps) {
  const [showExportModal, setShowExportModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);

  const operationalRoutes = routes.filter(r => r.status === 'operational').length;
  const criticalRoutes = routes.filter(r => r.status === 'critical').length;
  const maintenanceRoutes = routes.filter(r => r.status === 'maintenance').length;
  const totalTroubleTickets = routes.reduce((sum, route) => sum + route.troubleTickets, 0);

  const handleStatsClick = () => {
    if (onNavigateToTroubleTickets) {
      onNavigateToTroubleTickets();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Network Overview</h2>
          <p className="text-sm sm:text-base text-gray-600">Monitor the health and status of all fiber optic routes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export All Data</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* SLA Monitoring Section */}
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        <SLAChart data={slaData} />
      </div>

      <StatsOverview
        totalRoutes={routes.length}
        operationalRoutes={operationalRoutes}
        criticalRoutes={criticalRoutes}
        maintenanceRoutes={maintenanceRoutes}
        totalTroubleTickets={totalTroubleTickets}
        onClosureUsageClick={handleStatsClick}
        onCableUsageClick={handleStatsClick}
        onOpenTicketsClick={handleStatsClick}
      />

      {/* Import Modal */}
      <ExportImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        mode="import"
        dataType="all"
        data={{ 
          routes, 
          tickets: troubleTickets, 
          assets: [], 
          maintenance: maintenanceRecords 
        }}
        onImportComplete={(importedData) => {
          console.log('Imported data:', importedData);
        }}
      />
      {/* Route Status Grid - 3 Cards Per Row */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Route Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onClick={() => onRouteSelect(route)}
            />
          ))}
        </div>
      </div>

      {/* Activity Timeline - Moved to Bottom */}
      <div className="mb-6 sm:mb-8">
        <MaintenanceTimeline 
          maintenanceRecords={maintenanceRecords}
          troubleTickets={troubleTickets}
          routes={routes.map(r => ({ id: r.id, name: r.name }))}
        />
      </div>

      {/* Export Modal */}
      <ExportImportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mode="export"
        dataType="all"
        data={{ 
          routes, 
          tickets: troubleTickets, 
          assets: [], // You might want to pass actual assets here
          maintenance: maintenanceRecords 
        }}
      />
    </div>
  );
}