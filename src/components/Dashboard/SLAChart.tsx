import React from 'react';
import { SLAData } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SLAChartProps {
  data: SLAData[];
}

export default function SLAChart({ data }: SLAChartProps) {
  const maxValue = 25; // Maximum hours for scale
  const minValue = 0;  // Minimum hours
  const chartHeight = 180; // Increased from 150 to 180 (120%)
  const barWidth = 22; // Increased from 18 to 22 (120%)
  const barSpacing = 7; // Increased from 6 to 7 (120%)

  const routes = ['routeA', 'routeB', 'routeC', 'routeD', 'routeE', 'routeF'] as const;
  
  // Different colors for each route
  const routeColors = {
    routeA: '#10B981', // Green
    routeB: '#F59E0B', // Orange
    routeC: '#3B82F6', // Blue
    routeD: '#8B5CF6', // Purple
    routeE: '#EF4444', // Red
    routeF: '#06B6D4'  // Cyan
  };

  const routeNames = {
    routeA: 'Route A',
    routeB: 'Route B',
    routeC: 'Route C',
    routeD: 'Route D',
    routeE: 'Route E',
    routeF: 'Route F'
  };

  // Convert SLA percentage to response time hours (inverse relationship)
  const convertSLAToHours = (slaPercentage: number) => {
    // Higher SLA = lower response time
    // 100% SLA = 1 hour, 90% SLA = 24 hours (example mapping)
    if (slaPercentage >= 99.5) return 1.0;
    if (slaPercentage >= 99.0) return 2.0;
    if (slaPercentage >= 98.5) return 3.0;
    if (slaPercentage >= 98.0) return 4.0;
    if (slaPercentage >= 97.0) return 6.0;
    if (slaPercentage >= 96.0) return 8.0;
    if (slaPercentage >= 95.0) return 10.0;
    if (slaPercentage >= 94.0) return 12.0;
    if (slaPercentage >= 93.0) return 15.0;
    if (slaPercentage >= 92.0) return 18.0;
    if (slaPercentage >= 91.0) return 20.0;
    return 24.0; // Maximum 24 hours for very low SLA
  };

  // Convert data to hours format
  const dataInHours = data.map(weekData => ({
    ...weekData,
    routeA: convertSLAToHours(weekData.routeA),
    routeB: convertSLAToHours(weekData.routeB),
    routeC: convertSLAToHours(weekData.routeC),
    routeD: convertSLAToHours(weekData.routeD),
    routeE: convertSLAToHours(weekData.routeE),
    routeF: convertSLAToHours(weekData.routeF),
    average: convertSLAToHours(weekData.average)
  }));

  const getBarHeight = (value: number) => {
    const percentage = (value - minValue) / (maxValue - minValue);
    return percentage * chartHeight;
  };

  const getYPosition = (value: number) => {
    return chartHeight - getBarHeight(value);
  };

  const latestData = dataInHours[dataInHours.length - 1];
  const previousData = dataInHours[dataInHours.length - 2];

  const getTrend = (current: number, previous: number) => {
    const difference = current - previous;
    // For hours, lower is better, so trend logic is inverted
    if (difference < -0.5) return 'up'; // Improvement (less time)
    if (difference > 0.5) return 'down'; // Degradation (more time)
    return 'stable';
  };

  const averageResponseTime = latestData.average;

  // Get response time color based on hours (lower is better)
  const getResponseTimeColor = (hours: number) => {
    if (hours <= 6) return 'text-green-600'; // Good (≤ 6 hours)
    if (hours <= 12) return 'text-blue-600'; // Standard (6-12 hours)
    return 'text-red-600'; // Poor (> 12 hours)
  };

  const responseTimeColor = getResponseTimeColor(averageResponseTime);

  // Calculate original SLA percentage for display
  const originalLatestData = data[data.length - 1];

  const weekWidth = routes.length * barWidth + (routes.length - 1) * barSpacing;
  const weekSpacing = 72; // Increased from 60 to 72 (120%)
  const totalWidth = dataInHours.length * weekWidth + (dataInHours.length - 1) * weekSpacing;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Response Time Trends</h3>
          <p className="text-sm text-gray-600">Weekly maintenance response time comparison</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{originalLatestData.average.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">SLA Average</p>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <p className={`text-2xl font-bold ${responseTimeColor}`}>{averageResponseTime.toFixed(1)}h</p>
              <p className="text-sm text-gray-500">Avg Response</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg width="100%" height={chartHeight + 72} viewBox={`0 0 ${totalWidth + 48} ${chartHeight + 72}`} className="overflow-visible">
          {/* Grid lines - Hours scale */}
          {[0, 6, 12, 18, 24].map((value) => (
            <g key={value}>
              <line
                x1="0"
                y1={getYPosition(value)}
                x2={totalWidth}
                y2={getYPosition(value)}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <text
                x="-12"
                y={getYPosition(value) + 4}
                fontSize="14"
                fill="#6B7280"
                textAnchor="end"
              >
                {value}h
              </text>
            </g>
          ))}

          {/* Target line at 6 hours */}
          <line
            x1="0"
            y1={getYPosition(6)}
            x2={totalWidth}
            y2={getYPosition(6)}
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x={totalWidth + 6}
            y={getYPosition(6) + 4}
            fontSize="12"
            fill="#10B981"
            fontWeight="600"
          >
            Target (6h)
          </text>

          {/* Bars */}
          {dataInHours.map((weekData, weekIndex) => {
            const weekStartX = weekIndex * (weekWidth + weekSpacing);
            
            return (
              <g key={weekIndex}>
                {routes.map((routeKey, routeIndex) => {
                  const barX = weekStartX + routeIndex * (barWidth + barSpacing);
                  const barHeight = getBarHeight(weekData[routeKey]);
                  const barY = getYPosition(weekData[routeKey]);
                  
                  // Use consistent route colors
                  const barColor = routeColors[routeKey];
                  
                  return (
                    <g key={routeKey}>
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        fill={barColor}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        rx="2"
                      >
                        <title>{`${routeNames[routeKey]} - ${weekData.week}: ${weekData[routeKey].toFixed(1)}h`}</title>
                      </rect>
                      
                      {/* Value labels on top of bars */}
                      {barHeight > 18 && (
                        <text
                          x={barX + barWidth / 2}
                          y={barY - 4}
                          fontSize="9"
                          fill="#374151"
                          textAnchor="middle"
                          fontWeight="500"
                        >
                          {weekData[routeKey].toFixed(1)}h
                        </text>
                      )}
                    </g>
                  );
                })}
                
                {/* Week labels */}
                <text
                  x={weekStartX + weekWidth / 2}
                  y={chartHeight + 24}
                  fontSize="14"
                  fill="#6B7280"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {weekData.week}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Performance indicators */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">≤ 6h (Target)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">6-12h (Acceptable)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">{'>'} 12h (Needs Improvement)</span>
        </div>
      </div>
    </div>
  );
}