import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { Route, TroubleTicket, NetworkAsset, MaintenanceRecord } from '../types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  includeTimestamp?: boolean;
}

// Routes Export Functions
export const exportRoutesToXLSX = (routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'routes_export';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  // Flatten route data for export
  const exportData = routes.map(route => ({
    'Route ID': route.id,
    'Route Name': route.name,
    'Status': route.status,
    'Start Location': route.location.start,
    'End Location': route.location.end,
    'Fiber Count': route.fiberCount,
    'Total Links': route.links.length,
    'Total Length (km)': route.links.reduce((sum, link) => sum + link.length, 0).toFixed(1),
    'Average Loss (dB)': route.links.length > 0 
      ? (route.links.reduce((sum, link) => sum + link.totalLoss, 0) / route.links.length).toFixed(1) 
      : '0',
    'Trouble Tickets': route.troubleTickets,
    'Handhole Count': route.assets.handhole,
    'ODC Count': route.assets.odc,
    'Pole Count': route.assets.pole,
    'JC Count': route.assets.jc,
    'Last Maintenance': route.lastMaintenance,
    'Next Maintenance': route.nextMaintenance
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Routes');
  
  // Auto-size columns
  const colWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  ws['!cols'] = colWidths;
  
  XLSX.writeFile(wb, `${filename}${timestamp}.xlsx`);
};

export const exportRoutesToCSV = (routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'routes_export';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  const exportData = routes.map(route => ({
    'Route ID': route.id,
    'Route Name': route.name,
    'Status': route.status,
    'Start Location': route.location.start,
    'End Location': route.location.end,
    'Fiber Count': route.fiberCount,
    'Total Links': route.links.length,
    'Total Length (km)': route.links.reduce((sum, link) => sum + link.length, 0).toFixed(1),
    'Average Loss (dB)': route.links.length > 0 
      ? (route.links.reduce((sum, link) => sum + link.totalLoss, 0) / route.links.length).toFixed(1) 
      : '0',
    'Trouble Tickets': route.troubleTickets,
    'Handhole Count': route.assets.handhole,
    'ODC Count': route.assets.odc,
    'Pole Count': route.assets.pole,
    'JC Count': route.assets.jc,
    'Last Maintenance': route.lastMaintenance,
    'Next Maintenance': route.nextMaintenance
  }));

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}${timestamp}.csv`);
};

export const exportRoutesToPDF = (routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'routes_export';
  const title = options.title || 'Routes Report';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  
  // Prepare table data
  const tableData = routes.map(route => [
    route.name,
    route.status,
    `${route.location.start} → ${route.location.end}`,
    route.fiberCount.toString(),
    route.links.length.toString(),
    route.links.reduce((sum, link) => sum + link.length, 0).toFixed(1),
    route.links.length > 0 
      ? (route.links.reduce((sum, link) => sum + link.totalLoss, 0) / route.links.length).toFixed(1) 
      : '0',
    route.troubleTickets.toString()
  ]);

  doc.autoTable({
    head: [['Route', 'Status', 'Location', 'Fibers', 'Links', 'Length (km)', 'Avg Loss (dB)', 'Tickets']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  doc.save(`${filename}${timestamp}.pdf`);
};

// Trouble Tickets Export Functions
export const exportTroubleTicketsToXLSX = (tickets: TroubleTicket[], routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'trouble_tickets_export';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Main tickets sheet
  const ticketsData = tickets.map(ticket => ({
    'Ticket Number': ticket.ticketNumber,
    'Route': getRouteName(ticket.routeId),
    'Link ID': ticket.linkId || 'N/A',
    'Title': ticket.title,
    'Description': ticket.description,
    'Priority': ticket.priority,
    'Status': ticket.status,
    'Category': ticket.category,
    'Reported By': ticket.reportedBy,
    'Assigned To': ticket.assignedTo || 'Unassigned',
    'Person Handling': ticket.personHandling || 'N/A',
    'Impact': ticket.impact,
    'Repair Type': ticket.repairType,
    'Cores Spliced': ticket.coresSpliced,
    'Root Cause': ticket.rootCause,
    'Traffic Impacted': ticket.trafficImpacted,
    'Location': ticket.location.address,
    'Landmark': ticket.location.landmark || 'N/A',
    'Coordinates': `${ticket.problemCoordinates.latitude}, ${ticket.problemCoordinates.longitude}`,
    'Created At': new Date(ticket.createdAt).toLocaleString(),
    'Updated At': new Date(ticket.updatedAt).toLocaleString(),
    'Resolved At': ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : 'N/A',
    'Closed At': ticket.closedAt ? new Date(ticket.closedAt).toLocaleString() : 'N/A',
    'Total Duration': formatDuration(ticket.totalDuration),
    'SLA Target (hours)': ticket.slaTarget || 'N/A',
    'SLA Status': ticket.slaStatus || 'N/A',
    'Activities Count': ticket.activities.length,
    'Materials Count': ticket.materialUsage.length,
    'Photos Count': ticket.photos.length
  }));

  // Material usage sheet
  const materialsData = tickets.flatMap(ticket => 
    ticket.materialUsage.map(material => ({
      'Ticket Number': ticket.ticketNumber,
      'Route': getRouteName(ticket.routeId),
      'Material Type': material.materialType,
      'Material Name': material.materialName,
      'Quantity': material.quantity,
      'Unit': material.unit,
      'Supplier': material.supplier || 'N/A',
      'Part Number': material.partNumber || 'N/A',
      'Used Date': material.usedDate,
      'Location': material.location || 'N/A',
      'Coordinates': material.coordinates 
        ? `${material.coordinates.latitude}, ${material.coordinates.longitude}` 
        : 'N/A',
      'Notes': material.notes || 'N/A'
    }))
  );

  const wb = XLSX.utils.book_new();
  
  // Add tickets sheet
  const ticketsWs = XLSX.utils.json_to_sheet(ticketsData);
  XLSX.utils.book_append_sheet(wb, ticketsWs, 'Trouble Tickets');
  
  // Add materials sheet if there's data
  if (materialsData.length > 0) {
    const materialsWs = XLSX.utils.json_to_sheet(materialsData);
    XLSX.utils.book_append_sheet(wb, materialsWs, 'Material Usage');
  }
  
  XLSX.writeFile(wb, `${filename}${timestamp}.xlsx`);
};

export const exportTroubleTicketsToPDF = (tickets: TroubleTicket[], routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'trouble_tickets_export';
  const title = options.title || 'Trouble Tickets Report';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add generation date and summary
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  doc.text(`Total Tickets: ${tickets.length}`, 20, 40);
  
  // Summary by status
  const statusCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let yPos = 50;
  doc.text('Status Summary:', 20, yPos);
  yPos += 10;
  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`${status}: ${count}`, 30, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  
  // Tickets table
  const tableData = tickets.map(ticket => [
    ticket.ticketNumber,
    getRouteName(ticket.routeId),
    ticket.title.substring(0, 30) + (ticket.title.length > 30 ? '...' : ''),
    ticket.priority,
    ticket.status,
    ticket.impact,
    new Date(ticket.createdAt).toLocaleDateString()
  ]);

  doc.autoTable({
    head: [['Ticket #', 'Route', 'Title', 'Priority', 'Status', 'Impact', 'Created']],
    body: tableData,
    startY: yPos,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  doc.save(`${filename}${timestamp}.pdf`);
};

// Network Assets Export Functions
export const exportAssetsToXLSX = (assets: NetworkAsset[], routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'network_assets_export';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const calculateCompleteness = (completeness: NetworkAsset['completeness']) => {
    const total = Object.keys(completeness).length;
    const completed = Object.values(completeness).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const assetsData = assets.map(asset => ({
    'Asset Number': asset.assetNumber,
    'Asset Name': asset.name,
    'Type': asset.type,
    'Route': getRouteName(asset.routeId),
    'Link ID': asset.linkId || 'N/A',
    'Condition': asset.condition,
    'Status': asset.status,
    'Address': asset.location.address,
    'Landmark': asset.location.landmark || 'N/A',
    'Longitude': asset.location.longitude,
    'Latitude': asset.location.latitude,
    'Elevation (m)': asset.location.elevation || 'N/A',
    'Installation Date': asset.installationDate,
    'Last Inspection': asset.lastInspection || 'N/A',
    'Next Inspection': asset.nextInspection || 'N/A',
    'Manufacturer': asset.specifications.manufacturer || 'N/A',
    'Model': asset.specifications.model || 'N/A',
    'Serial Number': asset.specifications.serialNumber || 'N/A',
    'Capacity': asset.specifications.capacity || 'N/A',
    'Material': asset.specifications.material || 'N/A',
    'IP Rating': asset.specifications.ipRating || 'N/A',
    'Completeness (%)': calculateCompleteness(asset.completeness),
    'Photos Count': asset.photos.length,
    'Maintenance Records': asset.maintenanceHistory.length,
    'Created At': new Date(asset.createdAt).toLocaleString(),
    'Created By': asset.createdBy,
    'Last Modified': new Date(asset.updatedAt).toLocaleString(),
    'Last Modified By': asset.lastModifiedBy,
    'Notes': asset.notes || 'N/A'
  }));

  const ws = XLSX.utils.json_to_sheet(assetsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Network Assets');
  
  XLSX.writeFile(wb, `${filename}${timestamp}.xlsx`);
};

// Assets PDF Export
export const exportAssetsToPDF = (assets: NetworkAsset[], routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'network_assets_export';
  const title = options.title || 'Network Assets Report';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add generation date and summary
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  doc.text(`Total Assets: ${assets.length}`, 20, 40);
  
  // Summary by type
  const typeCounts = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let yPos = 50;
  doc.text('Asset Type Summary:', 20, yPos);
  yPos += 10;
  Object.entries(typeCounts).forEach(([type, count]) => {
    doc.text(`${type}: ${count}`, 30, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  
  // Assets table
  const tableData = assets.map(asset => [
    asset.assetNumber,
    asset.name.substring(0, 20) + (asset.name.length > 20 ? '...' : ''),
    asset.type,
    getRouteName(asset.routeId),
    asset.condition,
    asset.status,
    new Date(asset.installationDate).toLocaleDateString()
  ]);

  doc.autoTable({
    head: [['Asset #', 'Name', 'Type', 'Route', 'Condition', 'Status', 'Installed']],
    body: tableData,
    startY: yPos,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  doc.save(`${filename}${timestamp}.pdf`);
};

// Import Functions
export const importRoutesFromXLSX = (file: File): Promise<Partial<Route>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const routes = jsonData.map((row: any) => ({
          name: row['Route Name'] || row.name,
          status: row['Status'] || row.status || 'operational',
          fiberCount: parseInt(row['Fiber Count'] || row.fiberCount) || 0,
          location: {
            start: row['Start Location'] || row.start || '',
            end: row['End Location'] || row.end || ''
          },
          lastMaintenance: row['Last Maintenance'] || row.lastMaintenance || new Date().toISOString().split('T')[0],
          nextMaintenance: row['Next Maintenance'] || row.nextMaintenance || new Date().toISOString().split('T')[0],
          troubleTickets: parseInt(row['Trouble Tickets'] || row.troubleTickets) || 0,
          assets: {
            handhole: parseInt(row['Handhole Count'] || row.handhole) || 0,
            odc: parseInt(row['ODC Count'] || row.odc) || 0,
            pole: parseInt(row['Pole Count'] || row.pole) || 0,
            jc: parseInt(row['JC Count'] || row.jc) || 0
          },
          links: [] // Links would need to be imported separately or created
        }));
        
        resolve(routes);
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + error));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const importRoutesFromCSV = (file: File): Promise<Partial<Route>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const routes = results.data.map((row: any) => ({
            name: row['Route Name'] || row.name,
            status: row['Status'] || row.status || 'operational',
            fiberCount: parseInt(row['Fiber Count'] || row.fiberCount) || 0,
            location: {
              start: row['Start Location'] || row.start || '',
              end: row['End Location'] || row.end || ''
            },
            lastMaintenance: row['Last Maintenance'] || row.lastMaintenance || new Date().toISOString().split('T')[0],
            nextMaintenance: row['Next Maintenance'] || row.nextMaintenance || new Date().toISOString().split('T')[0],
            troubleTickets: parseInt(row['Trouble Tickets'] || row.troubleTickets) || 0,
            assets: {
              handhole: parseInt(row['Handhole Count'] || row.handhole) || 0,
              odc: parseInt(row['ODC Count'] || row.odc) || 0,
              pole: parseInt(row['Pole Count'] || row.pole) || 0,
              jc: parseInt(row['JC Count'] || row.jc) || 0
            },
            links: []
          }));
          
          resolve(routes.filter(route => route.name)); // Filter out empty rows
        } catch (error) {
          reject(new Error('Failed to parse CSV file: ' + error));
        }
      },
      error: (error) => reject(new Error('Failed to parse CSV file: ' + error))
    });
  });
};

// Maintenance Records Export
export const exportMaintenanceToXLSX = (records: MaintenanceRecord[], routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'maintenance_records_export';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const exportData = records.map(record => ({
    'Record ID': record.id,
    'Route': getRouteName(record.routeId),
    'Type': record.type,
    'Status': record.status,
    'Title': record.title,
    'Description': record.description,
    'Priority': record.priority,
    'Scheduled Date': record.scheduledDate,
    'Completed Date': record.completedDate || 'N/A',
    'Technician': record.technician,
    'Duration (hours)': record.duration || 'N/A',
    'Notes': record.notes || 'N/A'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Records');
  
  XLSX.writeFile(wb, `${filename}${timestamp}.xlsx`);
};

// Maintenance PDF Export
export const exportMaintenanceToPDF = (records: MaintenanceRecord[], routes: Route[], options: ExportOptions = {}) => {
  const filename = options.filename || 'maintenance_records_export';
  const title = options.title || 'Maintenance Records Report';
  const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  
  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add generation date and summary
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  doc.text(`Total Records: ${records.length}`, 20, 40);
  
  // Summary by status
  const statusCounts = records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let yPos = 50;
  doc.text('Status Summary:', 20, yPos);
  yPos += 10;
  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`${status}: ${count}`, 30, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  
  // Records table
  const tableData = records.map(record => [
    getRouteName(record.routeId),
    record.title.substring(0, 25) + (record.title.length > 25 ? '...' : ''),
    record.type,
    record.status,
    record.priority,
    record.technician,
    record.scheduledDate
  ]);

  doc.autoTable({
    head: [['Route', 'Title', 'Type', 'Status', 'Priority', 'Technician', 'Scheduled']],
    body: tableData,
    startY: yPos,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  doc.save(`${filename}${timestamp}.pdf`);
};

// Bulk export function
export const exportAllData = (
  routes: Route[], 
  tickets: TroubleTicket[], 
  assets: NetworkAsset[], 
  maintenance: MaintenanceRecord[],
  format: 'xlsx' | 'csv' | 'pdf' = 'xlsx'
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'xlsx') {
    const wb = XLSX.utils.book_new();
    
    // Routes sheet
    const routesData = routes.map(route => ({
      'Route ID': route.id,
      'Route Name': route.name,
      'Status': route.status,
      'Start Location': route.location.start,
      'End Location': route.location.end,
      'Fiber Count': route.fiberCount,
      'Total Links': route.links.length,
      'Total Length (km)': route.links.reduce((sum, link) => sum + link.length, 0).toFixed(1),
      'Average Loss (dB)': route.links.length > 0 
        ? (route.links.reduce((sum, link) => sum + link.totalLoss, 0) / route.links.length).toFixed(1) 
        : '0',
      'Trouble Tickets': route.troubleTickets,
      'Handhole Count': route.assets.handhole,
      'ODC Count': route.assets.odc,
      'Pole Count': route.assets.pole,
      'JC Count': route.assets.jc,
      'Last Maintenance': route.lastMaintenance,
      'Next Maintenance': route.nextMaintenance
    }));
    const routesWs = XLSX.utils.json_to_sheet(routesData);
    XLSX.utils.book_append_sheet(wb, routesWs, 'Routes');
    
    // Assets sheet
    if (assets.length > 0) {
      const assetsData = assets.map(asset => ({
        'Asset Number': asset.assetNumber,
        'Asset Name': asset.name,
        'Type': asset.type,
        'Route': routes.find(r => r.id === asset.routeId)?.name || 'Unknown',
        'Condition': asset.condition,
        'Status': asset.status,
        'Location': asset.location.address,
        'Installation Date': asset.installationDate,
        'Last Inspection': asset.lastInspection || 'N/A',
        'Next Inspection': asset.nextInspection || 'N/A'
      }));
      const assetsWs = XLSX.utils.json_to_sheet(assetsData);
      XLSX.utils.book_append_sheet(wb, assetsWs, 'Assets');
    }
    
    // Tickets sheet
    if (tickets.length > 0) {
      const ticketsData = tickets.map(ticket => ({
        'Ticket Number': ticket.ticketNumber,
        'Route': routes.find(r => r.id === ticket.routeId)?.name || 'Unknown',
        'Title': ticket.title,
        'Priority': ticket.priority,
        'Status': ticket.status,
        'Category': ticket.category,
        'Impact': ticket.impact,
        'Repair Type': ticket.repairType,
        'Created At': new Date(ticket.createdAt).toLocaleString(),
        'Resolved At': ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : 'N/A'
      }));
      const ticketsWs = XLSX.utils.json_to_sheet(ticketsData);
      XLSX.utils.book_append_sheet(wb, ticketsWs, 'Trouble Tickets');
    }
    
    // Maintenance sheet
    if (maintenance.length > 0) {
      const maintenanceData = maintenance.map(record => ({
        'Route': routes.find(r => r.id === record.routeId)?.name || 'Unknown',
        'Type': record.type,
        'Status': record.status,
        'Title': record.title,
        'Priority': record.priority,
        'Scheduled Date': record.scheduledDate,
        'Completed Date': record.completedDate || 'N/A',
        'Technician': record.technician,
        'Duration (hours)': record.duration || 'N/A'
      }));
      const maintenanceWs = XLSX.utils.json_to_sheet(maintenanceData);
      XLSX.utils.book_append_sheet(wb, maintenanceWs, 'Maintenance');
    }
    
    XLSX.writeFile(wb, `fibernet_complete_export_${timestamp}.xlsx`);
  } else if (format === 'pdf') {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('FiberNet Complete Report', 20, 20);
    
    // Add generation date and summary
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    doc.text(`Routes: ${routes.length} | Tickets: ${tickets.length} | Assets: ${assets.length} | Maintenance: ${maintenance.length}`, 20, 40);
    
    let yPos = 60;
    
    // Routes summary
    if (routes.length > 0) {
      doc.setFontSize(14);
      doc.text('Routes Summary', 20, yPos);
      yPos += 15;
      
      const routesTableData = routes.slice(0, 10).map(route => [
        route.name,
        route.status,
        route.fiberCount.toString(),
        route.links.length.toString(),
        route.troubleTickets.toString()
      ]);

      doc.autoTable({
        head: [['Route', 'Status', 'Fibers', 'Links', 'Tickets']],
        body: routesTableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      yPos = (doc as any).autoTable.previous.finalY + 20;
    }
    
    // Add new page if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Tickets summary
    if (tickets.length > 0) {
      doc.setFontSize(14);
      doc.text('Recent Trouble Tickets', 20, yPos);
      yPos += 15;
      
      const ticketsTableData = tickets.slice(0, 10).map(ticket => [
        ticket.ticketNumber,
        routes.find(r => r.id === ticket.routeId)?.name || 'Unknown',
        ticket.priority,
        ticket.status,
        new Date(ticket.createdAt).toLocaleDateString()
      ]);

      doc.autoTable({
        head: [['Ticket #', 'Route', 'Priority', 'Status', 'Created']],
        body: ticketsTableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
    }
    
    doc.save(`fibernet_complete_export_${timestamp}.pdf`);
  }
};