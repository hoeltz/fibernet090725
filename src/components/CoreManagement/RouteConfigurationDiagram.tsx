import React, { useState, useRef, useEffect } from 'react';
import { Route } from '../../types';
import { 
  Network, ArrowRight, ArrowLeft, Settings, Activity,
  Signal, MapPin, Zap, Cable, Monitor, Edit3, Save, X,
  Plus, Trash2, RotateCcw, Move, ZoomIn, ZoomOut
} from 'lucide-react';

interface TrafficData {
  id: string;
  routeId: string;
  trafficName: string;
  rsl: number;
  otdrDistance: number;
  portNumber: string;
  linkPointA: string;
  linkPointB: string;
  selectedRoute: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  totalLoss: number;
  lossPerKm: number;
  length: number;
  protocol: string;
}

interface RouteConfigurationDiagramProps {
  selectedRoute: Route;
  routes: Route[];
  trafficData: TrafficData[];
  isEditing: boolean;
  onRouteUpdate: (updatedRoute: Route) => void;
}

interface RoutePosition {
  id: string;
  x: number;
  y: number;
  name: string;
  displayName?: string; // Editable display name
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  trafficCount: number;
  status: 'active' | 'warning' | 'error';
  totalLoss: number;
  length: number;
  routeName: string;
}

export default function RouteConfigurationDiagram({
  selectedRoute,
  routes,
  trafficData,
  isEditing,
  onRouteUpdate
}: RouteConfigurationDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeName, setEditingNodeName] = useState('');

  // Initial route positions in a circular layout
  const [routePositions, setRoutePositions] = useState<RoutePosition[]>(() => {
    const centerX = 400;
    const centerY = 300;
    const radius = 150;
    
    return routes.map((route, index) => {
      const cols = Math.ceil(Math.sqrt(routes.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      const offsetX = (col - (cols - 1) / 2) * 120;
      const offsetY = (row - Math.floor((routes.length - 1) / cols) / 2) * 100;
      
      return {
        id: route.id,
        x: centerX + offsetX,
        y: centerY + offsetY,
        name: route.name,
        displayName: route.name
      };
    });
  });

  // Calculate connections based on traffic data
  const connections: Connection[] = React.useMemo(() => {
    const connectionMap = new Map<string, Connection>();
    
    // Process all traffic data to create connections
    routes.forEach(route => {
      const routeTraffic = trafficData.filter(t => t.routeId === route.id);
      
      routeTraffic.forEach(traffic => {
        // Map selected route to actual route
        const sourceRoute = route; // Current route
        const targetRoute = routes.find(r => r.name.includes(traffic.selectedRoute));
        
        if (sourceRoute && targetRoute && sourceRoute.id !== targetRoute.id) {
          const connectionKey = `${sourceRoute.id}-${targetRoute.id}`;
          const reverseKey = `${targetRoute.id}-${sourceRoute.id}`;
          
          // Use existing connection or create new one
          const existingKey = connectionMap.has(connectionKey) ? connectionKey : 
                            connectionMap.has(reverseKey) ? reverseKey : connectionKey;
          
          if (connectionMap.has(existingKey)) {
            const existing = connectionMap.get(existingKey)!;
            existing.trafficCount += 1;
            existing.totalLoss += traffic.totalLoss;
            existing.length += traffic.length;
            
            // Update status (worst case)
            if (traffic.status === 'error' || existing.status === 'error') {
              existing.status = 'error';
            } else if (traffic.status === 'maintenance' || existing.status === 'warning') {
              existing.status = 'warning';
            }
          } else {
            // Find route link for additional data
            const routeLink = sourceRoute.links.find(l => l.name.includes(traffic.selectedRoute)) || sourceRoute.links[0];
            
            connectionMap.set(existingKey, {
              id: existingKey,
              sourceId: sourceRoute.id,
              targetId: targetRoute.id,
              trafficCount: 1,
              status: traffic.status === 'active' ? 'active' : 
                     traffic.status === 'error' ? 'error' : 'warning',
              totalLoss: traffic.totalLoss,
              length: traffic.length,
              routeName: `${sourceRoute.name} → ${targetRoute.name}`
            });
          }
        }
      });
    });
    
    return Array.from(connectionMap.values());
  }, [routes, trafficData]);

  const getRoutePosition = (routeId: string) => {
    return routePositions.find(pos => pos.id === routeId) || { x: 0, y: 0 };
  };

  const getRouteStatus = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    return route?.status || 'operational';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'active':
        return '#10B981'; // green
      case 'warning':
        return '#F59E0B'; // yellow
      case 'maintenance':
        return '#3B82F6'; // blue
      case 'critical':
      case 'error':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const handleNodeDrag = (routeId: string, newX: number, newY: number) => {
    if (!isEditing) return;
    
    setRoutePositions(prev => 
      prev.map(pos => 
        pos.id === routeId 
          ? { ...pos, x: Math.max(50, Math.min(750, newX)), y: Math.max(50, Math.min(550, newY)) }
          : pos
      )
    );
  };

  const handleNodeNameEdit = (routeId: string, newName: string) => {
    setRoutePositions(prev => 
      prev.map(pos => 
        pos.id === routeId 
          ? { ...pos, displayName: newName }
          : pos
      )
    );
  };

  const startEditingNodeName = (routeId: string) => {
    const position = routePositions.find(pos => pos.id === routeId);
    if (position) {
      setEditingNodeId(routeId);
      setEditingNodeName(position.displayName || position.name);
    }
  };

  const saveNodeName = () => {
    if (editingNodeId) {
      handleNodeNameEdit(editingNodeId, editingNodeName);
      setEditingNodeId(null);
      setEditingNodeName('');
    }
  };

  const cancelEditingNodeName = () => {
    setEditingNodeId(null);
    setEditingNodeName('');
  };
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const renderConnection = (connection: Connection) => {
    const sourcePos = getRoutePosition(connection.sourceId);
    const targetPos = getRoutePosition(connection.targetId);
    
    if (!sourcePos || !targetPos) return null;

    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate arrow position
    const arrowSize = 8;
    const nodeRadius = 30;
    const arrowX = sourcePos.x + (dx / distance) * (distance - nodeRadius);
    const arrowY = sourcePos.y + (dy / distance) * (distance - nodeRadius);
    
    const strokeColor = getStatusColor(connection.status);
    const strokeWidth = Math.max(2, Math.min(8, connection.trafficCount * 2));

    return (
      <g key={connection.id}>
        {/* Connection line */}
        <line
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={connection.status === 'maintenance' ? '5,5' : 'none'}
          opacity={0.8}
        />
        
        {/* Arrow head */}
        <polygon
          points={`${arrowX},${arrowY} ${arrowX - arrowSize},${arrowY - arrowSize/2} ${arrowX - arrowSize},${arrowY + arrowSize/2}`}
          fill={strokeColor}
          transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI}, ${arrowX}, ${arrowY})`}
        />
        
        {/* Connection labels */}
        <text
          x={(sourcePos.x + targetPos.x) / 2}
          y={(sourcePos.y + targetPos.y) / 2 - 20}
          textAnchor="middle"
          fontSize="9"
          fill="#374151"
          className="pointer-events-none"
        >
          {connection.routeName}
        </text>
        <text
          x={(sourcePos.x + targetPos.x) / 2}
          y={(sourcePos.y + targetPos.y) / 2 - 8}
          textAnchor="middle"
          fontSize="8"
          fill="#6B7280"
          className="pointer-events-none"
        >
          Loss: {connection.totalLoss.toFixed(1)}dB | {connection.length.toFixed(1)}km
        </text>
        <text
          x={(sourcePos.x + targetPos.x) / 2}
          y={(sourcePos.y + targetPos.y) / 2 + 5}
          textAnchor="middle"
          fontSize="8"
          fill="#6B7280"
          className="pointer-events-none"
        >
          {connection.trafficCount} traffic flows
        </text>
      </g>
    );
  };

  const renderRouteNode = (route: Route) => {
    const position = getRoutePosition(route.id);
    if (!position) return null;

    const isSelected = selectedNode === route.id || selectedRoute.id === route.id;
    const statusColor = getStatusColor(getRouteStatus(route.id));
    const nodeSize = 60; // Rectangle size
    const routePosition = routePositions.find(pos => pos.id === route.id);
    
    return (
      <g key={route.id}>
        {/* Node rectangle */}
        <rect
          x={position.x - nodeSize/2}
          y={position.y - nodeSize/2}
          width={nodeSize}
          height={nodeSize}
          fill={statusColor}
          stroke={isSelected ? '#1D4ED8' : '#FFFFFF'}
          strokeWidth={isSelected ? 3 : 2}
          rx="8"
          className={`cursor-pointer transition-all ${isEditing ? 'cursor-move' : ''}`}
          onClick={() => setSelectedNode(route.id)}
          onDoubleClick={() => isEditing && startEditingNodeName(route.id)}
          onMouseDown={(e) => {
            if (isEditing) {
              setIsDragging(true);
              setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
            }
          }}
        />
        
        {/* Node icon */}
        <Network
          x={position.x - 8}
          y={position.y - 8}
          width={16}
          height={16}
          className="pointer-events-none"
          color="white"
        />
        
        {/* Node label - editable */}
        {editingNodeId === route.id ? (
          <foreignObject
            x={position.x - 40}
            y={position.y + nodeSize/2 + 5}
            width="80"
            height="25"
          >
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={editingNodeName}
                onChange={(e) => setEditingNodeName(e.target.value)}
                className="w-16 px-1 py-0.5 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && saveNodeName()}
                onBlur={saveNodeName}
                autoFocus
              />
            </div>
          </foreignObject>
        ) : (
          <text
            x={position.x}
            y={position.y + nodeSize/2 + 15}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#374151"
            className="pointer-events-none"
          >
            {routePosition?.displayName || route.name}
          </text>
        )}
        
        {/* Status indicator */}
        <text
          x={position.x}
          y={position.y + nodeSize/2 + 30}
          textAnchor="middle"
          fontSize="10"
          fill="#6B7280"
          className="pointer-events-none"
        >
          {route.status}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      {/* Diagram Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            Focus: {selectedRoute.name}
          </span>
          {selectedNode && (
            <span className="text-sm text-blue-600">
              Selected: {routes.find(r => r.id === selectedNode)?.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-colors"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="600"
          viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${600 / zoom}`}
          className="cursor-grab active:cursor-grabbing"
          onMouseMove={(e) => {
            if (isDragging && selectedNode && isEditing) {
              const rect = svgRef.current?.getBoundingClientRect();
              if (rect) {
                const x = (e.clientX - rect.left) / zoom + pan.x / zoom;
                const y = (e.clientY - rect.top) / zoom + pan.y / zoom;
                handleNodeDrag(selectedNode, x, y);
              }
            }
          }}
          onMouseUp={() => {
            setIsDragging(false);
          }}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Render connections first (behind nodes) */}
          {connections.map(connection => renderConnection(connection))}
          
          {/* Render route nodes */}
          {routes.map(route => renderRouteNode(route))}
          
          {/* Legend */}
          <g transform="translate(20, 20)">
            <rect x="0" y="0" width="200" height="120" fill="white" stroke="#D1D5DB" strokeWidth="1" rx="4" />
            <text x="10" y="20" fontSize="12" fontWeight="600" fill="#374151">Connection Status</text>
            
            <line x1="10" y1="35" x2="30" y2="35" stroke="#10B981" strokeWidth="3" />
            <text x="35" y="40" fontSize="10" fill="#374151">Active</text>
            
            <line x1="10" y1="50" x2="30" y2="50" stroke="#F59E0B" strokeWidth="3" />
            <text x="35" y="55" fontSize="10" fill="#374151">Warning</text>
            
            <line x1="10" y1="65" x2="30" y2="65" stroke="#EF4444" strokeWidth="3" />
            <text x="35" y="70" fontSize="10" fill="#374151">Error</text>
            
            <line x1="10" y1="80" x2="30" y2="80" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5,5" />
            <text x="35" y="85" fontSize="10" fill="#374151">Maintenance</text>
            
            <text x="10" y="105" fontSize="10" fill="#6B7280">Line thickness = Traffic volume</text>
          </g>
        </svg>
      </div>

      {/* Route Information Panel */}
      {selectedNode && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">
              {routes.find(r => r.id === selectedNode)?.name} Details
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {(() => {
            const route = routes.find(r => r.id === selectedNode);
            if (!route) return null;
            
            const routeConnections = connections.filter(
              c => c.sourceId === selectedNode || c.targetId === selectedNode
            );
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`font-medium ${
                    route.status === 'operational' ? 'text-green-600' :
                    route.status === 'warning' ? 'text-yellow-600' :
                    route.status === 'maintenance' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {route.status}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Connections</div>
                  <div className="font-medium text-gray-900">{routeConnections.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fiber Count</div>
                  <div className="font-medium text-gray-900">{route.fiberCount}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Edit Mode Instructions */}
      {isEditing && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Move className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">Edit Mode Active</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Click and drag route nodes to reposition them. Double-click a node to edit its name. Click on a node to select it and view details.
          </p>
        </div>
      )}
    </div>
  );
}