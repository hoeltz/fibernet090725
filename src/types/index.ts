export interface Link {
  id: string;
  name: string;
  length: number; // in km
  otdrLength?: number; // OTDR measured length in km
  totalLoss: number; // in dB
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
}

export interface RouteAssets {
  handhole: number;
  odc: number; // Optical Distribution Cabinet
  pole: number;
  jc: number; // Joint Closure
}

export interface Route {
  id: string;
  name: string;
  status: 'operational' | 'maintenance' | 'critical' | 'warning';
  lastMaintenance: string;
  nextMaintenance: string;
  troubleTickets: number; // Replace uptime with trouble ticket count
  fiberCount: number;
  location: {
    start: string;
    end: string;
  };
  links: Link[]; // Multiple links per route
  assets: RouteAssets; // Total assets for the route
}

export interface MaintenanceRecord {
  id: string;
  routeId: string;
  type: 'preventive' | 'corrective';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  technician: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration?: number; // in hours
  notes?: string;
}

export interface Alert {
  id: string;
  routeId: string;
  type: 'maintenance-due' | 'system-failure' | 'performance-degraded' | 'scheduled-maintenance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface SLAData {
  week: string;
  routeA: number;
  routeB: number;
  routeC: number;
  routeD: number;
  routeE: number;
  routeF: number;
  average: number;
}

export interface SLATarget {
  routeId: string;
  routeName: string;
  target: number;
  current: number;
  maintenanceTime: number; // in hours - time to resolve issues
  status: 'achieve' | 'standard' | 'exceed'; // Simplified to 3 categories
  trend: 'up' | 'down' | 'stable';
}

export interface TroubleTicketLocation {
  longitude: number;
  latitude: number;
  address: string;
  landmark?: string;
}

export interface TroubleTicketActivity {
  id: string;
  ticketId: string;
  type: 'created' | 'assigned' | 'status-changed' | 'comment' | 'resolved' | 'escalated' | 'field-work' | 'testing' | 'prepare' | 'initial-measurement' | 'travel' | 'handling' | 'securing';
  description: string;
  performedBy: string;
  timestamp: string;
  duration?: number; // in minutes
  details?: {
    oldValue?: string;
    newValue?: string;
    location?: string;
    testResults?: string;
    attachments?: string[];
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface MaterialUsage {
  id: string;
  ticketId: string;
  materialType: 'fiber-cable' | 'closure' | 'connector' | 'splice-tray' | 'patch-cord' | 'adapter' | 'cleaner' | 'protector' | 'tube' | 'other';
  materialName: string;
  quantity: number;
  unit: 'meter' | 'piece' | 'roll' | 'box' | 'set';
  supplier?: string;
  partNumber?: string;
  usedDate: string;
  notes?: string;
  // Coordinates for closures and equipment
  coordinates?: {
    longitude: number;
    latitude: number;
  };
  location?: string; // Description of where the material was used
}

export interface TroubleTicket {
  id: string;
  ticketNumber: string; // NOC-CGK-YYYYMMDD-XXX format
  routeId: string;
  linkId?: string; // Optional - specific link affected
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'signal-loss' | 'fiber-cut' | 'equipment-failure' | 'performance-degraded' | 'maintenance' | 'power-outage' | 'environmental' | 'other';
  reportedBy: string;
  assignedTo?: string;
  personHandling?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  estimatedResolution?: string;
  actualResolution?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  location: TroubleTicketLocation;
  totalDuration?: number; // in minutes - from creation to resolution
  activities: TroubleTicketActivity[];
  slaTarget?: number; // SLA target in hours
  slaStatus?: 'within' | 'approaching' | 'breached';
  
  // New fields for detailed tracking
  repairType: 'permanent' | 'temporary';
  coresSpliced: number;
  problemCoordinates: {
    longitude: number;
    latitude: number;
  };
  rootCause: string;
  trafficImpacted: string;
  photos: Array<{
    id: string;
    url: string;
    caption: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  materialUsage: MaterialUsage[];
}

// New Asset Management Types
export interface AssetLocation {
  longitude: number;
  latitude: number;
  address: string;
  landmark?: string;
  elevation?: number; // in meters
}

export interface AssetPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: string;
  type: 'installation' | 'maintenance' | 'inspection' | 'damage' | 'repair';
}

export interface AssetMaintenance {
  id: string;
  assetId: string;
  type: 'inspection' | 'cleaning' | 'repair' | 'replacement' | 'upgrade';
  date: string;
  performedBy: string;
  description: string;
  findings?: string;
  nextMaintenanceDate?: string;
  cost?: number;
  status: 'completed' | 'pending' | 'scheduled';
}

export interface NetworkAsset {
  id: string;
  assetNumber: string; // Unique asset identifier
  name: string;
  type: 'handhole' | 'odc' | 'pole' | 'jc' | 'otb' | 'splice-box' | 'repeater' | 'terminal' | 'cabinet';
  routeId: string;
  linkId?: string;
  location: AssetLocation;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  installationDate: string;
  lastInspection?: string;
  nextInspection?: string;
  specifications: {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    capacity?: number;
    material?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      depth?: number;
    };
    powerRequirement?: string;
    operatingTemperature?: string;
    ipRating?: string;
  };
  completeness: {
    cover: boolean;
    lock: boolean;
    label: boolean;
    grounding: boolean;
    drainage: boolean;
    accessories: boolean;
    documentation: boolean;
  };
  photos: AssetPhoto[];
  maintenanceHistory: AssetMaintenance[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}