import { Route, MaintenanceRecord, Alert, SLAData, SLATarget, TroubleTicket, TroubleTicketActivity, Link, NetworkAsset, MaterialUsage, NetworkPatrol } from '../types';

export const routes: Route[] = [
  {
    id: 'route-a',
    name: 'Route A',
    status: 'operational',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15',
    troubleTickets: 2,
    fiberCount: 144,
    location: {
      start: 'Central Hub',
      end: 'District A Terminal'
    },
    assets: {
      handhole: 15,
      odc: 3,
      pole: 28,
      jc: 12
    },
    links: [
      {
        id: 'link-a1',
        name: 'FO-LINK-CHA-01',
        length: 12.5,
        otdrLength: 12.7,
        totalLoss: 2.3,
        status: 'operational'
      },
      {
        id: 'link-a2',
        name: 'FO-LINK-CHA-02',
        length: 13.0,
        otdrLength: 13.2,
        totalLoss: 2.1,
        status: 'operational'
      }
    ]
  },
  {
    id: 'route-b',
    name: 'Route B',
    status: 'warning',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    troubleTickets: 5,
    fiberCount: 96,
    location: {
      start: 'Central Hub',
      end: 'District B Terminal'
    },
    assets: {
      handhole: 22,
      odc: 4,
      pole: 35,
      jc: 18
    },
    links: [
      {
        id: 'link-b1',
        name: 'FO-LINK-CHB-01',
        length: 16.1,
        otdrLength: 16.3,
        totalLoss: 3.8,
        status: 'warning'
      },
      {
        id: 'link-b2',
        name: 'FO-LINK-CHB-02',
        length: 16.0,
        otdrLength: 16.1,
        totalLoss: 3.2,
        status: 'operational'
      }
    ]
  },
  {
    id: 'route-c',
    name: 'Route C',
    status: 'maintenance',
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-05-01',
    troubleTickets: 8,
    fiberCount: 72,
    location: {
      start: 'Central Hub',
      end: 'District C Terminal'
    },
    assets: {
      handhole: 18,
      odc: 2,
      pole: 24,
      jc: 14
    },
    links: [
      {
        id: 'link-c1',
        name: 'FO-LINK-CHC-01',
        length: 9.2,
        otdrLength: 9.4,
        totalLoss: 4.2,
        status: 'maintenance'
      },
      {
        id: 'link-c2',
        name: 'FO-LINK-CHC-02',
        length: 9.5,
        otdrLength: 9.6,
        totalLoss: 3.9,
        status: 'operational'
      }
    ]
  },
  {
    id: 'route-d',
    name: 'Route D',
    status: 'operational',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-04-20',
    troubleTickets: 1,
    fiberCount: 144,
    location: {
      start: 'Central Hub',
      end: 'District D Terminal'
    },
    assets: {
      handhole: 25,
      odc: 5,
      pole: 42,
      jc: 20
    },
    links: [
      {
        id: 'link-d1',
        name: 'FO-LINK-CHD-01',
        length: 13.8,
        otdrLength: 14.0,
        totalLoss: 1.9,
        status: 'operational'
      },
      {
        id: 'link-d2',
        name: 'FO-LINK-CHD-02',
        length: 14.2,
        otdrLength: 14.4,
        totalLoss: 2.0,
        status: 'operational'
      },
      {
        id: 'link-d3',
        name: 'FO-LINK-CHD-03',
        length: 13.3,
        otdrLength: 13.5,
        totalLoss: 1.8,
        status: 'operational'
      }
    ]
  },
  {
    id: 'route-e',
    name: 'Route E',
    status: 'critical',
    lastMaintenance: '2024-01-08',
    nextMaintenance: '2024-04-08',
    troubleTickets: 12,
    fiberCount: 48,
    location: {
      start: 'Central Hub',
      end: 'District E Terminal'
    },
    assets: {
      handhole: 12,
      odc: 2,
      pole: 18,
      jc: 8
    },
    links: [
      {
        id: 'link-e1',
        name: 'FO-LINK-CHE-01',
        length: 14.5,
        otdrLength: 14.8,
        totalLoss: 6.7,
        status: 'critical'
      },
      {
        id: 'link-e2',
        name: 'FO-LINK-CHE-02',
        length: 14.4,
        otdrLength: 14.6,
        totalLoss: 5.2,
        status: 'warning'
      }
    ]
  },
  {
    id: 'route-f',
    name: 'Route F',
    status: 'operational',
    lastMaintenance: '2024-01-25',
    nextMaintenance: '2024-04-25',
    troubleTickets: 3,
    fiberCount: 96,
    location: {
      start: 'Central Hub',
      end: 'District F Terminal'
    },
    assets: {
      handhole: 20,
      odc: 3,
      pole: 32,
      jc: 16
    },
    links: [
      {
        id: 'link-f1',
        name: 'FO-LINK-CHF-01',
        length: 17.6,
        otdrLength: 17.8,
        totalLoss: 2.8,
        status: 'operational'
      },
      {
        id: 'link-f2',
        name: 'FO-LINK-CHF-02',
        length: 17.6,
        otdrLength: 17.9,
        totalLoss: 3.1,
        status: 'operational'
      }
    ]
  }
];

export const networkAssets: NetworkAsset[] = [
  {
    id: 'asset-001',
    assetNumber: 'HH-CHA-001',
    name: 'Handhole Central Hub 01',
    type: 'handhole',
    routeId: 'route-a',
    linkId: 'link-a1',
    location: {
      longitude: 106.8456,
      latitude: -6.2088,
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      landmark: 'Near Plaza Indonesia',
      elevation: 15
    },
    condition: 'good',
    status: 'active',
    installationDate: '2023-06-15',
    lastInspection: '2024-01-15',
    nextInspection: '2024-04-15',
    specifications: {
      manufacturer: 'Corning',
      model: 'HH-24F',
      serialNumber: 'SN123456789',
      capacity: 24,
      material: 'Concrete',
      dimensions: {
        length: 120,
        width: 80,
        height: 100,
        depth: 80
      },
      ipRating: 'IP65',
      operatingTemperature: '-40°C to +70°C'
    },
    completeness: {
      cover: true,
      lock: true,
      label: true,
      grounding: true,
      drainage: true,
      accessories: true,
      documentation: false
    },
    photos: [
      {
        id: 'photo-001',
        url: 'https://images.pexels.com/photos/159306/fiber-optic-cable-fiber-glass-fiber-159306.jpeg',
        caption: 'Handhole installation view',
        uploadedBy: 'John Smith',
        uploadedAt: '2024-01-15T10:30:00Z',
        type: 'installation'
      },
      {
        id: 'photo-002',
        url: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
        caption: 'Internal fiber connections',
        uploadedBy: 'John Smith',
        uploadedAt: '2024-01-15T10:35:00Z',
        type: 'inspection'
      }
    ],
    maintenanceHistory: [
      {
        id: 'maint-001',
        assetId: 'asset-001',
        type: 'inspection',
        date: '2024-01-15',
        performedBy: 'John Smith',
        description: 'Quarterly inspection and cleaning',
        findings: 'All connections secure, minor dust accumulation cleaned',
        nextMaintenanceDate: '2024-04-15',
        status: 'completed'
      }
    ],
    notes: 'Located at main intersection, high traffic area. Requires regular monitoring.',
    createdAt: '2023-06-15T08:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    createdBy: 'Installation Team',
    lastModifiedBy: 'John Smith'
  },
  {
    id: 'asset-002',
    assetNumber: 'ODC-CHA-001',
    name: 'ODC Central Hub Alpha',
    type: 'odc',
    routeId: 'route-a',
    location: {
      longitude: 106.8234,
      latitude: -6.1944,
      address: 'Jl. Thamrin No. 45, Jakarta Pusat',
      landmark: 'Grand Indonesia Mall',
      elevation: 12
    },
    condition: 'excellent',
    status: 'active',
    installationDate: '2023-05-20',
    lastInspection: '2024-02-01',
    nextInspection: '2024-05-01',
    specifications: {
      manufacturer: 'Huawei',
      model: 'ODC-144F',
      serialNumber: 'HW987654321',
      capacity: 144,
      material: 'Steel',
      dimensions: {
        length: 200,
        width: 150,
        height: 250
      },
      powerRequirement: '220V AC',
      ipRating: 'IP55',
      operatingTemperature: '-20°C to +60°C'
    },
    completeness: {
      cover: true,
      lock: true,
      label: true,
      grounding: true,
      drainage: true,
      accessories: true,
      documentation: true
    },
    photos: [
      {
        id: 'photo-003',
        url: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
        caption: 'ODC external view',
        uploadedBy: 'Sarah Johnson',
        uploadedAt: '2024-02-01T09:00:00Z',
        type: 'inspection'
      }
    ],
    maintenanceHistory: [
      {
        id: 'maint-002',
        assetId: 'asset-002',
        type: 'inspection',
        date: '2024-02-01',
        performedBy: 'Sarah Johnson',
        description: 'Monthly inspection and fiber testing',
        findings: 'All systems operational, excellent condition',
        nextMaintenanceDate: '2024-05-01',
        status: 'completed'
      }
    ],
    notes: 'Primary distribution point for Route A. Critical infrastructure.',
    createdAt: '2023-05-20T10:00:00Z',
    updatedAt: '2024-02-01T16:00:00Z',
    createdBy: 'Installation Team',
    lastModifiedBy: 'Sarah Johnson'
  },
  {
    id: 'asset-003',
    assetNumber: 'POLE-CHB-015',
    name: 'Utility Pole CHB-015',
    type: 'pole',
    routeId: 'route-b',
    linkId: 'link-b1',
    location: {
      longitude: 106.8567,
      latitude: -6.2234,
      address: 'Jl. Gatot Subroto No. 78, Jakarta Selatan',
      landmark: 'Kuningan City Mall',
      elevation: 18
    },
    condition: 'fair',
    status: 'active',
    installationDate: '2023-04-10',
    lastInspection: '2024-01-20',
    nextInspection: '2024-03-20',
    specifications: {
      manufacturer: 'PT Tiang Listrik',
      model: 'POLE-12M',
      serialNumber: 'PL456789123',
      material: 'Concrete',
      dimensions: {
        height: 1200
      },
      operatingTemperature: '-30°C to +80°C'
    },
    completeness: {
      cover: false,
      lock: false,
      label: true,
      grounding: true,
      drainage: false,
      accessories: true,
      documentation: true
    },
    photos: [
      {
        id: 'photo-004',
        url: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
        caption: 'Pole with fiber cable attachment',
        uploadedBy: 'Mike Wilson',
        uploadedAt: '2024-01-20T14:00:00Z',
        type: 'inspection'
      }
    ],
    maintenanceHistory: [
      {
        id: 'maint-003',
        assetId: 'asset-003',
        type: 'inspection',
        date: '2024-01-20',
        performedBy: 'Mike Wilson',
        description: 'Visual inspection and cable tension check',
        findings: 'Cable attachment secure, pole shows minor weathering',
        nextMaintenanceDate: '2024-03-20',
        status: 'completed'
      }
    ],
    notes: 'Requires attention for weathering protection. Schedule maintenance soon.',
    createdAt: '2023-04-10T12:00:00Z',
    updatedAt: '2024-01-20T18:00:00Z',
    createdBy: 'Installation Team',
    lastModifiedBy: 'Mike Wilson'
  },
  {
    id: 'asset-004',
    assetNumber: 'JC-CHE-008',
    name: 'Joint Closure CHE-008',
    type: 'jc',
    routeId: 'route-e',
    linkId: 'link-e1',
    location: {
      longitude: 106.8123,
      latitude: -6.1756,
      address: 'Jl. MH Thamrin No. 1, Jakarta Pusat',
      landmark: 'Hotel Indonesia Roundabout',
      elevation: 10
    },
    condition: 'critical',
    status: 'maintenance',
    installationDate: '2023-03-15',
    lastInspection: '2024-02-18',
    nextInspection: '2024-02-25',
    specifications: {
      manufacturer: 'CommScope',
      model: 'JC-48F-IP68',
      serialNumber: 'CS789123456',
      capacity: 48,
      material: 'Polymer',
      dimensions: {
        length: 45,
        width: 15,
        height: 15
      },
      ipRating: 'IP68',
      operatingTemperature: '-40°C to +70°C'
    },
    completeness: {
      cover: true,
      lock: true,
      label: false,
      grounding: true,
      drainage: true,
      accessories: false,
      documentation: true
    },
    photos: [
      {
        id: 'photo-005',
        url: 'https://images.pexels.com/photos/159306/fiber-optic-cable-fiber-glass-fiber-159306.jpeg',
        caption: 'Joint closure showing damage',
        uploadedBy: 'Tom Anderson',
        uploadedAt: '2024-02-18T11:00:00Z',
        type: 'damage'
      }
    ],
    maintenanceHistory: [
      {
        id: 'maint-004',
        assetId: 'asset-004',
        type: 'repair',
        date: '2024-02-18',
        performedBy: 'Tom Anderson',
        description: 'Emergency repair due to water ingress',
        findings: 'Water damage detected, seal replacement required',
        status: 'pending',
        cost: 250
      }
    ],
    notes: 'URGENT: Water ingress detected. Requires immediate seal replacement.',
    createdAt: '2023-03-15T14:00:00Z',
    updatedAt: '2024-02-18T15:30:00Z',
    createdBy: 'Installation Team',
    lastModifiedBy: 'Tom Anderson'
  },
  {
    id: 'asset-005',
    assetNumber: 'OTB-CHF-003',
    name: 'OTB Terminal CHF-003',
    type: 'otb',
    routeId: 'route-f',
    linkId: 'link-f1',
    location: {
      longitude: 106.8789,
      latitude: -6.2456,
      address: 'Jl. Casablanca No. 88, Jakarta Selatan',
      landmark: 'Kota Kasablanka Mall',
      elevation: 22
    },
    condition: 'good',
    status: 'active',
    installationDate: '2023-07-01',
    lastInspection: '2024-01-25',
    nextInspection: '2024-04-25',
    specifications: {
      manufacturer: 'FiberHome',
      model: 'OTB-16F',
      serialNumber: 'FH321654987',
      capacity: 16,
      material: 'ABS Plastic',
      dimensions: {
        length: 30,
        width: 20,
        height: 12
      },
      ipRating: 'IP65',
      operatingTemperature: '-20°C to +60°C'
    },
    completeness: {
      cover: true,
      lock: true,
      label: true,
      grounding: false,
      drainage: false,
      accessories: true,
      documentation: true
    },
    photos: [
      {
        id: 'photo-006',
        url: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
        caption: 'OTB installation complete',
        uploadedBy: 'Lisa Chen',
        uploadedAt: '2024-01-25T13:00:00Z',
        type: 'maintenance'
      }
    ],
    maintenanceHistory: [
      {
        id: 'maint-005',
        assetId: 'asset-005',
        type: 'cleaning',
        date: '2024-01-25',
        performedBy: 'Lisa Chen',
        description: 'Routine cleaning and connector inspection',
        findings: 'All connections clean and secure',
        nextMaintenanceDate: '2024-04-25',
        status: 'completed'
      }
    ],
    notes: 'Customer terminal box serving residential area. Good performance.',
    createdAt: '2023-07-01T09:00:00Z',
    updatedAt: '2024-01-25T17:00:00Z',
    createdBy: 'Installation Team',
    lastModifiedBy: 'Lisa Chen'
  }
];

export const troubleTickets: TroubleTicket[] = [
  {
    id: 'ticket-001',
    ticketNumber: 'NOC-CGK-20240220-0915-001',
    routeId: 'route-e',
    linkId: 'link-e1',
    title: 'Critical Signal Loss on FO-LINK-CHE-01',
    description: 'Severe signal degradation detected on primary link. Customer services affected.',
    priority: 'critical',
    status: 'in-progress',
    category: 'signal-loss',
    reportedBy: 'Network Monitoring System',
    assignedTo: 'Sarah Johnson',
    personHandling: 'Sarah Johnson',
    createdAt: '2024-02-20T09:15:00Z',
    updatedAt: '2024-02-20T11:30:00Z',
    estimatedResolution: '2024-02-20T18:00:00Z',
    impact: 'critical',
    location: {
      longitude: 106.8456,
      latitude: -6.2088,
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      landmark: 'Near Plaza Indonesia'
    },
    slaTarget: 4,
    slaStatus: 'approaching',
    repairType: 'permanent',
    coresSpliced: 12,
    problemCoordinates: {
      longitude: 106.8123,
      latitude: -6.1756
    },
    rootCause: 'Water ingress in joint closure due to damaged seal',
    trafficImpacted: 'Enterprise customers: 15 affected, Residential: 450 customers offline',
    photos: [
      {
        id: 'photo-t001-1',
        url: 'https://images.pexels.com/photos/159306/fiber-optic-cable-fiber-glass-fiber-159306.jpeg',
        caption: 'Damaged joint closure with water ingress',
        uploadedAt: '2024-02-20T11:30:00Z',
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: 'photo-t001-2',
        url: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
        caption: 'OTDR test results showing break location',
        uploadedAt: '2024-02-20T12:00:00Z',
        uploadedBy: 'Sarah Johnson'
      }
    ],
    materialUsage: [
      {
        id: 'mat-001',
        ticketId: 'ticket-001',
        materialType: 'closure',
        materialName: 'Dome Closure 48F IP68',
        quantity: 1,
        unit: 'piece',
        supplier: 'CommScope',
        partNumber: 'CS-DC-48F-IP68',
        usedDate: '2024-02-20T14:00:00Z',
        notes: 'Replacement for water-damaged closure',
        coordinates: {
          longitude: 106.8123,
          latitude: -6.1756
        },
        location: 'Joint Closure CHE-008 - Hotel Indonesia Roundabout'
      },
      {
        id: 'mat-002',
        ticketId: 'ticket-001',
        materialType: 'splice-tray',
        materialName: 'Splice Tray 12F',
        quantity: 2,
        unit: 'piece',
        supplier: 'Corning',
        partNumber: 'COR-ST-12F',
        usedDate: '2024-02-20T14:30:00Z',
        coordinates: {
          longitude: 106.8123,
          latitude: -6.1756
        },
        location: 'Joint Closure CHE-008'
      },
      {
        id: 'mat-003',
        ticketId: 'ticket-001',
        materialType: 'fiber-cable',
        materialName: 'Single Mode Fiber G.652D',
        quantity: 2.5,
        unit: 'meter',
        supplier: 'Furukawa',
        partNumber: 'FUR-SMF-G652D',
        usedDate: '2024-02-20T15:00:00Z',
        notes: 'Replacement fiber for damaged section',
        coordinates: {
          longitude: 106.8123,
          latitude: -6.1756
        },
        location: 'Splice point near JC CHE-008'
      }
    ],
    activities: [
      {
        id: 'activity-001',
        ticketId: 'ticket-001',
        type: 'created',
        description: 'Ticket created automatically by monitoring system',
        performedBy: 'System',
        timestamp: '2024-02-20T09:15:00Z'
      },
      {
        id: 'activity-002',
        ticketId: 'ticket-001',
        type: 'assigned',
        description: 'Ticket assigned to field technician',
        performedBy: 'John Manager',
        timestamp: '2024-02-20T09:20:00Z',
        details: {
          newValue: 'Sarah Johnson'
        }
      },
      {
        id: 'activity-003',
        ticketId: 'ticket-001',
        type: 'prepare',
        description: 'Equipment preparation and team briefing',
        performedBy: 'Sarah Johnson',
        timestamp: '2024-02-20T09:30:00Z',
        duration: 30
      },
      {
        id: 'activity-004',
        ticketId: 'ticket-001',
        type: 'travel',
        description: 'Travel to incident location',
        performedBy: 'Sarah Johnson',
        timestamp: '2024-02-20T10:00:00Z',
        duration: 45,
        details: {
          location: 'From NOC to Jl. Sudirman'
        }
      },
      {
        id: 'activity-005',
        ticketId: 'ticket-001',
        type: 'initial-measurement',
        description: 'OTDR testing completed - fiber break detected at 14.2km',
        performedBy: 'Sarah Johnson',
        timestamp: '2024-02-20T11:30:00Z',
        duration: 60,
        details: {
          testResults: 'Fiber break at 14.2km, loss: 15dB',
          location: 'Kilometer 14.2'
        }
      }
    ]
  },
  {
    id: 'ticket-002',
    ticketNumber: 'NOC-CGK-20240219-0800-002',
    routeId: 'route-c',
    linkId: 'link-c1',
    title: 'Scheduled Maintenance - Connector Cleaning',
    description: 'Preventive maintenance for connector cleaning and inspection',
    priority: 'medium',
    status: 'resolved',
    category: 'maintenance',
    reportedBy: 'Maintenance Team',
    assignedTo: 'Mike Wilson',
    personHandling: 'Mike Wilson',
    createdAt: '2024-02-19T08:00:00Z',
    updatedAt: '2024-02-20T16:00:00Z',
    resolvedAt: '2024-02-20T16:00:00Z',
    estimatedResolution: '2024-02-20T16:00:00Z',
    impact: 'low',
    location: {
      longitude: 106.8234,
      latitude: -6.1944,
      address: 'Jl. Thamrin No. 45, Jakarta Pusat',
      landmark: 'Grand Indonesia Mall'
    },
    slaTarget: 8,
    slaStatus: 'within',
    totalDuration: 480, // 8 hours
    repairType: 'permanent',
    coresSpliced: 0,
    problemCoordinates: {
      longitude: 106.8234,
      latitude: -6.1944
    },
    rootCause: 'Scheduled preventive maintenance',
    trafficImpacted: 'No traffic impact - maintenance window',
    photos: [
      {
        id: 'photo-t002-1',
        url: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
        caption: 'Before cleaning - connector inspection',
        uploadedAt: '2024-02-20T09:00:00Z',
        uploadedBy: 'Mike Wilson'
      },
      {
        id: 'photo-t002-2',
        url: 'https://images.pexels.com/photos/159306/fiber-optic-cable-fiber-glass-fiber-159306.jpeg',
        caption: 'After cleaning - all connectors clean',
        uploadedAt: '2024-02-20T15:30:00Z',
        uploadedBy: 'Mike Wilson'
      }
    ],
    materialUsage: [
      {
        id: 'mat-004',
        ticketId: 'ticket-002',
        materialType: 'cleaner',
        materialName: 'Fiber Optic Cleaning Kit',
        quantity: 1,
        unit: 'set',
        supplier: 'Fluke Networks',
        partNumber: 'FLU-FCK-001',
        usedDate: '2024-02-20T09:30:00Z',
        coordinates: {
          longitude: 106.8234,
          latitude: -6.1944
        },
        location: 'ODC Central Hub Alpha - Equipment Room'
      },
      {
        id: 'mat-005',
        ticketId: 'ticket-002',
        materialType: 'cleaner',
        materialName: 'Cleaning Wipes (Box of 100)',
        quantity: 1,
        unit: 'box',
        supplier: 'Thorlabs',
        partNumber: 'THO-CW-100',
        usedDate: '2024-02-20T09:30:00Z',
        coordinates: {
          longitude: 106.8234,
          latitude: -6.1944
        },
        location: 'ODC Central Hub Alpha'
      }
    ],
    activities: [
      {
        id: 'activity-006',
        ticketId: 'ticket-002',
        type: 'created',
        description: 'Scheduled maintenance ticket created',
        performedBy: 'Maintenance Scheduler',
        timestamp: '2024-02-19T08:00:00Z'
      },
      {
        id: 'activity-007',
        ticketId: 'ticket-002',
        type: 'prepare',
        description: 'Equipment and tools preparation',
        performedBy: 'Mike Wilson',
        timestamp: '2024-02-20T08:00:00Z',
        duration: 45
      },
      {
        id: 'activity-008',
        ticketId: 'ticket-002',
        type: 'travel',
        description: 'Travel to maintenance location',
        performedBy: 'Mike Wilson',
        timestamp: '2024-02-20T08:45:00Z',
        duration: 30
      },
      {
        id: 'activity-009',
        ticketId: 'ticket-002',
        type: 'handling',
        description: 'Connector cleaning completed on splice points 1-5',
        performedBy: 'Mike Wilson',
        timestamp: '2024-02-20T09:15:00Z',
        duration: 240
      },
      {
        id: 'activity-010',
        ticketId: 'ticket-002',
        type: 'securing',
        description: 'Site secured and equipment tested',
        performedBy: 'Mike Wilson',
        timestamp: '2024-02-20T15:30:00Z',
        duration: 30
      }
    ]
  },
  {
    id: 'ticket-003',
    ticketNumber: 'NOC-CGK-20240220-0730-003',
    routeId: 'route-b',
    linkId: 'link-b1',
    title: 'Performance Degradation Alert',
    description: 'Gradual signal quality degradation over past 48 hours',
    priority: 'medium',
    status: 'open',
    category: 'performance-degraded',
    reportedBy: 'Network Monitoring System',
    createdAt: '2024-02-20T07:30:00Z',
    updatedAt: '2024-02-20T07:30:00Z',
    impact: 'medium',
    location: {
      longitude: 106.8567,
      latitude: -6.2234,
      address: 'Jl. Gatot Subroto No. 78, Jakarta Selatan',
      landmark: 'Kuningan City Mall'
    },
    slaTarget: 6,
    slaStatus: 'within',
    repairType: 'temporary',
    coresSpliced: 0,
    problemCoordinates: {
      longitude: 106.8567,
      latitude: -6.2234
    },
    rootCause: 'Under investigation - suspected connector degradation',
    trafficImpacted: 'Reduced bandwidth affecting 25 enterprise customers',
    photos: [],
    materialUsage: [],
    activities: [
      {
        id: 'activity-011',
        ticketId: 'ticket-003',
        type: 'created',
        description: 'Performance degradation detected by monitoring system',
        performedBy: 'System',
        timestamp: '2024-02-20T07:30:00Z'
      }
    ]
  },
  {
    id: 'ticket-004',
    ticketNumber: 'NOC-CGK-20240218-1420-004',
    routeId: 'route-a',
    title: 'Equipment Failure - Amplifier Unit',
    description: 'Optical amplifier showing error codes and reduced output',
    priority: 'high',
    status: 'closed',
    category: 'equipment-failure',
    reportedBy: 'Field Technician',
    assignedTo: 'Tom Anderson',
    personHandling: 'Tom Anderson',
    createdAt: '2024-02-18T14:20:00Z',
    updatedAt: '2024-02-19T16:45:00Z',
    resolvedAt: '2024-02-19T16:30:00Z',
    closedAt: '2024-02-19T16:45:00Z',
    actualResolution: '2024-02-19T16:45:00Z',
    impact: 'medium',
    location: {
      longitude: 106.8123,
      latitude: -6.1756,
      address: 'Jl. MH Thamrin No. 1, Jakarta Pusat',
      landmark: 'Hotel Indonesia Roundabout'
    },
    slaTarget: 6,
    slaStatus: 'within',
    totalDuration: 1585, // ~26 hours
    repairType: 'permanent',
    coresSpliced: 0,
    problemCoordinates: {
      longitude: 106.8123,
      latitude: -6.1756
    },
    rootCause: 'Amplifier unit failure due to power surge',
    trafficImpacted: 'Backup path activated - minimal customer impact',
    photos: [
      {
        id: 'photo-t004-1',
        url: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
        caption: 'Failed amplifier unit showing error codes',
        uploadedAt: '2024-02-18T15:00:00Z',
        uploadedBy: 'Tom Anderson'
      },
      {
        id: 'photo-t004-2',
        url: 'https://images.pexels.com/photos/159306/fiber-optic-cable-fiber-glass-fiber-159306.jpeg',
        caption: 'New amplifier unit installed and tested',
        uploadedAt: '2024-02-19T16:30:00Z',
        uploadedBy: 'Tom Anderson'
      }
    ],
    materialUsage: [
      {
        id: 'mat-006',
        ticketId: 'ticket-004',
        materialType: 'other',
        materialName: 'Optical Amplifier EDFA 20dB',
        quantity: 1,
        unit: 'piece',
        supplier: 'Huawei',
        partNumber: 'HW-EDFA-20DB',
        usedDate: '2024-02-19T15:00:00Z',
        notes: 'Replacement for failed unit',
        coordinates: {
          longitude: 106.8123,
          latitude: -6.1756
        },
        location: 'Central Hub - Equipment Room'
      },
      {
        id: 'mat-007',
        ticketId: 'ticket-004',
        materialType: 'patch-cord',
        materialName: 'SC/APC Patch Cord 2m',
        quantity: 4,
        unit: 'piece',
        supplier: 'Corning',
        partNumber: 'COR-PC-SC-2M',
        usedDate: '2024-02-19T15:30:00Z',
        coordinates: {
          longitude: 106.8123,
          latitude: -6.1756
        },
        location: 'Central Hub - Equipment Room'
      }
    ],
    activities: [
      {
        id: 'activity-012',
        ticketId: 'ticket-004',
        type: 'created',
        description: 'Equipment failure reported by field technician',
        performedBy: 'Tom Anderson',
        timestamp: '2024-02-18T14:20:00Z'
      },
      {
        id: 'activity-013',
        ticketId: 'ticket-004',
        type: 'prepare',
        description: 'Spare equipment preparation and diagnostics',
        performedBy: 'Tom Anderson',
        timestamp: '2024-02-19T08:00:00Z',
        duration: 60
      },
      {
        id: 'activity-014',
        ticketId: 'ticket-004',
        type: 'travel',
        description: 'Travel to equipment location',
        performedBy: 'Tom Anderson',
        timestamp: '2024-02-19T14:00:00Z',
        duration: 45
      },
      {
        id: 'activity-015',
        ticketId: 'ticket-004',
        type: 'handling',
        description: 'Amplifier unit replaced with spare unit',
        performedBy: 'Tom Anderson',
        timestamp: '2024-02-19T15:00:00Z',
        duration: 90,
        details: {
          location: 'Central Hub - Equipment Room'
        }
      },
      {
        id: 'activity-016',
        ticketId: 'ticket-004',
        type: 'testing',
        description: 'System testing completed - all parameters normal',
        performedBy: 'Tom Anderson',
        timestamp: '2024-02-19T16:30:00Z',
        duration: 15,
        details: {
          testResults: 'Output power: 15dBm, Gain: 20dB - Normal'
        }
      },
      {
        id: 'activity-017',
        ticketId: 'ticket-004',
        type: 'securing',
        description: 'Site secured and documentation completed',
        performedBy: 'Tom Anderson',
        timestamp: '2024-02-19T16:45:00Z',
        duration: 15
      }
    ]
  }
];

export const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'maint-001',
    routeId: 'route-c',
    type: 'preventive',
    status: 'in-progress',
    title: 'Quarterly Fiber Inspection',
    description: 'Regular inspection of fiber optic cables and connections',
    scheduledDate: '2024-02-20',
    technician: 'John Smith',
    priority: 'medium'
  },
  {
    id: 'maint-002',
    routeId: 'route-e',
    type: 'corrective',
    status: 'scheduled',
    title: 'Signal Loss Investigation',
    description: 'Investigate and repair signal degradation on Route E',
    scheduledDate: '2024-02-22',
    technician: 'Sarah Johnson',
    priority: 'critical'
  },
  {
    id: 'maint-003',
    routeId: 'route-b',
    type: 'preventive',
    status: 'completed',
    title: 'Cable Cleaning and Testing',
    description: 'Clean connectors and perform signal quality tests',
    scheduledDate: '2024-02-15',
    completedDate: '2024-02-15',
    technician: 'Mike Wilson',
    priority: 'low',
    duration: 4,
    notes: 'All tests passed. Minor cleaning required on connector 12.'
  }
];

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    routeId: 'route-e',
    type: 'system-failure',
    severity: 'critical',
    message: 'Critical signal loss detected on Route E - immediate attention required',
    timestamp: '2024-02-20T09:15:00Z',
    acknowledged: false
  },
  {
    id: 'alert-002',
    routeId: 'route-b',
    type: 'performance-degraded',
    severity: 'warning',
    message: 'Performance degradation detected on Route B - schedule inspection',
    timestamp: '2024-02-20T07:30:00Z',
    acknowledged: true
  },
  {
    id: 'alert-003',
    routeId: 'route-a',
    type: 'maintenance-due',
    severity: 'info',
    message: 'Preventive maintenance due for Route A in 7 days',
    timestamp: '2024-02-20T08:00:00Z',
    acknowledged: false
  }
];

export const slaWeeklyData: SLAData[] = [
  {
    week: 'Week 1',
    routeA: 99.8,
    routeB: 98.5,
    routeC: 97.2,
    routeD: 99.9,
    routeE: 94.1,
    routeF: 99.3,
    average: 98.1
  },
  {
    week: 'Week 2',
    routeA: 99.7,
    routeB: 98.8,
    routeC: 96.8,
    routeD: 99.8,
    routeE: 93.5,
    routeF: 99.1,
    average: 97.9
  },
  {
    week: 'Week 3',
    routeA: 99.9,
    routeB: 97.9,
    routeC: 95.1,
    routeD: 99.7,
    routeE: 91.8,
    routeF: 99.4,
    average: 97.3
  },
  {
    week: 'Week 4',
    routeA: 99.8,
    routeB: 98.2,
    routeC: 95.5,
    routeD: 99.9,
    routeE: 92.1,
    routeF: 99.5,
    average: 97.5
  }
];

// Helper function to determine SLA status based on maintenance time
const getSLAStatus = (maintenanceTime: number): 'achieve' | 'standard' | 'exceed' => {
  if (maintenanceTime < 6) {
    return 'achieve'; // Below 6 hours - achieving target
  } else if (maintenanceTime === 6) {
    return 'standard'; // Exactly 6 hours - meeting standard
  } else {
    return 'exceed'; // Over 6 hours - exceeding time limit
  }
};

// Helper function to calculate trend based on SLA improvement and maintenance time
const calculateTrend = (currentSLA: number, previousSLA: number, maintenanceTime: number): 'up' | 'down' | 'stable' => {
  // If maintenance time < 6 hours, it's considered positive performance
  const hasGoodMaintenanceTime = maintenanceTime < 6;
  
  // Check if SLA percentage improved
  const slaImproved = currentSLA > previousSLA;
  const slaDeclined = currentSLA < previousSLA;
  
  // Positive trend if: SLA improved OR maintenance time is good
  if (slaImproved || hasGoodMaintenanceTime) {
    return 'up';
  } else if (slaDeclined && maintenanceTime >= 6) {
    return 'down';
  } else {
    return 'stable';
  }
};

// Previous week SLA data for trend calculation
const previousWeekSLA = {
  'route-a': 99.7, // Week 3 data
  'route-b': 97.9,
  'route-c': 95.1,
  'route-d': 99.7,
  'route-e': 91.8,
  'route-f': 99.4
};

export const slaTargets: SLATarget[] = [
  {
    routeId: 'route-a',
    routeName: 'Route A',
    target: 99.5,
    current: 99.8,
    maintenanceTime: 3.5, // < 6 hours = achieve
    status: getSLAStatus(3.5),
    trend: calculateTrend(99.8, previousWeekSLA['route-a'], 3.5)
  },
  {
    routeId: 'route-b',
    routeName: 'Route B',
    target: 99.0,
    current: 98.2,
    maintenanceTime: 6.0, // = 6 hours = standard
    status: getSLAStatus(6.0),
    trend: calculateTrend(98.2, previousWeekSLA['route-b'], 6.0)
  },
  {
    routeId: 'route-c',
    routeName: 'Route C',
    target: 98.0,
    current: 95.5,
    maintenanceTime: 12.0, // > 6 hours = exceed
    status: getSLAStatus(12.0),
    trend: calculateTrend(95.5, previousWeekSLA['route-c'], 12.0)
  },
  {
    routeId: 'route-d',
    routeName: 'Route D',
    target: 99.5,
    current: 99.9,
    maintenanceTime: 2.1, // < 6 hours = achieve
    status: getSLAStatus(2.1),
    trend: calculateTrend(99.9, previousWeekSLA['route-d'], 2.1)
  },
  {
    routeId: 'route-e',
    routeName: 'Route E',
    target: 98.0,
    current: 92.1,
    maintenanceTime: 24.0, // > 6 hours = exceed (24 hours for illustration)
    status: getSLAStatus(24.0),
    trend: calculateTrend(92.1, previousWeekSLA['route-e'], 24.0)
  },
  {
    routeId: 'route-f',
    routeName: 'Route F',
    target: 99.0,
    current: 99.5,
    maintenanceTime: 1.8, // < 6 hours = achieve
    status: getSLAStatus(1.8),
    trend: calculateTrend(99.5, previousWeekSLA['route-f'], 1.8)
  }
];

// Mock Network Patrol Data
export const networkPatrols: NetworkPatrol[] = [
  {
    id: 'patrol-001',
    patrolNumber: 'PATROL-20240220-001',
    routeId: 'route-a',
    type: 'routine',
    status: 'completed',
    priority: 'medium',
    title: 'Weekly Route A Inspection',
    description: 'Regular weekly inspection of Route A infrastructure and cable conditions',
    patrolDate: '2024-02-20',
    startTime: '08:00',
    endTime: '16:30',
    patrolTeam: ['John Smith', 'Mike Wilson'],
    vehicleInfo: {
      plateNumber: 'B 1234 ABC',
      type: 'Pickup Truck'
    },
    weather: {
      condition: 'sunny',
      temperature: 28,
      notes: 'Clear visibility, good conditions for inspection'
    },
    findings: [
      {
        id: 'finding-001',
        patrolId: 'patrol-001',
        type: 'third-party-activity',
        severity: 'high',
        title: 'Construction Activity Near Cable Route',
        description: 'Road construction work detected 2 meters from fiber cable route. Heavy machinery present.',
        location: {
          longitude: 106.8456,
          latitude: -6.2088,
          address: 'Jl. Sudirman No. 125, Jakarta Pusat',
          landmark: 'Near Plaza Indonesia',
          kmPost: 'KM 12.5'
        },
        photos: [
          {
            id: 'photo-f001-1',
            url: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg',
            caption: 'Construction equipment near cable route',
            timestamp: '2024-02-20T10:30:00Z'
          }
        ],
        thirdPartyDetails: {
          company: 'PT Konstruksi Jaya',
          contactPerson: 'Budi Santoso (081234567890)',
          activityType: 'Road widening project',
          permitNumber: 'PERMIT-2024-0215',
          estimatedDuration: '2 weeks'
        },
        actionRequired: 'coordination',
        status: 'in-progress',
        assignedTo: 'John Smith',
        createdAt: '2024-02-20T10:30:00Z',
        updatedAt: '2024-02-20T10:30:00Z'
      },
      {
        id: 'finding-002',
        patrolId: 'patrol-001',
        type: 'cable-exposure',
        severity: 'medium',
        title: 'Cable Exposure at KM 15.2',
        description: 'Fiber cable partially exposed due to soil erosion after recent rain',
        location: {
          longitude: 106.8567,
          latitude: -6.2234,
          address: 'Jl. Gatot Subroto No. 78, Jakarta Selatan',
          landmark: 'Near Kuningan City Mall',
          kmPost: 'KM 15.2'
        },
        photos: [
          {
            id: 'photo-f002-1',
            url: 'https://images.pexels.com/photos/159306/fiber-optic-cable-fiber-glass-fiber-159306.jpeg',
            caption: 'Exposed cable section',
            timestamp: '2024-02-20T14:15:00Z'
          }
        ],
        measurements: {
          cableDepth: 45,
          exposureLength: 1.5,
          damageExtent: 'Outer sheath intact, no fiber damage detected'
        },
        actionRequired: 'scheduled',
        status: 'open',
        assignedTo: 'Mike Wilson',
        createdAt: '2024-02-20T14:15:00Z',
        updatedAt: '2024-02-20T14:15:00Z'
      }
    ],
    measurements: [
      {
        id: 'measurement-001',
        patrolId: 'patrol-001',
        routeId: 'route-a',
        linkId: 'link-a1',
        measurementType: 'otdr',
        location: {
          longitude: 106.8456,
          latitude: -6.2088,
          address: 'Central Hub - Equipment Room',
          kmPost: 'KM 0.0'
        },
        results: {
          totalLoss: 2.3,
          reflectance: -45.2,
          length: 12.5,
          fiberCondition: 'good',
          anomalies: ['Minor splice loss at 8.2km'],
          recommendations: 'Monitor splice point, consider re-splicing if loss increases'
        },
        equipment: {
          deviceModel: 'Fluke OptiFiber Pro OTDR',
          serialNumber: 'FLK-2024-001',
          calibrationDate: '2024-01-15'
        },
        performedBy: 'John Smith',
        timestamp: '2024-02-20T09:30:00Z',
        attachments: [
          {
            id: 'att-001',
            type: 'otdr-trace',
            url: '/attachments/otdr-trace-001.pdf',
            filename: 'OTDR_RouteA_Link1_20240220.pdf'
          }
        ]
      }
    ],
    summary: 'Routine patrol completed successfully. Two findings identified: construction activity requiring coordination and cable exposure requiring scheduled repair. Overall route condition is good with minor maintenance needs.',
    recommendations: 'Coordinate with construction company for cable protection measures. Schedule cable re-burial at KM 15.2. Continue weekly patrols during construction period.',
    nextPatrolDate: '2024-02-27',
    createdBy: 'John Smith',
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-02-20T16:30:00Z',
    completedAt: '2024-02-20T16:30:00Z'
  },
  {
    id: 'patrol-002',
    patrolNumber: 'PATROL-20240221-002',
    routeId: 'route-e',
    type: 'emergency',
    status: 'in-progress',
    priority: 'critical',
    title: 'Emergency Response - Route E Signal Loss',
    description: 'Emergency patrol to investigate critical signal loss on Route E',
    patrolDate: '2024-02-21',
    startTime: '06:00',
    endTime: '',
    patrolTeam: ['Sarah Johnson', 'Tom Anderson'],
    vehicleInfo: {
      plateNumber: 'B 5678 DEF',
      type: 'Emergency Response Van'
    },
    weather: {
      condition: 'rainy',
      temperature: 24,
      notes: 'Heavy rain affecting visibility and access'
    },
    findings: [
      {
        id: 'finding-003',
        patrolId: 'patrol-002',
        type: 'infrastructure-damage',
        severity: 'critical',
        title: 'Fiber Cable Cut at Joint Closure',
        description: 'Complete fiber cut detected at joint closure CHE-008. Water ingress evident.',
        location: {
          longitude: 106.8123,
          latitude: -6.1756,
          address: 'Jl. MH Thamrin No. 1, Jakarta Pusat',
          landmark: 'Hotel Indonesia Roundabout',
          kmPost: 'KM 14.2'
        },
        photos: [
          {
            id: 'photo-f003-1',
            url: 'https://images.pexels.com/photos/159306/fiber-optic-cable-fiber-glass-fiber-159306.jpeg',
            caption: 'Damaged joint closure with water ingress',
            timestamp: '2024-02-21T08:30:00Z'
          }
        ],
        measurements: {
          signalLoss: 15.0,
          damageExtent: 'Complete fiber break, 12 cores affected'
        },
        actionRequired: 'immediate',
        status: 'in-progress',
        assignedTo: 'Sarah Johnson',
        createdAt: '2024-02-21T08:30:00Z',
        updatedAt: '2024-02-21T08:30:00Z',
        maintenanceTicketId: 'maint-emergency-001'
      }
    ],
    measurements: [
      {
        id: 'measurement-002',
        patrolId: 'patrol-002',
        routeId: 'route-e',
        linkId: 'link-e1',
        measurementType: 'otdr',
        location: {
          longitude: 106.8123,
          latitude: -6.1756,
          address: 'Joint Closure CHE-008',
          kmPost: 'KM 14.2'
        },
        results: {
          totalLoss: 15.0,
          length: 14.2,
          fiberCondition: 'damaged',
          anomalies: ['Complete break at 14.2km', 'High reflectance indicating water ingress'],
          recommendations: 'Immediate repair required - replace joint closure and re-splice affected fibers'
        },
        equipment: {
          deviceModel: 'Anritsu MT9083 OTDR',
          serialNumber: 'ANR-2024-002',
          calibrationDate: '2024-02-01'
        },
        performedBy: 'Tom Anderson',
        timestamp: '2024-02-21T09:00:00Z',
        attachments: [
          {
            id: 'att-002',
            type: 'otdr-trace',
            url: '/attachments/otdr-emergency-002.pdf',
            filename: 'OTDR_Emergency_RouteE_20240221.pdf'
          }
        ]
      }
    ],
    summary: 'Emergency patrol in progress. Critical fiber break identified at CHE-008 joint closure. Immediate repair initiated.',
    recommendations: 'Replace damaged joint closure, re-splice 12 affected fiber cores, implement better waterproofing measures.',
    createdBy: 'Network Operations Center',
    createdAt: '2024-02-21T06:00:00Z',
    updatedAt: '2024-02-21T09:00:00Z'
  }
];