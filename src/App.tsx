import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import RouteManagement from './components/Routes/RouteManagement';
import CoreManagement from './components/CoreManagement/CoreManagement';
import AssetManagement from './components/Assets/AssetManagement';
import TroubleTicketManagement from './components/TroubleTickets/TroubleTicketManagement';
import MaintenanceList from './components/Maintenance/MaintenanceList';
import ExportImportModal from './components/Common/ExportImportModal';
import { 
  routes as initialRoutes, 
  maintenanceRecords, 
  alerts, 
  slaWeeklyData, 
  slaTargets, 
  troubleTickets as initialTroubleTickets,
  networkAssets as initialNetworkAssets
} from './data/mockData';
import { Route, MaintenanceRecord, TroubleTicket, NetworkAsset } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [maintenanceData, setMaintenanceData] = useState(maintenanceRecords);
  const [routes, setRoutes] = useState(initialRoutes);
  const [troubleTickets, setTroubleTickets] = useState(initialTroubleTickets);
  const [networkAssets, setNetworkAssets] = useState(initialNetworkAssets);
  const [networkPatrols, setNetworkPatrols] = useState(initialNetworkPatrols);
  const [showMaintenanceExportModal, setShowMaintenanceExportModal] = useState(false);
  const [showMaintenanceImportModal, setShowMaintenanceImportModal] = useState(false);

  const activeAlerts = alerts.filter(alert => !alert.acknowledged).length;
  const totalTroubleTickets = routes.reduce((sum, route) => sum + route.troubleTickets, 0);

  const handleScheduleMaintenance = (maintenance: Omit<MaintenanceRecord, 'id'>) => {
    const newMaintenance: MaintenanceRecord = {
      ...maintenance,
      id: `maint-${Date.now()}`
    };
    setMaintenanceData([...maintenanceData, newMaintenance]);
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setActiveTab('routes');
  };

  const handleRouteUpdate = (updatedRoute: Route) => {
    setRoutes(routes.map(route => 
      route.id === updatedRoute.id ? updatedRoute : route
    ));
    setSelectedRoute(updatedRoute);
  };

  const handleCreateTicket = (ticketData: Omit<TroubleTicket, 'id'>) => {
    const newTicket: TroubleTicket = {
      ...ticketData,
      id: `ticket-${Date.now()}`
    };
    
    // Update activities with proper ticket ID
    newTicket.activities = newTicket.activities.map(activity => ({
      ...activity,
      ticketId: newTicket.id
    }));
    
    setTroubleTickets([...troubleTickets, newTicket]);
    
    // Update route trouble ticket count
    const updatedRoutes = routes.map(route => 
      route.id === ticketData.routeId 
        ? { ...route, troubleTickets: route.troubleTickets + 1 }
        : route
    );
    setRoutes(updatedRoutes);
  };

  const handleUpdateTicket = (ticketId: string, updates: Partial<TroubleTicket>) => {
    setTroubleTickets(troubleTickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
  };

  const handleCreateAsset = (assetData: Omit<NetworkAsset, 'id'>) => {
    const newAsset: NetworkAsset = {
      ...assetData,
      id: `asset-${Date.now()}`
    };
    setNetworkAssets([...networkAssets, newAsset]);
  };

  const handleUpdateAsset = (assetId: string, updates: Partial<NetworkAsset>) => {
    setNetworkAssets(networkAssets.map(asset => 
      asset.id === assetId ? { ...asset, ...updates } : asset
    ));
  };

  const handleDeleteAsset = (assetId: string) => {
    setNetworkAssets(networkAssets.filter(asset => asset.id !== assetId));
  };

  const handleNavigateToTroubleTickets = () => {
    setActiveTab('tickets');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            routes={routes}
            alerts={alerts}
            slaData={slaWeeklyData}
            slaTargets={slaTargets}
            maintenanceRecords={maintenanceData}
            troubleTickets={troubleTickets}
            onRouteSelect={handleRouteSelect}
            onNavigateToTroubleTickets={handleNavigateToTroubleTickets}
          />
        );
      case 'routes':
        return (
          <RouteManagement
            routes={routes}
            onRouteUpdate={handleRouteUpdate}
            maintenanceRecords={maintenanceData}
            troubleTickets={troubleTickets}
          />
        );
      case 'core':
        return (
          <CoreManagement
            routes={routes}
            onRouteUpdate={handleRouteUpdate}
          />
        );
      case 'assets':
        return (
          <AssetManagement
            routes={routes}
            assets={networkAssets}
            onCreateAsset={handleCreateAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        );
      case 'tickets':
        return (
          <TroubleTicketManagement 
            tickets={troubleTickets}
            routes={routes}
            onUpdateTicket={handleUpdateTicket}
            onCreateTicket={handleCreateTicket}
          />
        );
      case 'history':
        return (
          <div>
            <MaintenanceList 
              maintenanceRecords={maintenanceData}
              routes={routes.map(r => ({ id: r.id, name: r.name }))}
              onExport={() => setShowMaintenanceExportModal(true)}
              onImport={() => setShowMaintenanceImportModal(true)}
            />
            
            {/* Maintenance Export Modal */}
            <ExportImportModal
              isOpen={showMaintenanceExportModal}
              onClose={() => setShowMaintenanceExportModal(false)}
              mode="export"
              dataType="maintenance"
              data={{ maintenance: maintenanceData, routes }}
            />

            {/* Maintenance Import Modal */}
            <ExportImportModal
              isOpen={showMaintenanceImportModal}
              onClose={() => setShowMaintenanceImportModal(false)}
              mode="import"
              dataType="maintenance"
              data={{ maintenance: maintenanceData, routes }}
              onImportComplete={(importedMaintenance) => {
                console.log('Imported maintenance:', importedMaintenance);
              }}
            />
          </div>
        );
      case 'alerts':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Alerts</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center">No alerts at this time</p>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.severity === 'critical'
                            ? 'bg-red-50 border-red-200'
                            : alert.severity === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{alert.message}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : alert.severity === 'warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activeAlerts={activeAlerts} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">{renderContent()}</main>
    </div>
  );
}

export default App;