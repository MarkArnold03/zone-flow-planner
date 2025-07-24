import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, MapPin, Clock } from 'lucide-react';
import { useDeliveryPlanning } from '@/hooks/useDeliveryPlanning';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { PlanningHeader } from './PlanningHeader';

export function PlanningCalendar() {
  const {
    state,
    updateViewMode,
    getAssignments,
    handleDrop,
  } = useDeliveryPlanning();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, date: Date, timeSlot: string) => {
    e.preventDefault();
    
    // Try to get different types of drag data
    const zoneData = e.dataTransfer.getData('zone');
    const zoneGroupData = e.dataTransfer.getData('zoneGroup');
    const workerData = e.dataTransfer.getData('worker');

    if (zoneData) {
      handleDrop({ type: 'zone', data: JSON.parse(zoneData) }, date, timeSlot);
    } else if (zoneGroupData) {
      handleDrop({ type: 'zoneGroup', data: JSON.parse(zoneGroupData) }, date, timeSlot);
    } else if (workerData) {
      handleDrop({ type: 'worker', data: JSON.parse(workerData) }, date, timeSlot);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-in">
      <PlanningHeader />
      
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={state.viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateViewMode('week')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Week View
          </Button>
          <Button
            variant={state.viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateViewMode('month')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Month View
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{state.workers.length} workers available</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{state.zones.length} zones</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{state.assignments.length} assignments</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        {state.viewMode === 'week' ? (
          <WeekView
            onDrop={onDrop}
            onDragOver={handleDragOver}
            getAssignments={getAssignments}
          />
        ) : (
          <MonthView
            onDrop={onDrop}
            onDragOver={handleDragOver}
            getAssignments={getAssignments}
          />
        )}
      </Card>
    </div>
  );
}